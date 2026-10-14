import {LEVELS,createGame,revealCell,toggleFlag} from './engine.js';

const $=id=>document.getElementById(id);
const board=$('board');
const mineDisplay=$('mines-left');
const timeDisplay=$('elapsed');
const openedDisplay=$('safe-count');
const message=$('game-message');
const resultDialog=$('result-dialog');
const preferenceKey='nexus-campo-minado-pref-v1';
const nicknameKey='nexus-campo-minado-nickname-v1';

let level='medio';
let mode='reveal';
let useTimer=true;
let game;
let tiles=[];
let firstReveal=false;
let startTime=0;
let finalTime=0;
let tick=null;
let result=null;
let lastSubmitted=null;
let rankingLevel='medio';
let listToken=0;

function formatTime(ms){
  const sec=Math.floor(ms/1000),h=Math.floor(sec/3600);
  const min=String(Math.floor(sec%3600/60)).padStart(2,'0');
  const rem=String(sec%60).padStart(2,'0');
  return h?`${h}:${min}:${rem}`:`${min}:${rem}`;
}

function now(){return performance.now();}
function elapsed(){return firstReveal&&!game.outcome?now()-startTime:finalTime;}
function refreshMetrics(){
  mineDisplay.textContent=String(game.config.mines-game.flagCount).padStart(3,'0');
  timeDisplay.textContent=useTimer?formatTime(elapsed()):'--:--';
  const safe=game.cells.length-game.config.mines;
  openedDisplay.textContent=`${String(game.openedCount).padStart(3,'0')}/${safe}`;
}

function stopClock(){
  if (tick!==null){clearInterval(tick);tick=null;}
  if(firstReveal) finalTime=Math.max(1,Math.round(now()-startTime));
  refreshMetrics();
}
function startClock(){
  if(!firstReveal){firstReveal=true;startTime=now();}
  if(useTimer&&tick===null) tick=setInterval(refreshMetrics,250);
}
function updateStatus(state,subtitle){
  const indicator=document.querySelector('.mission-indicator');
  indicator.classList.toggle('critical',state==='lost');
  indicator.classList.toggle('complete',state==='won');
  $('mission-state').textContent=({ready:'MISSÃO PRONTA',active:'CAMPO ATIVO',lost:'MISSÃO FALHOU',won:'MISSÃO CUMPRIDA'})[state];
  $('round-status').textContent=subtitle;
}

// Coordenadas: coluna A..T, seguida da linha 1..20 (ex.: A3).
function tileCoordinate(index){
  const row=Math.floor(index/game.config.cols)+1;
  const column=String.fromCharCode(65+(index%game.config.cols));
  return `${column}${row}`;
}
function showCoordinate(index){
  $('active-coordinate').textContent=tileCoordinate(index);
}
function tileLabel(index){
  const cell=game.cells[index],r=Math.floor(index/game.config.cols)+1;
  const col=String.fromCharCode(65+(index%game.config.cols));
  const loc=`${col}${r}, coluna ${col}, linha ${r}`;
  if (game.outcome==='lost'&&cell.mine) return `Mina, ${loc}`;
  if(cell.flag) return `Bandeira, ${loc}`;
  if(!cell.open)return `Casa oculta, ${loc}`;
  return cell.near?`${cell.near} mina${cell.near>1?'s':''} próxima${cell.near>1?'s':''}, ${loc}`:`Casa vazia, ${loc}`;
}
function renderCells(){
  game.cells.forEach((cell,i)=>{
    const node=tiles[i];
    node.className='cell';
    node.dataset.near=String(cell.near);
    node.textContent='';
    if(cell.open){
      node.classList.add('open');
      if(cell.near){node.textContent=String(cell.near);}
      else node.classList.add('zero');
    }else if(cell.flag){
      node.classList.add('flag');
      node.textContent='⚑';
    }
    if(game.outcome==='lost'){
      if(cell.mine){
        node.classList.add('mine');
        node.textContent=cell.flag?'⚑':'✹';
      }else if(cell.flag){
        node.classList.add('wrong');
        node.textContent='×';
      }
      if(i===game.exploded){node.classList.add('exploded');node.textContent='✹';}
    }
    node.setAttribute('aria-label',tileLabel(i));
    node.setAttribute('aria-pressed',String(cell.flag));
  });
  refreshMetrics();
}

function setMode(next){
  mode=next;
  document.querySelectorAll('.mode-btn[data-mode]').forEach(btn=>{
    const active=btn.dataset.mode===mode;
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-pressed',String(active));
  });
}
function clearResult(){
  result=null;lastSubmitted=null;
  $('save-score').disabled=true;
  $('submit-status').textContent='Conclua uma partida com cronômetro para se classificar.';
}
function persistPreference(){
  try{localStorage.setItem(preferenceKey,JSON.stringify({level,useTimer}));}catch(_){/* sem armazenamento */}
}
function freshRound(){
  if (tick!==null){clearInterval(tick);tick=null;}
  game=createGame(level);
  firstReveal=false;finalTime=0;startTime=0;
  clearResult();
  message.textContent='Selecione uma casa para iniciar a missão. O primeiro clique e suas vizinhas são seguros.';
  updateStatus('ready','AGUARDANDO PRIMEIRO CLIQUE');
  board.style.setProperty('--cols',game.config.cols);
  $('field-size').textContent=`${game.config.rows} × ${game.config.cols}`;
  $('elapsed').parentElement.querySelector('span').textContent=useTimer?'TEMPO DECORRIDO':'MODO LIVRE';
  document.querySelectorAll('[data-level]').forEach(btn=>{
    const active=btn.dataset.level===level;
    btn.classList.toggle('selected',active);
    btn.setAttribute('aria-pressed',String(active));
  });
  board.replaceChildren();tiles=[];
  $('active-coordinate').textContent='—';
  const fragment=document.createDocumentFragment();
  const axis=(text,classes)=>{
    const el=document.createElement('span');
    el.className=`axis-label ${classes}`;
    el.textContent=text;
    el.setAttribute('aria-hidden','true');
    return el;
  };
  // Linha superior: canto vazio e letras alinhadas às colunas.
  fragment.append(axis('','axis-corner'));
  for(let c=0;c<game.config.cols;c++){
    fragment.append(axis(String.fromCharCode(65+c),'axis-col'));
  }
  // Corpo: números das linhas, seguidos pelas casas clicáveis.
  for(let r=0;r<game.config.rows;r++){
    fragment.append(axis(String(r+1),'axis-row'));
    for(let c=0;c<game.config.cols;c++){
      const index=r*game.config.cols+c;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='cell';
      btn.dataset.index=String(index);
      btn.dataset.coordinate=tileCoordinate(index);
      btn.title=tileCoordinate(index);
      btn.setAttribute('aria-label',tileLabel(index));
      fragment.append(btn);tiles.push(btn);
    }
  }
  board.append(fragment);
  renderCells();
  persistPreference();
  setRankingLevel(level);
}
function changeConfiguration(nextLevel,nextTimer){
  if((game.generated||game.flagCount>0)&&!game.outcome){
    if(!confirm('A partida atual será descartada. Deseja continuar?')){
      $('clock-enabled').checked=useTimer;
      return;
    }
  }
  level=nextLevel;
  useTimer=nextTimer;
  if(resultDialog.open)resultDialog.close();
  freshRound();
}
function act(index,action='reveal'){
  showCoordinate(index);
  if(game.outcome)return;
  if(action==='flag'){
    if(toggleFlag(game,index)){
      renderCells();
      message.textContent=game.cells[index].flag?'Bandeira posicionada.':'Bandeira retirada.';
    }else if(game.flagCount>=game.config.mines){
      message.textContent='Todas as bandeiras já foram utilizadas.';
    }
    return;
  }
  const startedBefore=game.generated;
  const resultAction=revealCell(game,index);
  if(!startedBefore && game.generated){
    startClock();
    updateStatus('active','EM EXPLORAÇÃO');
  }
  if(!resultAction.changed)return;
  if(game.outcome){stopClock();}
  renderCells();
  if(game.outcome==='lost'){
    message.textContent='Você encontrou uma mina. As bombas foram reveladas.';
    updateStatus('lost','MINA DETONADA');
    showResult(false);
  }else if(game.outcome==='won'){
    message.textContent='Campo seguro! Todas as casas livres foram reveladas.';
    updateStatus('won','TODAS AS CASAS SEGURAS');
    if(useTimer){
      result={id:`${Date.now()}-${Math.random().toString(36).slice(2)}`, level,time:finalTime,description:`Campo Minado · ${game.config.rows}×${game.config.cols} · ${game.config.mines} minas`};
      $('save-score').disabled=false;
      $('submit-status').textContent=`Vitória em ${formatTime(finalTime)}! Informe um apelido e registre seu tempo.`;
    }
    showResult(true);
  }else{
    message.textContent=game.openedCount>1?'Continue explorando. Analise os números para deduzir onde estão as minas.':'Setor inicial aberto! As minas foram distribuídas ao redor da zona segura.';
  }
}
function showResult(won){
  $('result-icon').textContent=won?'🏆':'💥';
  $('result-kicker').textContent=won?'MISSÃO CONCLUÍDA':'ALERTA // EXPLOSÃO';
  $('result-title').textContent=won?'Campo liberado!':'Mina encontrada';
  $('result-description').textContent=won
    ? `Você revelou todas as ${game.cells.length-game.config.mines} casas seguras no nível ${game.config.label}. ${useTimer?`Tempo: ${formatTime(finalTime)}.`:'Você escolheu jogar sem cronômetro.'}`
    : `O campo de ${game.config.rows}×${game.config.cols} continha ${game.config.mines} minas. Tente novamente para melhorar sua estratégia.`;
  $('result-score').hidden=!(won&&useTimer);
  if(!resultDialog.open)resultDialog.showModal();
}

// Interface do tabuleiro: mouse, toque e teclado.
board.addEventListener('pointerover',event=>{
  const target=event.target.closest('.cell');
  if(target)showCoordinate(Number(target.dataset.index));
});
board.addEventListener('focusin',event=>{
  const target=event.target.closest('.cell');
  if(target)showCoordinate(Number(target.dataset.index));
});
board.addEventListener('click',event=>{
  const target=event.target.closest('.cell');
  if(!target)return;
  act(Number(target.dataset.index),mode);
});
board.addEventListener('contextmenu',event=>{
  const target=event.target.closest('.cell');
  if(!target)return;
  event.preventDefault();
  act(Number(target.dataset.index),'flag');
});
board.addEventListener('keydown',event=>{
  const target=event.target.closest('.cell');
  if(!target)return;
  const i=Number(target.dataset.index);
  if(event.key.toLowerCase()==='f'){
    event.preventDefault();act(i,'flag');return;
  }
  const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-game.config.cols,ArrowDown:game.config.cols}[event.key];
  if(delta===undefined)return;
  event.preventDefault();
  let next=i+delta;
  if(event.key==='ArrowLeft'&&i%game.config.cols===0)next=i;
  if(event.key==='ArrowRight'&&i%game.config.cols===game.config.cols-1)next=i;
  tiles[next]?.focus();
});
$('level-options').addEventListener('click',event=>{
  const button=event.target.closest('[data-level]');
  if(button)changeConfiguration(button.dataset.level,useTimer);
});
$('clock-enabled').addEventListener('change',event=>changeConfiguration(level,event.target.checked));
$('restart').addEventListener('click',()=>changeConfiguration(level,useTimer));
document.querySelectorAll('.mode-btn[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
$('help-open').addEventListener('click',()=>$('help-dialog').showModal());
$('help-close').addEventListener('click',()=>$('help-dialog').close());
$('result-close').addEventListener('click',()=>resultDialog.close());
$('result-restart').addEventListener('click',()=>{resultDialog.close();freshRound();});
$('result-score').addEventListener('click',()=>{
  resultDialog.close();
  $('submit-panel').scrollIntoView({behavior:'smooth',block:'center'});
  $('nickname').focus({preventScroll:true});
});

// ==========================================
// Ranking separado do Caça-Palavras
// ==========================================
function setRankingLevel(next){
  rankingLevel=next;
  $('rank-level').textContent=LEVELS[next].label;
  document.querySelectorAll('[data-rank]').forEach(btn=>{
    const active=btn.dataset.rank===next;
    btn.classList.toggle('selected',active);
    btn.setAttribute('aria-pressed',String(active));
  });
  refreshRanking();
}
async function refreshRanking(){
  const token=++listToken;
  $('rank-status').textContent='Consultando tempos...';
  $('rank-list').replaceChildren();
  try{
    const {readScores}=await import('./ranking.js');
    const rows=await readScores(rankingLevel,5);
    if(token!==listToken)return;
    const fragment=document.createDocumentFragment();
    rows.forEach(entry=>{
      const li=document.createElement('li');
      const place=document.createElement('span');
      place.className='rank-place';
      place.textContent=entry.position===1?'🥇':entry.position===2?'🥈':entry.position===3?'🥉':`#${entry.position}`;
      const name=document.createElement('span');name.className='rank-person';name.textContent=entry.nome||'Participante';
      const time=document.createElement('span');time.className='rank-time';time.textContent=formatTime(entry.tempoMs);
      li.append(place,name,time);fragment.append(li);
    });
    $('rank-list').replaceChildren(fragment);
    $('rank-status').textContent=rows.length?`${rows.length} tempo(s) exibido(s).`:'Ainda não existem recordes neste nível.';
  }catch(error){
    if(token!==listToken)return;
    $('rank-status').textContent='Ranking indisponível. Confira a conexão e as regras do Firestore.';
    console.warn('Erro no ranking Campo Minado:',error);
  }
}
$('rank-nav').addEventListener('click',event=>{
  const button=event.target.closest('[data-rank]');
  if(button)setRankingLevel(button.dataset.rank);
});
$('rank-refresh').addEventListener('click',refreshRanking);
$('save-score').addEventListener('click',async()=>{
  if(!result||lastSubmitted===result.id){$('submit-status').textContent='Conclua outra partida com cronômetro para registrar novo tempo.';return;}
  const nickname=$('nickname').value.trim().replace(/\s+/g,' ');
  if(nickname.length<2||nickname.length>24||!/^[\p{L}\p{N} ._-]+$/u.test(nickname)){
    $('submit-status').textContent='Digite um apelido de 2 a 24 caracteres, sem símbolos especiais.';
    return;
  }
  const attempt={...result};
  $('save-score').disabled=true;
  $('submit-status').textContent='Salvando resultado no ranking...';
  try{
    const {submitScore}=await import('./ranking.js');
    const response=await submitScore({...attempt,nickname});
    if(result?.id!==attempt.id)return;
    lastSubmitted=attempt.id;
    try{localStorage.setItem(nicknameKey,nickname);}catch(_){/* sem armazenamento */}
    $('submit-status').textContent=response.improved
      ?`Novo recorde registrado: ${formatTime(attempt.time)}! Seu apelido agora aparece no ranking.`
      :`Seu melhor tempo anterior (${formatTime(response.previous)}) continua no ranking.`;
    setRankingLevel(attempt.level);
  }catch(error){
    $('submit-status').textContent=`Não foi possível registrar: ${error.message||'erro no Firebase'}`;
    console.error(error);
  }finally{
    $('save-score').disabled=!result||lastSubmitted===result?.id;
  }
});

try{
  const pref=JSON.parse(localStorage.getItem(preferenceKey)||'{}');
  if(Object.hasOwn(LEVELS,pref.level))level=pref.level;
  if(typeof pref.useTimer==='boolean')useTimer=pref.useTimer;
  $('nickname').value=localStorage.getItem(nicknameKey)||'';
}catch(_){/* usar padrões */}
$('clock-enabled').checked=useTimer;
freshRound();
