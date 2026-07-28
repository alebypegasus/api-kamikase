import { db } from '../config/database';
import { IUsuario } from '../types';

export class UsuarioModel {
    static async buscarPorEmail(email: string): Promise<IUsuario | null> {
        const [linhas]: any = await db.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        if (linhas.length >0) {
            return linhas[0] as IUsuario;
        }
        return null;
    }

    static async listarTodos(): Promise<IUsuario[]> {
        const [linhas]: any = await db.execute(
            'SELECT id, nome, email FROM usuarios'
        );
        return linhas as IUsuario[];
    }

    static async criar(usuario: IUsuario): Promise<number> {
        const [resultado]: any = await db.execute(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [usuario.nome, usuario.email, usuario.senha ?? null]
        );
        return resultado.insertId;
    }

    static async deletar(id: number): Promise<boolean> {
        const [resultado]: any = await db.execute(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }

    static async atualizar(id: number, dados: Partial<IUsuario>): Promise<boolean> {
        const campos = Object.keys(dados);
        if (campos.length === 0) return false;

        const setSql = campos.map(campo => `${campo} = ?`).join(', ');
        const valores = campos.map(campo => (dados as any)[campo]);
        valores.push(id);

        const [resultado]: any = await db.execute(
            `UPDATE usuarios SET ${setSql} WHERE id = ?`,
            valores
        );
        return resultado.affectedRows > 0;
    }
}