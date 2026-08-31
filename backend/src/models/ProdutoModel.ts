import { db } from '../config/database';
import { IProduto, ICategoria } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Whitelist de campos permitidos para atualização
const ALLOWED_UPDATE_FIELDS = ['nome', 'descricao', 'preco', 'categorias_id', 'estoque'] as const;

export class ProdutoModel {
    static async criar(produto: Omit<IProduto, 'id'>): Promise<number> {
        const [resultado] = await db.execute<ResultSetHeader>(
            'INSERT INTO produtos (nome, descricao, preco, categorias_id, usuarios_id, estoque) VALUES (?, ?, ?, ?, ?, ?)',
            [produto.nome, produto.descricao || null, produto.preco, produto.categorias_id, produto.usuarios_id, produto.estoque ?? 0]
        );
        return resultado.insertId;
    }

    static async listarTodos(): Promise<IProduto[]> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM produtos'
        );
        return linhas as IProduto[];
    }

    static async listarPorUsuario(usuariosId: number): Promise<IProduto[]> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM produtos WHERE usuarios_id = ?',
            [usuariosId]
        );
        return linhas as IProduto[];
    }

    static async contarPorUsuario(usuariosId: number): Promise<number> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM produtos WHERE usuarios_id = ?',
            [usuariosId]
        );
        return linhas[0]?.total ?? 0;
    }

    static async listarCategoriasPorUsuario(usuariosId: number): Promise<ICategoria[]> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT DISTINCT c.id, c.nome FROM categorias c INNER JOIN produtos p ON c.id = p.categorias_id WHERE p.usuarios_id = ?',
            [usuariosId]
        );
        return linhas as ICategoria[];
    }

    static async contarCategoriasPorUsuario(usuariosId: number): Promise<number> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(DISTINCT p.categorias_id) as total FROM produtos p WHERE p.usuarios_id = ?',
            [usuariosId]
        );
        return linhas[0]?.total ?? 0;
    }

    static async deletar(id: number, usuariosId: number): Promise<boolean> {
        const [resultado] = await db.execute<ResultSetHeader>(
            'DELETE FROM produtos WHERE id = ? AND usuarios_id = ?',
            [id, usuariosId]
        );
        return resultado.affectedRows > 0;
    }

    static async atualizar(id: number, usuariosId: number, dados: Partial<IProduto>): Promise<boolean> {
        // Filtrar apenas campos permitidos
        const campos = Object.keys(dados).filter(
            campo => ALLOWED_UPDATE_FIELDS.includes(campo as typeof ALLOWED_UPDATE_FIELDS[number])
        );
        if (campos.length === 0) return false;

        const setSql = campos.map(campo => `${campo} = ?`).join(', ');
        const valores: any[] = campos.map(campo => (dados as Record<string, unknown>)[campo]);
        valores.push(id, usuariosId);

        const [resultado] = await db.execute<ResultSetHeader>(
            `UPDATE produtos SET ${setSql} WHERE id = ? AND usuarios_id = ?`,
            valores
        );
        return resultado.affectedRows > 0;
    }
}
