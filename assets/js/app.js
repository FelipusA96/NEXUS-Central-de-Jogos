import { games, categories } from './catalog.js';

const $ = id => document.getElementById(id);
const pageNames = { inicio:'INÍCIO', jogos:'JOGOS', ranking:'RANKINGS', perfil:'PERFIL' };
const levelNames = { facil:'Fácil', medio:'Médio', dificil:'Difícil', extremo:'Extremo' };
let activeFilter = 'todos';
let currentLevel = 'medio';
let currentRankGame = 'caca-palavras';
let rankRequest = 0;

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function drawCard(game) {
  const common = `data-game="${game.id}"`;
  const details = game.playable
    ? `<a href="${game.href}" aria-label="Jogar ${escapeHTML(game.title)}">Jogar agora <span aria-hidden="true">↗</span></a>`
    : `<button type="button" class="soon" ${common} aria-label="Conhecer ${escapeHTML(game.title)}">Conhecer projeto <span aria-hidden="true">↗</span></button>`;
  return `<article class="game-card">
    <div class="game-cover ${game.glow}" aria-hidden="true">
      <span class="mini-code">${escapeHTML(game.kicker)}</span>
      <span class="glyph">${escapeHTML(game.icon)}</span>
      <span class="cover-bar"></span>
    </div>
    <div class="game-card-body">
      <div class="card-meta"><span class="chip ${game.playable?'live':''}">${game.playable?'● DISPONÍVEL':'EM BREVE'}</span></div>
      <h3>${escapeHTML(game.title)}</h3>
      <p>${escapeHTML(game.short)}</p>
      <div class="game-action">${details}<span aria-hidden="true">→</span></div>
    </div>
  </article>`;
}

function renderCatalog() {
  $('home-game-grid').innerHTML = games.map(drawCard).join('');
  $('category-filters').innerHTML = categories.map(category =>
    `<button type="button" data-filter="${category.id}" class="filter-btn ${activeFilter===category.id?'active':''}" aria-pressed="${activeFilter===category.id}">${category.label}</button>`
  ).join('');
  filterCatalog();
}

function filterCatalog() {
  const term = $('search-games').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const shown = games.filter(game => {
    const haystack = `${game.title} ${game.category} ${game.label} ${game.description}`
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return (activeFilter==='todos' || game.category===activeFilter) && haystack.includes(term);
  });
  $('catalog-game-grid').innerHTML = shown.map(drawCard).join('');
  $('catalog-count').textContent = `${shown.length} de ${games.length} jogos · ${shown.filter(g=>g.playable).length} disponível(is)`;
  $('catalog-empty').hidden = shown.length!==0;
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.classList.toggle('active',button.dataset.filter===activeFilter);
    button.setAttribute('aria-pressed',String(button.dataset.filter===activeFilter));
  });
}

function navigate(forcePage = null) {
  const route = forcePage || location.hash.slice(1).split('?')[0];
  const query = location.hash.split('?')[1] || '';
  if (route==='ranking' && ['campo-minado','sudoku','caca-palavras','memoria','paciencia-spider'].includes(new URLSearchParams(query).get('jogo'))) setRankGame(new URLSearchParams(query).get('jogo'),false);
  const page = pageNames[route] ? route : 'inicio';
  document.querySelectorAll('[data-view]').forEach(view => {
    view.hidden = view.dataset.view!==page;
  });
  document.querySelectorAll('[data-page]').forEach(item => {
    const current = item.dataset.page === page;
    item.classList.toggle('active', current);
    if (current) item.setAttribute('aria-current','page');
    else item.removeAttribute('aria-current');
  });
  $('current-crumb').textContent = pageNames[page];
  document.title = `${pageNames[page]} | NEXUS Central de Jogos`;
  window.scrollTo({top:0,behavior:'instant'});
  if (page==='ranking') loadRanking();
  if (page==='perfil') readProfile();
}

function setTheme(mode) {
  const valid = mode === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.mode = valid;
  $('theme-toggle').setAttribute('aria-label', valid==='dark'?'Ativar modo claro':'Ativar modo escuro');
  $('theme-toggle').title = valid==='dark'?'Ativar modo claro':'Ativar modo escuro';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = valid==='dark'?'#080d19':'#f2f5ff';
  try { localStorage.setItem('nexus-hud-theme-v1',valid); } catch (_) {}
}

function formatTime(ms) {
  const seconds = Math.floor(ms/1000);
  const hrs = Math.floor(seconds/3600);
  const minutes = String(Math.floor(seconds%3600/60)).padStart(2,'0');
  const secs = String(seconds%60).padStart(2,'0');
  return hrs ? `${hrs}:${minutes}:${secs}` : `${minutes}:${secs}`;
}

async function loadRanking() {
  const id = ++rankRequest;
  const body = $('rank-body');
  body.replaceChildren();
  const feedback = document.createElement('p');
  feedback.className = 'feedback';
  feedback.textContent = `Consultando ranking ${levelNames[currentLevel]}…`;
  body.appendChild(feedback);
  $('rank-status').textContent = '';
  try {
    // Firebase SDK carregado APENAS quando a página de ranking é aberta.
    const { readRanking } = await import('./firebase.js');
    const rows = await readRanking(currentLevel,20,currentRankGame);
    if (id!==rankRequest) return;
    body.replaceChildren();
    if (!rows.length) {
      const p=document.createElement('p');p.className='feedback';p.textContent='Ainda não existem resultados registrados nesta dificuldade.';body.appendChild(p);
      return;
    }
    for(const row of rows){
      const article=document.createElement('div');article.className='rank-row';
      const place=document.createElement('span');place.className='place';place.textContent=row.place===1?'🥇':row.place===2?'🥈':row.place===3?'🥉':`#${row.place}`;
      const person=document.createElement('div');
      const strong=document.createElement('strong');strong.textContent=row.name;
      const sub=document.createElement('small');sub.textContent=row.theme;
      person.append(strong,sub);
      const time=document.createElement('span');time.className='time';time.textContent=currentRankGame==='memoria' ? `${row.attempts} tentativas · ${formatTime(row.time)}` : currentRankGame==='paciencia-spider' ? `${row.moves} mov. · ${formatTime(row.time)}` : formatTime(row.time);
      article.append(place,person,time);body.appendChild(article);
    }
    $('rank-status').textContent=`${rows.length} resultado(s) exibido(s) · ${levelNames[currentLevel]} · ${({'campo-minado':'Campo Minado','sudoku':'Sudoku diário','caca-palavras':'Caça-Palavras','memoria':'Memória diário','paciencia-spider':'Spider diário'})[currentRankGame]}`;
  } catch(e) {
    if(id!==rankRequest)return;
    body.replaceChildren();
    const p=document.createElement('p');p.className='feedback error';
    p.textContent='Não foi possível consultar os dados reais. Verifique sua conexão, as regras do Firestore e a publicação do site.';
    body.appendChild(p);
    $('rank-status').textContent='Falha ao carregar ranking.';
    console.warn('Erro ao consultar ranking:',e);
  }
}

async function readProfile() {
  $('profile-status').textContent='Consultando sessão no Firebase…';
  try {
    // Carregamento sob demanda: não pesa no primeiro acesso à HUD.
    const { currentUser } = await import('./firebase.js');
    const user=await currentUser();
    const identified=user && !user.isAnonymous;
    const nickname=identified ? (user.email?.split('@')[0]||'Jogador') : 'Visitante';
    $('profile-name').textContent=nickname;
    $('mini-username').textContent=nickname;
    $('mini-avatar').textContent=nickname[0].toUpperCase();
    $('profile-avatar').textContent=nickname[0].toUpperCase();
    $('profile-desc').textContent=identified
      ? 'Sessão identificada no Firebase. Seus modelos salvos e o gerenciamento de conta permanecem disponíveis dentro do Caça-Palavras.'
      : 'Você pode jogar sem conta. Para registrar tempos, informe um apelido após vencer com cronômetro. Modelos salvos exigem uma conta com e-mail e senha.';
    $('profile-status').textContent=identified?'Sessão autenticada detectada.':user?'Sessão anônima de ranking ativa.':'Sem sessão autenticada.';
  }catch(e){
    $('profile-status').textContent='Não foi possível consultar sua sessão nesta conexão.';
    console.warn('Erro ao carregar perfil:',e);
  }
}

function drawHeroBoard() {
  const grid = [
    'PXTLVOA',
    'AEMRUZQ',
    'BJOGARV',
    'KOTVSAE',
    'AQZNPXE',
    'MNRTBOL',
    'RYAKUEH',
  ];
  $('hero-board').innerHTML=grid.join('').split('').map((letter,i)=>{
    const hit = Math.floor(i/7)===2 && i%7>=1 && i%7<=5;
    return `<span class="${hit?'hit':''}">${letter}</span>`;
  }).join('');
}

// Eventos e navegação de páginas: o hash mantém histórico/URLs compartilháveis.
function goToPage(page) {
  if (!pageNames[page]) return;
  if (location.hash !== `#${page}`) {
    try { history.pushState(null, '', `#${page}`); }
    catch (_) { /* O protótipo também funciona em prévias isoladas. */ }
  }
  navigate(page);
}
window.addEventListener('hashchange', () => navigate());
window.addEventListener('popstate', () => navigate());
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = link.getAttribute('href').slice(1);
  if (!pageNames[target]) return;
  event.preventDefault();
  goToPage(target);
});
$('search-games').addEventListener('input',()=>{
  if (document.querySelector('[data-view="jogos"]').hidden) {
    goToPage('jogos');
  }
  filterCatalog();
});
$('category-filters').addEventListener('click',event=>{
  const button=event.target.closest('[data-filter]');
  if(!button)return;
  activeFilter=button.dataset.filter;
  filterCatalog();
});
document.addEventListener('click',event=>{
  const button=event.target.closest('button[data-game]');
  if(!button)return;
  const game=games.find(item=>item.id===button.dataset.game);
  if(!game||game.playable)return;
  $('modal-kicker').textContent=game.kicker;
  $('modal-title').textContent=game.title;
  $('modal-description').textContent=game.description;
  $('game-modal').showModal();
});
$('theme-toggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.mode==='dark'?'light':'dark'));
$('rank-controls').addEventListener('click',event=>{
  const btn=event.target.closest('[data-level]');
  if(!btn)return;
  currentLevel=btn.dataset.level;
  document.querySelectorAll('[data-level]').forEach(button=>button.classList.toggle('active',button.dataset.level===currentLevel));
  loadRanking();
});
function setRankGame(game,refresh=true){
  if (!['caca-palavras','campo-minado','sudoku','memoria','paciencia-spider'].includes(game)) return;
  currentRankGame=game;
  document.querySelectorAll('[data-rank-game]').forEach(button=>{
    const selected=button.dataset.rankGame===currentRankGame;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
  const gameNames={'caca-palavras':'Caça-Palavras','campo-minado':'Campo Minado','sudoku':'Sudoku','memoria':'Memória','paciencia-spider':'Paciência Spider'};
  $('rank-game-link').href=`./jogos/${currentRankGame}/`;
  $('rank-score-label').textContent=currentRankGame==='memoria'?'Tentativas · tempo':currentRankGame==='paciencia-spider'?'Movimentos · tempo':'Tempo';
  $('rank-help-title').textContent=currentRankGame==='memoria'?'Menos tentativas vence.':currentRankGame==='paciencia-spider'?'Menos movimentos vence.':'Seu melhor tempo conta.';
  $('rank-help-text').textContent=currentRankGame==='memoria'?'Na Memória, menos tentativas vem primeiro; o tempo desempata. Apenas desafios diários com cronômetro.':currentRankGame==='paciencia-spider'?'No Spider diário, todos começam com as mesmas cartas. Menos movimentos vence; o tempo desempata. Dicas e desfazer não são permitidos no ranking.':'Conclua a partida com cronômetro. Para Sudoku, apenas o desafio diário sem dicas ou conferências pode ser registrado.';
  $('rank-game-link').textContent=`Abrir ${gameNames[currentRankGame]} ↗`;
  if(refresh) loadRanking();
}
$('rank-game-controls').addEventListener('click',event=>{
  const btn=event.target.closest('[data-rank-game]');
  if(btn) setRankGame(btn.dataset.rankGame);
});
$('rank-refresh').addEventListener('click',loadRanking);
$('profile-refresh').addEventListener('click',readProfile);

try {setTheme(localStorage.getItem('nexus-hud-theme-v1') || 'dark');}catch(_){setTheme('dark');}
renderCatalog();
drawHeroBoard();
navigate();
