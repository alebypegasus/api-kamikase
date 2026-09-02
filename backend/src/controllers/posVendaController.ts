import { Response } from 'express';
import { z } from 'zod';
import { PosVendaModel } from '../models/PosVendaModel';
import { AuthRequest } from '../middlewares/authMiddleware';

const atualizarPosVendaSchema = z.object({
    status: z.enum(['Pendente', 'Contatado', 'Satisfeito', 'Troca/Garantia', 'Concluido']).optional(),
    observacoes: z.string().max(2000).optional(),
    satisfacao: z.coerce.number().int().min(1).max(5).nullable().optional(),
    data_contato: z.string().datetime().optional().nullable(),
});

export class PosVendaController {
    static async listar(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const status = req.query.status as string | undefined;
        const busca = req.query.q as string | undefined;

        const lista = await PosVendaModel.listarPorUsuario(usuariosId, status, busca);
        return res.json(lista);
    }

    static async obterEstatisticas(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const stats = await PosVendaModel.obterEstatisticas(usuariosId);
        return res.json(stats);
    }

    static async obterPorId(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        const { id } = req.params;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const item = await PosVendaModel.obterPorId(Number(id), usuariosId);
        if (!item) {
            return res.status(404).json({ erro: "Registro de pós-venda não encontrado." });
        }
        return res.json(item);
    }

    static async atualizar(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        const { id } = req.params;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const dados = atualizarPosVendaSchema.parse(req.body);
        const atualizado = await PosVendaModel.atualizar(Number(id), usuariosId, dados);

        if (!atualizado) {
            return res.status(404).json({ erro: "Registro de pós-venda não encontrado ou sem permissão." });
        }
        return res.json({ mensagem: "Pós-venda atualizado com sucesso!" });
    }
}
