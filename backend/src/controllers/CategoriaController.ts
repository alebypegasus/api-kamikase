import { Request, Response } from 'express';
import { CategoriaModel } from '../models/CategoriaModel';

export class CategoriaController {
    static async criar(req: Request, res: Response): Promise<any> {
        try {
            const { nome, usuarios_id } = req.body;
            if (!nome) {
                return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
            }

            const id = await CategoriaModel.criar(nome, usuarios_id ? Number(usuarios_id) : null);
            return res.status(201).json({ mensagem: "Categoria criada com sucesso", id });
        } catch (erro) {
            return res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async listar(req: Request, res: Response): Promise<any> {
        try {
            const categorias = await CategoriaModel.listarTodas();
            return res.status(200).json(categorias);
        } catch (erro) {
            return res.status(500).json({ erro: "Erro ao listar categorias." });
        }
    }

    static async deletar(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ erro: "ID da categoria é obrigatório." });
            }

            const deletado = await CategoriaModel.deletar(Number(id));
            if (!deletado) {
                return res.status(404).json({ erro: "Categoria não encontrada." });
            }

            return res.status(200).json({ mensagem: "Categoria deletada com sucesso." });
        } catch (erro) {
            return res.status(500).json({ erro: "Erro ao deletar categoria." });
        }
    }

    static async atualizar(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { nome } = req.body;

            if (!id || !nome) {
                return res.status(400).json({ erro: "ID e nome da categoria são obrigatórios." });
            }

            const atualizado = await CategoriaModel.atualizar(Number(id), nome);
            if (!atualizado) {
                return res.status(404).json({ erro: "Categoria não encontrada." });
            }

            return res.status(200).json({ mensagem: "Categoria atualizada com sucesso." });
        } catch (erro) {
            return res.status(500).json({ erro: "Erro ao atualizar categoria." });
        }
    }
}