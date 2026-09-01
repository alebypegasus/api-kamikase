import { Response } from 'express';
import { z } from 'zod';
import { AdminModel } from '../models/AdminModel';
import { UsuarioModel } from '../models/UsuarioModel';
import { AuthRequest } from '../middlewares/authMiddleware';

const criarLojistaSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(255),
    email: z.string().email("Formato de email inválido").max(255),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128),
    unidade_id: z.coerce.number().nullable().optional()
});

const resetSenhaSchema = z.object({
    novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres").max(128)
});

export class AdminController {
    static async obterDashboard(_req: AuthRequest, res: Response): Promise<void> {
        const [dadosUsuarios, relatorioGlobal, faturamentoUnidades, faturamentoPagamentos] = await Promise.all([
            AdminModel.obterDadosUsuarios(),
            AdminModel.obterRelatorioGlobal(),
            AdminModel.obterFaturamentoPorUnidade(),
            AdminModel.obterFaturamentoPorPagamento()
        ]);

        res.json({
            usuarios: dadosUsuarios,
            global: relatorioGlobal,
            unidadesMetricas: faturamentoUnidades,
            pagamentosMetricas: faturamentoPagamentos
        });
    }

    static async listarTodasVendas(_req: AuthRequest, res: Response): Promise<void> {
        const vendas = await AdminModel.listarTodasVendas();
        res.json(vendas);
    }

    static async obterDetalhesVenda(req: AuthRequest, res: Response): Promise<void> {
        const { id } = req.params;
        const venda = await AdminModel.obterDetalhesVendaGlobal(Number(id));
        if (!venda) {
            res.status(404).json({ erro: 'Venda não encontrada.' });
            return;
        }
        res.json(venda);
    }

    static async listarTodosProdutos(_req: AuthRequest, res: Response): Promise<void> {
        const produtos = await AdminModel.listarTodosProdutos();
        res.json(produtos);
    }

    static async criarLojista(req: AuthRequest, res: Response): Promise<void> {
        const dados = criarLojistaSchema.parse(req.body);

        const usuarioExistente = await UsuarioModel.buscarPorEmail(dados.email);
        if (usuarioExistente) {
            res.status(400).json({ erro: 'E-mail já cadastrado no sistema.' });
            return;
        }

        const novoId = await AdminModel.criarLojista(dados);
        res.status(201).json({ mensagem: 'Lojista cadastrado com sucesso!', id: novoId });
    }

    static async resetarSenhaLojista(req: AuthRequest, res: Response): Promise<void> {
        const { id } = req.params;
        const { novaSenha } = resetSenhaSchema.parse(req.body);

        const atualizado = await AdminModel.resetarSenhaLojista(Number(id), novaSenha);
        if (!atualizado) {
            res.status(404).json({ erro: 'Lojista não encontrado.' });
            return;
        }

        res.json({ mensagem: 'Senha redefinida com sucesso!' });
    }

    static async obterDetalhesLojista(req: AuthRequest, res: Response): Promise<void> {
        const { id } = req.params;
        const detalhes = await AdminModel.obterDetalhesLojista(Number(id));
        if (!detalhes) {
            res.status(404).json({ erro: 'Lojista não encontrado.' });
            return;
        }

        res.json(detalhes);
    }
}
