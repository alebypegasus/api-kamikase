import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
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
        console.error('   Verifique as variáveis de ambiente DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    }
})();

export const closeDatabase = async (): Promise<void> => {
    try {
        await db.end();
        console.log('🛑 Pool de conexões MySQL encerrado.');
    } catch (err) {
        console.error('Erro ao fechar o pool MySQL:', err);
    }
};