import {LEVELS,makeDeck,resolvePair,brazilDay} from './engine.js';
const $=id=>document.getElementById(id);
const board=$('board');
const PREF='nexus-memoria-config-v1';
const NICK_KEY='nexus-memoria-apelido-v1';
const FLIP_BACK_MS=1000;
let level='medio',mode='livre',useTimer=true;
let deck=null,cards=[],matched=new Set(),first=null,second=null,locked=false,tries=0;
let roundId=0,flipTimer=null,clockTimer=null,startStamp=null,finalMs=0,won=false;
let result=null,submittedRound=null,rankingLevel='medio',rankFetchId=0;
function fmt(ms) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const two = value => String(value).padStart(2, '0');
  return hours > 0
    ? `${two(hours)}:${two(minutes)}:${two(seconds)}`
    : `${two(minutes)}:${two(seconds)}`;
}
const dayText=day=>day.split('-').reverse().join('/');
const elapsed=()=>startStamp===null?0:won?finalMs:Math.max(0,performance.now()-startStamp);
function showMessage(message,type=''){const el=$('game-message');el.textContent=message;el.className='notice'+(type?' '+type:'');}
function scoreMessage(message,type=''){const el=$('submit-status');el.textContent=message;el.className='rank-feedback'+(type?' '+type:'');}
function updateStats(){
  $('matched').textContent=`${matched.size}/${deck.pairs}`;
  $('attempts').textContent=String(tries);
  $('elapsed').textContent=useTimer?fmt(elapsed()):'--:--';
  const progress=$('progress');
  progress.setAttribute('aria-valuemax',String(deck.pairs));
  progress.setAttribute('aria-valuenow',String(matched.size));
  $('progress-fill').style.width=`${matched.size/deck.pairs*100}%`;
}
function startClock(){
  if(startStamp!==null)return;
  startStamp=performance.now();
  if(useTimer) clockTimer=setInterval(updateStats,200);
  $('mission-state').textContent='MEMÓRIA EM AÇÃO';
  $('mission-caption').textContent='ENCONTRE TODOS OS PARES';
}
function stopClock(){
  if(startStamp!==null)finalMs=Math.max(1,Math.round(performance.now()-startStamp));
  if(clockTimer!==null){clearInterval(clockTimer);clockTimer=null;}
  updateStats();
}
function randomSeed(){
  if(globalThis.crypto?.getRandomValues){
    const array=new Uint32Array(4);crypto.getRandomValues(array);
    return [...array].join('-');
  }
  return `${performance.now()}-${Math.random()}`;
}
function storeSettings(){
  try{localStorage.setItem(PREF,JSON.stringify({level,mode,useTimer}));}catch(_){}
}
function renderBoard(){
  board.style.setProperty('--columns',String(deck.cols));
  board.setAttribute('aria-label',`${deck.cards.length} cartas, ${deck.pairs} pares, nível ${LEVELS[level].name}`);
  const fragment=document.createDocumentFragment();
  cards=[];
  deck.cards.forEach((card,i)=>{
    const button=document.createElement('button');
    button.type='button';button.className='memory-card';button.dataset.index=String(i);
    button.setAttribute('aria-label',`Carta ${i+1}, virada para baixo`);
    button.setAttribute('aria-pressed','false');
    const inner=document.createElement('span');inner.className='memory-card-inner';
    const back=document.createElement('span');back.className='memory-face memory-back';
    back.innerHTML='<span class="memory-back-icon" aria-hidden="true">✧</span>';
    const front=document.createElement('span');front.className='memory-face memory-front';
    const symbol=document.createElement('span');symbol.className='memory-symbol';symbol.textContent=card.symbol;symbol.setAttribute('aria-hidden','true');
    front.appendChild(symbol);inner.append(back,front);button.appendChild(inner);fragment.appendChild(button);cards.push(button);
  });
  board.replaceChildren(fragment);
}
function turnFace(index,visible,matchedCard=false){
  const el=cards[index];
  el.classList.toggle('is-up',visible && !matchedCard);
  el.classList.toggle('is-matched',matchedCard);
  el.disabled=matchedCard || won;
  el.setAttribute('aria-pressed',String(visible || matchedCard));
  el.setAttribute('aria-label',visible||matchedCard?`Carta ${index+1}: ${deck.cards[index].name}${matchedCard?', par encontrado':''}`:`Carta ${index+1}, virada para baixo`);
}
function finish(){
  won=true;
  locked=true;
  stopClock();
  for(let i=0;i<cards.length;i++)cards[i].disabled=true;
  $('mission-state').textContent='MISSÃO CONCLUÍDA';
  $('mission-caption').textContent='TODOS OS PARES ENCONTRADOS';
  showMessage(`Todos os ${deck.pairs} pares encontrados em ${tries} tentativas!`,'success');
  $('result-description').textContent=`Você encontrou ${deck.pairs} pares usando ${tries} tentativas${useTimer?` em ${fmt(finalMs)}`:''}. ${mode==='diario'?'Desafio diário concluído!':'Excelente treino de memória!'}`;
  // O usuário opta por participar: nunca registrar automaticamente.
  if(mode==='diario' && useTimer){
    result={id:roundId,level,day:deck.seed,attempts:tries,time:finalMs,tema:`Memória • ${LEVELS[level].name} • ${dayText(deck.seed)}`};
    $('submit-score').disabled=false;
    $('result-rank').hidden=false;
    scoreMessage(`Resultado disponível: ${tries} tentativas em ${fmt(finalMs)}. Informe um apelido para participar.`,'success');
  }else{
    result=null;
    $('result-rank').hidden=true;
    scoreMessage('Partida concluída! Apenas o desafio diário com cronômetro pode entrar no ranking.');
  }
  $('result-dialog').showModal();
}
function onPick(index){
  if(locked || won || matched.has(deck.cards[index].pair) || first===index || second!==null)return;
  if(startStamp===null) startClock();
  turnFace(index,true);
  if(first===null){
    first=index;
    showMessage('Primeira carta revelada. Escolha a segunda.');
    return;
  }
  second=index;
  tries++;
  updateStats();
  const a=first,b=second;
  if(resolvePair(deck.cards,a,b)){
    matched.add(deck.cards[a].pair);
    turnFace(a,true,true);
    turnFace(b,true,true);
    first=null;second=null;
    if(matched.size===deck.pairs){finish();return;}
    showMessage('✦ Par encontrado! Continue procurando.','success');
    updateStats();
    return;
  }
  locked=true;
  showMessage('Cartas diferentes. Elas serão ocultadas em 1 segundo.');
  const origin=roundId;
  flipTimer=setTimeout(()=>{
    if(origin!==roundId)return;
    turnFace(a,false);turnFace(b,false);
    first=null;second=null;locked=false;flipTimer=null;
    showMessage('Tente lembrar das cartas reveladas.');
  },FLIP_BACK_MS);
}
function newRound(){
  roundId++;
  if(flipTimer!==null){clearTimeout(flipTimer);flipTimer=null;}
  if(clockTimer!==null){clearInterval(clockTimer);clockTimer=null;}
  startStamp=null;finalMs=0;won=false;matched=new Set();first=null;second=null;locked=false;tries=0;
  result=null;submittedRound=null;$('submit-score').disabled=true;$('result-rank').hidden=true;
  const seed=mode==='diario'?brazilDay():randomSeed();
  deck=makeDeck(level,seed);
  renderBoard();updateStats();storeSettings();
  $('mission-state').textContent='ARENA PRONTA';
  $('mission-caption').textContent='AGUARDANDO PRIMEIRA CARTA';
  $('game-mode-label').textContent=mode==='diario'?`DIÁRIO · ${dayText(seed)}`:'TREINO LIVRE';
  $('daily-explanation').textContent=mode==='diario'
    ? `Hoje (${dayText(seed)}), a posição das cartas é igual para todos nesta dificuldade. Só vitórias com cronômetro são elegíveis ao ranking, que prioriza menos tentativas.`
    : 'O treino livre embaralha símbolos e posições a cada partida. Para disputar com outros jogadores, escolha o desafio diário.';
  if($('result-dialog').open)$('result-dialog').close();
  showMessage('Escolha a primeira carta. Cartas diferentes são ocultadas automaticamente após 1 segundo.');
  scoreMessage(mode==='diario'?(useTimer?'Conclua o desafio diário com cronômetro para registrar seu resultado.':'Ative o cronômetro para habilitar o ranking na próxima partida.'):'Para entrar no ranking, selecione Desafio diário com cronômetro.');
  rankingLevel=level;syncRankingTabs();loadRanking();
}
function syncChoiceButtons(){
  document.querySelectorAll('[data-level]').forEach(btn=>{
    const active=btn.dataset.level===level;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-play-mode]').forEach(btn=>{
    const active=btn.dataset.playMode===mode;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));
  });
  $('clock-enabled').checked=useTimer;
}
function syncRankingTabs(){
  document.querySelectorAll('[data-rank]').forEach(btn=>{
    const active=btn.dataset.rank===rankingLevel;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));
  });
  $('rank-date').textContent=`Desafio de ${dayText(brazilDay())} · ${LEVELS[rankingLevel].name}`;
}
async function loadRanking(){
  const id=++rankFetchId;
  const viewedLevel=rankingLevel,day=brazilDay();
  $('rank-list').replaceChildren();
  $('rank-status').textContent='Consultando ranking…';
  try{
    // A biblioteca Firebase só é baixada na consulta/envio do ranking.
    const {readDailyRanking}=await import('./ranking.js');
    const entries=await readDailyRanking(viewedLevel,day);
    if(id!==rankFetchId)return;
    const fragment=document.createDocumentFragment();
    entries.forEach((entry,i)=>{
      const li=document.createElement('li');
      const medal=document.createElement('span');medal.className='place';medal.textContent=i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
      const user=document.createElement('div');
      const name=document.createElement('strong');name.textContent=typeof entry.nome==='string'?entry.nome:'Participante';
      const sub=document.createElement('small');sub.textContent='Desafio diário';user.append(name,sub);
      const score=document.createElement('span');score.className='stat';score.textContent=`${entry.tentativas} jogadas`;
      const time=document.createElement('small');time.textContent=fmt(entry.tempoMs);score.appendChild(time);
      li.append(medal,user,score);fragment.appendChild(li);
    });
    $('rank-list').replaceChildren(fragment);
    $('rank-status').textContent=entries.length?`${entries.length} participante(s). Menos tentativas vence; tempo desempata.`:'Ainda não há registros nessa dificuldade hoje.';
  }catch(error){
    if(id!==rankFetchId)return;
    $('rank-status').textContent='Ranking indisponível. Confira sua conexão ou as regras do Firestore.';
    $('rank-status').className='rank-feedback error';
    console.warn('Ranking Memória:',error);
  }
}
function viewRankingRegistration(){
  $('result-dialog').close();
  $('nickname').focus({preventScroll:true});
  document.querySelector('.registration').scrollIntoView({behavior:'smooth',block:'center'});
}
board.addEventListener('click',event=>{
  const btn=event.target.closest('.memory-card');
  if(btn && board.contains(btn))onPick(Number(btn.dataset.index));
});
$('level-options').addEventListener('click',event=>{
  const btn=event.target.closest('[data-level]');
  if(!btn || !LEVELS[btn.dataset.level])return;
  level=btn.dataset.level;syncChoiceButtons();newRound();
});
$('mode-options').addEventListener('click',event=>{
  const btn=event.target.closest('[data-play-mode]');
  if(!btn || !['livre','diario'].includes(btn.dataset.playMode))return;
  mode=btn.dataset.playMode;syncChoiceButtons();newRound();
});
$('clock-enabled').addEventListener('change',event=>{
  useTimer=event.target.checked;newRound();
});
$('new-round').addEventListener('click',newRound);
$('rank-tabs').addEventListener('click',event=>{
  const btn=event.target.closest('[data-rank]');if(!btn||!LEVELS[btn.dataset.rank])return;
  rankingLevel=btn.dataset.rank;syncRankingTabs();loadRanking();
});
$('rank-refresh').addEventListener('click',loadRanking);
$('help-open').addEventListener('click',()=>$('help-dialog').showModal());
$('help-close').addEventListener('click',()=>$('help-dialog').close());
$('result-close').addEventListener('click',()=>$('result-dialog').close());
$('result-next').addEventListener('click',newRound);
$('result-rank').addEventListener('click',viewRankingRegistration);
$('submit-score').addEventListener('click',async()=>{
  if(!result || result.id!==roundId || submittedRound===roundId){
    scoreMessage('Conclua um novo desafio diário válido para enviar seu resultado.','error');return;
  }
  if(result.day!==brazilDay()){
    scoreMessage('A data mudou. Inicie o novo desafio diário para concorrer.','error');return;
  }
  const name=$('nickname').value.trim().replace(/\s+/g,' ');
  if(name.length<2 || name.length>24 || !/^[\p{L}\p{N} ._\-]+$/u.test(name)){
    scoreMessage('Use um apelido de 2 a 24 caracteres, com letras, números, espaço, ponto, _ ou hífen.','error');return;
  }
  const payload={...result};$('submit-score').disabled=true;
  scoreMessage('Enviando resultado…');
  try{
    const {submitDailyRanking}=await import('./ranking.js');
    if(roundId!==payload.id)throw Error('A partida foi substituída.');
    await submitDailyRanking(payload,name);
    submittedRound=payload.id;
    try{localStorage.setItem(NICK_KEY,name);}catch(_){}
    scoreMessage('Resultado registrado! O ranking compara tentativas primeiro e tempo depois.','success');
    rankingLevel=payload.level;syncRankingTabs();await loadRanking();
  }catch(error){
    scoreMessage(error.message||'Falha no registro. Confira as regras do Firebase.','error');
  }finally{
    $('submit-score').disabled=!result || submittedRound===roundId || result.id!==roundId;
  }
});
try{
  const saved=JSON.parse(localStorage.getItem(PREF)||'{}');
  if(LEVELS[saved.level])level=saved.level;
  if(['livre','diario'].includes(saved.mode))mode=saved.mode;
  if(typeof saved.useTimer==='boolean')useTimer=saved.useTimer;
  $('nickname').value=localStorage.getItem(NICK_KEY)||'';
}catch(_){}
syncChoiceButtons();
newRound();
