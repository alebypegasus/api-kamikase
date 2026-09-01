import { db } from '../config/database';

export interface Unidade {
    id: number;
    nome: string;
    created_at?: Date;
    updated_at?: Date;
}

export class UnidadeModel {
    static async criar(nome: string): Promise<number> {
        const [result]: any = await db.execute(
            'INSERT INTO unidades (nome) VALUES (?)',
            [nome]
        );
        return result.insertId;
    }

    static async listarTodas(): Promise<Unidade[]> {
        const [rows]: any = await db.execute('SELECT id, nome, created_at, updated_at FROM unidades');
        return rows as Unidade[];
    }

    static async atualizar(id: number, nome: string): Promise<boolean> {
        const [result]: any = await db.execute(
            'UPDATE unidades SET nome = ? WHERE id = ?',
            [nome, id]
        );
        return result.affectedRows > 0;
    }

    static async buscarPorId(id: number): Promise<Unidade | null> {
        const [rows]: any = await db.execute(
            'SELECT id, nome, created_at, updated_at FROM unidades WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        return rows[0] as Unidade;
    }
}
