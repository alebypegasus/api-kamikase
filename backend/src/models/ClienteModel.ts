import { db } from '../config/database';
import { ICliente } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ClienteModel {
    static async listarPorUsuario(usuariosId: number, busca?: string): Promise<ICliente[]> {
        let query = 'SELECT * FROM clientes WHERE usuarios_id = ?';
        const params: any[] = [usuariosId];

        if (busca && busca.trim()) {
            query += ' AND (nome LIKE ? OR cpf_cnpj LIKE ? OR telefone LIKE ? OR email LIKE ?)';
            const term = `%${busca.trim()}%`;
            params.push(term, term, term, term);
        }

        query += ' ORDER BY nome ASC';

        const [linhas] = await db.execute<RowDataPacket[]>(query, params);
        return linhas as ICliente[];
    }

    static async obterPorId(id: number, usuariosId: number): Promise<ICliente | null> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM clientes WHERE id = ? AND usuarios_id = ?',
            [id, usuariosId]
        );
        if (linhas.length === 0) return null;
        return linhas[0] as ICliente;
    }

    static async criar(cliente: ICliente): Promise<number> {
        const [resultado] = await db.execute<ResultSetHeader>(
            `INSERT INTO clientes (usuarios_id, nome, cpf_cnpj, telefone, email, endereco) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                cliente.usuarios_id,
                cliente.nome,
                cliente.cpf_cnpj || null,
                cliente.telefone || null,
                cliente.email || null,
                cliente.endereco || null
            ]
        );
        return resultado.insertId;
    }

    static async atualizar(id: number, usuariosId: number, dados: Partial<ICliente>): Promise<boolean> {
        const [resultado] = await db.execute<ResultSetHeader>(
            `UPDATE clientes 
             SET nome = COALESCE(?, nome), 
                 cpf_cnpj = COALESCE(?, cpf_cnpj), 
                 telefone = COALESCE(?, telefone), 
                 email = COALESCE(?, email), 
                 endereco = COALESCE(?, endereco) 
             WHERE id = ? AND usuarios_id = ?`,
            [
                dados.nome ?? null,
                dados.cpf_cnpj ?? null,
                dados.telefone ?? null,
                dados.email ?? null,
                dados.endereco ?? null,
                id,
                usuariosId
            ]
        );
        return resultado.affectedRows > 0;
    }

    static async excluir(id: number, usuariosId: number): Promise<boolean> {
        const [resultado] = await db.execute<ResultSetHeader>(
            'DELETE FROM clientes WHERE id = ? AND usuarios_id = ?',
            [id, usuariosId]
        );
        return resultado.affectedRows > 0;
    }
}
