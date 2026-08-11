import { db } from './src/config/database';
import bcrypt from 'bcrypt';

async function resetPassword() {
  try {
    const newPassword = '123';
    const hash = await bcrypt.hash(newPassword, 10);
    const [result]: any = await db.execute(
      'UPDATE usuarios SET senha = ? WHERE email = ?',
      [hash, 'ale.ramos.oliveira@hotmail.com']
    );
    console.log('Password reset successfully to "123". Affected rows:', result.affectedRows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();
