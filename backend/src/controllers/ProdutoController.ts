import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ProdutoModel } from '../models/ProdutoModel';

const criarProdutoSchema = z.object({
    nome: z.string().min(1, "Nome do produto é obrigatório").max(255),
    descricao: z.string().max(1000).optional().nullable(),
    preco: z.number({ message: "Preço é obrigatório" }).positive("Preço deve ser positivo"),
    categorias_id: z.number({ message: "Categoria é obrigatória" }).int().positive(),
    estoque: z.number().int().min(0, "Estoque não pode ser negativo").optional().default(0),
});

const atualizarProdutoSchema = z.object({
    nome: z.string().min(1).max(255).optional(),
    descricao: z.string().max(1000).optional().nullable(),
    preco: z.number().positive("Preço deve ser positivo").optional(),
    categorias_id: z.number().int().positive().optional(),
    estoque: z.number().int().min(0, "Estoque não pode ser negativo").optional(),
});

export class ProdutoController {
    static async criar(req: AuthRequest, res: Response): Promise<any> {
        const dados = criarProdutoSchema.parse(req.body);
        const usuarios_id = req.usuarioId;

        if (!usuarios_id) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        const id = await ProdutoModel.criar({
            nome: dados.nome,
            descricao: dados.descricao ?? undefined,
            preco: dados.preco,
            categorias_id: dados.categorias_id,
            usuarios_id,
            estoque: dados.estoque ?? 0
        });

        return res.status(201).json({ mensagem: 'Produto criado com sucesso.', id });
    }

    static async listarTodos(req: AuthRequest, res: Response): Promise<any> {
        const produtos = await ProdutoModel.listarTodos();
        return res.status(200).json(produtos);
    }

    static async listarPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        const usuarios_id = req.usuarioId;
        if (!usuarios_id) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        const produtos = await ProdutoModel.listarPorUsuario(usuarios_id);
        return res.status(200).json(produtos);
    }

    static async contarPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        const usuarios_id = req.usuarioId;
        if (!usuarios_id) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        const total = await ProdutoModel.contarPorUsuario(usuarios_id);
        return res.status(200).json({ total });
    }

    static async listarCategoriasPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        const usuarios_id = req.usuarioId;
        if (!usuarios_id) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        const categorias = await ProdutoModel.listarCategoriasPorUsuario(usuarios_id);
        return res.status(200).json(categorias);
    }

    static async contarCategoriasPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        const usuarios_id = req.usuarioId;
        if (!usuarios_id) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        const total = await ProdutoModel.contarCategoriasPorUsuario(usuarios_id);
        return res.status(200).json({ total });
    }

    static async deletar(req: AuthRequest, res: Response): Promise<any> {
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
    }

    static async atualizar(req: AuthRequest, res: Response): Promise<any> {
        const { id } = req.params;
        const usuarios_id = req.usuarioId;

        if (!id || !usuarios_id) {
            return res.status(400).json({ erro: 'ID do produto é obrigatório.' });
        }

        const dados = atualizarProdutoSchema.parse(req.body);

        // Filtrar apenas campos enviados
        const dadosAtualizados: Record<string, unknown> = {};
        if (dados.nome !== undefined) dadosAtualizados.nome = dados.nome;
        if (dados.descricao !== undefined) dadosAtualizados.descricao = dados.descricao;
        if (dados.preco !== undefined) dadosAtualizados.preco = dados.preco;
        if (dados.categorias_id !== undefined) dadosAtualizados.categorias_id = dados.categorias_id;
        if (dados.estoque !== undefined) dadosAtualizados.estoque = dados.estoque;

        if (Object.keys(dadosAtualizados).length === 0) {
            return res.status(400).json({ erro: 'Nenhum campo fornecido para atualização.' });
        }

        const atualizado = await ProdutoModel.atualizar(Number(id), usuarios_id, dadosAtualizados);
        if (!atualizado) {
            return res.status(404).json({ erro: 'Produto não encontrado ou não pertence a este usuário.' });
        }

        return res.status(200).json({ mensagem: 'Produto atualizado com sucesso.' });
    }
}
