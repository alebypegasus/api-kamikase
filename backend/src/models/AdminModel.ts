import { db } from '../config/database';

export class AdminModel {
    static async obterDadosUsuarios() {
        const query = `
            SELECT 
                u.id as usuario_id,
                u.nome,
                u.email,
                (SELECT COUNT(*) FROM produtos WHERE usuarios_id = u.id) as total_produtos,
                (SELECT COUNT(*) FROM categorias WHERE usuarios_id = u.id) as total_categorias,
                (SELECT IFNULL(SUM(preco * estoque), 0) FROM produtos WHERE usuarios_id = u.id) as valor_total_estoque,
                (SELECT COUNT(*) FROM vendas WHERE usuarios_id = u.id) as total_vendas,
                (SELECT IFNULL(SUM(valor_total), 0) FROM vendas WHERE usuarios_id = u.id) as valor_total_vendido
            FROM usuarios u
            WHERE u.is_admin = FALSE
        `;
        
        const [linhas]: any = await db.execute(query);
        return linhas;
    }

    static async obterRelatorioGlobal() {
        const [totalVendas]: any = await db.execute('SELECT COUNT(*) as total, IFNULL(SUM(valor_total), 0) as valor FROM vendas');
        const [totalProdutos]: any = await db.execute('SELECT COUNT(*) as total, IFNULL(SUM(preco * estoque), 0) as valor FROM produtos');
        const [totalCategorias]: any = await db.execute('SELECT COUNT(*) as total FROM categorias');

        return {
            vendas: totalVendas[0],
            produtos: totalProdutos[0],
            categorias: totalCategorias[0]
        };
    }
}
