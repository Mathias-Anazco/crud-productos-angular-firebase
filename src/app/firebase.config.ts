// Inicialización de Firebase y Cloud Firestore.
// Los valores de configuración NO están escritos aquí: se generan en
// firebase.env.ts a partir de variables de entorno (ver README).
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase.env';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
