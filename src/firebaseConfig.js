import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAQuVq1kayAs4CPXB8R0MP0PZM4AvJicMA",
  authDomain: "projetoapsrafael.firebaseapp.com",
  projectId: "projetoapsrafael",
  storageBucket: "projetoapsrafael.firebasestorage.app",
  messagingSenderId: "70350899763",
  appId: "1:70350899763:web:d14517d63e02d4e19c3146",
  measurementId: "G-7Z0FNCVRFH"
};

// Inicializa o App
const appFirebase = initializeApp(firebaseConfig);

// Inicializa e exporta o Firestore
export const db = getFirestore(appFirebase);

// Inicializa e exporta o Auth
export const auth = getAuth(appFirebase);

// Mantém export default do app (se quiser)
export default appFirebase;
