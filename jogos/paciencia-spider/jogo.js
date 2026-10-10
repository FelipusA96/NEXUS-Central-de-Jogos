import {LEVELS,makeGame,cloneGame,canSelect,canMove,move,canDeal,deal,validMoves,isWon,rankLabel,brazilDay} from './engine.js';
const $=id=>document.getElementById(id);
const state={level:'medio',mode:'livre',clock:true,game:null,selected:null,history:[],assisted:false,running:false,won:false,time:0,startedAt:0,interval:null,rankLevel:'medio',rankRequest:0,result:null,submitted:false,highlight:null};
const NICK_KEY='nexus-spider-apelido-v1';
const SUIT_COLOR={'♠':'black','♣':'black','♥':'red','♦':'red'};
function timeMs(){return state.time+(state.running?Date.now()-state.startedAt:0);}
function format(ms){const n=Math.floor(ms/1000),m=Math.floor(n/60),s=n%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function tick(){$('elapsed').textContent=state.clock?format(timeMs()):'—';}
function startClock(){if(!state.clock||state.running||state.won)return;state.startedAt=Date.now();state.running=true;state.interval=setInterval(tick,250);tick();}
function stopClock(){if(!state.running)return;state.time=timeMs();state.running=false;clearInterval(state.interval);state.interval=null;tick();}
function note(text,error=false){$('game-message').textContent=text;$('game-message').classList.toggle('error',error);}
function clearSelect(){state.selected=null;state.highlight=null;}
function showStatus(){
  $('completed').textContent=`${state.game.completed.length} / 8`;
  $('moves').textContent=String(state.game.moves);
  const packets=state.game.stock.length/10;
  $('stock-count').textContent=`${packets} rodada${packets===1?'':'s'}`;
  $('stock-badge').textContent=String(packets);
  $('stock').disabled=state.won||!state.game.stock.length;
  $('undo').disabled=state.won||!state.history.length;
  const finished=$('finished-suits');finished.replaceChildren();
  for(let i=0;i<8;i++){
    const mark=document.createElement('span');
    const suit=state.game.completed[i];
    mark.className=suit?'done':'';
    mark.textContent=suit||'◇';
    finished.append(mark);
  }
  tick();
}
function render(){
  const table=$('table'),frag=document.createDocumentFragment();
  let bottom=260;
  for(let c=0;c<10;c++){
    const stack=state.game.columns[c];
    const col=document.createElement('div');col.className='spider-col';col.dataset.col=String(c);
    if(state.selected&&canMove(state.game,state.selected.from,state.selected.at,c))col.classList.add('drop-allowed');
    if(state.highlight?.to===c)col.classList.add('drop-target');
    const tag=document.createElement('span');tag.className='col-number';tag.textContent=String(c+1).padStart(2,'0');col.append(tag);
    let y=5;
    if(!stack.length){const empty=document.createElement('button');empty.className='column-empty';empty.type='button';empty.dataset.empty=String(c);empty.textContent='+';empty.setAttribute('aria-label',`Coluna ${c+1} vazia: colocar cartas`);col.append(empty);}
    for(let i=0;i<stack.length;i++){
      const card=stack[i];
      const possible=card.faceUp && canSelect(state.game,c,i);
      const el=document.createElement(card.faceUp?'button':'div');
      el.className='card '+(card.faceUp?'face '+SUIT_COLOR[card.suit]:'back')+(possible?' selectable':'');
      el.dataset.col=String(c);el.dataset.index=String(i);
      el.style.top=`${y}px`;el.style.zIndex=String(i+1);
      if(state.selected?.from===c&&i>=state.selected.at)el.classList.add('selected');
      if(state.highlight?.from===c&&i>=state.highlight.at)el.classList.add('hinted');
      if(card.faceUp){
        el.type='button';el.disabled=false;el.draggable=possible;
        el.setAttribute('aria-label',`${rankLabel(card.rank)} de ${card.suit}, coluna ${c+1}${possible?', sequência movível':''}`);
        const corner=document.createElement('span');corner.className='corner';
        const rank=document.createElement('span');rank.textContent=rankLabel(card.rank);
        const suit=document.createElement('small');suit.textContent=card.suit;
        corner.append(rank,suit);
        const center=document.createElement('span');center.className='center-symbol';center.textContent=card.suit;
        el.append(corner,center);
      }else{el.setAttribute('aria-label','Carta virada para baixo');}
      col.append(el);
      y+=card.faceUp?32:18;
    }
    col.style.height=`${Math.max(120,y+101)}px`;
    bottom=Math.max(bottom,y+101);
    frag.append(col);
  }
  table.replaceChildren(frag);
  table.style.minHeight=`${Math.min(1500,bottom+5)}px`;
  showStatus();
}
function select(from,at){
  if(!canSelect(state.game,from,at)){note('Esse grupo não pode ser movido junto. Selecione cartas consecutivas do mesmo naipe.',true);return;}
  state.selected={from,at};state.highlight=null;render();
  const card=state.game.columns[from][at];
  note(`${rankLabel(card.rank)} ${card.suit} selecionado. Escolha a coluna de destino ou arraste.`);
}
function saveSnapshot(){state.history.push(cloneGame(state.game));if(state.history.length>150)state.history.shift();}
function afterAction(wasComplete){
  clearSelect();render();
  const complete=state.game.completed.length-wasComplete;
  if(complete)note(`✦ ${complete} sequência(s) completa(s) removida(s)!`);
  else note('Movimento realizado. Continue até completar oito sequências.');
  if(isWon(state.game))finishGame();
}
function playMove(from,at,to){
  if(state.won)return false;
  if(!canMove(state.game,from,at,to)){
    note('Destino inválido. Uma sequência só pode ir sobre uma carta de valor imediatamente superior ou coluna vazia.',true);return false;
  }
  const completed=state.game.completed.length;
  saveSnapshot();startClock();
  move(state.game,from,at,to);
  afterAction(completed);return true;
}
function handleColumnClick(c,i){
  if(state.won)return;
  const src=state.selected;
  if(src){
    if(src.from===c&&src.at===i){clearSelect();render();note('Seleção cancelada.');return;}
    if(canMove(state.game,src.from,src.at,c)){playMove(src.from,src.at,c);return;}
  }
  if(i!==null&&canSelect(state.game,c,i)){select(c,i);return;}
  if(src){note('Movimento inválido. Selecione outra coluna de destino.',true);return;}
  note('Selecione uma carta aberta que inicie uma sequência válida.',true);
}
$('table').addEventListener('click',event=>{
  const card=event.target.closest('[data-index]');
  if(card){if(card.classList.contains('back'))return;handleColumnClick(Number(card.dataset.col),Number(card.dataset.index));return;}
  const column=event.target.closest('[data-col]');
  if(column)handleColumnClick(Number(column.dataset.col),null);
});
$('table').addEventListener('dragstart',event=>{
  const card=event.target.closest('.card.selectable');
  if(!card||state.won){event.preventDefault();return;}
  const from=Number(card.dataset.col),at=Number(card.dataset.index);
  if(!canSelect(state.game,from,at)){event.preventDefault();return;}
  state.selected={from,at};
  event.dataTransfer.effectAllowed='move';
  event.dataTransfer.setData('text/plain',`${from},${at}`);
  card.classList.add('selected');
});
$('table').addEventListener('dragover',event=>{
  const col=event.target.closest('.spider-col');
  if(!col||!state.selected)return;
  if(canMove(state.game,state.selected.from,state.selected.at,Number(col.dataset.col))){event.preventDefault();event.dataTransfer.dropEffect='move';}
});
$('table').addEventListener('drop',event=>{
  const col=event.target.closest('.spider-col');
  if(!col||!state.selected)return;
  const src=state.selected;
  event.preventDefault();
  if(canMove(state.game,src.from,src.at,Number(col.dataset.col)))playMove(src.from,src.at,Number(col.dataset.col));
  else{clearSelect();render();}
});
$('table').addEventListener('dragend',()=>{if(state.selected){clearSelect();render();}});
$('stock').addEventListener('click',()=>{
  if(state.won)return;
  if(!state.game.stock.length){note('Não restam cartas para distribuir.',true);return;}
  if(!canDeal(state.game)){note('Antes de distribuir, preencha todas as colunas vazias.',true);return;}
  const completed=state.game.completed.length;
  saveSnapshot();startClock();deal(state.game);afterAction(completed);
});
$('undo').addEventListener('click',()=>{
  if(!state.history.length||state.won)return;
  state.game=state.history.pop();
  state.assisted=true;clearSelect();render();
  updateEligibility();note('Movimento desfeito. Esta partida diária não poderá entrar no ranking.');
});
$('hint').addEventListener('click',()=>{
  if(state.won)return;
  const suggested=validMoves(state.game)[0];
  state.assisted=true;updateEligibility();
  if(!suggested){note(canDeal(state.game)?'Sem movimentos imediatos. Experimente distribuir mais cartas.':'Sem movimentos disponíveis. Reorganize as colunas antes de distribuir.',true);return;}
  state.selected={from:suggested.from,at:suggested.at};state.highlight=suggested;
  render();note(`✦ Sugestão: mover da coluna ${suggested.from+1} para a coluna ${suggested.to+1}.`);
});
function randomSeed(){return `${Date.now()}-${Math.random()}-${crypto.randomUUID?.()||Math.random()}`;}
function newGame(){
  stopClock();state.running=false;state.time=0;state.won=false;state.assisted=false;state.history=[];state.result=null;state.submitted=false;clearSelect();
  const seed=state.mode==='diario'?brazilDay():randomSeed();
  state.game=makeGame(state.level,seed);
  $('game-mode-label').textContent=state.mode==='diario'?`DESAFIO DIÁRIO • ${seed}`:'PARTIDA LIVRE';
  $('mission-state').textContent='MESA PRONTA';$('mission-caption').textContent='AGUARDANDO PRIMEIRO MOVIMENTO';
  $('submit-score').disabled=true;
  $('submit-status').textContent='Conclua um desafio diário elegível com cronômetro para participar.';
  render();note('Nova partida pronta. Ordene cartas do Rei ao Ás.');
  state.rankLevel=state.level;updateTabs();refreshRanking();
}
function updateEligibility(){
  if(state.mode==='diario'&&state.assisted){$('submit-status').textContent='Dica ou desfazer utilizado: esta partida pode continuar, mas não é elegível ao ranking.';}
}
$('new-round').addEventListener('click',newGame);
$('level-options').addEventListener('click',e=>{
  const btn=e.target.closest('[data-level]');if(!btn||btn.dataset.level===state.level)return;
  state.level=btn.dataset.level;
  document.querySelectorAll('[data-level]').forEach(b=>{const active=b.dataset.level===state.level;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  newGame();
});
$('mode-options').addEventListener('click',e=>{
  const btn=e.target.closest('[data-play-mode]');if(!btn||btn.dataset.playMode===state.mode)return;
  state.mode=btn.dataset.playMode;
  document.querySelectorAll('[data-play-mode]').forEach(b=>{const active=b.dataset.playMode===state.mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  newGame();
});
$('clock-enabled').addEventListener('change',e=>{state.clock=e.target.checked;newGame();});
function finishGame(){
  stopClock();state.won=true;
  $('mission-state').textContent='VITÓRIA CONFIRMADA';$('mission-caption').textContent='OITO SEQUÊNCIAS RESOLVIDAS';
  const eligible=state.mode==='diario'&&state.clock&&!state.assisted;
  state.result=eligible?{level:state.level,day:state.game.seed,moves:state.game.moves,time:Math.max(1,Math.round(timeMs()))}:null;
  $('win-description').textContent=`Você concluiu as oito sequências em ${state.game.moves} movimentos${state.clock?` e ${format(timeMs())}`:''}. ${eligible?'Você pode registrar seu resultado no ranking diário.':'O modo livre, partidas sem cronômetro e partidas com dicas/desfazer não entram no ranking.'}`;
  $('win-rank').hidden=!eligible;$('submit-score').disabled=!eligible;
  $('submit-status').textContent=eligible?'Vitória válida! Informe seu apelido para registrar.':'Partida concluída sem registro competitivo.';
  render();note('🏆 Parabéns! Você concluiu todas as oito sequências.');$('win-dialog').showModal();
}
$('win-close').addEventListener('click',()=>$('win-dialog').close());
$('win-next').addEventListener('click',()=>{$('win-dialog').close();newGame();});
$('win-rank').addEventListener('click',()=>{$('win-dialog').close();$('nickname').scrollIntoView({behavior:'smooth',block:'center'});$('nickname').focus({preventScroll:true});});
$('help-open').addEventListener('click',()=>$('help-dialog').showModal());
$('help-close').addEventListener('click',()=>$('help-dialog').close());
function updateTabs(){
  document.querySelectorAll('[data-rank]').forEach(b=>{const active=b.dataset.rank===state.rankLevel;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('rank-day').textContent=`${brazilDay()} · ${LEVELS[state.rankLevel].name} · menor número de movimentos vence`;
}
$('rank-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-rank]');if(!b)return;state.rankLevel=b.dataset.rank;updateTabs();refreshRanking();});
function formatRankTime(ms){return format(ms);}
async function refreshRanking(){
  const request=++state.rankRequest,level=state.rankLevel,day=brazilDay();
  $('rank-status').textContent='Consultando ranking...';$('rank-list').replaceChildren();
  try{
    const {readDailyRanking}=await import('./ranking.js');
    const rows=await readDailyRanking(level,day);
    if(request!==state.rankRequest)return;
    if(!rows.length){$('rank-status').textContent='Ainda não há resultados nesta dificuldade. Seja o primeiro!';return;}
    const frag=document.createDocumentFragment();
    rows.forEach((row,index)=>{
      const li=document.createElement('li');li.className='rank-row';
      const place=document.createElement('span');place.className='place';place.textContent=['🥇','🥈','🥉'][index]||`#${index+1}`;
      const who=document.createElement('span');who.className='who';
      const name=document.createElement('strong');name.textContent=row.nome||'Jogador';
      const label=document.createElement('small');label.textContent=row.tema||'';
      who.append(name,label);
      const result=document.createElement('span');result.className='result';result.textContent=`${row.movimentos} · ${formatRankTime(row.tempoMs)}`;
      li.append(place,who,result);frag.append(li);
    });
    $('rank-list').append(frag);$('rank-status').textContent=`${rows.length} resultado(s) exibido(s).`;
  }catch(e){if(request!==state.rankRequest)return;$('rank-status').textContent='Ranking indisponível. Confira a conexão e as regras do Firestore.';console.warn(e);}
}
$('rank-refresh').addEventListener('click',refreshRanking);
try{$('nickname').value=localStorage.getItem(NICK_KEY)||'';}catch(_){}
$('submit-score').addEventListener('click',async()=>{
  if(!state.result||state.submitted)return;
  const result={...state.result};const nickname=$('nickname').value.trim().replace(/\s+/g,' ');
  if(nickname.length<2||nickname.length>24||!/^[\p{L}\p{N} ._\-]+$/u.test(nickname)){$('submit-status').textContent='Use um apelido de 2 a 24 caracteres, sem símbolos especiais.';return;}
  $('submit-score').disabled=true;$('submit-status').textContent='Registrando resultado...';
  try{
    const {submitDailyRanking}=await import('./ranking.js');
    await submitDailyRanking(result,nickname);
    if(state.result && JSON.stringify(state.result)===JSON.stringify(result))state.submitted=true;
    try{localStorage.setItem(NICK_KEY,nickname);}catch(_){}
    $('submit-status').textContent='✦ Resultado registrado! Veja sua colocação no ranking.';
    state.rankLevel=result.level;updateTabs();refreshRanking();
  }catch(e){$('submit-status').textContent=e.message||'Falha ao registrar resultado.';}
  finally{$('submit-score').disabled=!state.result||state.submitted;}
});
newGame();
