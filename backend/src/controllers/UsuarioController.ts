import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/UsuarioModel';

export class UsuarioController {
    static async cadastrar(req: Request, res: Response): Promise<any> {
        try {
            const {nome, email, senha} = req.body;

            if (!nome ||!email ||!senha){
                return res.status(400).json({mensagem: 'Todos os campos são obrigatorios.'});
            }

            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({mensagem: 'Email já está em uso na base de dados.'});
            }

            const senhaCriptografada = await bcrypt.hash(senha, 10);

            const novoId = await UsuarioModel.criar({
                nome,
                email,
                senha: senhaCriptografada
            });

            return res.status(201).json({mensagem: 'Usuario cadastrado com sucesso.', id: novoId});

        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno do servidor.'})
        }
    }

    static async login(req: Request, res: Response): Promise<any> {
        try {
            const { email, senha } = req.body;

           const usuario = await UsuarioModel.buscarPorEmail(email);
           if (!usuario) {
                return res.status(401).json({mensagem: 'Credenciais invalidas'});
           }

           const senhaValida = await bcrypt.compare(senha, usuario.senha!);
           if (!senhaValida) {
            return res.status(401).json({mensagem: 'Credenciais invalidas'});
           }

           const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome},
            process.env.JWT_SECRET as string,
            {expiresIn: '8h' }
            );

            return res.status(200).json({ 
                mensagem: 'Acesso autorizado!',
                token: token,
                nome: usuario.nome,
                email: usuario.email
            });

        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ mensagem: 'Erro interno do servidor.'})
        }    
    }

    static async listarTodos(req: Request, res: Response): Promise<any> {
        try {
            const usuarios = await UsuarioModel.listarTodos();
            return res.status(200).json(usuarios);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ mensagem: 'Erro ao listar usuários.' });
        }
    }

    static async deletar(req: Request, res: Response): Promise<any> {
    try {
        // Agora pegamos o id de dentro do req.body
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
        }

        const deletado = await UsuarioModel.deletar(Number(id));
        if (!deletado) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        return res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
}

static async atualizar(req: Request, res: Response): Promise<any> {
    try {
        // Agora pegamos o id de dentro do req.body junto com os outros dados
        const { id, nome, email, senha } = req.body;

        if (!id) {
            return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
        }

        const dadosAtualizacao: any = {};
        if (nome) dadosAtualizacao.nome = nome;
        
        if (email) {
            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente && usuarioExistente.id !== Number(id)) {
                return res.status(400).json({ mensagem: 'Email já está em uso na base de dados.' });
            }
            dadosAtualizacao.email = email;
        }

        if (senha) {
            dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
        }

        if (Object.keys(dadosAtualizacao).length === 0) {
            return res.status(400).json({ mensagem: 'Nenhum campo enviado para alteração.' });
        }

        const atualizado = await UsuarioModel.atualizar(Number(id), dadosAtualizacao);
        if (!atualizado) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
}


}