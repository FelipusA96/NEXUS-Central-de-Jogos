/** Ranking diário independente. Firebase é carregado somente ao consultar/enviar. */
import {db,auth} from '../../assets/js/firebase.js';
import {collection,doc,getDocs,query,orderBy,limit,getDoc,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import {signInAnonymously} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

const LEVELS=['facil','medio','dificil','extremo'];
function check(level,day){
  if(!LEVELS.includes(level)||!/^\d{4}-\d\d-\d\d$/.test(day))throw Error('Desafio inválido.');
}
export async function readDailyRanking(level,day){
  check(level,day);
  const records=query(collection(db,'rankings_sudoku',level,'dias',day,'participantes'),orderBy('tempoMs','asc'),limit(20));
  const snapshot=await getDocs(records);
  return snapshot.docs.map(d=>({uid:d.id,...d.data()}));
}
export async function submitDailyRanking(result,nome){
  check(result.level,result.day);
  if(!auth.currentUser)await signInAnonymously(auth);
  const uid=auth.currentUser?.uid;
  if(!uid)throw Error('Não foi possível autenticar esta sessão.');
  const ref=doc(db,'rankings_sudoku',result.level,'dias',result.day,'participantes',uid);
  const old=await getDoc(ref);
  if(old.exists())throw Error('Você já registrou uma conclusão nesta dificuldade hoje. Tente novamente amanhã.');
  await setDoc(ref,{nome,tempoMs:Math.max(1,Math.round(result.time)),tema:result.tema,atualizadoEm:serverTimestamp()});
}
