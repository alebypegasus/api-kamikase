    export interface IUsuario {
        id?: number; 
        nome: string;
        email: string;
        senha?: string;
        is_admin?: boolean;
    }

    export interface ICategoria {
        id?: number;
        nome: string;
        usuarios_id?: number;
    }

    export interface IProduto {
        id?: number;
        nome: string;
        descricao?: string;
        preco: number;
        categorias_id: number;
        usuarios_id: number;
        estoque: number;
    }

    export interface IVendaItem {
        id?: number;
        vendas_id?: number;
        produtos_id: number;
        quantidade: number;
        preco_unitario: number;
    }

    export interface IVenda {
        id?: number;
        usuarios_id: number;
        valor_total: number;
        desconto?: number;
        forma_pagamento?: string;
        parcelas?: number;
        itens?: IVendaItem[];
        created_at?: Date;
    }