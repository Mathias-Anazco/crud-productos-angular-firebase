// Genera src/app/firebase.env.ts con la configuración de Firebase.
//
// Los valores se leen de variables de entorno (en Vercel) o del archivo
// .env (en local). Así las credenciales NO quedan dentro del repositorio:
// tanto .env como el archivo generado están en .gitignore.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// Si existe un archivo .env, cargamos sus valores (formato CLAVE=valor).
if (existsSync('.env')) {
  for (const linea of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const coincide = linea.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (coincide && !linea.trim().startsWith('#') && !(coincide[1] in process.env)) {
      process.env[coincide[1]] = coincide[2].replace(/^["']|["']$/g, '');
    }
  }
}

const variables = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
};

const faltantes = Object.values(variables).filter(nombre => !process.env[nombre]);
if (faltantes.length > 0) {
  console.error(`\n❌ Faltan variables de entorno de Firebase: ${faltantes.join(', ')}`);
  console.error('   Copia .env.example como .env y completa los valores de tu proyecto Firebase.\n');
  process.exit(1);
}

const config = Object.fromEntries(
  Object.entries(variables).map(([campo, nombre]) => [campo, process.env[nombre]])
);

writeFileSync(
  'src/app/firebase.env.ts',
  '// ARCHIVO GENERADO por scripts/set-env.mjs. No editar ni subir a git.\n' +
  `export const firebaseConfig = ${JSON.stringify(config, null, 2)};\n`
);
console.log('✔ src/app/firebase.env.ts generado');
