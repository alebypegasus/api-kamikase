import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'api_kamikase'
};

async function runSeed() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database, starting seed...');

        const email = process.env.SEED_USER_EMAIL || 'demo@kamikase.com';
        const nome = process.env.SEED_USER_NAME || 'Lojista Demonstração';
        const senhaPlain = process.env.SEED_USER_PASSWORD || 'kamikase123';
        const senhaHash = await bcrypt.hash(senhaPlain, 12);

        // Verifica se o usuario existe
        let [usuarios]: any = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        let usuarioId;

        if (usuarios.length > 0) {
            usuarioId = usuarios[0].id;
            console.log(`Usuario já existe com ID: ${usuarioId}`);
        } else {
            const [resultInsertUser]: any = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES (?, ?, ?, false)',
                [nome, email, senhaHash]
            );
            usuarioId = resultInsertUser.insertId;
            console.log(`Novo usuario criado com ID: ${usuarioId}`);
        }

        // Criar Categorias
        console.log('Criando categorias...');
        const categoriaNomes = [
            'Eletrônicos', 'Informática', 'Acessórios', 'Vestuário', 
            'Calçados', 'Alimentos & Bebidas', 'Casa & Decoração', 'Beleza & Saúde'
        ];
        const categoriaIds = [];
        for (const catName of categoriaNomes) {
            const [resultInsertCat]: any = await connection.execute(
                'INSERT INTO categorias (nome, usuarios_id) VALUES (?, ?)',
                [catName, usuarioId]
            );
            categoriaIds.push(resultInsertCat.insertId);
        }

        // Criar produtos para demonstração
        console.log('Criando produtos demonstrativos...');
        const produtosDemo = [
            { nome: 'Notebook Pro 15" i7 16GB', preco: 4599.90, estoque: 15, cat: 1 },
            { nome: 'Mouse Sem Fio Ergonômico', preco: 129.90, estoque: 40, cat: 2 },
            { nome: 'Teclado Mecânico RGB', preco: 289.00, estoque: 25, cat: 2 },
            { nome: 'Monitor Gamer 27" 144Hz', preco: 1450.00, estoque: 10, cat: 0 },
            { nome: 'Headset Gamer 7.1 Surround', preco: 320.00, estoque: 30, cat: 2 },
            { nome: 'Smartphone 128GB 5G', preco: 2199.00, estoque: 18, cat: 0 },
            { nome: 'Camisa Polo Confort', preco: 89.90, estoque: 50, cat: 3 },
            { nome: 'Calça Jeans Slim Fit', preco: 149.90, estoque: 35, cat: 3 },
            { nome: 'Tênis Esportivo Air Runner', preco: 299.90, estoque: 20, cat: 4 },
            { nome: 'Garrafa Térmica Inox 1L', preco: 79.90, estoque: 60, cat: 6 },
            { nome: 'Café Especial Gourmet 500g', preco: 34.90, estoque: 80, cat: 5 },
            { nome: 'Luminária LED de Mesa Articulada', preco: 119.00, estoque: 22, cat: 6 }
        ];

        for (const prod of produtosDemo) {
            const catId = categoriaIds[prod.cat % categoriaIds.length];
            await connection.execute(
                'INSERT INTO produtos (nome, descricao, preco, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                [prod.nome, `Produto de alta qualidade para demonstração no Kamikase ERP & PDV.`, prod.preco, prod.estoque, catId, usuarioId]
            );
        }

        console.log('✅ Seed finalizado com sucesso!');
        console.log(`🔑 Login de demonstração: ${email} / ${senhaPlain}`);
    } catch (error) {
        console.error('Erro ao executar seed:', error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

runSeed();
