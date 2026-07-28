import { db } from '../config/database';
import { ICategoria } from '../types';

export class CategoriaModel {
    static async criar(nome: string, usuarios_id: number | null = null): Promise<number> {
        const [resultado]: any = await db.execute(
            'INSERT INTO categorias (nome, usuarios_id) VALUES (?, ?)',
            [nome, usuarios_id]
        );
        return resultado.insertId;
    }

    static async listarTodas(): Promise<ICategoria[]> {
        const [linhas]: any = await db.execute(
            'SELECT * FROM categorias'
        );
        return linhas as ICategoria[];
    }

    static async deletar(id: number): Promise<boolean> {
        const [resultado]: any = await db.execute(
            'DELETE FROM categorias WHERE id = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }

    static async atualizar(id: number, nome: string): Promise<boolean> {
        const [resultado]: any = await db.execute(
            'UPDATE categorias SET nome = ? WHERE id = ?',
            [nome, id]
        );
        return resultado.affectedRows > 0;
    }
}
