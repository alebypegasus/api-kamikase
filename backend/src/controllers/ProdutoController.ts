import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ProdutoModel } from '../models/ProdutoModel';

export class ProdutoController {
    static async criar(req: AuthRequest, res: Response): Promise<any> {
        try {
            const { nome, preco, categorias_id, estoque } = req.body;
            const usuarios_id = req.usuarioId;

            if (!nome || preco === undefined || !categorias_id || !usuarios_id) {
                return res.status(400).json({ erro: 'Todos os campos (nome, preco, categorias_id) são obrigatórios.' });
            }

            const id = await ProdutoModel.criar({
                nome,
                preco,
                categorias_id: Number(categorias_id),
                usuarios_id,
                estoque: estoque !== undefined ? Number(estoque) : 0
            });

            return res.status(201).json({ mensagem: 'Produto criado com sucesso.', id });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro interno do servidor.' });
        }
    }

    static async listarTodos(req: AuthRequest, res: Response): Promise<any> {
        try {
            const produtos = await ProdutoModel.listarTodos();
            return res.status(200).json(produtos);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao listar todos os produtos.' });
        }
    }

    static async listarPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        try {
            const usuarios_id = req.usuarioId;
            if (!usuarios_id) {
                return res.status(401).json({ erro: 'Usuário não autenticado.' });
            }

            const produtos = await ProdutoModel.listarPorUsuario(usuarios_id);
            return res.status(200).json(produtos);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao listar produtos.' });
        }
    }

    static async contarPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        try {
            const usuarios_id = req.usuarioId;
            if (!usuarios_id) {
                return res.status(401).json({ erro: 'Usuário não autenticado.' });
            }

            const total = await ProdutoModel.contarPorUsuario(usuarios_id);
            return res.status(200).json({ total });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao contar produtos.' });
        }
    }

    static async listarCategoriasPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        try {
            const usuarios_id = req.usuarioId;
            if (!usuarios_id) {
                return res.status(401).json({ erro: 'Usuário não autenticado.' });
            }

            const categorias = await ProdutoModel.listarCategoriasPorUsuario(usuarios_id);
            return res.status(200).json(categorias);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao listar categorias do usuário.' });
        }
    }

    static async contarCategoriasPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        try {
            const usuarios_id = req.usuarioId;
            if (!usuarios_id) {
                return res.status(401).json({ erro: 'Usuário não autenticado.' });
            }

            const total = await ProdutoModel.contarCategoriasPorUsuario(usuarios_id);
            return res.status(200).json({ total });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao contar categorias do usuário.' });
        }
    }

    static async deletar(req: AuthRequest, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const usuarios_id = req.usuarioId;

            if (!id || !usuarios_id) {
                return res.status(400).json({ erro: 'ID do produto é obrigatório.' });
            }

            const deletado = await ProdutoModel.deletar(Number(id), usuarios_id);
            if (!deletado) {
                return res.status(404).json({ erro: 'Produto não encontrado ou não pertence a este usuário.' });
            }

            return res.status(200).json({ mensagem: 'Produto deletado com sucesso.' });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao deletar produto.' });
        }
    }

    static async atualizar(req: AuthRequest, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { nome, preco, categorias_id, estoque } = req.body;
            const usuarios_id = req.usuarioId;

            if (!id || !usuarios_id) {
                return res.status(400).json({ erro: 'ID do produto é obrigatório.' });
            }

            const dadosAtualizados: any = {};
            if (nome) dadosAtualizados.nome = nome;
            if (preco !== undefined) dadosAtualizados.preco = preco;
            if (categorias_id !== undefined) dadosAtualizados.categorias_id = Number(categorias_id);
            if (estoque !== undefined) dadosAtualizados.estoque = Number(estoque);

            if (Object.keys(dadosAtualizados).length === 0) {
                return res.status(400).json({ erro: 'Nenhum campo fornecido para atualização.' });
            }

            const atualizado = await ProdutoModel.atualizar(Number(id), usuarios_id, dadosAtualizados);
            if (!atualizado) {
                return res.status(404).json({ erro: 'Produto não encontrado ou não pertence a este usuário.' });
            }

            return res.status(200).json({ mensagem: 'Produto atualizado com sucesso.' });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao atualizar produto.' });
        }
    }
}
