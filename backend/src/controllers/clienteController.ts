import { Response } from 'express';
import { z } from 'zod';
import { ClienteModel } from '../models/ClienteModel';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ICliente } from '../types';

const clienteSchema = z.object({
    nome: z.string({ message: "Nome do cliente é obrigatório" }).min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
    cpf_cnpj: z.string().max(20).nullable().optional(),
    telefone: z.string().max(30).nullable().optional(),
    email: z.string().email("E-mail inválido").max(255).nullable().optional().or(z.literal('')),
    endereco: z.string().max(255).nullable().optional(),
});

export class ClienteController {
    static async listar(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const busca = req.query.q as string | undefined;
        const clientes = await ClienteModel.listarPorUsuario(usuariosId, busca);
        return res.json(clientes);
    }

    static async obterPorId(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        const { id } = req.params;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const cliente = await ClienteModel.obterPorId(Number(id), usuariosId);
        if (!cliente) {
            return res.status(404).json({ erro: "Cliente não encontrado." });
        }
        return res.json(cliente);
    }

    static async criar(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const dados = clienteSchema.parse(req.body);

        const novoCliente: ICliente = {
            usuarios_id: usuariosId,
            nome: dados.nome.trim(),
            cpf_cnpj: dados.cpf_cnpj ? dados.cpf_cnpj.trim() : null,
            telefone: dados.telefone ? dados.telefone.trim() : null,
            email: dados.email && dados.email.trim() !== '' ? dados.email.trim() : null,
            endereco: dados.endereco ? dados.endereco.trim() : null
        };

        const id = await ClienteModel.criar(novoCliente);
        return res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso!",
            id,
            cliente: { id, ...novoCliente }
        });
    }

    static async atualizar(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        const { id } = req.params;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const dados = clienteSchema.partial().parse(req.body);
        const atualizado = await ClienteModel.atualizar(Number(id), usuariosId, dados);

        if (!atualizado) {
            return res.status(404).json({ erro: "Cliente não encontrado ou sem permissão." });
        }
        return res.json({ mensagem: "Cliente atualizado com sucesso!" });
    }

    static async excluir(req: AuthRequest, res: Response): Promise<any> {
        const usuariosId = req.usuarioId;
        const { id } = req.params;
        if (!usuariosId) return res.status(401).json({ erro: "Usuário não autenticado." });

        const excluido = await ClienteModel.excluir(Number(id), usuariosId);
        if (!excluido) {
            return res.status(404).json({ erro: "Cliente não encontrado ou sem permissão." });
        }
        return res.json({ mensagem: "Cliente excluído com sucesso!" });
    }
}
