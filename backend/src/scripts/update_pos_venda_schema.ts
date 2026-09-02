import { db, closeDatabase } from '../config/database';

async function updatePosVendaSchema() {
    console.log('🔄 Atualizando schema do banco para suportar módulo de Pós-Venda...');
    const conn = await db.getConnection();

    try {
        // Criar tabela pos_venda
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS pos_venda (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendas_id INT NOT NULL,
                usuarios_id INT NOT NULL,
                cliente_id INT DEFAULT NULL,
                status ENUM('Pendente', 'Contatado', 'Satisfeito', 'Troca/Garantia', 'Concluido') DEFAULT 'Pendente',
                satisfacao INT DEFAULT NULL,
                observacoes TEXT,
                data_contato DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vendas_id) REFERENCES vendas(id) ON DELETE CASCADE,
                FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
                INDEX idx_pos_venda_usuario (usuarios_id),
                INDEX idx_pos_venda_venda (vendas_id),
                INDEX idx_pos_venda_cliente (cliente_id),
                INDEX idx_pos_venda_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabela "pos_venda" criada/verificada com sucesso.');

        console.log('🎉 Migração de pós-venda concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração de pós-venda:', error);
        throw error;
    } finally {
        conn.release();
        await closeDatabase();
    }
}

updatePosVendaSchema().catch(() => process.exit(1));
