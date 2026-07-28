    export interface IUsuario {
        id?: number; 
        nome: string;
        email: string;
        senha?: string;
    }

    export interface ICategoria {
        id?: number;
        nome: string;
        usuarios_id?: number;
    }

    export interface IProduto {
        id?: number;
        nome: string;
        preco: number;
        categorias_id: number;
        usuarios_id: number;
        estoque: number;
    }