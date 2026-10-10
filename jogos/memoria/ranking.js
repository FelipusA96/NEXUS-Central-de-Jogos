/** Ranking diário: menos tentativas, tempo usado somente como desempate. */
import {auth,db} from '../../assets/js/firebase.js';
import {collection,doc,getDocs,query,orderBy,limit,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import {signInAnonymously} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import {LEVELS,rankingOrder,brazilDay} from './engine.js';
function check(level,day){
  if(!LEVELS[level] || !/^\d{4}-\d{2}-\d{2}$/.test(day))throw new Error('Desafio inválido.');
}
const participants=(level,day)=>collection(db,'rankings_memoria',level,'dias',day,'participantes');
export async function readDailyRanking(level,day){
  check(level,day);
  const data=await getDocs(query(participants(level,day),orderBy('ordem','asc'),limit(30)));
  return data.docs.map(d=>({uid:d.id,...d.data()}));
}
export async function submitDailyRanking(result,nome){
  check(result.level,result.day);
  if(result.day!==brazilDay())throw Error('O desafio diário já mudou de data.');
  const validatedName=String(nome).trim().replace(/\s+/g,' ');
  if(validatedName.length<2||validatedName.length>24||!/^[\p{L}\p{N} ._\-]+$/u.test(validatedName))throw Error('Apelido inválido.');
  const attempts=Number(result.attempts),timeMs=Math.round(result.time);
  if(attempts<LEVELS[result.level].pairs)throw Error('Quantidade de tentativas inválida.');
  const ordem=rankingOrder(attempts,timeMs);
  if(!auth.currentUser)await signInAnonymously(auth);
  const uid=auth.currentUser?.uid;
  if(!uid)throw Error('Não foi possível autenticar a sessão.');
  const ref=doc(participants(result.level,result.day),uid);
  await runTransaction(db,async tx=>{
    const previous=await tx.get(ref);
    if(previous.exists())throw Error('Você já registrou um resultado neste nível hoje. Volte amanhã para competir novamente.');
    tx.set(ref,{
      nome:validatedName,
      tentativas:attempts,
      tempoMs:timeMs,
      ordem,
      tema:`Memória • ${LEVELS[result.level].name} • ${result.day}`,
      atualizadoEm:serverTimestamp()
    });
  });
}
