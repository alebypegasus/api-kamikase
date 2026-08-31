import { db } from '../config/database';
import { IUsuario } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Whitelist de campos permitidos para atualização (previne SQL injection via nomes de coluna)
const ALLOWED_UPDATE_FIELDS = ['nome', 'email', 'senha'] as const;

export class UsuarioModel {
    static async buscarPorEmail(email: string): Promise<IUsuario | null> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        if (linhas.length > 0) {
            return linhas[0] as IUsuario;
        }
        return null;
    }

    static async listarTodos(): Promise<IUsuario[]> {
        const [linhas] = await db.execute<RowDataPacket[]>(
            'SELECT id, nome, email, is_admin, created_at FROM usuarios'
        );
        return linhas as IUsuario[];
    }

    static async criar(usuario: IUsuario): Promise<number> {
        const [resultado] = await db.execute<ResultSetHeader>(
            'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES (?, ?, ?, ?)',
            [usuario.nome, usuario.email, usuario.senha ?? null, usuario.is_admin ?? false]
        );
        return resultado.insertId;
    }

    static async deletar(id: number): Promise<boolean> {
        const [resultado] = await db.execute<ResultSetHeader>(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }

    static async atualizar(id: number, dados: Partial<IUsuario>): Promise<boolean> {
        // Filtrar apenas campos permitidos
        const campos = Object.keys(dados).filter(
            campo => ALLOWED_UPDATE_FIELDS.includes(campo as typeof ALLOWED_UPDATE_FIELDS[number])
        );
        if (campos.length === 0) return false;

        const setSql = campos.map(campo => `${campo} = ?`).join(', ');
        const valores: any[] = campos.map(campo => (dados as Record<string, unknown>)[campo]);
        valores.push(id);

        const [resultado] = await db.execute<ResultSetHeader>(
            `UPDATE usuarios SET ${setSql} WHERE id = ?`,
            valores
        );
        return resultado.affectedRows > 0;
    }
}