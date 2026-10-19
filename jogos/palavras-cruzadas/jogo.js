import { WORD_BANK, LEVELS, chooseWords, generateCrossword, parseCustomWords } from './engine.js';

const $ = id => document.getElementById(id);
const STORAGE = {
  theme: 'nexus-crossword-theme-v1',
  custom: 'nexus-crossword-custom-v1',
  difficulty: 'nexus-crossword-difficulty-v1',
  source: 'nexus-crossword-source-v1',
};

let sourceMode = 'bank';
let puzzle = null;
let answers = new Map();
let wrongCells = new Set();
let activeWordId = null;
let activeCellKey = null;
let lastClickedKey = null;
let timerEnabled = true;
let startedAt = 0;
let elapsedMs = 0;
let timerInterval = null;
let finished = false;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch]);
}

function safeStorageGet(key, fallback = '') {
  try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
}
function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (_) { /* A partida continua funcionando sem armazenamento local. */ }
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const two = n => String(n).padStart(2, '0');
  return hours > 0 ? `${two(hours)}:${two(minutes)}:${two(seconds)}` : `${two(minutes)}:${two(seconds)}`;
}

function setTheme(theme) {
  const value = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = value;
  $('theme-label').textContent = value === 'dark' ? 'Modo claro' : 'Modo escuro';
  $('theme-toggle').setAttribute('aria-label', value === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = value === 'dark' ? '#080d19' : '#f2f6fc';
  safeStorageSet(STORAGE.theme, value);
}

function setSourceMode(mode) {
  sourceMode = mode === 'custom' ? 'custom' : 'bank';
  $('tab-bank').classList.toggle('active', sourceMode === 'bank');
  $('tab-custom').classList.toggle('active', sourceMode === 'custom');
  $('tab-bank').setAttribute('aria-selected', String(sourceMode === 'bank'));
  $('tab-custom').setAttribute('aria-selected', String(sourceMode === 'custom'));
  $('custom-panel').hidden = sourceMode !== 'custom';
  safeStorageSet(STORAGE.source, sourceMode);
}

function setFeedback(message, type = '') {
  const node = $('game-feedback');
  node.textContent = message;
  node.className = `game-feedback${type ? ` ${type}` : ''}`;
}

function setSetupFeedback(message, type = '') {
  const node = $('setup-feedback');
  node.textContent = message;
  node.style.color = type === 'error' ? 'var(--bad)' : type === 'success' ? 'var(--good)' : '';
}

function clearClock() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimer() {
  if (!timerEnabled) {
    $('timer').textContent = 'OFF';
    return;
  }
  const ms = finished ? elapsedMs : Math.max(0, Date.now() - startedAt);
  $('timer').textContent = formatTime(ms);
}

function startClock() {
  clearClock();
  elapsedMs = 0;
  startedAt = Date.now();
  updateTimer();
  if (timerEnabled) timerInterval = setInterval(updateTimer, 500);
}

function stopClock() {
  if (timerEnabled && startedAt) elapsedMs = Math.max(0, Date.now() - startedAt);
  clearClock();
  updateTimer();
}

function getSelectedPool() {
  if (sourceMode === 'bank') return { words: WORD_BANK.map((item, index) => ({ ...item, id: `bank-${index}` })), ignored: [] };
  const parsed = parseCustomWords($('custom-words').value);
  safeStorageSet(STORAGE.custom, $('custom-words').value);
  return parsed;
}

function createPuzzle() {
  const levelKey = $('difficulty').value;
  const level = LEVELS[levelKey] || LEVELS.medio;
  safeStorageSet(STORAGE.difficulty, levelKey);
  const { words: pool, ignored } = getSelectedPool();

  if (pool.length < 4) {
    setSetupFeedback(sourceMode === 'custom'
      ? 'Adicione pelo menos 4 palavras válidas (de 3 a 16 letras) para montar uma cruzadinha.'
      : 'O banco não possui palavras suficientes para gerar esta grade.', 'error');
    return;
  }

  const selected = chooseWords(pool, level.count).map((word, index) => ({ ...word, id: `${word.id || word.word}-${index}` }));
  try {
    puzzle = generateCrossword(selected, { attempts: 90, size: 35 });
  } catch (error) {
    setSetupFeedback(error?.message || 'Não foi possível gerar a grade. Tente outra lista.', 'error');
    return;
  }

  answers = new Map();
  wrongCells = new Set();
  activeWordId = puzzle.words[0]?.id ?? null;
  activeCellKey = puzzle.words[0] ? `${puzzle.words[0].row},${puzzle.words[0].col}` : null;
  lastClickedKey = null;
  finished = false;
  timerEnabled = $('timer-enabled').checked;
  $('win-banner').hidden = true;
  startClock();
  renderBoard();
  renderClues();
  updateProgress();
  renderUnusedWords();
  $('board-subtitle').textContent = `${level.label} · ${puzzle.words.length} palavras · ${puzzle.crossings} cruzamentos`;
  $('clue-count').textContent = `${puzzle.words.length} pistas`;
  setFeedback('Selecione uma dica ou uma casa da grade. As letras compartilhadas pertencem às duas palavras.');

  const pieces = [];
  pieces.push(sourceMode === 'bank' ? `Banco NEXUS: sorteio de ${selected.length} entre ${pool.length} palavras` : `Lista personalizada: ${selected.length} palavra(s) selecionada(s) de ${pool.length}`);
  pieces.push(`grade montada com ${puzzle.words.length} palavra(s)`);
  if (puzzle.unusedWords.length) pieces.push(`${puzzle.unusedWords.length} não encaixada(s)`);
  if (ignored.length) pieces.push(`${ignored.length} linha(s) ignorada(s) por tamanho inválido`);
  setSetupFeedback(`${pieces.join(' · ')}. Gere novamente para embaralhar a combinação e a posição das palavras.`, puzzle.unusedWords.length ? '' : 'success');
  focusCell(activeCellKey);
}

function getWordById(id) {
  if (id === null || id === undefined || id === '') return null;
  return puzzle?.words.find(word => word.id === Number(id)) || null;
}

function wordCellKeys(word) {
  if (!word) return [];
  return Array.from({ length: word.length }, (_, i) => {
    const row = word.row + (word.dir === 'down' ? i : 0);
    const col = word.col + (word.dir === 'across' ? i : 0);
    return `${row},${col}`;
  });
}

function focusCell(key) {
  if (!key) return;
  const node = [...$('crossword-board').querySelectorAll('.cross-cell')].find(cell => cell.dataset.key === key);
  if (node) node.focus({ preventScroll: true });
}

function renderBoard(shouldFocus = false) {
  if (!puzzle) return;
  const board = $('crossword-board');
  board.style.setProperty('--cols', puzzle.cols);
  const html = [];
  for (let row = 0; row < puzzle.rows; row++) {
    for (let col = 0; col < puzzle.cols; col++) {
      const cell = puzzle.cells[row][col];
      if (!cell) {
        html.push('<div class="block-cell" aria-hidden="true"></div>');
        continue;
      }
      const key = `${row},${col}`;
      const value = answers.get(key) || '';
      const wordActive = activeWordId !== null && (cell.acrossWordId === activeWordId || cell.downWordId === activeWordId);
      const classes = ['cross-cell'];
      if (wordActive) classes.push('is-active-word');
      if (activeCellKey === key) classes.push('is-current');
      if (wrongCells.has(key)) classes.push('is-wrong');
      const label = `Linha ${row + 1}, coluna ${col + 1}${cell.number ? `, número ${cell.number}` : ''}, ${value || 'vazia'}`;
      html.push(`<button type="button" class="${classes.join(' ')}" data-row="${row}" data-col="${col}" data-key="${key}" aria-label="${escapeHTML(label)}"><span class="cell-number">${cell.number || ''}</span><span class="cell-letter">${value}</span></button>`);
    }
  }
  board.innerHTML = html.join('');
  if (shouldFocus) focusCell(activeCellKey);
}

function renderClueList(direction, containerId) {
  const words = puzzle.words.filter(word => word.dir === direction).sort((a, b) => a.number - b.number);
  $(containerId).innerHTML = words.map(word => `
    <button type="button" class="clue-item${word.id === activeWordId ? ' active' : ''}" data-word-id="${word.id}" aria-pressed="${word.id === activeWordId}">
      <span class="clue-number">${word.number}</span>
      <span class="clue-copy">${escapeHTML(word.clue)}<small>${word.length} letras</small></span>
    </button>`).join('') || '<p class="field-help">Nenhuma palavra nesta direção.</p>';
  return words.length;
}

function renderClues() {
  if (!puzzle) return;
  const across = renderClueList('across', 'across-clues');
  const down = renderClueList('down', 'down-clues');
  $('across-count').textContent = across;
  $('down-count').textContent = down;
  $('clue-count').textContent = `${puzzle.words.length} pistas`;
}

function renderUnusedWords() {
  const unused = puzzle?.unusedWords || [];
  $('unused-panel').hidden = unused.length === 0;
  $('unused-words').textContent = unused.map(item => item.original || item.word).join(', ');
}

function updateProgress() {
  if (!puzzle) return;
  let total = 0;
  let filled = 0;
  for (let row = 0; row < puzzle.rows; row++) {
    for (let col = 0; col < puzzle.cols; col++) {
      if (!puzzle.cells[row][col]) continue;
      total++;
      if (answers.has(`${row},${col}`)) filled++;
    }
  }
  const percent = total ? Math.round((filled / total) * 100) : 0;
  $('progress-label').textContent = `${percent}% preenchido`;
  $('letter-count').textContent = `${filled} de ${total} letras`;
  $('progress-fill').style.width = `${percent}%`;
}

function activateWord(wordId, preferredKey = null) {
  const word = getWordById(wordId);
  if (!word) return;
  activeWordId = word.id;
  const keys = wordCellKeys(word);
  activeCellKey = preferredKey && keys.includes(preferredKey)
    ? preferredKey
    : (keys.find(key => !answers.has(key)) || keys[0]);
  lastClickedKey = null;
  renderBoard(true);
  renderClues();
}

function handleCellClick(button) {
  if (!puzzle || finished) return;
  const row = Number(button.dataset.row);
  const col = Number(button.dataset.col);
  const key = `${row},${col}`;
  const cell = puzzle.cells[row][col];
  const options = [cell.acrossWordId, cell.downWordId].filter(id => id !== null && id !== undefined);

  if (options.length > 1) {
    if (lastClickedKey === key) {
      activeWordId = activeWordId === options[0] ? options[1] : options[0];
    } else if (!options.includes(activeWordId)) {
      activeWordId = options[0];
    }
  } else if (options.length) {
    activeWordId = options[0];
  }
  activeCellKey = key;
  lastClickedKey = key;
  renderBoard(true);
  renderClues();
}

function moveCursor(step) {
  const word = getWordById(activeWordId);
  const keys = wordCellKeys(word);
  if (!keys.length) return;
  let index = keys.indexOf(activeCellKey);
  if (index < 0) index = 0;
  index = Math.max(0, Math.min(keys.length - 1, index + step));
  activeCellKey = keys[index];
  renderBoard(true);
}

function setLetter(letter) {
  if (!puzzle || finished) return;
  if (!activeCellKey) {
    const firstWord = puzzle.words[0];
    if (!firstWord) return;
    activeWordId = firstWord.id;
    activeCellKey = `${firstWord.row},${firstWord.col}`;
  }
  const word = getWordById(activeWordId);
  const keys = wordCellKeys(word);
  if (!keys.includes(activeCellKey)) activeCellKey = keys[0];
  const key = activeCellKey;
  answers.set(key, letter.toLocaleUpperCase('pt-BR'));
  wrongCells.delete(key);
  const index = keys.indexOf(key);
  if (index >= 0 && index < keys.length - 1) activeCellKey = keys[index + 1];
  renderBoard(true);
  renderClues();
  updateProgress();
  if (isSolved()) finishGame();
}

function deleteLetter() {
  if (!puzzle || finished) return;
  const word = getWordById(activeWordId);
  const keys = wordCellKeys(word);
  if (!keys.length) return;
  if (!activeCellKey || !keys.includes(activeCellKey)) activeCellKey = keys[0];
  if (answers.has(activeCellKey)) {
    answers.delete(activeCellKey);
    wrongCells.delete(activeCellKey);
  } else {
    const index = keys.indexOf(activeCellKey);
    if (index > 0) {
      activeCellKey = keys[index - 1];
      answers.delete(activeCellKey);
      wrongCells.delete(activeCellKey);
    }
  }
  renderBoard(true);
  updateProgress();
}

function isSolved() {
  if (!puzzle) return false;
  for (let row = 0; row < puzzle.rows; row++) {
    for (let col = 0; col < puzzle.cols; col++) {
      const cell = puzzle.cells[row][col];
      if (!cell) continue;
      if (answers.get(`${row},${col}`) !== cell.letter) return false;
    }
  }
  return true;
}

function finishGame() {
  if (finished) return;
  finished = true;
  stopClock();
  wrongCells.clear();
  renderBoard();
  $('win-banner').hidden = false;
  $('win-message').textContent = `${puzzle.words.length} palavras resolvidas${timerEnabled ? ` em ${formatTime(elapsedMs)}` : ', sem cronômetro'}.`;
  setFeedback('Todas as letras estão corretas. Excelente trabalho!', 'success');
}

function checkAnswers() {
  if (!puzzle || finished) return;
  wrongCells.clear();
  let empty = 0;
  for (let row = 0; row < puzzle.rows; row++) {
    for (let col = 0; col < puzzle.cols; col++) {
      const cell = puzzle.cells[row][col];
      if (!cell) continue;
      const key = `${row},${col}`;
      if (!answers.has(key)) empty++;
      else if (answers.get(key) !== cell.letter) wrongCells.add(key);
    }
  }
  if (isSolved()) {
    finishGame();
    return;
  }
  renderBoard();
  if (wrongCells.size) setFeedback(`${wrongCells.size} letra(s) incorreta(s) sinalizada(s). Revise as casas destacadas.`, 'error');
  else if (empty) setFeedback(`Ainda faltam ${empty} casa(s). Continue preenchendo a grade.`, '');
  else setFeedback('Confira os cruzamentos: todas as casas estão preenchidas, mas algumas letras precisam ser corrigidas.', 'error');
}

function clearBoard() {
  if (!puzzle) return;
  answers.clear();
  wrongCells.clear();
  finished = false;
  $('win-banner').hidden = true;
  const word = puzzle.words.find(item => item.id === activeWordId) || puzzle.words[0];
  activeWordId = word?.id ?? null;
  activeCellKey = word ? `${word.row},${word.col}` : null;
  startClock();
  renderBoard(true);
  renderClues();
  updateProgress();
  setFeedback('Grade limpa. Você pode começar novamente.');
}

function renderVirtualKeyboard() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  $('virtual-keyboard').innerHTML = letters.map(letter => `<button type="button" data-key="${letter}" aria-label="Digitar ${letter}">${letter}</button>`).join('')
    + '<button type="button" data-key="backspace" aria-label="Apagar última letra">⌫ Apagar</button>'
    + '<button type="button" data-key="next" aria-label="Próxima casa">Próxima ↗</button>';
}

function onKeyboardInput(event) {
  if (!puzzle || finished || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLElement && target.closest('textarea, input, select, a, button:not(.cross-cell), [contenteditable="true"]')) return;
  if (/^[a-zA-Z]$/.test(event.key)) {
    event.preventDefault();
    setLetter(event.key.toUpperCase());
    return;
  }
  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault();
    deleteLetter();
    return;
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    moveCursor(1);
    return;
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveCursor(-1);
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    const current = puzzle.words.findIndex(word => word.id === activeWordId);
    const next = puzzle.words[(current + 1) % puzzle.words.length];
    activateWord(next.id);
  }
}

function bindEvents() {
  $('tab-bank').addEventListener('click', () => setSourceMode('bank'));
  $('tab-custom').addEventListener('click', () => setSourceMode('custom'));
  $('generate-puzzle').addEventListener('click', createPuzzle);
  $('next-puzzle').addEventListener('click', createPuzzle);
  $('clear-board').addEventListener('click', clearBoard);
  $('check-answers').addEventListener('click', checkAnswers);
  $('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('custom-words').addEventListener('input', () => safeStorageSet(STORAGE.custom, $('custom-words').value));
  $('difficulty').addEventListener('change', () => safeStorageSet(STORAGE.difficulty, $('difficulty').value));
  $('timer-enabled').addEventListener('change', () => {
    timerEnabled = $('timer-enabled').checked;
    if (puzzle && !finished) startClock();
    else updateTimer();
  });

  $('crossword-board').addEventListener('click', event => {
    const button = event.target.closest('.cross-cell');
    if (button) handleCellClick(button);
  });
  $('across-clues').addEventListener('click', event => {
    const button = event.target.closest('[data-word-id]');
    if (button) activateWord(button.dataset.wordId);
  });
  $('down-clues').addEventListener('click', event => {
    const button = event.target.closest('[data-word-id]');
    if (button) activateWord(button.dataset.wordId);
  });
  $('virtual-keyboard').addEventListener('click', event => {
    const button = event.target.closest('[data-key]');
    if (!button) return;
    if (button.dataset.key === 'backspace') deleteLetter();
    else if (button.dataset.key === 'next') moveCursor(1);
    else setLetter(button.dataset.key);
    focusCell(activeCellKey);
  });
  document.addEventListener('keydown', onKeyboardInput);
}

function initialize() {
  $('bank-count').textContent = WORD_BANK.length;
  $('bank-count-copy').textContent = `${WORD_BANK.length} palavras originais`;
  $('custom-words').value = safeStorageGet(STORAGE.custom, '');
  const savedLevel = safeStorageGet(STORAGE.difficulty, 'medio');
  if (LEVELS[savedLevel]) $('difficulty').value = savedLevel;
  setTheme(safeStorageGet(STORAGE.theme, 'dark'));
  const savedSource = safeStorageGet(STORAGE.source, 'bank');
  setSourceMode(savedSource === 'custom' && $('custom-words').value.trim() ? 'custom' : 'bank');
  renderVirtualKeyboard();
  bindEvents();
  createPuzzle();
}

initialize();
