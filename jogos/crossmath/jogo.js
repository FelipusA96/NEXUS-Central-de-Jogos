const $ = id => document.getElementById(id);
const LEVELS = {
  facil:  { label:'Fácil',   rows:3, cols:4, nodeRatio:.67, givenRatio:.42, minValue:1,   maxValue:9,   maxDigits:1, nodeRangeLabel:'1–9',       cell:'clamp(31px,4.2vw,45px)', description:'Introdução à lógica cruzada, com valores de 1 a 9 e um tabuleiro irregular compacto.' },
  medio:  { label:'Médio',   rows:4, cols:5, nodeRatio:.67, givenRatio:.32, minValue:1,   maxValue:99,  maxDigits:2, nodeRangeLabel:'1–99',      cell:'clamp(27px,3.25vw,37px)', description:'Valores de até 99, mais ramificações, cruzamentos e menos números iniciais.' },
  dificil:{ label:'Difícil', rows:5, cols:6, nodeRatio:.70, givenRatio:.24, minValue:10,  maxValue:999, maxDigits:3, nodeRangeLabel:'10–999',    cell:'clamp(25px,2.8vw,33px)', description:'Valores-base de dois e três dígitos, com operações que exigem atenção aos cruzamentos.' },
  extremo:{ label:'Extremo', rows:6, cols:7, nodeRatio:.72, givenRatio:.18, minValue:100, maxValue:999, maxDigits:3, nodeRangeLabel:'100–999',   cell:'clamp(24px,2.55vw,31px)', description:'Valores-base na casa das centenas, grade mais densa e poucas casas reveladas.' }
};
const RECENT_LIMIT = 80;
let level = 'medio';
let puzzle = null;
let answers = new Map();
let gameOver = false;
let elapsedSeconds = 0;
let clockInterval = null;
let hintsUsed = 0;
let lastValidEquations = 0;

function randomInt(max) {
  try {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return Math.floor((array[0] / 4294967296) * max);
  } catch {
    return Math.floor(Math.random() * max);
  }
}
function choose(list) { return list[randomInt(list.length)]; }
function keyOf(r,c) { return `${r},${c}`; }
function parseKey(key) { return key.split(',').map(Number); }
function setCell(cells, r, c, data) { cells.set(keyOf(r,c), {r,c,...data}); }
function getCell(cells, r, c) { return cells.get(keyOf(r,c)); }
function getNumberCandidates(a, result, maxOperand) {
  const candidates = [];
  const plus = result - a;
  if (plus >= 1 && plus <= maxOperand) candidates.push({op:'+', operand:plus, weight:2});
  const minus = a - result;
  if (minus >= 1 && minus <= maxOperand) candidates.push({op:'−', operand:minus, weight:2});
  if (a !== 0 && result % a === 0 && result / a >= 1 && result / a <= maxOperand) candidates.push({op:'×', operand:result / a, weight:3});
  if (result !== 0 && a % result === 0 && a / result >= 1 && a / result <= maxOperand) candidates.push({op:'÷', operand:a / result, weight:3});
  const weighted = candidates.flatMap(candidate => Array(candidate.weight).fill(candidate));
  if (weighted.length) return weighted;
  // Com os limites de cada dificuldade, uma diferença positiva sempre cabe
  // no limite. Este fallback mantém a geração matematicamente segura.
  if (result > a) return [{op:'+', operand:result-a, weight:1}];
  if (a > result) return [{op:'−', operand:a-result, weight:1}];
  return [{op:'×', operand:1, weight:1}];
}
function createNodeMask(rows, cols, ratio) {
  const total = rows * cols;
  const minTarget = Math.max(rows + cols - 2, Math.floor(total * ratio));
  const maxTarget = Math.min(total - 2, Math.ceil(total * (ratio + .08)));

  function neighborsOf(key) {
    const [r, c] = key.split(',').map(Number);
    return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
      .filter(([nr,nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols)
      .map(([nr,nc]) => `${nr},${nc}`);
  }

  function isUsable(mask) {
    const rowCounts = Array(rows).fill(0);
    const colCounts = Array(cols).fill(0);
    let horizontalEdges = 0, verticalEdges = 0, crossings = 0;
    for (const key of mask) {
      const [r,c] = key.split(',').map(Number);
      rowCounts[r]++;
      colCounts[c]++;
      const hasLeft = c > 0 && mask.has(`${r},${c-1}`);
      const hasRight = c < cols-1 && mask.has(`${r},${c+1}`);
      const hasUp = r > 0 && mask.has(`${r-1},${c}`);
      const hasDown = r < rows-1 && mask.has(`${r+1},${c}`);
      if (hasRight) horizontalEdges++;
      if (hasDown) verticalEdges++;
      if ((hasLeft || hasRight) && (hasUp || hasDown)) crossings++;
    }
    const coversEveryRow = rowCounts.every(count => count > 0);
    const coversEveryCol = colCounts.every(count => count > 0);
    const rowVariation = Math.min(...rowCounts) < Math.max(...rowCounts);
    const colVariation = Math.min(...colCounts) < Math.max(...colCounts);
    const minimumCrossings = Math.max(1, Math.floor(mask.size * .08));
    return coversEveryRow && coversEveryCol && rowVariation && colVariation &&
      horizontalEdges >= rows && verticalEdges >= cols && crossings >= minimumCrossings && mask.size < total;
  }

  for (let attempt = 0; attempt < 180; attempt++) {
    const target = minTarget + randomInt(Math.max(1, maxTarget - minTarget + 1));
    const seedRow = randomInt(rows), seedCol = randomInt(cols);
    const mask = new Set([`${seedRow},${seedCol}`]);
    while (mask.size < target) {
      const frontier = new Set();
      for (const key of mask) {
        for (const neighbor of neighborsOf(key)) if (!mask.has(neighbor)) frontier.add(neighbor);
      }
      if (!frontier.size) break;
      const candidates = Array.from(frontier);
      // Prefere levemente pontos com apenas um vizinho ativo, criando ramificações
      // e contornos menos retangulares sem quebrar a conectividade do tabuleiro.
      const weighted = candidates.flatMap(key => {
        const activeNeighbors = neighborsOf(key).filter(neighbor => mask.has(neighbor)).length;
        return Array(Math.max(1, 4 - activeNeighbors)).fill(key);
      });
      mask.add(choose(weighted));
    }
    if (mask.size === target && isUsable(mask)) return mask;
  }

  // Fallback seguro: constrói uma máscara conectada removendo células periféricas
  // de uma grade completa e valida a conectividade antes de aceitar cada remoção.
  const mask = new Set(Array.from({length:total}, (_,i) => `${Math.floor(i/cols)},${i%cols}`));
  const target = minTarget;
  const connected = candidate => {
    if (!candidate.size) return false;
    const visited = new Set([candidate.values().next().value]);
    const stack = [...visited];
    while (stack.length) {
      for (const neighbor of neighborsOf(stack.pop())) {
        if (candidate.has(neighbor) && !visited.has(neighbor)) { visited.add(neighbor); stack.push(neighbor); }
      }
    }
    return visited.size === candidate.size;
  };
  let guard = total * 20;
  while (mask.size > target && guard-- > 0) {
    const candidates = Array.from(mask).sort(() => Math.random() - .5);
    let removed = false;
    for (const key of candidates) {
      const candidate = new Set(mask);
      candidate.delete(key);
      if (connected(candidate) && isUsable(candidate)) { mask.delete(key); removed = true; break; }
    }
    if (!removed) break;
  }
  return mask;
}

function createPuzzle(selectedLevel) {
  const config = LEVELS[selectedLevel];
  const rows = config.rows;
  const cols = config.cols;
  const gridRows = rows * 4 - 3;
  const gridCols = cols * 4 - 3;
  const activeNodes = createNodeMask(rows, cols, config.nodeRatio);
  const nodeValues = Array.from({length:rows}, () => Array.from({length:cols}, () => config.minValue + randomInt(config.maxValue - config.minValue + 1)));
  const cells = new Map();
  const equations = [];
  const numberKeys = new Set();
  const edgeKeys = [];

  // Os nós agora ocupam uma máscara conectada e assimétrica, em vez de uma matriz cheia.
  for (const nodeKey of activeNodes) {
    const [r,c] = nodeKey.split(',').map(Number);
    const rr = r * 4, cc = c * 4, key = keyOf(rr,cc), value = nodeValues[r][c];
    setCell(cells, rr, cc, {type:'number', solution:value, given:false, node:true});
    numberKeys.add(key);
  }

  function addEquation(startR, startC, endR, endC, direction) {
    const a = nodeValues[startR][startC];
    const result = nodeValues[endR][endC];
    const candidate = choose(getNumberCandidates(a, result, config.maxValue));
    const dr = direction === 'v' ? 1 : 0;
    const dc = direction === 'h' ? 1 : 0;
    const r0 = startR*4, c0 = startC*4;
    const startKey = keyOf(r0,c0);
    const opKey = keyOf(r0 + dr, c0 + dc);
    const operandKey = keyOf(r0 + dr*2, c0 + dc*2);
    const equalKey = keyOf(r0 + dr*3, c0 + dc*3);
    const resultKey = keyOf(endR*4, endC*4);
    setCell(cells, r0+dr, c0+dc, {type:'operator', display:candidate.op});
    setCell(cells, r0+dr*2, c0+dc*2, {type:'number', solution:candidate.operand, given:false, node:false});
    setCell(cells, r0+dr*3, c0+dc*3, {type:'equals', display:'='});
    numberKeys.add(operandKey);
    const eq = {startKey, operandKey, resultKey, op:candidate.op, direction};
    equations.push(eq);
    edgeKeys.push([startKey, operandKey, resultKey]);
  }

  // Só cria uma equação quando os dois nós vizinhos existem na máscara.
  for (const nodeKey of activeNodes) {
    const [r,c] = nodeKey.split(',').map(Number);
    if (c + 1 < cols && activeNodes.has(`${r},${c+1}`)) addEquation(r,c,r,c+1,'h');
    if (r + 1 < rows && activeNodes.has(`${r+1},${c}`)) addEquation(r,c,r+1,c,'v');
  }

  // Sorteia casas iniciais e garante ao menos uma pista numérica por equação.
  const givenKeys = new Set();
  for (const key of numberKeys) if (randomInt(1000) < config.givenRatio*1000) givenKeys.add(key);
  for (const edge of edgeKeys) {
    if (!edge.some(key => givenKeys.has(key))) givenKeys.add(choose(edge));
  }
  for (const key of numberKeys) cells.get(key).given = givenKeys.has(key);

  const signature = Array.from(numberKeys).sort().map(key => `${key}:${cells.get(key).solution}${givenKeys.has(key)?'g':'_'}`).join('|') +
    '//' + equations.map(eq=>`${eq.startKey}>${eq.resultKey}:${eq.op}:${cells.get(eq.operandKey).solution}`).join(',');
  const id = makePuzzleId(signature);
  return {level:selectedLevel, config, sizeRows:gridRows, sizeCols:gridCols, rows, cols, activeNodes, cells, equations, numberKeys, givenKeys, id, signature};
}
function makePuzzleId(signature) {
  let hash = 2166136261;
  for (let i=0; i<signature.length; i++) { hash ^= signature.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return `NEX-${(hash>>>0).toString(16).toUpperCase().padStart(8,'0').slice(0,8)}`;
}
function loadRecent(selectedLevel) {
  try { return JSON.parse(localStorage.getItem(`nexus-crossmath-recent-${selectedLevel}`) || '[]'); }
  catch { return []; }
}
function saveRecent(selectedLevel, signature) {
  try {
    const recent = loadRecent(selectedLevel).filter(item => item !== signature);
    recent.push(signature);
    localStorage.setItem(`nexus-crossmath-recent-${selectedLevel}`, JSON.stringify(recent.slice(-RECENT_LIMIT)));
  } catch { /* O jogo continua funcionando mesmo sem armazenamento local. */ }
}
function generateUnique(selectedLevel) {
  const recent = loadRecent(selectedLevel);
  let next = createPuzzle(selectedLevel);
  let attempts = 0;
  while (recent.includes(next.signature) && attempts < 250) { answers.clear(); next = createPuzzle(selectedLevel); attempts++; }
  saveRecent(selectedLevel, next.signature);
  return next;
}
function valueAt(key) {
  const cell = puzzle.cells.get(key);
  if (!cell || cell.type !== 'number') return null;
  if (cell.given) return cell.solution;
  const raw = answers.get(key);
  if (raw === undefined || raw === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 1 && value <= puzzle.config.maxValue ? value : null;
}
function formatTime(total) {
  const minutes = String(Math.floor(total/60)).padStart(2,'0');
  const seconds = String(total%60).padStart(2,'0');
  return `${minutes}:${seconds}`;
}
function startClock() {
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    if (gameOver || !$('clock-enabled').checked) return;
    elapsedSeconds++;
    $('elapsed').textContent = formatTime(elapsedSeconds);
  }, 1000);
}
function setMessage(text, type='') {
  const message = $('game-message');
  message.textContent = text;
  message.className = `notice${type ? ` ${type}` : ''}`;
}
function updateMetrics() {
  const total = Array.from(puzzle.numberKeys).filter(key => !puzzle.givenKeys.has(key)).length;
  const filled = Array.from(puzzle.numberKeys).filter(key => !puzzle.givenKeys.has(key) && answers.get(key)).length;
  $('filled').textContent = `${filled}/${total}`;
  $('equations').textContent = `${lastValidEquations}/${puzzle.equations.length}`;
  $('level-title').textContent = puzzle.config.label;
  $('level-description').textContent = puzzle.config.description;
  $('level-range').textContent = puzzle.config.nodeRangeLabel;
  $('level-grid').textContent = `${puzzle.sizeRows} × ${puzzle.sizeCols} · irregular`; 
  $('level-equation-count').textContent = puzzle.equations.length;
  $('level-givens').textContent = puzzle.givenKeys.size;
  $('puzzle-id').textContent = puzzle.id;
}
function renderBoard() {
  const board = $('board');
  board.style.setProperty('--rows', puzzle.sizeRows);
  board.style.setProperty('--cols', puzzle.sizeCols);
  board.style.setProperty('--cell-size', puzzle.config.cell);
  board.dataset.rows = puzzle.sizeRows;
  board.dataset.cols = puzzle.sizeCols;
  board.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (let r=0; r<puzzle.sizeRows; r++) {
    for (let c=0; c<puzzle.sizeCols; c++) {
      const cell = getCell(puzzle.cells,r,c);
      if (!cell) {
        const empty = document.createElement('div');
        empty.className = 'math-cell void';
        empty.setAttribute('aria-hidden','true');
        fragment.appendChild(empty);
        continue;
      }
      if (cell.type === 'number') {
        const input = document.createElement('input');
        input.className = `math-cell number digits-${puzzle.config.maxDigits}`;
        input.type = 'text';
        input.inputMode = 'numeric';
        input.autocomplete = 'off';
        input.maxLength = puzzle.config.maxDigits;
        input.dataset.key = keyOf(r,c);
        input.dataset.row = String(r+1);
        input.dataset.col = String(c+1);
        input.setAttribute('role','gridcell');
        input.setAttribute('aria-label', `Número na linha ${r+1}, coluna ${c+1}${cell.given ? ', pista fixa' : ', casa vazia'}`);
        input.value = cell.given ? String(cell.solution) : (answers.get(keyOf(r,c)) || '');
        input.readOnly = cell.given || gameOver;
        if (cell.given) input.title = 'Número fornecido como pista';
        else input.title = `Digite um número de 1 a ${puzzle.config.maxValue}`;
        fragment.appendChild(input);
      } else {
        const token = document.createElement('div');
        token.className = `math-cell ${cell.type === 'equals' ? 'equals' : 'operator'}`;
        token.textContent = cell.display;
        token.setAttribute('aria-hidden','true');
        fragment.appendChild(token);
      }
    }
  }
  board.appendChild(fragment);
  updateMetrics();
}
function evaluateEquation(eq) {
  const a = valueAt(eq.startKey), b = valueAt(eq.operandKey), result = valueAt(eq.resultKey);
  if (a === null || b === null || result === null) return {complete:false, valid:false};
  let calculated;
  switch(eq.op) {
    case '+': calculated = a+b; break;
    case '−': calculated = a-b; break;
    case '×': calculated = a*b; break;
    case '÷': calculated = b === 0 ? NaN : a/b; break;
    default: return {complete:true, valid:false};
  }
  return {complete:true, valid:Number.isFinite(calculated) && Number.isInteger(calculated) && calculated === result};
}
function checkBoard(showMessage=true) {
  if (gameOver) return;
  const blankKeys = Array.from(puzzle.numberKeys).filter(key => !puzzle.givenKeys.has(key));
  const allFilled = blankKeys.every(key => answers.get(key));
  const goodKeys = new Set(), badKeys = new Set();
  let validCount = 0, completedCount = 0;
  for (const eq of puzzle.equations) {
    const result = evaluateEquation(eq);
    if (!result.complete) continue;
    completedCount++;
    const keys = [eq.startKey,eq.operandKey,eq.resultKey];
    if (result.valid) { validCount++; keys.forEach(key=>goodKeys.add(key)); }
    else keys.forEach(key=>badKeys.add(key));
  }
  $('board').querySelectorAll('.number:not([readonly])').forEach(input => {
    input.classList.remove('correct','incorrect');
    const key = input.dataset.key;
    if (badKeys.has(key)) input.classList.add('incorrect');
    else if (goodKeys.has(key)) input.classList.add('correct');
  });
  lastValidEquations = validCount;
  $('equations').textContent = `${validCount}/${puzzle.equations.length}`;
  if (allFilled && validCount === puzzle.equations.length) {
    finishGame(false);
    return;
  }
  if (showMessage) {
    const pending = blankKeys.length - blankKeys.filter(key=>answers.get(key)).length;
    if (completedCount === 0) setMessage(`Preencha mais casas para avaliar as equações. Restam ${pending} espaços vazios.`, '');
    else if (validCount === puzzle.equations.length) setMessage(`Todas as equações estão corretas; faltam ${pending} espaços para concluir.`, 'success');
    else setMessage(`${validCount} de ${puzzle.equations.length} equações válidas. ${puzzle.equations.length-validCount} ainda precisam ser resolvidas.`, 'error');
  }
}
function finishGame(revealed) {
  gameOver = true;
  if (clockInterval) clearInterval(clockInterval);
  $('mission-state').textContent = revealed ? 'GABARITO REVELADO' : 'MATRIZ RESOLVIDA';
  $('status-caption').textContent = revealed ? 'RODADA ENCERRADA' : 'TODAS AS EQUAÇÕES CORRETAS';
  $('board').querySelectorAll('.number').forEach(input => {
    input.readOnly = true;
    input.classList.remove('incorrect','correct');
    if (revealed && !puzzle.givenKeys.has(input.dataset.key)) input.classList.add('revealed');
    else if (!revealed && !puzzle.givenKeys.has(input.dataset.key)) input.classList.add('correct');
  });
  $('check-board').disabled = true;
  $('hint').disabled = true;
  $('give-up').disabled = true;
  $('result-icon').textContent = revealed ? '◉' : '∑';
  $('result-title').textContent = revealed ? 'Gabarito revelado' : 'Matriz resolvida!';
  $('result-description').textContent = revealed
    ? `A solução da matriz ${puzzle.id} está preenchida. Tempo de jogo: ${formatTime(elapsedSeconds)}. Gere uma nova matriz quando quiser continuar.`
    : `Você validou as ${puzzle.equations.length} equações da dificuldade ${puzzle.config.label} em ${formatTime(elapsedSeconds)}. Uma nova matriz será diferente das configurações recentes.`;
  if (!$('result-dialog').open) $('result-dialog').showModal();
  setMessage(revealed ? 'Gabarito revelado. A rodada foi encerrada e as respostas estão destacadas em violeta.' : `Parabéns! Todas as ${puzzle.equations.length} equações estão corretas.`, 'success');
}
function startNewGame() {
  answers = new Map();
  gameOver = false;
  elapsedSeconds = 0;
  hintsUsed = 0;
  puzzle = generateUnique(level);
  for (const key of puzzle.numberKeys) if (!puzzle.givenKeys.has(key)) answers.set(key, '');
  lastValidEquations = 0;
  $('elapsed').textContent = '00:00';
  $('mission-state').textContent = 'MATRIZ GERADA';
  $('status-caption').textContent = 'PRONTA PARA RESOLUÇÃO';
  $('game-mode-label').textContent = 'GRADE IRREGULAR';
  $('check-board').disabled = false;
  $('hint').disabled = false;
  $('give-up').disabled = false;
  document.querySelectorAll('[data-level]').forEach(button => {
    const active = button.dataset.level === level;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderBoard();
  setMessage(`Novo tabuleiro irregular gerado. ${puzzle.config.label}: valores-base de ${puzzle.config.nodeRangeLabel}; complete as casas com números de até ${puzzle.config.maxDigits} ${puzzle.config.maxDigits === 1 ? 'dígito' : 'dígitos'}.`);
  if ($('result-dialog').open) $('result-dialog').close();
  startClock();
}
function giveHint() {
  if (gameOver) return;
  const empty = Array.from(puzzle.numberKeys).filter(key => !puzzle.givenKeys.has(key) && !answers.get(key));
  if (!empty.length) { checkBoard(); return; }
  const key = choose(empty);
  answers.set(key, String(puzzle.cells.get(key).solution));
  hintsUsed++;
  const input = $('board').querySelector(`[data-key="${key}"]`);
  if (input) { input.value = answers.get(key); input.classList.add('revealed'); }
  updateMetrics();
  const [r,c] = parseKey(key);
  const allFilled = Array.from(puzzle.numberKeys).filter(k=>!puzzle.givenKeys.has(k)).every(k=>answers.get(k));
  if (allFilled) { checkBoard(true); if (gameOver) return; }
  setMessage(`Dica ${hintsUsed}: revelado o número ${answers.get(key)} na linha ${r+1}, coluna ${c+1}.`, 'success');
}
function revealSolution() {
  if (gameOver) return;
  if (!window.confirm('Desistir desta partida e preencher todas as casas com o gabarito?')) return;
  for (const key of puzzle.numberKeys) if (!puzzle.givenKeys.has(key)) answers.set(key, String(puzzle.cells.get(key).solution));
  $('board').querySelectorAll('.number:not([readonly])').forEach(input => { input.value = answers.get(input.dataset.key) || ''; });
  lastValidEquations = puzzle.equations.length;
  updateMetrics();
  finishGame(true);
}

$('board').addEventListener('input', event => {
  const input = event.target.closest('.number-input, input.number');
  if (!input || input.readOnly || gameOver) return;
  const key = input.dataset.key;
  const cleaned = input.value.replace(/\D/g,'').replace(/^0+(?=\d)/,'').slice(0,puzzle.config.maxDigits);
  input.value = cleaned;
  answers.set(key, cleaned);
  input.classList.remove('correct','incorrect','revealed');
  updateMetrics();
  if (Array.from(puzzle.numberKeys).filter(k=>!puzzle.givenKeys.has(k)).every(k=>answers.get(k))) checkBoard(true);
});
$('board').addEventListener('keydown', event => {
  const input = event.target.closest('input.number');
  if (!input || input.readOnly) return;
  if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter'].includes(event.key)) return;
  event.preventDefault();
  const fields = Array.from($('board').querySelectorAll('input.number:not([readonly])'));
  const index = fields.indexOf(input);
  const row = Number(input.dataset.row), col = Number(input.dataset.col);
  let target = null;
  if (event.key === 'Enter') target = fields[index+1] || null;
  if (event.key === 'ArrowLeft') target = fields.filter(field=>Number(field.dataset.row)===row && Number(field.dataset.col)<col).sort((a,b)=>Number(b.dataset.col)-Number(a.dataset.col))[0] || null;
  if (event.key === 'ArrowRight') target = fields.filter(field=>Number(field.dataset.row)===row && Number(field.dataset.col)>col).sort((a,b)=>Number(a.dataset.col)-Number(b.dataset.col))[0] || null;
  if (event.key === 'ArrowUp') target = fields.filter(field=>Number(field.dataset.col)===col && Number(field.dataset.row)<row).sort((a,b)=>Number(b.dataset.row)-Number(a.dataset.row))[0] || null;
  if (event.key === 'ArrowDown') target = fields.filter(field=>Number(field.dataset.col)===col && Number(field.dataset.row)>row).sort((a,b)=>Number(a.dataset.row)-Number(b.dataset.row))[0] || null;
  if (target) target.focus();
});
document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.level === level) { startNewGame(); return; }
  level = button.dataset.level;
  startNewGame();
}));
$('new-round').addEventListener('click', startNewGame);
$('check-board').addEventListener('click', () => checkBoard(true));
$('hint').addEventListener('click', giveHint);
$('give-up').addEventListener('click', revealSolution);
$('result-next').addEventListener('click', startNewGame);
$('result-close').addEventListener('click', () => $('result-dialog').close());
$('help-open').addEventListener('click', () => $('help-dialog').showModal());
$('help-close').addEventListener('click', () => $('help-dialog').close());

startNewGame();
