import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { db } from '../config/database';

async function exportSql() {
    try {
        console.log('Exporting database tables to SQL...');
        const connection = await db.getConnection();

        let sqlOutput = `-- ====================================================\n`;
        sqlOutput += `-- SCRIPT DE POPULAÇÃO DO BANCO DE DADOS: api_kamikase\n`;
        sqlOutput += `-- Gerado automaticamente para Kamikase ERP & PDV\n`;
        sqlOutput += `-- Usuários Principais: \n`;
        sqlOutput += `--   - Admin: admin@admin.com (Senha: 123)\n`;
        sqlOutput += `--   - User 01: ale.ramos.oliveira@hotmail.com (Senha: 123)\n`;
        sqlOutput += `--   - User 02: ale.ramos.oliveira@gmail.com (Senha: 123)\n`;
        sqlOutput += `--   - +12 Lojistas com vendas e estoque (Senha: 123)\n`;
        sqlOutput += `-- ====================================================\n\n`;
        sqlOutput += `USE api_kamikase;\n\n`;
        sqlOutput += `SET FOREIGN_KEY_CHECKS = 0;\n`;
        sqlOutput += `TRUNCATE TABLE itens_venda;\n`;
        sqlOutput += `TRUNCATE TABLE vendas;\n`;
        sqlOutput += `TRUNCATE TABLE produtos;\n`;
        sqlOutput += `TRUNCATE TABLE categorias;\n`;
        sqlOutput += `TRUNCATE TABLE usuarios;\n`;
        sqlOutput += `TRUNCATE TABLE unidades;\n`;
        sqlOutput += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;

        const tables = ['unidades', 'usuarios', 'categorias', 'produtos', 'vendas', 'itens_venda'];

        for (const table of tables) {
            const [rows]: any = await connection.query(`SELECT * FROM ${table}`);
            if (rows.length === 0) continue;

            sqlOutput += `-- Dados da tabela: ${table} (${rows.length} registros)\n`;
            for (const row of rows) {
                const cols = Object.keys(row).join(', ');
                const vals = Object.values(row).map(val => {
                    if (val === null) return 'NULL';
                    if (typeof val === 'number' || typeof val === 'boolean') return val;
                    if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                    return `'${String(val).replace(/'/g, "\\'")}'`;
                }).join(', ');

                sqlOutput += `INSERT INTO ${table} (${cols}) VALUES (${vals});\n`;
            }
            sqlOutput += `\n`;
        }

        const seedPath = path.resolve(__dirname, '../../../db/seed.sql');
        fs.writeFileSync(seedPath, sqlOutput, 'utf8');
        console.log(`✅ Arquivo db/seed.sql gerado com sucesso em: ${seedPath}`);

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Erro exportando SQL:', error);
        process.exit(1);
    }
}

exportSql();
