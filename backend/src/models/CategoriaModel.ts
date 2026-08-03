import { db } from '../config/database';
import { ICategoria } from '../types';

export class CategoriaModel {
    static async criar(nome: string, usuarios_id: number | null = null, parent_id: number | null = null): Promise<number> {
        const [resultado]: any = await db.execute(
            'INSERT INTO categorias (nome, usuarios_id, parent_id) VALUES (?, ?, ?)',
            [nome, usuarios_id, parent_id]
        );
        return resultado.insertId;
    }

    static async listarPorUsuario(usuarios_id: number): Promise<ICategoria[]> {
        const [linhas]: any = await db.execute(
            'SELECT * FROM categorias WHERE usuarios_id = ?',
            [usuarios_id]
        );
        return linhas as ICategoria[];
    }

    static async deletar(id: number, usuarios_id: number): Promise<boolean> {
        const [resultado]: any = await db.execute(
            'DELETE FROM categorias WHERE id = ? AND usuarios_id = ?',
            [id, usuarios_id]
        );
        return resultado.affectedRows > 0;
    }

    static async atualizar(id: number, usuarios_id: number, nome: string, parent_id: number | null = null): Promise<boolean> {
        const [resultado]: any = await db.execute(
            'UPDATE categorias SET nome = ?, parent_id = ? WHERE id = ? AND usuarios_id = ?',
            [nome, parent_id, id, usuarios_id]
        );
        return resultado.affectedRows > 0;
    }
}
