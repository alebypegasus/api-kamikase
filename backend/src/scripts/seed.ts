import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { db } from '../config/database';

// Tipos auxiliares
interface SeedCategory {
    id?: number;
    nome: string;
    subcategorias?: string[];
}

const UNIDADES = ['Niterói', 'São Gonçalo', 'Rio de Janeiro', 'Laranjeiras'];

const NOMES_USUARIOS = [
    'João Silva', 'Maria Santos', 'Carlos Ferreira', 'Ana Costa', 'Pedro Alves',
    'Lucia Oliveira', 'Marcos Souza', 'Fernanda Lima', 'Ricardo Gomes', 'Camila Rocha'
];

const PRODUTOS_GENERICOS = [
    { nome: 'Camiseta Básica', preco: 39.90 },
    { nome: 'Calça Jeans', preco: 119.90 },
    { nome: 'Relógio Digital', preco: 250.00 },
    { nome: 'Óculos de Sol', preco: 150.00 },
    { nome: 'Bolsa de Couro', preco: 320.00 },
    { nome: 'Boné Esportivo', preco: 50.00 },
    { nome: 'Carteira Slim', preco: 85.00 },
    { nome: 'Cinto de Couro', preco: 60.00 },
    { nome: 'Jaqueta Corta-Vento', preco: 199.90 },
    { nome: 'Moletom com Capuz', preco: 140.00 },
    { nome: 'Meias Cano Médio', preco: 25.00 },
    { nome: 'Luvas de Frio', preco: 35.00 },
    { nome: 'Caneca Térmica', preco: 90.00 },
    { nome: 'Garrafa de Água', preco: 45.00 },
    { nome: 'Mochila Escolar', preco: 180.00 }
];

async function run() {
    try {
        console.log('🌱 Iniciando Seed do Banco de Dados...');
        const connection = await db.getConnection();
        await connection.beginTransaction();

        // Limpar dados anteriores caso haja
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE itens_venda');
        await connection.execute('TRUNCATE TABLE vendas');
        await connection.execute('TRUNCATE TABLE produtos');
        await connection.execute('TRUNCATE TABLE categorias');
        await connection.execute('TRUNCATE TABLE usuarios');
        await connection.execute('TRUNCATE TABLE unidades');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        // 1. Criar Unidades
        console.log('🏢 Criando Unidades...');
        const unidadesIds: number[] = [];
        for (const nome of UNIDADES) {
            const [res]: any = await connection.execute('INSERT INTO unidades (nome) VALUES (?)', [nome]);
            unidadesIds.push(res.insertId);
        }

        const getRandomUnidade = () => unidadesIds[Math.floor(Math.random() * unidadesIds.length)];

        // 2. Criar Admin e Usuários Principais
        console.log('👤 Criando Usuários Principais e Admin...');
        const senhaPadrao = await bcrypt.hash('123', 12);

        // Admin
        await connection.execute(
            'INSERT INTO usuarios (nome, email, senha, is_admin, ativo, unidade_id) VALUES (?, ?, ?, ?, ?, ?)',
            ['Administrador Geral', 'admin@admin.com', senhaPadrao, true, true, getRandomUnidade()]
        );

        // Usuário de Informática
        const [resUser1]: any = await connection.execute(
            'INSERT INTO usuarios (nome, email, senha, is_admin, ativo, unidade_id) VALUES (?, ?, ?, ?, ?, ?)',
            ['Ale Ramos (TI)', 'ale.ramos.oliveira@hotmail.com', senhaPadrao, false, true, getRandomUnidade()]
        );
        const uId1 = resUser1.insertId;

        // Usuário de Tênis
        const [resUser2]: any = await connection.execute(
            'INSERT INTO usuarios (nome, email, senha, is_admin, ativo, unidade_id) VALUES (?, ?, ?, ?, ?, ?)',
            ['Ale Ramos (Sneakers)', 'ale.ramos.oliveira@gmail.com', senhaPadrao, false, true, getRandomUnidade()]
        );
        const uId2 = resUser2.insertId;

        // 3. Criar 10 Usuários Aleatórios
        console.log('👥 Criando 10 Usuários Secundários...');
        const usuariosIds = [uId1, uId2];
        for (let i = 0; i < 10; i++) {
            const email = `user${i+1}@exemplo.com`;
            const [res]: any = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, is_admin, ativo, unidade_id) VALUES (?, ?, ?, ?, ?, ?)',
                [NOMES_USUARIOS[i], email, senhaPadrao, false, true, getRandomUnidade()]
            );
            usuariosIds.push(res.insertId);
        }

        // Função para criar categoria e subcategorias
        const criarCategoriaCompleta = async (uId: number, nome: string, subs: string[]) => {
            const [resCat]: any = await connection.execute(
                'INSERT INTO categorias (nome, usuarios_id, parent_id) VALUES (?, ?, NULL)',
                [nome, uId]
            );
            const parentId = resCat.insertId;
            const subIds = [];
            for (const sub of subs) {
                const [resSub]: any = await connection.execute(
                    'INSERT INTO categorias (nome, usuarios_id, parent_id) VALUES (?, ?, ?)',
                    [sub, uId, parentId]
                );
                subIds.push(resSub.insertId);
            }
            return { parentId, subIds };
        };

        // 4. Produtos e Categorias - Informática
        console.log('💻 Populando Produtos de Informática...');
        const catTI1 = await criarCategoriaCompleta(uId1, 'Periféricos', ['Teclados', 'Mouses']);
        const catTI2 = await criarCategoriaCompleta(uId1, 'Hardware', ['Placa Mãe', 'Placa de Vídeo', 'Memória RAM']);
        const produtosTI = [
            { nome: 'Teclado Mecânico Redragon', preco: 250.00, catId: catTI1.subIds[0] },
            { nome: 'Mouse Logitech G PRO', preco: 450.00, catId: catTI1.subIds[1] },
            { nome: 'Placa de Vídeo RTX 4060', preco: 2100.00, catId: catTI2.subIds[1] },
            { nome: 'Memória RAM 16GB DDR5', preco: 350.00, catId: catTI2.subIds[2] },
            { nome: 'Placa Mãe B550', preco: 850.00, catId: catTI2.subIds[0] }
        ];
        
        for (const p of produtosTI) {
            await connection.execute(
                'INSERT INTO produtos (nome, preco, descricao, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                [p.nome, p.preco, 'Descrição TI', 50, p.catId, uId1]
            );
        }

        // 5. Produtos e Categorias - Sneakers
        console.log('👟 Populando Produtos de Calçados...');
        const catSneaker1 = await criarCategoriaCompleta(uId2, 'Casual', ['Cano Baixo', 'Cano Alto']);
        const catSneaker2 = await criarCategoriaCompleta(uId2, 'Esportivo', ['Corrida', 'Basquete']);
        const produtosSneaker = [
            { nome: 'Nike Air Force 1', preco: 700.00, catId: catSneaker1.subIds[0] },
            { nome: 'Jordan 1 High', preco: 1200.00, catId: catSneaker1.subIds[1] },
            { nome: 'Adidas Ultraboost', preco: 900.00, catId: catSneaker2.subIds[0] },
            { nome: 'Nike LeBron XX', preco: 1500.00, catId: catSneaker2.subIds[1] },
            { nome: 'Puma Suede', preco: 350.00, catId: catSneaker1.subIds[0] }
        ];

        for (const p of produtosSneaker) {
            await connection.execute(
                'INSERT INTO produtos (nome, preco, descricao, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                [p.nome, p.preco, 'Descrição Sneaker', 50, p.catId, uId2]
            );
        }

        // 6. Produtos para os 10 usuários aleatórios
        console.log('📦 Populando Produtos para Usuários Aleatórios...');
        for (let i = 2; i < usuariosIds.length; i++) {
            const uId = usuariosIds[i];
            const cat = await criarCategoriaCompleta(uId, 'Geral', ['Acessórios', 'Vestuário']);
            
            // Cada usuário de 10 a 20 produtos
            const numProdutos = Math.floor(Math.random() * 11) + 10;
            for (let j = 0; j < numProdutos; j++) {
                const prodRef = PRODUTOS_GENERICOS[Math.floor(Math.random() * PRODUTOS_GENERICOS.length)];
                const catId = Math.random() > 0.5 ? cat.subIds[0] : cat.subIds[1];
                
                await connection.execute(
                    'INSERT INTO produtos (nome, preco, descricao, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [`${prodRef.nome} - Variação ${j}`, prodRef.preco, 'Produto genérico de exemplo', 100, catId, uId]
                );
            }
        }

        // 7. Vendas Aleatórias
        console.log('🛒 Gerando Vendas Aleatórias...');
        const formasPagamento = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'];
        
        for (const uId of usuariosIds) {
            // Buscar produtos desse usuário
            const [produtosRows]: any = await connection.execute('SELECT id, preco FROM produtos WHERE usuarios_id = ?', [uId]);
            
            if (produtosRows.length > 0) {
                // Criar de 5 a 15 vendas por usuário
                const numVendas = Math.floor(Math.random() * 11) + 5;
                for (let v = 0; v < numVendas; v++) {
                    const formaPag = formasPagamento[Math.floor(Math.random() * formasPagamento.length)];
                    
                    // Inserir venda vazia primeiro
                    const [resVenda]: any = await connection.execute(
                        'INSERT INTO vendas (usuarios_id, valor_total, desconto, forma_pagamento, parcelas) VALUES (?, 0, 0, ?, 1)',
                        [uId, formaPag]
                    );
                    const vendaId = resVenda.insertId;
                    
                    // Adicionar 1 a 3 itens na venda
                    const numItens = Math.floor(Math.random() * 3) + 1;
                    let valorTotal = 0;
                    
                    for (let i = 0; i < numItens; i++) {
                        const prod = produtosRows[Math.floor(Math.random() * produtosRows.length)];
                        const qtd = Math.floor(Math.random() * 3) + 1;
                        
                        await connection.execute(
                            'INSERT INTO itens_venda (vendas_id, produtos_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                            [vendaId, prod.id, qtd, prod.preco]
                        );
                        valorTotal += Number(prod.preco) * qtd;
                    }
                    
                    // Atualizar total da venda
                    await connection.execute(
                        'UPDATE vendas SET valor_total = ? WHERE id = ?',
                        [valorTotal, vendaId]
                    );
                }
            }
        }

        await connection.commit();
        connection.release();
        console.log('✅ Seed finalizado com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
}

run();
