/** Ranking Spider: menor número de movimentos, tempo para desempatar. */
import {auth,db} from '../../assets/js/firebase.js';
import {collection,doc,getDocs,query,orderBy,limit,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import {signInAnonymously} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import {LEVELS,brazilDay,rankingOrder} from './engine.js';
function validate(level,day){if(!LEVELS[level]||!/^\d{4}-\d{2}-\d{2}$/.test(day))throw Error('Desafio inválido.');}
const participants=(level,day)=>collection(db,'rankings_spider',level,'dias',day,'participantes');
export async function readDailyRanking(level,day){
  validate(level,day);
  const docs=await getDocs(query(participants(level,day),orderBy('ordem','asc'),limit(30)));
  return docs.docs.map(d=>({uid:d.id,...d.data()}));
}
export async function submitDailyRanking(result,nome){
  validate(result.level,result.day);
  if(result.day!==brazilDay())throw Error('O desafio mudou de data. Comece o desafio de hoje.');
  const nick=String(nome).trim().replace(/\s+/g,' ');
  if(nick.length<2||nick.length>24||!/^[\p{L}\p{N} ._\-]+$/u.test(nick))throw Error('Apelido inválido.');
  const movimentos=Number(result.moves),tempoMs=Math.round(result.time);
  const ordem=rankingOrder(movimentos,tempoMs);
  if(!auth.currentUser)await signInAnonymously(auth);
  const uid=auth.currentUser?.uid;
  if(!uid)throw Error('Falha na autenticação do visitante.');
  const ref=doc(participants(result.level,result.day),uid);
  await runTransaction(db,async tx=>{
    const old=await tx.get(ref);
    if(old.exists())throw Error('Você já registrou uma partida neste nível hoje. Volte amanhã para um novo desafio.');
    tx.set(ref,{
      nome:nick,movimentos,tempoMs,ordem,
      tema:`Spider • ${LEVELS[result.level].name} • ${result.day}`,
      atualizadoEm:serverTimestamp()
    });
  });
}
