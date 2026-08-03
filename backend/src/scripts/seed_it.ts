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
        console.log('Connected to database. Starting IT seed...');

        const email = 'ale.ramos.oliveira@hotmail.com';
        const nome = 'Ale Ramos Oliveira';
        const senhaPlain = 'senha123';
        const senhaHash = await bcrypt.hash(senhaPlain, 10);

        let [usuarios]: any = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        let usuarioId;

        if (usuarios.length > 0) {
            usuarioId = usuarios[0].id;
            console.log(`Usuario já existe com ID: ${usuarioId}`);
            
            // Delete old data for this user
            console.log('Apagando produtos e categorias antigas deste usuário...');
            await connection.execute('DELETE FROM categorias WHERE usuarios_id = ?', [usuarioId]);
            // (produtos cascade on delete categoria/usuario)
        } else {
            const [resultInsertUser]: any = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES (?, ?, ?, false)',
                [nome, email, senhaHash]
            );
            usuarioId = resultInsertUser.insertId;
            console.log(`Novo usuario criado com ID: ${usuarioId}`);
        }

        // Criar Categorias de Informática (Pai e Filhos)
        const categoriasIT = [
            { 
                nome: 'Hardware', 
                filhas: ['Processadores', 'Placas de Vídeo', 'Placas Mãe', 'Memória RAM', 'Armazenamento']
            },
            {
                nome: 'Periféricos',
                filhas: ['Mouses', 'Teclados', 'Headsets', 'Monitores']
            },
            {
                nome: 'Computadores',
                filhas: ['PC Gamer', 'Notebooks', 'Workstations']
            },
            {
                nome: 'Software',
                filhas: ['Sistemas Operacionais', 'Antivírus', 'Pacote Office']
            }
        ];

        console.log('Criando categorias de Informática...');
        const mapCategorias = new Map(); // subcategoriaNome -> id

        for (const catPai of categoriasIT) {
            const [resPai]: any = await connection.execute(
                'INSERT INTO categorias (nome, usuarios_id, parent_id) VALUES (?, ?, NULL)',
                [catPai.nome, usuarioId]
            );
            const parentId = resPai.insertId;

            for (const catFilha of catPai.filhas) {
                const [resFilha]: any = await connection.execute(
                    'INSERT INTO categorias (nome, usuarios_id, parent_id) VALUES (?, ?, ?)',
                    [catFilha, usuarioId, parentId]
                );
                mapCategorias.set(catFilha, resFilha.insertId);
            }
        }

        // Criar Produtos de Informática
        const produtosData = [
            // Processadores
            { cat: 'Processadores', nome: 'Processador AMD Ryzen 9 7950X', preco: 4500.00, est: 12 },
            { cat: 'Processadores', nome: 'Processador Intel Core i9-13900K', preco: 4200.00, est: 8 },
            { cat: 'Processadores', nome: 'Processador AMD Ryzen 5 5600G', preco: 950.00, est: 40 },
            { cat: 'Processadores', nome: 'Processador Intel Core i5-12400F', preco: 1100.00, est: 25 },
            
            // Placas de Vídeo
            { cat: 'Placas de Vídeo', nome: 'Placa de Vídeo RTX 4090 24GB ASUS ROG', preco: 14999.00, est: 2 },
            { cat: 'Placas de Vídeo', nome: 'Placa de Vídeo RTX 3060 12GB MSI', preco: 2100.00, est: 15 },
            { cat: 'Placas de Vídeo', nome: 'Placa de Vídeo RX 6700 XT 12GB Gigabyte', preco: 2800.00, est: 10 },
            { cat: 'Placas de Vídeo', nome: 'Placa de Vídeo GTX 1650 4GB Galax', preco: 850.00, est: 30 },
            
            // Placas Mãe
            { cat: 'Placas Mãe', nome: 'Placa Mãe B550M Aorus Elite', preco: 950.00, est: 22 },
            { cat: 'Placas Mãe', nome: 'Placa Mãe Z790 ASUS ROG Maximus', preco: 3500.00, est: 5 },
            
            // Memória RAM
            { cat: 'Memória RAM', nome: 'Memória Kingston Fury Beast 16GB (2x8) 3200MHz', preco: 350.00, est: 50 },
            { cat: 'Memória RAM', nome: 'Memória Corsair Vengeance 32GB (2x16) DDR5 6000MHz', preco: 1100.00, est: 18 },
            
            // Armazenamento
            { cat: 'Armazenamento', nome: 'SSD 1TB Kingston NV2 M.2 NVMe', preco: 420.00, est: 60 },
            { cat: 'Armazenamento', nome: 'HD Seagate Barracuda 2TB', preco: 380.00, est: 15 },
            { cat: 'Armazenamento', nome: 'SSD Samsung 990 Pro 2TB M.2 NVMe', preco: 1500.00, est: 10 },
            
            // Mouses
            { cat: 'Mouses', nome: 'Mouse Logitech G Pro X Superlight', preco: 750.00, est: 20 },
            { cat: 'Mouses', nome: 'Mouse Razer DeathAdder V2', preco: 350.00, est: 30 },
            { cat: 'Mouses', nome: 'Mouse Redragon Cobra M711', preco: 120.00, est: 80 },
            
            // Teclados
            { cat: 'Teclados', nome: 'Teclado Mecânico HyperX Alloy Origins', preco: 650.00, est: 15 },
            { cat: 'Teclados', nome: 'Teclado Mecânico Redragon Kumara', preco: 220.00, est: 40 },
            
            // Headsets
            { cat: 'Headsets', nome: 'Headset Gamer HyperX Cloud II', preco: 550.00, est: 25 },
            { cat: 'Headsets', nome: 'Headset Logitech G432 7.1', preco: 380.00, est: 18 },
            
            // Monitores
            { cat: 'Monitores', nome: 'Monitor Gamer LG UltraGear 24" 144Hz', preco: 1100.00, est: 12 },
            { cat: 'Monitores', nome: 'Monitor Dell UltraSharp 27" 4K', preco: 3200.00, est: 4 },
            { cat: 'Monitores', nome: 'Monitor AOC Hero 27" 165Hz', preco: 1400.00, est: 20 },
            
            // Computadores / Notebooks
            { cat: 'PC Gamer', nome: 'PC Gamer Pichau (i5 12400F, RTX 3060, 16GB)', preco: 4500.00, est: 8 },
            { cat: 'PC Gamer', nome: 'PC Gamer High-End (Ryzen 7 7800X3D, RTX 4080)', preco: 14000.00, est: 2 },
            { cat: 'Notebooks', nome: 'Notebook Gamer Acer Nitro 5 (i7, GTX 1650)', preco: 4200.00, est: 10 },
            { cat: 'Notebooks', nome: 'MacBook Air M2 256GB', preco: 7500.00, est: 5 },
            { cat: 'Workstations', nome: 'Workstation Dell Precision (Xeon, 64GB, RTX A4000)', preco: 22000.00, est: 1 },
            
            // Software
            { cat: 'Sistemas Operacionais', nome: 'Windows 11 Pro (Licença Digital)', preco: 850.00, est: 999 },
            { cat: 'Antivírus', nome: 'Kaspersky Total Security 1 Ano', preco: 120.00, est: 999 },
            { cat: 'Pacote Office', nome: 'Microsoft 365 Personal (Assinatura 1 Ano)', preco: 300.00, est: 999 }
        ];

        console.log(`Criando ${produtosData.length} produtos base e duplicando para gerar volume...`);
        let prodCount = 0;

        for (const baseProd of produtosData) {
            const catId = mapCategorias.get(baseProd.cat);
            if (!catId) continue;
            
            // Create the base product
            await connection.execute(
                'INSERT INTO produtos (nome, descricao, preco, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                [baseProd.nome, `Um excelente item da categoria ${baseProd.cat}. Produto original de altíssima qualidade.`, baseProd.preco, baseProd.est, catId, usuarioId]
            );
            prodCount++;

            // Create some variations to reach ~100 products
            for(let i=1; i<=2; i++) {
                await connection.execute(
                    'INSERT INTO produtos (nome, descricao, preco, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [`${baseProd.nome} - Variação ${i}`, `Variação ${i} do produto ${baseProd.nome}.`, (baseProd.preco * (1 + (i*0.1))).toFixed(2), Math.floor(baseProd.est / 2), catId, usuarioId]
                );
                prodCount++;
            }
        }

        console.log(`Seed finalizado com sucesso! ${prodCount} produtos gerados.`);
    } catch (error) {
        console.error('Erro ao executar seed:', error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

runSeed();
