import { db } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

export class AdminModel {
    static async obterDadosUsuarios() {
        const query = `
            SELECT 
                u.id as usuario_id,
                u.nome,
                u.email,
                u.ativo,
                u.unidade_id,
                un.nome as unidade_nome,
                u.created_at,
                (SELECT COUNT(*) FROM produtos WHERE usuarios_id = u.id) as total_produtos,
                (SELECT COUNT(*) FROM categorias WHERE usuarios_id = u.id) as total_categorias,
                (SELECT IFNULL(SUM(preco * estoque), 0) FROM produtos WHERE usuarios_id = u.id) as valor_total_estoque,
                (SELECT COUNT(*) FROM vendas WHERE usuarios_id = u.id) as total_vendas,
                (SELECT IFNULL(SUM(valor_total), 0) FROM vendas WHERE usuarios_id = u.id) as valor_total_vendido
            FROM usuarios u
            LEFT JOIN unidades un ON u.unidade_id = un.id
            WHERE u.is_admin = FALSE
            ORDER BY valor_total_vendido DESC, u.nome ASC
        `;
        
        const [linhas] = await db.execute<RowDataPacket[]>(query);
        return linhas;
    }

    static async obterRelatorioGlobal() {
        const [totalVendas] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total, IFNULL(SUM(valor_total), 0) as valor, IFNULL(AVG(valor_total), 0) as ticket_medio FROM vendas'
        );
        const [totalProdutos] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total, IFNULL(SUM(preco * estoque), 0) as valor, SUM(CASE WHEN estoque <= 5 THEN 1 ELSE 0 END) as estoque_critico FROM produtos'
        );
        const [totalCategorias] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM categorias'
        );
        const [totalUsuarios] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total, SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos, SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as inativos FROM usuarios WHERE is_admin = FALSE'
        );
        const [totalUnidades] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM unidades'
        );

        return {
            vendas: totalVendas[0],
            produtos: totalProdutos[0],
            categorias: totalCategorias[0],
            usuarios: totalUsuarios[0],
            unidades: totalUnidades[0]
        };
    }

    static async obterFaturamentoPorUnidade() {
        const query = `
            SELECT 
                un.id,
                un.nome as unidade_nome,
                COUNT(DISTINCT u.id) as total_lojistas,
                (SELECT COUNT(*) FROM produtos p JOIN usuarios u2 ON p.usuarios_id = u2.id WHERE u2.unidade_id = un.id) as total_produtos,
                (SELECT COUNT(*) FROM vendas v JOIN usuarios u3 ON v.usuarios_id = u3.id WHERE u3.unidade_id = un.id) as total_vendas,
                IFNULL(SUM(v.valor_total), 0) as faturamento_total
            FROM unidades un
            LEFT JOIN usuarios u ON u.unidade_id = un.id AND u.is_admin = FALSE
            LEFT JOIN vendas v ON v.usuarios_id = u.id
            GROUP BY un.id, un.nome
            ORDER BY faturamento_total DESC
        `;
        const [linhas] = await db.execute<RowDataPacket[]>(query);
        return linhas;
    }

    static async obterFaturamentoPorPagamento() {
        const query = `
            SELECT 
                IFNULL(forma_pagamento, 'Dinheiro') as forma_pagamento,
                COUNT(*) as total_vendas,
                IFNULL(SUM(valor_total), 0) as valor_total
            FROM vendas
            GROUP BY forma_pagamento
            ORDER BY valor_total DESC
        `;
        const [linhas] = await db.execute<RowDataPacket[]>(query);
        return linhas;
    }

    static async listarTodasVendas() {
        const query = `
            SELECT 
                v.id,
                v.usuarios_id,
                v.valor_total,
                v.desconto,
                v.forma_pagamento,
                v.parcelas,
                v.created_at,
                v.cliente_id,
                COALESCE(v.cliente_nome, c.nome) as cliente_identificado,
                c.nome as cliente_cadastrado_nome,
                c.telefone as cliente_telefone,
                u.nome as lojista_nome,
                u.email as lojista_email,
                un.nome as unidade_nome,
                (SELECT COUNT(*) FROM itens_venda WHERE vendas_id = v.id) as total_itens
            FROM vendas v
            JOIN usuarios u ON v.usuarios_id = u.id
            LEFT JOIN unidades un ON u.unidade_id = un.id
            LEFT JOIN clientes c ON v.cliente_id = c.id
            ORDER BY v.created_at DESC
        `;
        const [linhas] = await db.execute<RowDataPacket[]>(query);
        return linhas;
    }

    static async obterDetalhesVendaGlobal(vendaId: number) {
        const [vendaRows] = await db.execute<RowDataPacket[]>(
            `SELECT v.*, 
                    COALESCE(v.cliente_nome, c.nome) as cliente_identificado,
                    c.nome as cliente_cadastrado_nome,
                    c.telefone as cliente_telefone,
                    c.cpf_cnpj as cliente_cpf,
                    c.email as cliente_email,
                    u.nome as lojista_nome, 
                    u.email as lojista_email, 
                    un.nome as unidade_nome 
             FROM vendas v 
             JOIN usuarios u ON v.usuarios_id = u.id 
             LEFT JOIN unidades un ON u.unidade_id = un.id 
             LEFT JOIN clientes c ON v.cliente_id = c.id
             WHERE v.id = ?`,
            [vendaId]
        );

        if (vendaRows.length === 0) return null;

        const venda = vendaRows[0];
        const [itens] = await db.execute<RowDataPacket[]>(
            `SELECT iv.*, p.nome as produto_nome 
             FROM itens_venda iv 
             JOIN produtos p ON iv.produtos_id = p.id 
             WHERE iv.vendas_id = ?`,
            [vendaId]
        );

        venda.itens = itens;
        return venda;
    }

    static async listarTodosProdutos() {
        const query = `
            SELECT 
                p.id,
                p.nome,
                p.preco,
                p.estoque,
                p.descricao,
                p.categorias_id,
                p.usuarios_id,
                c.nome as categoria_nome,
                u.nome as lojista_nome,
                u.email as lojista_email,
                un.nome as unidade_nome
            FROM produtos p
            JOIN usuarios u ON p.usuarios_id = u.id
            LEFT JOIN categorias c ON p.categorias_id = c.id
            LEFT JOIN unidades un ON u.unidade_id = un.id
            ORDER BY p.estoque ASC, p.nome ASC
        `;
        const [linhas] = await db.execute<RowDataPacket[]>(query);
        return linhas;
    }

    static async criarLojista(dados: { nome: string; email: string; senha: string; unidade_id?: number | null }) {
        const senhaCriptografada = await bcrypt.hash(dados.senha, 12);
        const [resultado] = await db.execute<ResultSetHeader>(
            'INSERT INTO usuarios (nome, email, senha, is_admin, ativo, unidade_id) VALUES (?, ?, ?, false, true, ?)',
            [dados.nome, dados.email, senhaCriptografada, dados.unidade_id ?? null]
        );
        return resultado.insertId;
    }

    static async resetarSenhaLojista(usuarioId: number, novaSenha: string) {
        const senhaCriptografada = await bcrypt.hash(novaSenha, 12);
        const [resultado] = await db.execute<ResultSetHeader>(
            'UPDATE usuarios SET senha = ? WHERE id = ?',
            [senhaCriptografada, usuarioId]
        );
        return resultado.affectedRows > 0;
    }

    static async obterDetalhesLojista(usuarioId: number) {
        const [usuarioRows] = await db.execute<RowDataPacket[]>(
            `SELECT u.id, u.nome, u.email, u.ativo, u.unidade_id, u.created_at, un.nome as unidade_nome 
             FROM usuarios u 
             LEFT JOIN unidades un ON u.unidade_id = un.id 
             WHERE u.id = ? AND u.is_admin = FALSE`,
            [usuarioId]
        );

        if (usuarioRows.length === 0) return null;

        const usuario = usuarioRows[0];

        const [produtos] = await db.execute<RowDataPacket[]>(
            `SELECT p.*, c.nome as categoria_nome 
             FROM produtos p 
             LEFT JOIN categorias c ON p.categorias_id = c.id 
             WHERE p.usuarios_id = ? 
             ORDER BY p.nome ASC`,
            [usuarioId]
        );

        const [vendas] = await db.execute<RowDataPacket[]>(
            `SELECT v.*, (SELECT COUNT(*) FROM itens_venda WHERE vendas_id = v.id) as total_itens 
             FROM vendas v 
             WHERE v.usuarios_id = ? 
             ORDER BY v.created_at DESC 
             LIMIT 50`,
            [usuarioId]
        );

        return {
            ...usuario,
            produtos,
            vendas
        };
    }
}
