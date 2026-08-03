import { Request, Response } from 'express';
import { AdminModel } from '../models/AdminModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AdminController {
    static async obterDashboard(req: AuthRequest, res: Response) {
        try {
            if (!req.isAdmin) {
                return res.status(403).json({ erro: "Acesso restrito ao administrador." });
            }

            const dadosUsuarios = await AdminModel.obterDadosUsuarios();
            const relatorioGlobal = await AdminModel.obterRelatorioGlobal();
            res.json({ usuarios: dadosUsuarios, global: relatorioGlobal });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro ao buscar dados do painel administrador.' });
        }
    }
}
