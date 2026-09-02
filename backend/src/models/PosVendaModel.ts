import { db } from '../config/database';
import { IPosVenda } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class PosVendaModel {
    static async listarPorUsuario(usuariosId: number, status?: string, busca?: string): Promise<any[]> {
        let query = `
            SELECT 
                pv.*,
                v.valor_total as venda_valor,
                v.forma_pagamento as venda_pagamento,
                v.created_at as venda_data,
                COALESCE(v.cliente_nome, c.nome, 'Cliente Avulso') as cliente_nome,
                c.telefone as cliente_telefone,
                c.email as cliente_email,
                c.cpf_cnpj as cliente_cpf,
                (SELECT COUNT(*) FROM itens_venda iv WHERE iv.vendas_id = v.id) as total_itens,
                (SELECT GROUP_CONCAT(CONCAT(iv.quantidade, 'x ', p.nome) SEPARATOR ' • ') 
                 FROM itens_venda iv 
                 JOIN produtos p ON iv.produtos_id = p.id 
                 WHERE iv.vendas_id = v.id) as itens_resumo
            FROM pos_venda pv
            JOIN vendas v ON pv.vendas_id = v.id
            LEFT JOIN clientes c ON pv.cliente_id = c.id
            WHERE pv.usuarios_id = ?
        `;
        const params: any[] = [usuariosId];

        if (status && status !== 'todos') {
            query += ' AND pv.status = ?';
            params.push(status);
        }

        if (busca && busca.trim()) {
            query += ' AND (v.cliente_nome LIKE ? OR c.nome LIKE ? OR c.telefone LIKE ? OR c.email LIKE ? OR pv.observacoes LIKE ?)';
            const term = `%${busca.trim()}%`;
            params.push(term, term, term, term, term);
        }

        query += ' ORDER BY pv.updated_at DESC, pv.created_at DESC';

        const [linhas] = await db.execute<RowDataPacket[]>(query, params);
        return linhas;
    }

    static async obterPorId(id: number, usuariosId: number): Promise<any | null> {
        const query = `
            SELECT 
                pv.*,
                v.valor_total as venda_valor,
                v.forma_pagamento as venda_pagamento,
                v.created_at as venda_data,
                COALESCE(v.cliente_nome, c.nome, 'Cliente Avulso') as cliente_nome,
                c.telefone as cliente_telefone,
                c.email as cliente_email,
                c.cpf_cnpj as cliente_cpf,
                c.endereco as cliente_endereco
            FROM pos_venda pv
            JOIN vendas v ON pv.vendas_id = v.id
            LEFT JOIN clientes c ON pv.cliente_id = c.id
            WHERE pv.id = ? AND pv.usuarios_id = ?
        `;
        const [linhas] = await db.execute<RowDataPacket[]>(query, [id, usuariosId]);
        if (linhas.length === 0) return null;
        return linhas[0];
    }

    static async criar(dados: {
        vendas_id: number;
        usuarios_id: number;
        cliente_id?: number | null;
        status?: string;
        observacoes?: string;
    }): Promise<number> {
        const [resultado] = await db.execute<ResultSetHeader>(
            `INSERT INTO pos_venda (vendas_id, usuarios_id, cliente_id, status, observacoes) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                dados.vendas_id,
                dados.usuarios_id,
                dados.cliente_id || null,
                dados.status || 'Pendente',
                dados.observacoes || null
            ]
        );
        return resultado.insertId;
    }

    static async atualizar(
        id: number, 
        usuariosId: number, 
        dados: { 
            status?: string; 
            observacoes?: string; 
            satisfacao?: number | null;
            data_contato?: Date | string | null;
        }
    ): Promise<boolean> {
        const fields: string[] = [];
        const params: any[] = [];

        if (dados.status !== undefined) {
            fields.push('status = ?');
            params.push(dados.status);
            if (dados.status === 'Contatado' || dados.status === 'Satisfeito' || dados.status === 'Concluido') {
                fields.push('data_contato = COALESCE(data_contato, NOW())');
            }
        }

        if (dados.observacoes !== undefined) {
            fields.push('observacoes = ?');
            params.push(dados.observacoes);
        }

        if (dados.satisfacao !== undefined) {
            fields.push('satisfacao = ?');
            params.push(dados.satisfacao);
        }

        if (dados.data_contato !== undefined) {
            fields.push('data_contato = ?');
            params.push(dados.data_contato);
        }

        if (fields.length === 0) return true;

        params.push(id, usuariosId);
        const [resultado] = await db.execute<ResultSetHeader>(
            `UPDATE pos_venda SET ${fields.join(', ')} WHERE id = ? AND usuarios_id = ?`,
            params
        );
        return resultado.affectedRows > 0;
    }

    static async obterEstatisticas(usuariosId: number): Promise<any> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pendente' THEN 1 ELSE 0 END) as pendentes,
                SUM(CASE WHEN status = 'Contatado' THEN 1 ELSE 0 END) as contatados,
                SUM(CASE WHEN status = 'Satisfeito' THEN 1 ELSE 0 END) as satisfeitos,
                SUM(CASE WHEN status = 'Troca/Garantia' THEN 1 ELSE 0 END) as trocas_garantias,
                SUM(CASE WHEN status = 'Concluido' THEN 1 ELSE 0 END) as concluidos,
                AVG(satisfacao) as media_satisfacao
             FROM pos_venda 
             WHERE usuarios_id = ?`,
            [usuariosId]
        );
        return rows[0] || {
            total: 0,
            pendentes: 0,
            contatados: 0,
            satisfeitos: 0,
            trocas_garantias: 0,
            concluidos: 0,
            media_satisfacao: null
        };
    }
}
