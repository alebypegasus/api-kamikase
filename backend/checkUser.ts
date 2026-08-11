import { db } from './src/config/database';

async function checkUser() {
  try {
    const [rows]: any = await db.execute('SELECT * FROM usuarios WHERE email = ?', ['ale.ramos.oliveira@hotmail.com']);
    console.log('User found:', rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
