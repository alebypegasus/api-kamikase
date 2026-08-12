import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify database connectivity on startup
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conexão com MySQL estabelecida com sucesso (Pool de conexões)');
        connection.release();
    } catch (error) {
        console.error('❌ Falha ao conectar com o MySQL:', (error as Error).message);
    }
})();