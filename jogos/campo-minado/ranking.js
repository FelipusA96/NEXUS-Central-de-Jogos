/** Ranking modular do Campo Minado; acesso ao Firebase apenas quando solicitado. */
import {auth,db} from '../../assets/js/firebase.js';
import {signInAnonymously} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import {collection,query,orderBy,limit,getDocs,doc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

const ROOT='rankings_campo_minado';
const VALID_LEVELS=new Set(['facil','medio','dificil','extremo']);

export async function readScores(level,max=5) {
  if (!VALID_LEVELS.has(level)) throw new Error('Dificuldade inválida.');
  const q=query(collection(db,ROOT,level,'participantes'),orderBy('tempoMs','asc'),limit(max));
  const snap=await getDocs(q);
  return snap.docs.map((entry,index)=>({position:index+1,id:entry.id,...entry.data()}));
}

export async function submitScore({level,nickname,time,description}) {
  if(!VALID_LEVELS.has(level)) throw new Error('Dificuldade inválida.');
  if (typeof nickname!=='string'||nickname.length<2||nickname.length>24||!/^[\p{L}\p{N} ._-]+$/u.test(nickname)) {
    throw new Error('Use um apelido de 2 a 24 caracteres, sem símbolos especiais.');
  }
  if (!Number.isInteger(time)||time<1||time>86400000) throw new Error('Tempo inválido.');
  if (!description||description.length>160) throw new Error('Detalhes da partida inválidos.');
  // Auth State pode ainda estar carregando ao iniciar o módulo.
  await auth.authStateReady();
  if (!auth.currentUser) await signInAnonymously(auth);
  const user=auth.currentUser;
  if (!user) throw new Error('Não foi possível autenticar a participação.');
  const ref=doc(db,ROOT,level,'participantes',user.uid);
  let previous=null;
  let improved=false;
  await runTransaction(db,async trx=>{
    const old=await trx.get(ref);
    previous=old.exists()?Number(old.data().tempoMs):null;
    improved=false;
    if (previous!==null && previous<=time) return;
    trx.set(ref,{nome:nickname,tempoMs:time,tema:description,atualizadoEm:serverTimestamp()});
    improved=true;
  });
  return {improved,previous,uid:user.uid};
}
