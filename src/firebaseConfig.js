import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBJlXgar8asDPdIIVw8UZOb9UkW0fCHBQc",
  authDomain: "atividade2-64cf8.firebaseapp.com",
  projectId: "atividade2-64cf8",
  storageBucket: "atividade2-64cf8.firebasestorage.app",
  messagingSenderId: "27454764510",
  appId: "1:27454764510:web:072e6916789ba8bdf5994f",
  measurementId: "G-MQ42853ES7"
};

// Inicializa o App
const appFirebase = initializeApp(firebaseConfig);

// Inicializa e exporta o Firestore
export const db = getFirestore(appFirebase);

// Inicializa e exporta o Auth
export const auth = getAuth(appFirebase);

// Mantém export default do app (se quiser)
export default appFirebase;
