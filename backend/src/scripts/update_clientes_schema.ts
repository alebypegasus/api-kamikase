import { db, closeDatabase } from '../config/database';

async function updateSchema() {
    console.log('🔄 Atualizando schema do banco para suportar clientes e identificação na venda...');
    const conn = await db.getConnection();

    try {
        // 1. Criar tabela de clientes
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuarios_id INT NOT NULL,
                nome VARCHAR(255) NOT NULL,
                cpf_cnpj VARCHAR(20) DEFAULT NULL,
                telefone VARCHAR(30) DEFAULT NULL,
                email VARCHAR(255) DEFAULT NULL,
                endereco VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_clientes_usuario (usuarios_id),
                INDEX idx_clientes_nome (nome)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabela "clientes" verificada/criada com sucesso.');

        // 2. Verificar e adicionar colunas na tabela vendas
        const [columns]: any = await conn.execute(`SHOW COLUMNS FROM vendas`);
        const colNames = columns.map((c: any) => c.Field);

        if (!colNames.includes('cliente_id')) {
            await conn.execute(`
                ALTER TABLE vendas 
                ADD COLUMN cliente_id INT DEFAULT NULL AFTER usuarios_id,
                ADD CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
                ADD INDEX idx_vendas_cliente (cliente_id);
            `);
            console.log('✅ Coluna "cliente_id" adicionada à tabela "vendas".');
        } else {
            console.log('ℹ️ Coluna "cliente_id" já existe em "vendas".');
        }

        if (!colNames.includes('cliente_nome')) {
            await conn.execute(`
                ALTER TABLE vendas 
                ADD COLUMN cliente_nome VARCHAR(255) DEFAULT NULL AFTER cliente_id,
                ADD INDEX idx_vendas_cliente_nome (cliente_nome);
            `);
            console.log('✅ Coluna "cliente_nome" adicionada à tabela "vendas".');
        } else {
            console.log('ℹ️ Coluna "cliente_nome" já existe em "vendas".');
        }

        console.log('🎉 Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao atualizar schema:', error);
        throw error;
    } finally {
        conn.release();
        await closeDatabase();
    }
}

updateSchema().catch(() => process.exit(1));
