import { Response } from 'express';
import { z } from 'zod';
import { VendaModel } from '../models/VendaModel';
import { AuthRequest } from '../middlewares/authMiddleware';
import { IVenda } from '../types';

const itemVendaSchema = z.object({
    produtos_id: z.coerce.number({ message: "ID do produto é obrigatório" }).int().positive(),
    quantidade: z.coerce.number({ message: "Quantidade é obrigatória" }).int().positive("Quantidade deve ser maior que zero"),
    preco_unitario: z.coerce.number().optional().default(0),
});

const criarVendaSchema = z.object({
    valor_total: z.coerce.number().optional().default(0),
    itens: z.array(itemVendaSchema).min(1, "A venda deve conter pelo menos 1 item"),
    desconto: z.coerce.number().min(0).optional().default(0),
    forma_pagamento: z.string().max(50).optional().default('Dinheiro'),
    parcelas: z.coerce.number().int().min(1).max(12).optional().default(1),
});

export class VendaController {
    static async criar(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;

        if (!usuariosId) {
            return res.status(401).json({ erro: "Usuário não autenticado." });
        }

        const dados = criarVendaSchema.parse(req.body);

        const venda: IVenda = {
            usuarios_id: usuariosId,
            valor_total: dados.valor_total,
            desconto: dados.desconto,
            forma_pagamento: dados.forma_pagamento,
            parcelas: dados.parcelas,
            itens: dados.itens
        };

        try {
            const id = await VendaModel.criar(venda);
            return res.status(201).json({ mensagem: 'Venda registrada com sucesso!', id });
        } catch (error) {
            const errorMsg = (error as Error).message;
            // Erros de estoque são retornados como 400 (não 500)
            if (errorMsg.includes('Estoque insuficiente') || errorMsg.includes('não encontrado')) {
                return res.status(400).json({ erro: errorMsg });
            }
            throw error; // Re-throw para o errorHandler global tratar como 500
        }
    }

    static async listarPorUsuario(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const vendas = await VendaModel.listarPorUsuario(usuariosId);
        return res.json(vendas);
    }

    static async listarDetalhesVenda(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        const { id } = req.params;

        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const venda = await VendaModel.listarDetalhesVenda(Number(id), usuariosId);
        if (!venda) {
            return res.status(404).json({ erro: 'Venda não encontrada ou não pertence ao usuário.' });
        }
        return res.json(venda);
    }
}
