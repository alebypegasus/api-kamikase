import { db } from '../config/database';
import { IVenda, IVendaItem } from '../types';

export class VendaModel {
    static async criar(venda: IVenda): Promise<number> {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [resultado]: any = await connection.execute(
                'INSERT INTO vendas (usuarios_id, valor_total) VALUES (?, ?)',
                [venda.usuarios_id, venda.valor_total]
            );
            
            const vendaId = resultado.insertId;

            if (venda.itens && venda.itens.length > 0) {
                for (const item of venda.itens) {
                    await connection.execute(
                        'INSERT INTO itens_venda (vendas_id, produtos_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                        [vendaId, item.produtos_id, item.quantidade, item.preco_unitario]
                    );

                    // Atualiza estoque
                    await connection.execute(
                        'UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND usuarios_id = ?',
                        [item.quantidade, item.produtos_id, venda.usuarios_id]
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
        const [linhas]: any = await db.execute(
            'SELECT * FROM vendas WHERE usuarios_id = ?',
            [usuariosId]
        );
        return linhas as IVenda[];
    }

    static async listarDetalhesVenda(id: number, usuariosId: number): Promise<IVenda | null> {
        const [linhas]: any = await db.execute(
            'SELECT * FROM vendas WHERE id = ? AND usuarios_id = ?',
            [id, usuariosId]
        );

        if (linhas.length === 0) return null;

        const venda = linhas[0] as IVenda;

        const [itens]: any = await db.execute(
            'SELECT iv.*, p.nome as produto_nome FROM itens_venda iv JOIN produtos p ON iv.produtos_id = p.id WHERE iv.vendas_id = ?',
            [id]
        );

        venda.itens = itens;
        return venda;
    }

    static async totalVendasPorUsuario(usuariosId: number): Promise<number> {
        const [linhas]: any = await db.execute(
            'SELECT SUM(valor_total) as total FROM vendas WHERE usuarios_id = ?',
            [usuariosId]
        );
        return linhas[0]?.total ?? 0;
    }
}
