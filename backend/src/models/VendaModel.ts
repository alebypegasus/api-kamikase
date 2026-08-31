import { db } from '../config/database';
import { IVenda } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class VendaModel {
    static async criar(venda: IVenda): Promise<number> {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [resultado] = await connection.execute<ResultSetHeader>(
                'INSERT INTO vendas (usuarios_id, valor_total, desconto, forma_pagamento, parcelas) VALUES (?, ?, ?, ?, ?)',
                [venda.usuarios_id, venda.valor_total, venda.desconto || 0, venda.forma_pagamento || 'Dinheiro', venda.parcelas || 1]
            );
            
            const vendaId = resultado.insertId;

            if (venda.itens && venda.itens.length > 0) {
                for (const item of venda.itens) {
                    // Verificar estoque disponível antes de decrementar
                    const [estoqueRows] = await connection.execute<RowDataPacket[]>(
                        'SELECT estoque, nome FROM produtos WHERE id = ? AND usuarios_id = ? FOR UPDATE',
                        [item.produtos_id, venda.usuarios_id]
                    );

                    if (estoqueRows.length === 0) {
                        throw new Error(`Produto #${item.produtos_id} não encontrado.`);
                    }

                    const produto = estoqueRows[0];
                    if (produto.estoque < item.quantidade) {
                        throw new Error(
                            `Estoque insuficiente para "${produto.nome}". ` +
                            `Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`
                        );
                    }

                    await connection.execute(
                        'INSERT INTO itens_venda (vendas_id, produtos_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                        [vendaId, item.produtos_id, item.quantidade, item.preco_unitario]
                    );

                    // Atualiza estoque com condição de segurança
                    await connection.execute(
                        'UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND usuarios_id = ? AND estoque >= ?',
                        [item.quantidade, item.produtos_id, venda.usuarios_id, item.quantidade]
                    );
                }
            }

            await connection.commit();
            connection.release();
            return vendaId;
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }

    static async listarPorUsuario(usuariosId: number): Promise<IVenda[]> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM vendas WHERE usuarios_id = ? ORDER BY created_at DESC',
            [usuariosId]
        );
        return linhas as IVenda[];
    }

    static async listarDetalhesVenda(id: number, usuariosId: number): Promise<IVenda | null> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM vendas WHERE id = ? AND usuarios_id = ?',
            [id, usuariosId]
        );

        if (linhas.length === 0) return null;

        const venda = linhas[0] as IVenda;

        const [itens] = await db.execute<RowDataPacket[]>(
            'SELECT iv.*, p.nome as produto_nome FROM itens_venda iv JOIN produtos p ON iv.produtos_id = p.id WHERE iv.vendas_id = ?',
            [id]
        );

        venda.itens = itens as IVenda['itens'];
        return venda;
    }

    static async totalVendasPorUsuario(usuariosId: number): Promise<number> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT IFNULL(SUM(valor_total), 0) as total FROM vendas WHERE usuarios_id = ?',
            [usuariosId]
        );
        return linhas[0]?.total ?? 0;
    }
}
