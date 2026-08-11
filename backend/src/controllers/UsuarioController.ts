import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UsuarioModel } from '../models/UsuarioModel';

const cadastrarSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Formato de email inválido"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    is_admin: z.boolean().optional()
});

const loginSchema = z.object({
    email: z.string().email("Formato de email inválido"),
    senha: z.string().min(1, "Senha é obrigatória")
});

const idSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(val => Number(val))
});

const atualizarSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(val => Number(val)),
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
    email: z.string().email("Formato de email inválido").optional(),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional()
});

export class UsuarioController {
    static async cadastrar(req: Request, res: Response): Promise<void> {
        const { nome, email, senha, is_admin } = cadastrarSchema.parse(req.body);

        const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
        if (usuarioExistente) {
            res.status(400).json({ mensagem: 'Email já está em uso na base de dados.' });
            return;
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoId = await UsuarioModel.criar({
            nome,
            email,
            senha: senhaCriptografada,
            is_admin: is_admin || false
        });

        res.status(201).json({ mensagem: 'Usuario cadastrado com sucesso.', id: novoId });
    }

    static async login(req: Request, res: Response): Promise<void> {
        const { email, senha } = loginSchema.parse(req.body);

        const usuario = await UsuarioModel.buscarPorEmail(email);
        if (!usuario) {
            res.status(401).json({ mensagem: 'Credenciais invalidas' });
            return;
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha!);
        if (!senhaValida) {
            res.status(401).json({ mensagem: 'Credenciais invalidas' });
            return;
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome, is_admin: usuario.is_admin },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            mensagem: 'Acesso autorizado!',
            token: token,
            nome: usuario.nome,
            email: usuario.email,
            is_admin: usuario.is_admin
        });
    }

    static async listarTodos(req: Request, res: Response): Promise<void> {
        const usuarios = await UsuarioModel.listarTodos();
        res.status(200).json(usuarios);
    }

    static async deletar(req: Request, res: Response): Promise<void> {
        const { id } = idSchema.parse(req.body);

        const deletado = await UsuarioModel.deletar(id);
        if (!deletado) {
            res.status(404).json({ mensagem: 'Usuário não encontrado.' });
            return;
        }

        res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
    }

    static async atualizar(req: Request, res: Response): Promise<void> {
        const { id, nome, email, senha } = atualizarSchema.parse(req.body);

        const dadosAtualizacao: any = {};
        if (nome) dadosAtualizacao.nome = nome;

        if (email) {
            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente && usuarioExistente.id !== id) {
                res.status(400).json({ mensagem: 'Email já está em uso na base de dados.' });
                return;
            }
            dadosAtualizacao.email = email;
        }

        if (senha) {
            dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
        }

        if (Object.keys(dadosAtualizacao).length === 0) {
            res.status(400).json({ mensagem: 'Nenhum campo enviado para alteração.' });
            return;
        }

        const atualizado = await UsuarioModel.atualizar(id, dadosAtualizacao);
        if (!atualizado) {
            res.status(404).json({ mensagem: 'Usuário não encontrado.' });
            return;
        }

        res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });
    }
}