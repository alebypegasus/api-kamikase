    export interface IUsuario {
        id?: number; 
        nome: string;
        email: string;
        senha?: string;
        is_admin?: boolean;
        ativo?: boolean;
        unidade_id?: number;
    }

    export interface ICategoria {
        id?: number;
        nome: string;
        usuarios_id?: number;
        parent_id?: number;
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

    export interface ICliente {
        id?: number;
        usuarios_id: number;
        nome: string;
        cpf_cnpj?: string | null;
        telefone?: string | null;
        email?: string | null;
        endereco?: string | null;
        created_at?: Date;
        updated_at?: Date;
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
        cliente_id?: number | null;
        cliente_nome?: string | null;
        valor_total: number;
        desconto?: number;
        forma_pagamento?: string;
        parcelas?: number;
        itens?: IVendaItem[];
        created_at?: Date;
    }

    export interface IPosVenda {
        id?: number;
        vendas_id: number;
        usuarios_id: number;
        cliente_id?: number | null;
        status: 'Pendente' | 'Contatado' | 'Satisfeito' | 'Troca/Garantia' | 'Concluido';
        satisfacao?: number | null;
        observacoes?: string | null;
        data_contato?: Date | null;
        created_at?: Date;
        updated_at?: Date;
    }