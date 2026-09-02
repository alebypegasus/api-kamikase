import { db } from '../config/database';
import { IVenda } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class VendaModel {
    static async criar(venda: IVenda): Promise<number> {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insere a venda inicialmente com valor_total = 0
            const [resultado] = await connection.execute<ResultSetHeader>(
                'INSERT INTO vendas (usuarios_id, cliente_id, cliente_nome, valor_total, desconto, forma_pagamento, parcelas) VALUES (?, ?, ?, 0, ?, ?, ?)',
                [
                    venda.usuarios_id,
                    venda.cliente_id || null,
                    venda.cliente_nome || null,
                    venda.desconto || 0,
                    venda.forma_pagamento || 'Dinheiro',
                    venda.parcelas || 1
                ]
            );
            
            const vendaId = resultado.insertId;
            let valor_total_calculado = 0;

            if (venda.itens && venda.itens.length > 0) {
                for (const item of venda.itens) {
                    // Buscar o preço e o estoque diretamente do banco
                    const [estoqueRows] = await connection.execute<RowDataPacket[]>(
                        'SELECT estoque, nome, preco FROM produtos WHERE id = ? AND usuarios_id = ? FOR UPDATE',
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

                    const precoUnitarioDB = Number(produto.preco);
                    valor_total_calculado += precoUnitarioDB * item.quantidade;

                    await connection.execute(
                        'INSERT INTO itens_venda (vendas_id, produtos_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                        [vendaId, item.produtos_id, item.quantidade, precoUnitarioDB]
                    );

                    // Atualiza estoque com condição de segurança
                    await connection.execute(
                        'UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND usuarios_id = ? AND estoque >= ?',
                        [item.quantidade, item.produtos_id, venda.usuarios_id, item.quantidade]
                    );
                }
            }

            // Aplicar desconto (opcional)
            let valor_final = valor_total_calculado - (venda.desconto || 0);
            if (valor_final < 0) valor_final = 0;

            // Atualizar a venda com o valor_total calculado
            await connection.execute(
                'UPDATE vendas SET valor_total = ? WHERE id = ?',
                [valor_final, vendaId]
            );

            // Criar automaticamente registro no Pós-Venda para acompanhamento / follow-up
            await connection.execute(
                `INSERT INTO pos_venda (vendas_id, usuarios_id, cliente_id, status, observacoes) 
                 VALUES (?, ?, ?, 'Pendente', ?)`,
                [
                    vendaId,
                    venda.usuarios_id,
                    venda.cliente_id || null,
                    venda.cliente_nome ? `Venda realizada para ${venda.cliente_nome}` : 'Venda realizada no PDV'
                ]
            );

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
            `SELECT v.*, 
                    COALESCE(v.cliente_nome, c.nome) as cliente_identificado,
                    c.nome as cliente_cadastrado_nome,
                    c.telefone as cliente_telefone,
                    c.cpf_cnpj as cliente_cpf
             FROM vendas v 
             LEFT JOIN clientes c ON v.cliente_id = c.id 
             WHERE v.usuarios_id = ? 
             ORDER BY v.created_at DESC`,
            [usuariosId]
        );
        return linhas as IVenda[];
    }

    static async listarDetalhesVenda(id: number, usuariosId: number): Promise<IVenda | null> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            `SELECT v.*, 
                    COALESCE(v.cliente_nome, c.nome) as cliente_identificado,
                    c.nome as cliente_cadastrado_nome,
                    c.telefone as cliente_telefone,
                    c.cpf_cnpj as cliente_cpf,
                    c.email as cliente_email,
                    c.endereco as cliente_endereco
             FROM vendas v 
             LEFT JOIN clientes c ON v.cliente_id = c.id 
             WHERE v.id = ? AND v.usuarios_id = ?`,
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
