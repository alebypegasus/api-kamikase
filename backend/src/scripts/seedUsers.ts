import bcrypt from 'bcrypt';
import { db } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const usuariosToSeed = [
    {
        nome: 'Carlos Oliveira',
        email: 'carlos@veiculos.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Som Automotivo',
                filhas: [
                    { nome: 'Rádios', produtos: [{ nome: 'Rádio Pioneer', preco: 350.00, estoque: 15 }, { nome: 'Multimídia 7 pol', preco: 890.00, estoque: 8 }] },
                    { nome: 'Alto-falantes', produtos: [{ nome: 'Kit Duas Vias JBL', preco: 280.00, estoque: 12 }] }
                ]
            },
            {
                nome: 'Acessórios',
                filhas: [
                    { nome: 'Alarmes', produtos: [{ nome: 'Alarme Positron', preco: 220.00, estoque: 20 }] },
                    { nome: 'Tapetes', produtos: [{ nome: 'Tapete Borracha', preco: 45.00, estoque: 50 }] }
                ]
            }
        ]
    },
    {
        nome: 'Maria Silva',
        email: 'maria@modafashion.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Moda Feminina',
                filhas: [
                    { nome: 'Vestidos', produtos: [{ nome: 'Vestido Longo Floral', preco: 120.00, estoque: 10 }, { nome: 'Vestido de Festa', preco: 250.00, estoque: 5 }] },
                    { nome: 'Blusas', produtos: [{ nome: 'Blusa de Seda', preco: 80.00, estoque: 25 }] }
                ]
            },
            {
                nome: 'Moda Masculina',
                filhas: [
                    { nome: 'Camisas', produtos: [{ nome: 'Camisa Polo', preco: 65.00, estoque: 30 }] },
                    { nome: 'Calças', produtos: [{ nome: 'Calça Jeans Slim', preco: 110.00, estoque: 15 }] }
                ]
            }
        ]
    },
    {
        nome: 'João Pedro',
        email: 'joao@calcados.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Esportivos',
                filhas: [
                    { nome: 'Tênis de Corrida', produtos: [{ nome: 'Nike Revolution 6', preco: 399.00, estoque: 20 }, { nome: 'Adidas Ultraboost', preco: 799.00, estoque: 12 }] }
                ]
            },
            {
                nome: 'Sociais',
                filhas: [
                    { nome: 'Sapato Social', produtos: [{ nome: 'Sapato Oxford Couro', preco: 250.00, estoque: 10 }] }
                ]
            },
            {
                nome: 'Casuais',
                filhas: [
                    { nome: 'Sandálias', produtos: [{ nome: 'Havaianas Tradicional', preco: 35.00, estoque: 100 }, { nome: 'Sandália Rasteira', preco: 55.00, estoque: 40 }] }
                ]
            }
        ]
    },
    {
        nome: 'Ana Santos',
        email: 'ana@cosmeticos.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Maquiagem',
                filhas: [
                    { nome: 'Lábios', produtos: [{ nome: 'Batom Matte Vermelho', preco: 45.00, estoque: 30 }] },
                    { nome: 'Rosto', produtos: [{ nome: 'Base Líquida Alta Cobertura', preco: 89.00, estoque: 20 }] }
                ]
            },
            {
                nome: 'Fragrâncias',
                filhas: [
                    { nome: 'Perfumes', produtos: [{ nome: '212 VIP Rosé 80ml', preco: 599.00, estoque: 10 }, { nome: 'Malbec Gold 100ml', preco: 199.00, estoque: 15 }] }
                ]
            },
            {
                nome: 'Cuidados com a Pele',
                filhas: [
                    { nome: 'Skincare', produtos: [{ nome: 'Sérum Vitamina C', preco: 115.00, estoque: 25 }] }
                ]
            }
        ]
    },
    {
        nome: 'Roberto Costa',
        email: 'roberto@eletronicos.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Smartphones',
                filhas: [
                    { nome: 'Celulares', produtos: [{ nome: 'iPhone 15 Pro', preco: 8500.00, estoque: 5 }, { nome: 'Samsung Galaxy S24', preco: 5900.00, estoque: 8 }] }
                ]
            },
            {
                nome: 'Informática',
                filhas: [
                    { nome: 'Hardware', produtos: [{ nome: 'SSD 1TB NVMe', preco: 450.00, estoque: 20 }, { nome: 'Memória RAM 16GB', preco: 320.00, estoque: 15 }] },
                    { nome: 'Periféricos', produtos: [{ nome: 'Mouse Gamer RGB', preco: 150.00, estoque: 30 }] }
                ]
            }
        ]
    },
    {
        nome: 'Fernanda Lima',
        email: 'fernanda@saudenatural.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Suplementos',
                filhas: [
                    { nome: 'Proteínas', produtos: [{ nome: 'Whey Protein Isolado 900g', preco: 180.00, estoque: 40 }] },
                    { nome: 'Vitaminas', produtos: [{ nome: 'Polivitamínico AZ', preco: 65.00, estoque: 50 }] }
                ]
            },
            {
                nome: 'Chás e Ervas',
                filhas: [
                    { nome: 'Chás Naturais', produtos: [{ nome: 'Chá Verde 100g', preco: 15.00, estoque: 80 }, { nome: 'Chá de Camomila', preco: 12.00, estoque: 60 }] }
                ]
            }
        ]
    },
    {
        nome: 'Marcos Souza',
        email: 'marcos@construcao.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Ferramentas',
                filhas: [
                    { nome: 'Elétricas', produtos: [{ nome: 'Furadeira Impacto Bosch', preco: 299.00, estoque: 15 }, { nome: 'Serra Mármore Makita', preco: 450.00, estoque: 10 }] },
                    { nome: 'Manuais', produtos: [{ nome: 'Jogo de Chaves 10 peças', preco: 85.00, estoque: 25 }] }
                ]
            },
            {
                nome: 'Material Básico',
                filhas: [
                    { nome: 'Hidráulica', produtos: [{ nome: 'Tubo PVC 25mm 6m', preco: 35.00, estoque: 100 }] },
                    { nome: 'Elétrica', produtos: [{ nome: 'Fio Flexível 2.5mm 100m', preco: 120.00, estoque: 40 }] }
                ]
            }
        ]
    },
    {
        nome: 'Patricia Alves',
        email: 'patricia@esportes.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Esportes de Quadra',
                filhas: [
                    { nome: 'Futebol', produtos: [{ nome: 'Bola Oficial Society', preco: 120.00, estoque: 30 }, { nome: 'Chuteira Futsal', preco: 199.00, estoque: 20 }] }
                ]
            },
            {
                nome: 'Fitness',
                filhas: [
                    { nome: 'Musculação', produtos: [{ nome: 'Halter Emborrachado 5kg', preco: 60.00, estoque: 40 }, { nome: 'Colchonete Ginástica', preco: 45.00, estoque: 50 }] }
                ]
            }
        ]
    },
    {
        nome: 'Thiago Rocha',
        email: 'thiago@petshop.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Cães',
                filhas: [
                    { nome: 'Rações Premium', produtos: [{ nome: 'Ração Golden 15kg', preco: 145.00, estoque: 25 }] },
                    { nome: 'Brinquedos', produtos: [{ nome: 'Bolinha Cravo Maciça', preco: 15.00, estoque: 60 }] }
                ]
            },
            {
                nome: 'Gatos',
                filhas: [
                    { nome: 'Alimentação Úmida', produtos: [{ nome: 'Sachê Whiskas 85g', preco: 3.50, estoque: 200 }] },
                    { nome: 'Higiene', produtos: [{ nome: 'Areia Sanitária 4kg', preco: 22.00, estoque: 40 }] }
                ]
            }
        ]
    },
    {
        nome: 'Camila Gomes',
        email: 'camila@papelaria.com',
        senhaText: '123',
        categorias: [
            {
                nome: 'Livros',
                filhas: [
                    { nome: 'Ficção', produtos: [{ nome: 'O Senhor dos Anéis (Box)', preco: 180.00, estoque: 10 }, { nome: 'Harry Potter 1', preco: 45.00, estoque: 20 }] },
                    { nome: 'Didáticos', produtos: [{ nome: 'Gramática Normativa', preco: 120.00, estoque: 15 }] }
                ]
            },
            {
                nome: 'Material Escolar',
                filhas: [
                    { nome: 'Cadernos', produtos: [{ nome: 'Caderno Universitário 10 Matérias', preco: 25.00, estoque: 50 }] },
                    { nome: 'Escrita', produtos: [{ nome: 'Caixa de Canetas Bic', preco: 35.00, estoque: 30 }] }
                ]
            }
        ]
    }
];

async function seedDatabase() {
    console.log('Iniciando o Seeding de Lojistas...');

    for (const u of usuariosToSeed) {
        try {
            // Verificar se usuário já existe
            const [rows]: any = await db.execute('SELECT id FROM usuarios WHERE email = ?', [u.email]);
            if (rows.length > 0) {
                console.log(`Usuário ${u.email} já existe. Pulando...`);
                continue;
            }

            // Criar usuário
            const hashedPassword = await bcrypt.hash(u.senhaText, 10);
            const [userResult] = await db.execute<ResultSetHeader>(
                'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES (?, ?, ?, ?)',
                [u.nome, u.email, hashedPassword, false]
            );
            const usuarioId = userResult.insertId;
            console.log(`✅ Usuário criado: ${u.nome} (${u.email}) - ID: ${usuarioId}`);

            // Criar categorias e produtos
            for (const catParent of u.categorias) {
                const [catParentResult] = await db.execute<ResultSetHeader>(
                    'INSERT INTO categorias (nome, parent_id, usuarios_id) VALUES (?, NULL, ?)',
                    [catParent.nome, usuarioId]
                );
                const parentId = catParentResult.insertId;

                for (const catChild of catParent.filhas) {
                    const [catChildResult] = await db.execute<ResultSetHeader>(
                        'INSERT INTO categorias (nome, parent_id, usuarios_id) VALUES (?, ?, ?)',
                        [catChild.nome, parentId, usuarioId]
                    );
                    const childId = catChildResult.insertId;

                    for (const prod of catChild.produtos) {
                        await db.execute(
                            'INSERT INTO produtos (nome, descricao, preco, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                            [prod.nome, `Produto ${prod.nome} de alta qualidade`, prod.preco, prod.estoque, childId, usuarioId]
                        );
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao inserir usuário ${u.email}:`, error);
        }
    }

    console.log('🎉 Seeding finalizado!');
    process.exit(0);
}

seedDatabase();
