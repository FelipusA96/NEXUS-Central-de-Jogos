import {LEVELS,makePuzzle,peerIndices,conflicts,isSolved} from './engine.js';

const $=id=>document.getElementById(id);
const board=$('board');
const memoKey='nexus-sudoku-config-v1';
const nicknameKey='nexus-sudoku-nickname-v1';
let level='medio', mode='livre', useTimer=true;
let puzzle,solution,values,notes,history,selected=0,editingNotes=false,reviewErrors=new Set(),hinted=new Set();
let gameOver=false,assists=0,result=null,submittedRound=null;
let timer=null,startedAt=0,finalElapsed=0;
let rankingLevel='medio',rankingRequest=0;
let cells=[];

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
const now=()=>performance.now();
const elapsed=()=>gameOver?finalElapsed:useTimer?Math.max(0,now()-startedAt):0;
function dayBrazil(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const v=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return `${v.year}-${v.month}-${v.day}`;
}
const getDay=()=>dayBrazil();
function randomId(){const b=new Uint32Array(4);crypto.getRandomValues(b);return [...b].map(v=>v.toString(16).padStart(8,'0')).join('');}
const dayDisplay=day=>day.split('-').reverse().join('/');
function setMessage(text,type=''){const el=$('game-message');el.textContent=text;el.className='notice'+(type?' '+type:'');}
function setScoreStatus(text,type=''){const el=$('submit-status');el.textContent=text;el.className='rank-feedback'+(type?' '+type:'');}
function refreshStats(){
  $('elapsed').textContent=useTimer?fmt(elapsed()):'--:--';
  $('filled').textContent=`${values.filter(Boolean).length}/81`;
  $('hint-count').textContent=String(assists);
}
function stopTimer(){
  if(timer!==null){clearInterval(timer);timer=null;}
  finalElapsed=useTimer?Math.max(1,Math.round(now()-startedAt)):0;
  refreshStats();
}
function startTimer(){
  if(timer!==null){clearInterval(timer);timer=null;}
  startedAt=now();finalElapsed=0;
  if(useTimer) timer=setInterval(refreshStats,240);
  refreshStats();
}
function storeSettings(){try{localStorage.setItem(memoKey,JSON.stringify({level,mode,useTimer}));}catch(_){}}
function emptyNotes(){return Array.from({length:81},()=>new Set());}
function snapshot(){
  history.push({values:[...values],notes:notes.map(s=>[...s]),hinted:[...hinted]});
  if(history.length>200)history.shift();
}
function markIneligible(msg){
  assists++;
  result=null;
  $('submit-score').disabled=true;
  setScoreStatus(msg||'O uso de ajuda retira a elegibilidade desta partida.','error');
}
function setModeName(){
  $('game-mode-label').textContent=mode==='diario'?`DIÁRIO · ${dayDisplay(getDay())}`:'MODO LIVRE';
  $('daily-explanation').textContent=mode==='diario'
    ? `O desafio de ${dayDisplay(getDay())} é idêntico para todos os jogadores desta dificuldade. O tempo vale para o ranking apenas sem dicas ou conferências.`
    : 'O treino livre gera grades variadas com solução única. Escolha Desafio diário para competir em condições iguais.';
}
function freshRound(){
  if($('result-dialog').open)$('result-dialog').close();
  const seed=mode==='diario'?`desafio-diario:${getDay()}`:`treino:${randomId()}`;
  ({puzzle,solution}=makePuzzle(level,seed));
  values=[...puzzle];notes=emptyNotes();history=[];reviewErrors=new Set();hinted=new Set();
  gameOver=false;assists=0;result=null;submittedRound=null;editingNotes=false;
  $('notes').classList.remove('active');$('notes').setAttribute('aria-pressed','false');
  $('submit-score').disabled=true;
  setScoreStatus('Conclua o desafio diário com cronômetro e sem ajudas para participar.');
  selected=puzzle.findIndex(x=>x===0);
  if(selected<0)selected=0;
  buildBoard();renderBoard();startTimer();setModeName();storeSettings();
  $('mission-state').textContent='MATRIZ ATIVA';
  $('status-caption').textContent=LEVELS[level].name.toUpperCase();
  $('clock-enabled').checked=useTimer;
  document.querySelectorAll('[data-level]').forEach(b=>{const active=b.dataset.level===level;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('[data-play-mode]').forEach(b=>{const active=b.dataset.playMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  setMessage('Escolha uma casa vazia e preencha a matriz. Boa sorte!');
  rankingLevel=level;selectRanking(level);
}
function buildBoard(){
  board.replaceChildren();cells=[];
  const frag=document.createDocumentFragment();
  for(let i=0;i<81;i++){
    const btn=document.createElement('button');btn.type='button';btn.className='sudoku-cell';btn.dataset.index=String(i);btn.setAttribute('role','gridcell');
    if(i%9===2||i%9===5)btn.classList.add('edge-right');
    if(Math.floor(i/9)===2||Math.floor(i/9)===5)btn.classList.add('edge-bottom');
    frag.appendChild(btn);cells.push(btn);
  }
  board.appendChild(frag);
}
function renderBoard(){
  const bad=conflicts(values);const related=new Set(peerIndices(selected));
  const activeNum=values[selected];
  cells.forEach((node,i)=>{
    node.classList.toggle('given',Boolean(puzzle[i]));
    node.classList.toggle('active',i===selected);
    node.classList.toggle('peer',related.has(i));
    node.classList.toggle('same-number',Boolean(activeNum)&&activeNum===values[i]);
    node.classList.toggle('conflict',bad.has(i));
    node.classList.toggle('wrong',reviewErrors.has(i));
    node.classList.toggle('hinted',hinted.has(i));
    const v=values[i];
    if(v){node.textContent=String(v);}else{
      node.replaceChildren();
      if(notes[i].size){
        const list=document.createElement('span');list.className='cell-notes';
        for(let n=1;n<=9;n++){
          const mark=document.createElement('span');mark.textContent=notes[i].has(n)?String(n):'';
          if(!notes[i].has(n))mark.className='empty';
          list.appendChild(mark);
        }
        node.appendChild(list);
      }
    }
    const r=Math.floor(i/9)+1,c=i%9+1;
    node.setAttribute('aria-label',`Linha ${r}, coluna ${c}: ${v||'vazia'}${puzzle[i]?', pista fixa':''}${bad.has(i)?', conflito':''}`);
    node.setAttribute('aria-selected',String(i===selected));
    node.tabIndex=i===selected?0:-1;
  });
  $('undo').disabled=gameOver||history.length===0;
  $('erase').disabled=gameOver||Boolean(puzzle[selected]);
  refreshStats();
}
function select(index,focus=false){if(index<0||index>=81)return;selected=index;renderBoard();if(focus)cells[index].focus();}
function clearPeerNotes(index,digit){for(const j of peerIndices(index))notes[j].delete(digit);}
function enterDigit(digit){
  if(gameOver||puzzle[selected]||!Number.isInteger(digit)||digit<1||digit>9)return;
  snapshot();
  if(editingNotes){
    if(!values[selected]){
      if(notes[selected].has(digit))notes[selected].delete(digit);
      else notes[selected].add(digit);
    } else history.pop();
  }else{
    values[selected]=digit;
    notes[selected].clear();
    clearPeerNotes(selected,digit);
  }
  reviewErrors.clear();renderBoard();checkVictory();
}
function erase(){
  if(gameOver||puzzle[selected]||(!values[selected]&&!notes[selected].size))return;
  snapshot();values[selected]=0;notes[selected].clear();reviewErrors.clear();renderBoard();
}
function undo(){
  if(gameOver||!history.length)return;
  const last=history.pop();values=last.values;notes=last.notes.map(a=>new Set(a));hinted=new Set(last.hinted);reviewErrors.clear();
  renderBoard();setMessage('Último movimento desfeito.');
}
function toggleNotes(){
  if(gameOver)return;
  editingNotes=!editingNotes;
  $('notes').classList.toggle('active',editingNotes);
  $('notes').setAttribute('aria-pressed',String(editingNotes));
  setMessage(editingNotes?'Anotações ativadas: números agora marcam candidatos.':'Anotações desativadas: números preenchem casas.');
}
function hint(){
  if(gameOver)return;
  const possible=values.map((v,i)=>i).filter(i=>!puzzle[i]&&values[i]!==solution[i]);
  if(!possible.length)return;
  const index=possible.includes(selected)?selected:possible[0];
  snapshot();selected=index;values[index]=solution[index];notes[index].clear();hinted.add(index);clearPeerNotes(index,solution[index]);reviewErrors.clear();
  markIneligible('Dica utilizada: esta partida não poderá entrar no ranking diário.');
  renderBoard();setMessage(`Dica: a casa selecionada contém ${solution[index]}.`,'success');checkVictory();
}
function check(){
  if(gameOver)return;
  reviewErrors=new Set(values.map((v,i)=>i).filter(i=>values[i]&&values[i]!==solution[i]));
  markIneligible('Conferência utilizada: esta partida não poderá entrar no ranking diário.');
  renderBoard();
  setMessage(reviewErrors.size?`${reviewErrors.size} resposta(s) incorreta(s) destacada(s) no tabuleiro.`:'Todas as respostas preenchidas estão corretas.',reviewErrors.size?'error':'success');
}
function checkVictory(){
  if(!isSolved(values,solution))return;
  gameOver=true;stopTimer();renderBoard();
  $('mission-state').textContent='MATRIZ RESOLVIDA';$('status-caption').textContent='DESAFIO CONCLUÍDO';
  setMessage('🏆 Todas as 81 casas estão corretas. Sudoku concluído!','success');
  const eligible=mode==='diario'&&useTimer&&assists===0;
  result=eligible?{id:randomId(),level,day:getDay(),time:finalElapsed,tema:'Sudoku · Desafio diário'}:null;
  $('submit-score').disabled=!eligible;
  $('result-rank').hidden=!eligible;
  $('result-description').textContent=useTimer
    ? `Você concluiu o nível ${LEVELS[level].name} em ${fmt(finalElapsed)}. ${eligible?'Resultado elegível ao ranking diário.':'Esta partida não vale para o ranking diário.'}`
    : `Você concluiu o nível ${LEVELS[level].name}, sem cronômetro.`;
  setScoreStatus(eligible?`Parabéns! Seu tempo: ${fmt(finalElapsed)}. Informe um apelido e registre sua vitória.`:'Vitória concluída! Para competir, use o desafio diário com cronômetro e sem ajudas.',eligible?'success':'');
  $('result-dialog').showModal();
}
function activeDailyView(){
  $('rank-date').textContent=`Desafio de ${dayDisplay(getDay())} · horário de Brasília`;
}
function selectRanking(next){
  rankingLevel=next;
  document.querySelectorAll('[data-rank]').forEach(b=>{const active=b.dataset.rank===next;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  refreshRanking();
}
async function refreshRanking(){
  activeDailyView();const token=++rankingRequest;
  $('rank-list').replaceChildren();$('rank-status').textContent='Consultando ranking diário…';$('rank-status').className='rank-feedback';
  try{
    const {readDailyRanking}=await import('./ranking.js');
    const rows=await readDailyRanking(rankingLevel,getDay());
    if(token!==rankingRequest)return;
    const frag=document.createDocumentFragment();
    rows.forEach((item,i)=>{
      const li=document.createElement('li');
      const position=document.createElement('span');position.className='rank-place';position.textContent=i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
      const name=document.createElement('div');name.className='rank-person';
      const strong=document.createElement('strong');strong.textContent=item.nome;
      const small=document.createElement('small');small.textContent=LEVELS[rankingLevel].name+' · Hoje';name.append(strong,small);
      const time=document.createElement('strong');time.className='rank-time';time.textContent=fmt(item.tempoMs);
      li.append(position,name,time);frag.appendChild(li);
    });
    $('rank-list').replaceChildren(frag);
    $('rank-status').textContent=rows.length?`${rows.length} participante(s) nesta dificuldade.`:'Nenhum resultado registrado hoje neste nível.';
  }catch(err){
    if(token!==rankingRequest)return;
    $('rank-status').textContent='Ranking indisponível nesta conexão ou sem regras publicadas no Firebase.';
    $('rank-status').className='rank-feedback error';
    console.warn('Sudoku ranking:',err);
  }
}

// Eventos
board.addEventListener('click',e=>{const cell=e.target.closest('.sudoku-cell');if(cell)select(Number(cell.dataset.index),true);});
board.addEventListener('keydown',e=>{
  const i=Number(e.target.closest('.sudoku-cell')?.dataset.index);
  if(!Number.isInteger(i))return;
  const r=Math.floor(i/9),c=i%9;
  const shifts={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
  if(shifts[e.key]){
    e.preventDefault();let [dr,dc]=shifts[e.key];select(Math.max(0,Math.min(8,r+dr))*9+Math.max(0,Math.min(8,c+dc)),true);
  }
});
document.addEventListener('keydown',e=>{
  if(e.target.closest('input,dialog')||e.ctrlKey&&e.key.toLowerCase()!=='z')return;
  if(e.ctrlKey&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}
  if(/^\d$/.test(e.key)&&e.key!=='0'){enterDigit(Number(e.key));return;}
  if(e.key==='Backspace'||e.key==='Delete'||e.key==='0'){e.preventDefault();erase();return;}
  if(e.key.toLowerCase()==='n')toggleNotes();
});
document.querySelector('.keypad').addEventListener('click',e=>{const b=e.target.closest('[data-digit]');if(b)enterDigit(Number(b.dataset.digit));});
$('erase').addEventListener('click',erase);$('undo').addEventListener('click',undo);$('notes').addEventListener('click',toggleNotes);
$('hint').addEventListener('click',hint);$('check').addEventListener('click',check);
$('new-round').addEventListener('click',freshRound);
document.getElementById('level-options').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(!b||b.dataset.level===level)return;level=b.dataset.level;freshRound();});
document.querySelector('[data-play-mode="livre"]').parentElement.addEventListener('click',e=>{const b=e.target.closest('[data-play-mode]');if(!b||b.dataset.playMode===mode)return;mode=b.dataset.playMode;freshRound();});
$('clock-enabled').addEventListener('change',e=>{useTimer=e.target.checked;freshRound();});
$('rank-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-rank]');if(b)selectRanking(b.dataset.rank);});
$('rank-refresh').addEventListener('click',refreshRanking);
$('help-open').addEventListener('click',()=>$('help-dialog').showModal());
$('help-close').addEventListener('click',()=>$('help-dialog').close());
$('result-next').addEventListener('click',freshRound);
$('result-close').addEventListener('click',()=>$('result-dialog').close());
$('result-rank').addEventListener('click',()=>{$('result-dialog').close();$('nickname').focus();$('nickname').scrollIntoView({behavior:'smooth',block:'center'});});
$('submit-score').addEventListener('click',async()=>{
  if(!result||submittedRound===result.id){setScoreStatus('Nenhum resultado novo disponível para registro.','error');return;}
  const name=$('nickname').value.trim().replace(/\s+/g,' ');
  if(name.length<2||name.length>24||!/^[\p{L}\p{N} ._-]+$/u.test(name)){setScoreStatus('Informe um apelido de 2 a 24 caracteres (letras, números, espaços, ponto, traço ou _).','error');return;}
  const record={...result};$('submit-score').disabled=true;setScoreStatus('Enviando resultado ao Firebase…');
  try{
    const {submitDailyRanking}=await import('./ranking.js');
    if(result?.id!==record.id)throw new Error('A partida foi alterada.');
    await submitDailyRanking(record,name);
    submittedRound=record.id;
    try{localStorage.setItem(nicknameKey,name);}catch(_){}
    setScoreStatus(`Tempo ${fmt(record.time)} registrado! Sua primeira conclusão deste nível hoje foi salva.`,'success');
    selectRanking(record.level);
  }catch(err){
    setScoreStatus(err.message||'Não foi possível registrar. Verifique sua conexão.','error');
  }finally{$('submit-score').disabled=!result||submittedRound===result.id;}
});

// Início
try{
  const pref=JSON.parse(localStorage.getItem(memoKey)||'{}');
  if(LEVELS[pref.level])level=pref.level;
  if(['livre','diario'].includes(pref.mode))mode=pref.mode;
  if(typeof pref.useTimer==='boolean')useTimer=pref.useTimer;
  $('nickname').value=localStorage.getItem(nicknameKey)||'';
}catch(_){}
freshRound();
