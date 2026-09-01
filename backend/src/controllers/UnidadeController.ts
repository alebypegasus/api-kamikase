import { Request, Response, NextFunction } from 'express';
import { UnidadeModel } from '../models/UnidadeModel';
import { z } from 'zod';

const UnidadeSchema = z.object({
    nome: z.string().min(3, "O nome da unidade deve ter pelo menos 3 caracteres")
});

export class UnidadeController {
    static async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = UnidadeSchema.parse(req.body);
            const id = await UnidadeModel.criar(data.nome);
            res.status(201).json({ mensagem: 'Unidade criada com sucesso', id });
        } catch (error) {
            next(error);
        }
    }

    static async listarTodas(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const unidades = await UnidadeModel.listarTodas();
            res.status(200).json(unidades);
        } catch (error) {
            next(error);
        }
    }

    static async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = UnidadeSchema.parse(req.body);
            
            const atualizou = await UnidadeModel.atualizar(Number(id), data.nome);
            
            if (atualizou) {
                res.status(200).json({ mensagem: 'Unidade atualizada com sucesso' });
            } else {
                res.status(404).json({ erro: 'Unidade não encontrada' });
            }
        } catch (error) {
            next(error);
        }
    }
}
