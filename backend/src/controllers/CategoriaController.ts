import { Response } from 'express';
import { CategoriaModel } from '../models/CategoriaModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export class CategoriaController {
    static async criar(req: AuthRequest, res: Response): Promise<any> {
        try {
            const { nome } = req.body;
            const usuarios_id = req.usuarioId;

            if (!nome) {
                return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
            }

            if (!usuarios_id) {
                return res.status(401).json({ erro: "Usuário não autenticado." });
            }

            const id = await CategoriaModel.criar(nome, usuarios_id);
            return res.status(201).json({ mensagem: "Categoria criada com sucesso", id });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async listar(req: AuthRequest, res: Response): Promise<any> {
        try {
            const usuarios_id = req.usuarioId;
            if (!usuarios_id) return res.status(401).json({ erro: "Usuário não autenticado." });

            const categorias = await CategoriaModel.listarPorUsuario(usuarios_id);
            return res.status(200).json(categorias);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: "Erro ao listar categorias." });
        }
    }

    static async deletar(req: AuthRequest, res: Response): Promise<any> {
        try {
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
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: "Erro ao deletar categoria." });
        }
    }

    static async atualizar(req: AuthRequest, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { nome } = req.body;
            const usuarios_id = req.usuarioId;

            if (!id || !nome) {
                return res.status(400).json({ erro: "ID e nome da categoria são obrigatórios." });
            }
            if (!usuarios_id) return res.status(401).json({ erro: "Usuário não autenticado." });

            const atualizado = await CategoriaModel.atualizar(Number(id), usuarios_id, nome);
            if (!atualizado) {
                return res.status(404).json({ erro: "Categoria não encontrada ou não pertence a este usuário." });
            }

            return res.status(200).json({ mensagem: "Categoria atualizada com sucesso." });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: "Erro ao atualizar categoria." });
        }
    }
}