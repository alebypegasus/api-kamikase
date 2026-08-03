import { Request, Response } from 'express';
import { VendaModel } from '../models/VendaModel';
import { AuthRequest } from '../middlewares/authMiddleware';
import { IVenda } from '../types';

export class VendaController {
    static async criar(req: AuthRequest, res: Response) {
        try {
            const { valor_total, itens } = req.body;
            const usuariosId = req.usuarioId;

            if (!usuariosId) {
                return res.status(401).json({ erro: "Usuário não autenticado." });
            }

            if (!valor_total || !itens || !Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({ erro: "Dados inválidos para registrar a venda." });
            }

            const venda: IVenda = {
                usuarios_id: usuariosId,
                valor_total,
                itens
            };

            const id = await VendaModel.criar(venda);
            res.status(201).json({ mensagem: 'Venda registrada com sucesso!', id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro ao registrar venda.' });
        }
    }

    static async listarPorUsuario(req: AuthRequest, res: Response) {
        try {
            const usuariosId = req.usuarioId;
            if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

            const vendas = await VendaModel.listarPorUsuario(usuariosId);
            res.json(vendas);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao listar vendas.' });
        }
    }

    static async listarDetalhesVenda(req: AuthRequest, res: Response) {
        try {
            const usuariosId = req.usuarioId;
            const { id } = req.params;

            if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

            const venda = await VendaModel.listarDetalhesVenda(Number(id), usuariosId);
            if (!venda) {
                return res.status(404).json({ erro: 'Venda não encontrada ou não pertence ao usuário.' });
            }
            res.json(venda);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar detalhes da venda.' });
        }
    }
}
