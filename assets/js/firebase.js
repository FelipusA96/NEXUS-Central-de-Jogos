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
const db = getFirestore(app);
const auth = getAuth(app);

export async function readRanking(level, count = 20) {
  if (!['facil','medio','dificil','extremo'].includes(level)) {
    throw new Error('Nível inválido');
  }
  const q = query(
    collection(db,'rankings',level,'participantes'),
    orderBy('tempoMs','asc'),
    limit(count),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((entry,index) => ({
    id: entry.id,
    place: index + 1,
    name: typeof entry.data().nome === 'string' ? entry.data().nome : 'Participante',
    time: Number(entry.data().tempoMs) || 0,
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
