import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function runSeed() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database, starting seed...');

        const email = 'ale.ramos.oliveira@hotmail.com';
        const nome = 'Ale Ramos Oliveira';
        const senhaPlain = 'senha123';
        const senhaHash = await bcrypt.hash(senhaPlain, 10);

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

        // Criar 25 categorias
        console.log('Criando 25 categorias...');
        const categoriaIds = [];
        for (let i = 1; i <= 25; i++) {
            const catName = `Categoria Premium ${i}`;
            const [resultInsertCat]: any = await connection.execute(
                'INSERT INTO categorias (nome, usuarios_id) VALUES (?, ?)',
                [catName, usuarioId]
            );
            categoriaIds.push(resultInsertCat.insertId);
        }

        // Criar 290 produtos
        console.log('Criando 290 produtos (com descrições e preços variáveis)...');
        for (let i = 1; i <= 290; i++) {
            const catId = categoriaIds[Math.floor(Math.random() * categoriaIds.length)]; // Categoria aleatória
            const nomeProd = `Produto Exclusivo ${i}`;
            const preco = (Math.random() * 900 + 10).toFixed(2); // Preço entre 10 e 910
            const estoque = Math.floor(Math.random() * 100) + 1; // Estoque entre 1 e 100
            const descricao = `Descrição detalhada do maravilhoso Produto Exclusivo ${i}. Este produto possui qualidade superior, design moderno e é ideal para quem busca eficiência e estilo. Perfeito para o dia a dia e altamente durável. Aproveite esta oportunidade única!`;

            await connection.execute(
                'INSERT INTO produtos (nome, descricao, preco, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                [nomeProd, descricao, preco, estoque, catId, usuarioId]
            );

            if (i % 50 === 0) {
                console.log(`${i} produtos criados...`);
            }
        }

        console.log('Seed massivo finalizado com sucesso!');
    } catch (error) {
        console.error('Erro ao executar seed:', error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

runSeed();
