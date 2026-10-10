// Integração sob demanda. A HUD funciona sem conexão com o Firebase.
// O projeto é o mesmo do Caça-Palavras existente; dados e permissões são compartilhados.
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBt5PxI4qIfc23Vr2ytTd9VYFIGvSwv2fE',
  authDomain: 'cacapalavrasinterativo.firebaseapp.com',
  projectId: 'cacapalavrasinterativo',
  storageBucket: 'cacapalavrasinterativo.firebasestorage.app',
  messagingSenderId: '167586064732',
  appId: '1:167586064732:web:4b7450d7cbbbcf09717999',
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function readRanking(level, count = 20, game = 'caca-palavras') {
  if (!['facil','medio','dificil','extremo'].includes(level)) {
    throw new Error('Nível inválido');
  }
  const root = game === 'campo-minado' ? 'rankings_campo_minado' : 'rankings';
  let ref;
  if (game === 'sudoku' || game === 'memoria') {
    const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const date = Object.fromEntries(parts.map(p=>[p.type,p.value]));
    const day = `${date.year}-${date.month}-${date.day}`;
    ref=collection(db,game==='memoria'?'rankings_memoria':'rankings_sudoku',level,'dias',day,'participantes');
  } else {
    ref=collection(db,root,level,'participantes');
  }
  const q = query(
    ref,
    orderBy(game==='memoria'?'ordem':'tempoMs','asc'),
    limit(count),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((entry,index) => ({
    id: entry.id,
    place: index + 1,
    name: typeof entry.data().nome === 'string' ? entry.data().nome : 'Participante',
    time: Number(entry.data().tempoMs) || 0,
    attempts: Number(entry.data().tentativas) || 0,
    theme: typeof entry.data().tema === 'string' ? entry.data().tema : '',
  }));
}

export function currentUser() {
  return new Promise((resolve,reject) => {
    let unsub = () => {};
    unsub = onAuthStateChanged(auth,user => {
      unsub();
      resolve(user);
    }, reject);
  });
}
