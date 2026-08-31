import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UsuarioModel } from '../models/UsuarioModel';

// Schema de cadastro público — SEM is_admin (prevenção de escalação de privilégio)
const cadastrarSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(255, "Nome deve ter no máximo 255 caracteres"),
    email: z.string().email("Formato de email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128, "Senha deve ter no máximo 128 caracteres"),
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
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(255).optional(),
    email: z.string().email("Formato de email inválido").max(255).optional(),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128).optional()
});

export class UsuarioController {
    static async cadastrar(req: Request, res: Response): Promise<void> {
        const { nome, email, senha } = cadastrarSchema.parse(req.body);

        const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
        if (usuarioExistente) {
            res.status(400).json({ mensagem: 'Email já está em uso na base de dados.' });
            return;
        }

        const senhaCriptografada = await bcrypt.hash(senha, 12);

        const novoId = await UsuarioModel.criar({
            nome,
            email,
            senha: senhaCriptografada,
            is_admin: false // Sempre false no cadastro público
        });

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', id: novoId });
    }

    static async login(req: Request, res: Response): Promise<void> {
        const { email, senha } = loginSchema.parse(req.body);

        const usuario = await UsuarioModel.buscarPorEmail(email);
        if (!usuario) {
            res.status(401).json({ mensagem: 'Credenciais inválidas.' });
            return;
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha!);
        if (!senhaValida) {
            res.status(401).json({ mensagem: 'Credenciais inválidas.' });
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

        const dadosAtualizacao: Record<string, string> = {};
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
            dadosAtualizacao.senha = await bcrypt.hash(senha, 12);
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