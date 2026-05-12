require('dotenv').config();
const db = require('../src/database/db');

const email = process.env.OWNER_EMAIL;
if (!email) {
  console.error('ERROR: Define OWNER_EMAIL en tu .env');
  process.exit(1);
}

const token = db.registerUser(email);

console.log('\n✅ Token de propietario generado para:', email);
console.log('\n📋 Pega esto en la consola del navegador (F12 → Console):\n');
console.log(`localStorage.setItem('cc_auth_token', '${token}')\n`);
console.log('Luego recarga la página — tendrás descargas ilimitadas.\n');
