/** Regras puras do Campo Minado. Sem dependências do DOM ou Firebase. */
export const LEVELS = Object.freeze({
  facil:   { label: 'Fácil',   rows: 9,  cols: 9,  mines: 10, icon: '🌱' },
  medio:   { label: 'Médio',   rows: 12, cols: 12, mines: 24, icon: '◈' },
  dificil: { label: 'Difícil', rows: 16, cols: 16, mines: 40, icon: '🔥' },
  extremo: { label: 'Extremo', rows: 20, cols: 20, mines: 80, icon: '👑' },
});

export function createGame(level = 'medio', random = Math.random) {
  if (!Object.hasOwn(LEVELS,level)) throw new Error('Dificuldade inválida.');
  const config = LEVELS[level];
  return {
    level, config, random,
    cells: Array.from({length: config.rows*config.cols}, () => ({mine:false,near:0,open:false,flag:false})),
    generated: false,
    outcome: null,
    openedCount: 0,
    flagCount: 0,
    exploded: -1,
  };
}

export function neighbors(game,index) {
  const {rows,cols} = game.config;
  const r = Math.floor(index / cols), c = index % cols;
  const result=[];
  for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
    if (!dr && !dc) continue;
    const y=r+dr,x=c+dc;
    if (y>=0 && y<rows && x>=0 && x<cols) result.push(y*cols+x);
  }
  return result;
}

function seedMines(game,safeIndex) {
  // O primeiro clique e suas oito vizinhas ficam seguros.
  const forbidden = new Set([safeIndex,...neighbors(game,safeIndex)]);
  let candidates=game.cells.map((_,i)=>i).filter(i=>!forbidden.has(i));
  // Proteção adicional, caso uma configuração futura seja muito densa.
  if (candidates.length<game.config.mines) {
    candidates=game.cells.map((_,i)=>i).filter(i=>i!==safeIndex);
  }
  for (let i=candidates.length-1;i>0;i--) {
    const j=Math.floor(Math.max(0,Math.min(0.999999999,game.random()))*(i+1));
    [candidates[i],candidates[j]]=[candidates[j],candidates[i]];
  }
  for (const index of candidates.slice(0,game.config.mines)) {
    game.cells[index].mine=true;
  }
  game.cells.forEach((cell,index)=>{
    if (!cell.mine) cell.near=neighbors(game,index).reduce((n,j)=>n+Number(game.cells[j].mine),0);
  });
  game.generated=true;
}

export function toggleFlag(game,index) {
  const cell=game.cells[index];
  if (!cell || game.outcome || cell.open) return false;
  if (!cell.flag && game.flagCount>=game.config.mines) return false;
  cell.flag=!cell.flag;
  game.flagCount+=cell.flag?1:-1;
  return true;
}

export function revealCell(game,index) {
  const cell=game.cells[index];
  if (!cell || game.outcome || cell.flag) return {changed: false};
  if (!game.generated) seedMines(game,index);
  const queue=[];
  // Ao clicar no número já aberto com o mesmo total de bandeiras ao redor,
  // revela as vizinhas ainda ocultas (chord, padrão de Campo Minado).
  if (cell.open) {
    if (!cell.near) return {changed:false};
    const adjacent=neighbors(game,index);
    if (adjacent.filter(j=>game.cells[j].flag).length!==cell.near) return {changed:false};
    queue.push(...adjacent.filter(j=>!game.cells[j].open && !game.cells[j].flag));
  } else {
    queue.push(index);
  }
  const visited=new Set();
  let changed=false;
  while (queue.length) {
    const j=queue.shift();
    if (visited.has(j)) continue;
    visited.add(j);
    const item=game.cells[j];
    if (item.open || item.flag) continue;
    if (item.mine) {
      game.exploded=j;
      game.outcome='lost';
      return {changed:true, outcome:'lost'};
    }
    item.open=true;
    game.openedCount++;
    changed=true;
    if (item.near===0) {
      for (const k of neighbors(game,j)) {
        if (!game.cells[k].open && !game.cells[k].flag && !visited.has(k)) queue.push(k);
      }
    }
  }
  if (game.openedCount===game.cells.length-game.config.mines) {
    game.outcome='won';
    for (const item of game.cells) {
      if (item.mine && !item.flag) {item.flag=true;game.flagCount++;}
    }
  }
  return {changed,outcome:game.outcome};
}
