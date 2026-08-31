import { Response } from 'express';
import { AdminModel } from '../models/AdminModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AdminController {
    static async obterDashboard(req: AuthRequest, res: Response): Promise<void> {
        if (!req.isAdmin) {
            res.status(403).json({ erro: "Acesso restrito ao administrador." });
            return;
        }

        const dadosUsuarios = await AdminModel.obterDadosUsuarios();
        const relatorioGlobal = await AdminModel.obterRelatorioGlobal();
        res.json({ usuarios: dadosUsuarios, global: relatorioGlobal });
    }
}
