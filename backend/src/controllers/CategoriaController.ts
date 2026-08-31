import { Response } from 'express';
import { z } from 'zod';
import { CategoriaModel } from '../models/CategoriaModel';
import { AuthRequest } from '../middlewares/authMiddleware';

const criarCategoriaSchema = z.object({
    nome: z.string().min(1, "Nome da categoria é obrigatório").max(255),
    parent_id: z.number().int().positive().nullable().optional(),
});

const atualizarCategoriaSchema = z.object({
    nome: z.string().min(1, "Nome da categoria é obrigatório").max(255),
    parent_id: z.number().int().positive().nullable().optional(),
});

export class CategoriaController {
    static async criar(req: AuthRequest, res: Response): Promise<any> {
        const { nome, parent_id } = criarCategoriaSchema.parse(req.body);
        const usuarios_id = req.usuarioId;

        if (!usuarios_id) {
            return res.status(401).json({ erro: "Usuário não autenticado." });
        }

        const id = await CategoriaModel.criar(nome, usuarios_id, parent_id ?? null);
        return res.status(201).json({ mensagem: "Categoria criada com sucesso.", id });
    }

    static async listar(req: AuthRequest, res: Response): Promise<any> {
        const usuarios_id = req.usuarioId;
        if (!usuarios_id) return res.status(401).json({ erro: "Usuário não autenticado." });

        const categorias = await CategoriaModel.listarPorUsuario(usuarios_id);
        return res.status(200).json(categorias);
    }

    static async deletar(req: AuthRequest, res: Response): Promise<any> {
        const { id } = req.params;
        const usuarios_id = req.usuarioId;
        
        if (!id) {
            return res.status(400).json({ erro: "ID da categoria é obrigatório." });
        }
        if (!usuarios_id) return res.status(401).json({ erro: "Usuário não autenticado." });

        const deletado = await CategoriaModel.deletar(Number(id), usuarios_id);
        if (!deletado) {
            return res.status(404).json({ erro: "Categoria não encontrada ou não pertence a este usuário." });
        }

        return res.status(200).json({ mensagem: "Categoria deletada com sucesso." });
    }

    static async atualizar(req: AuthRequest, res: Response): Promise<any> {
        const { id } = req.params;
        const { nome, parent_id } = atualizarCategoriaSchema.parse(req.body);
        const usuarios_id = req.usuarioId;

        if (!id) {
            return res.status(400).json({ erro: "ID da categoria é obrigatório." });
        }
        if (!usuarios_id) return res.status(401).json({ erro: "Usuário não autenticado." });

        const atualizado = await CategoriaModel.atualizar(Number(id), usuarios_id, nome, parent_id ?? null);
        if (!atualizado) {
            return res.status(404).json({ erro: "Categoria não encontrada ou não pertence a este usuário." });
        }

        return res.status(200).json({ mensagem: "Categoria atualizada com sucesso." });
    }
}