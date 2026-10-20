// Motor de geração de palavras cruzadas do NEXUS.
// As palavras são normalizadas sem acentos para o encaixe, mas as dicas preservam a grafia original.
// O banco é carregado por word-bank.js antes deste módulo.
export const WORD_BANK = (Array.isArray(globalThis.NEXUS_WORD_BANK) ? globalThis.NEXUS_WORD_BANK : [])
  .map((item, index) => ({ ...item, id: `bank-${index}`, original: item.original || item.word }));

export const LEVELS = {
  facil: { label: 'Fácil', count: 8, description: '8 palavras' },
  medio: { label: 'Médio', count: 12, description: '12 palavras' },
  dificil: { label: 'Difícil', count: 16, description: '16 palavras' },
  extremo: { label: 'Extremo', count: 20, description: '20 palavras' },
};

export function normalizeWord(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-Z]/g, '');
}

export function parseCustomWords(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const words = [];
  const seen = new Set();
  const ignored = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = line.split(/\s*(?:\||—|\t)\s*/, 2);
    const original = (parts[0] || '').trim();
    const word = normalizeWord(original);
    const clue = (parts[1] || '').trim();

    if (word.length < 2 || word.length > 16) {
      ignored.push(original || line);
      continue;
    }
    if (seen.has(word)) continue;
    seen.add(word);
    words.push({
      word,
      original: original.toLocaleUpperCase('pt-BR'),
      clue: clue || `Palavra escolhida por você · ${word.length} letras`,
      custom: true,
    });
    if (words.length >= 50) break;
  }

  return { words, ignored };
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function chooseWords(pool, count, random = Math.random) {
  return shuffle(pool, random).slice(0, Math.min(count, pool.length));
}

function blankGrid(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ({ letter: '', across: false, down: false })));
}

function boundsFor(placements) {
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  for (const p of placements) {
    for (let i = 0; i < p.word.length; i++) {
      const r = p.r + (p.dir === 'down' ? i : 0);
      const c = p.c + (p.dir === 'across' ? i : 0);
      minR = Math.min(minR, r); minC = Math.min(minC, c);
      maxR = Math.max(maxR, r); maxC = Math.max(maxC, c);
    }
  }
  if (!placements.length) return { minR: 0, minC: 0, maxR: 0, maxC: 0, area: 0 };
  return { minR, minC, maxR, maxC, area: (maxR - minR + 1) * (maxC - minC + 1) };
}

function crossingCount(grid) {
  let total = 0;
  for (const row of grid) for (const cell of row) if (cell.across && cell.down) total++;
  return total;
}

function placeWord(grid, item, r, c, dir) {
  for (let i = 0; i < item.word.length; i++) {
    const rr = r + (dir === 'down' ? i : 0);
    const cc = c + (dir === 'across' ? i : 0);
    const cell = grid[rr][cc];
    cell.letter = item.word[i];
    cell[dir] = true;
  }
  return { ...item, r, c, dir };
}

function fits(grid, item, r, c, dir) {
  const size = grid.length;
  const dr = dir === 'down' ? 1 : 0;
  const dc = dir === 'across' ? 1 : 0;
  const endR = r + dr * (item.word.length - 1);
  const endC = c + dc * (item.word.length - 1);
  if (r < 1 || c < 1 || endR >= size - 1 || endC >= size - 1) return null;

  const beforeR = r - dr, beforeC = c - dc;
  const afterR = endR + dr, afterC = endC + dc;
  if (grid[beforeR][beforeC].letter || grid[afterR][afterC].letter) return null;

  const perpendicular = dir === 'across' ? 'down' : 'across';
  let crossings = 0;
  for (let i = 0; i < item.word.length; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    const cell = grid[rr][cc];
    if (cell[dir]) return null;
    if (cell.letter) {
      if (cell.letter !== item.word[i] || !cell[perpendicular]) return null;
      crossings++;
    } else if (dir === 'across') {
      if (grid[rr - 1][cc].letter || grid[rr + 1][cc].letter) return null;
    } else if (grid[rr][cc - 1].letter || grid[rr][cc + 1].letter) {
      return null;
    }
  }
  return crossings > 0 ? { crossings } : null;
}

function findCandidates(grid, item, placements, random) {
  const candidates = new Map();
  const currentBounds = boundsFor(placements);
  for (const existing of placements) {
    const dir = existing.dir === 'across' ? 'down' : 'across';
    for (let i = 0; i < existing.word.length; i++) {
      const crossR = existing.r + (existing.dir === 'down' ? i : 0);
      const crossC = existing.c + (existing.dir === 'across' ? i : 0);
      const letter = existing.word[i];
      for (let j = 0; j < item.word.length; j++) {
        if (item.word[j] !== letter) continue;
        const r = dir === 'down' ? crossR - j : crossR;
        const c = dir === 'across' ? crossC - j : crossC;
        const key = `${r},${c},${dir}`;
        if (candidates.has(key)) continue;
        const fit = fits(grid, item, r, c, dir);
        if (!fit) continue;
        const hypothetical = [...placements, { ...item, r, c, dir }];
        const nextBounds = boundsFor(hypothetical);
        const areaGrowth = nextBounds.area - currentBounds.area;
        const centerDistance = Math.abs((r + (dir === 'down' ? item.word.length / 2 : 0)) - grid.length / 2)
          + Math.abs((c + (dir === 'across' ? item.word.length / 2 : 0)) - grid.length / 2);
        const score = fit.crossings * 120 - areaGrowth * 0.8 - centerDistance * 0.12 + random() * 5;
        candidates.set(key, { r, c, dir, crossings: fit.crossings, score });
      }
    }
  }
  return [...candidates.values()].sort((a, b) => b.score - a.score);
}

function oneAttempt(words, size, random) {
  const grid = blankGrid(size);
  const sorted = shuffle(words, random).sort((a, b) => b.word.length - a.word.length || random() - 0.5);
  const first = sorted[0];
  if (!first) return { grid, placements: [] };
  const r = Math.floor(size / 2);
  const c = Math.floor((size - first.word.length) / 2);
  const placements = [placeWord(grid, first, r, c, 'across')];

  for (const item of sorted.slice(1)) {
    const candidates = findCandidates(grid, item, placements, random);
    if (!candidates.length) continue;
    const best = candidates[0];
    placements.push(placeWord(grid, item, best.r, best.c, best.dir));
  }
  return { grid, placements };
}

function cropLayout(grid, placements, unusedWords) {
  const bounds = boundsFor(placements);
  const offsetR = Math.max(0, bounds.minR - 1);
  const offsetC = Math.max(0, bounds.minC - 1);
  const rows = bounds.maxR - bounds.minR + 3;
  const cols = bounds.maxC - bounds.minC + 3;
  const cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

  for (let r = bounds.minR; r <= bounds.maxR; r++) {
    for (let c = bounds.minC; c <= bounds.maxC; c++) {
      const cell = grid[r][c];
      if (!cell.letter) continue;
      cells[r - offsetR][c - offsetC] = {
        letter: cell.letter,
        number: null,
        acrossWordId: null,
        downWordId: null,
      };
    }
  }

  const normalized = placements.map(p => ({
    ...p,
    row: p.r - offsetR,
    col: p.c - offsetC,
    length: p.word.length,
  })).sort((a, b) => a.row - b.row || a.col - b.col || (a.dir === 'across' ? -1 : 1));

  const starts = new Map();
  let number = 1;
  for (const p of normalized) {
    const key = `${p.row},${p.col}`;
    if (!starts.has(key)) starts.set(key, number++);
    p.number = starts.get(key);
  }

  normalized.forEach((p, id) => {
    p.id = id;
    const startCell = cells[p.row][p.col];
    if (startCell) startCell.number = starts.get(`${p.row},${p.col}`) || null;
    for (let i = 0; i < p.word.length; i++) {
      const r = p.row + (p.dir === 'down' ? i : 0);
      const c = p.col + (p.dir === 'across' ? i : 0);
      const cell = cells[r][c];
      if (p.dir === 'across') cell.acrossWordId = id;
      else cell.downWordId = id;
    }
  });

  return {
    rows,
    cols,
    cells,
    words: normalized,
    unusedWords,
    crossings: crossingCount(grid),
  };
}

export function generateCrossword(inputWords, options = {}) {
  const size = Math.max(25, Math.min(41, Number(options.size) || 35));
  const attempts = Math.max(12, Math.min(120, Number(options.attempts) || 70));
  const words = inputWords
    .map((item, index) => ({
      ...item,
      word: normalizeWord(item.word),
      id: item.id ?? `${normalizeWord(item.word)}-${index}`,
    }))
    .filter(item => item.word.length >= 2 && item.word.length <= size - 4);

  if (!words.length) throw new Error('Inclua pelo menos uma palavra válida.');
  let best = null;
  let bestScore = -Infinity;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const layout = oneAttempt(words, size, options.random || Math.random);
    const placedIds = new Set(layout.placements.map(p => p.id));
    const unused = words.filter(w => !placedIds.has(w.id));
    const crossings = crossingCount(layout.grid);
    const bounds = boundsFor(layout.placements);
    const score = layout.placements.length * 10000 + crossings * 120 - bounds.area * 0.15 + (options.random || Math.random)();
    if (score > bestScore) {
      bestScore = score;
      best = { ...layout, unused };
      if (layout.placements.length === words.length) break;
    }
  }
  if (!best?.placements.length) throw new Error('Não foi possível montar a grade com essa lista. Tente outras palavras.');
  return cropLayout(best.grid, best.placements, best.unused);
}
