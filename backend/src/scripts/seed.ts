import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { db } from '../config/database';

const UNIDADES = [
    'Filial Matriz - Rio de Janeiro',
    'Filial Niterói - Icaraí',
    'Filial São Gonçalo - Centro',
    'Filial Barra da Tijuca - Shopping',
    'Filial Laranjeiras - Zona Sul'
];

interface ProductSeed {
    nome: string;
    preco: number;
    estoque: number;
    descricao: string;
}

interface SubCatSeed {
    nome: string;
    produtos: ProductSeed[];
}

interface CatSeed {
    nome: string;
    subcategorias: SubCatSeed[];
}

interface UserSeedDef {
    nome: string;
    email: string;
    isAdmin: boolean;
    nicho: string;
    unidadeIndex: number;
    categorias: CatSeed[];
}

// 1. Ale Ramos - Informática & Periféricos (26 produtos)
const userInformatica: UserSeedDef = {
    nome: 'Ale Ramos (Informática & Tech)',
    email: 'ale.ramos.oliveira@hotmail.com',
    isAdmin: false,
    nicho: 'Produtos e periféricos de informática',
    unidadeIndex: 0,
    categorias: [
        {
            nome: 'Periféricos Gamers',
            subcategorias: [
                {
                    nome: 'Teclados Mecânicos',
                    produtos: [
                        { nome: 'Teclado Mecânico RGB Switch Blue Redragon Kumara', preco: 239.90, estoque: 25, descricao: 'Teclado mecânico ABNT2 com iluminação RGB personalizável e switches azuis tácteis.' },
                        { nome: 'Teclado Mecânico HyperX Alloy Origins Core', preco: 499.00, estoque: 14, descricao: 'Corpo em alumínio de grau de aviação com switches lineares HyperX Red.' },
                        { nome: 'Teclado Sem Fio Logitech MX Keys Advanced', preco: 689.00, estoque: 18, descricao: 'Teclado ergonômico premium iluminado com conexão Multi-Device Bluetooth.' },
                        { nome: 'Teclado Gamer Razer Huntsman Mini 60%', preco: 750.00, estoque: 10, descricao: 'Teclado compacto 60% com switches ópticos lineares Razer de resposta ultrarrápida.' }
                    ]
                },
                {
                    nome: 'Mouses e Mousepads',
                    produtos: [
                        { nome: 'Mouse Gamer Logitech G502 HERO 25K DPI', preco: 349.90, estoque: 30, descricao: 'Sensor HERO 25K com 11 botões programáveis e pesos ajustáveis.' },
                        { nome: 'Mouse Gamer Sem Fio Razer Viper Ultimate', preco: 699.00, estoque: 12, descricao: 'Mouse sem fio ultraleve de 74g com sensor óptico Focus+ de 20.000 DPI.' },
                        { nome: 'Mouse Ergonômico Vertical Anker 2.4G', preco: 189.00, estoque: 20, descricao: 'Design ergonômico vertical que previne tendinite e dores no punho.' },
                        { nome: 'Mousepad Gamer Extra Grande Speed 900x400mm', preco: 89.90, estoque: 45, descricao: 'Mousepad gigante com bordas costuradas e base de borracha antiderrapante.' }
                    ]
                },
                {
                    nome: 'Áudio & Headsets',
                    produtos: [
                        { nome: 'Headset Gamer HyperX Cloud II 7.1 Virtual', preco: 459.00, estoque: 22, descricao: 'Áudio surround 7.1 com almofadas de espuma memory foam para conforto extremo.' },
                        { nome: 'Headset Sem Fio SteelSeries Arctis Nova 7', preco: 1199.00, estoque: 8, descricao: 'Sistema acústico de alta fidelidade com conexão sem fio simultânea 2.4GHz e BT.' },
                        { nome: 'Microfone Condensador USB FIFINE AmpliGame A6V', preco: 229.00, estoque: 16, descricao: 'Microfone com iluminação RGB degradê, pop filter e suporte anti-vibração shock mount.' }
                    ]
                }
            ]
        },
        {
            nome: 'Hardware & Peças',
            subcategorias: [
                {
                    nome: 'Placas de Vídeo (GPU)',
                    produtos: [
                        { nome: 'Placa de Vídeo RTX 4060 8GB GDDR6 Galax', preco: 2199.00, estoque: 8, descricao: 'Arquitetura NVIDIA Ada Lovelace com DLSS 3 e Ray Tracing de última geração.' },
                        { nome: 'Placa de Vídeo RTX 4070 SUPER 12GB ASUS Dual', preco: 4390.00, estoque: 5, descricao: 'Desempenho extremo para jogos 1440p e 4K com Ray Tracing avançado.' },
                        { nome: 'Placa de Vídeo Radeon RX 7600 8GB Sapphire Pulse', preco: 1890.00, estoque: 10, descricao: 'Excelente custo-benefício em 1080p Ultra com suporte a FSR 3.' }
                    ]
                },
                {
                    nome: 'Processadores & Memória',
                    produtos: [
                        { nome: 'Processador AMD Ryzen 7 5700X3D Octa-Core', preco: 1450.00, estoque: 15, descricao: 'Cache 3D V-Cache monstruoso para taxas de quadros absurdamente altas em jogos.' },
                        { nome: 'Processador Intel Core i5-14400F 10 Núcleos', preco: 1320.00, estoque: 12, descricao: 'Excelente performance multitarefa e games com arquitetura híbrida Intel.' },
                        { nome: 'Memória RAM Kingston Fury Beast 16GB DDR4 3200MHz', preco: 249.90, estoque: 40, descricao: 'Módulo de memória com dissipador de calor de baixo perfil e perfil XMP.' },
                        { nome: 'Memória RAM Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz', preco: 799.00, estoque: 15, descricao: 'Altíssima velocidade DDR5 para plataformas AM5 e Intel LGA1700.' }
                    ]
                },
                {
                    nome: 'Armazenamento & Energia',
                    produtos: [
                        { nome: 'SSD NVMe M.2 1TB Kingston NV2 PCIe 4.0', preco: 399.00, estoque: 35, descricao: 'Velocidade de leitura de até 3500MB/s para carregamento instantâneo de apps e SO.' },
                        { nome: 'SSD NVMe M.2 2TB Samsung 990 PRO Heatsink', preco: 1290.00, estoque: 9, descricao: 'O SSD PCIe 4.0 mais rápido do mundo com dissipador térmico integrado.' },
                        { nome: 'Fonte Modular 750W 80 Plus Gold Corsair RM750e', preco: 699.00, estoque: 14, descricao: 'Eficiência energética 80 Plus Gold com cabos 100% modulares e operação silenciosa.' },
                        { nome: 'Water Cooler 240mm DeepCool Castle ARGB', preco: 389.00, estoque: 18, descricao: 'Refrigeração líquida eficiente com ventiladores PWM silenciosos e bomba ARGB.' }
                    ]
                }
            ]
        },
        {
            nome: 'Monitores & Acessórios',
            subcategorias: [
                {
                    nome: 'Monitores',
                    produtos: [
                        { nome: 'Monitor Gamer 27" IPS 165Hz LG UltraGear 1ms', preco: 1099.00, estoque: 11, descricao: 'Painel IPS Full HD com 1ms real MBR, 165Hz, HDR10 e AMD FreeSync Premium.' },
                        { nome: 'Monitor Curvo 34" Ultrawide WQHD 144Hz Alienware', preco: 4499.00, estoque: 4, descricao: 'Monitor curvo 1900R com resolução WQHD 3440x1440 e cobertura DCI-P3 98%.' },
                        { nome: 'Suporte Articulado a Gás para 2 Monitores NB F160', preco: 299.00, estoque: 20, descricao: 'Suporte articulado de mesa com pistão a gás para telas de 17 a 30 polegadas.' },
                        { nome: 'Webcam Full HD 1080p 60fps Redragon Apex', preco: 249.00, estoque: 25, descricao: 'Câmera com foco automático, microfone estéreo integrado e lente de vidro 6 camadas.' }
                    ]
                }
            ]
        }
    ]
};

// 2. Ale Ramos - Roupas & Calçados (26 produtos)
const userModa: UserSeedDef = {
    nome: 'Ale Ramos (Moda & Calçados)',
    email: 'ale.ramos.oliveira@gmail.com',
    isAdmin: false,
    nicho: 'Roupas e calçados',
    unidadeIndex: 1,
    categorias: [
        {
            nome: 'Calçados & Tênis',
            subcategorias: [
                {
                    nome: 'Sneakers & Casuais',
                    produtos: [
                        { nome: 'Tênis Nike Air Force 1 07 Low Triple White', preco: 749.90, estoque: 20, descricao: 'O lendário clássico do streetwear com couro premium e amortecimento Nike Air.' },
                        { nome: 'Tênis Air Jordan 1 Retro High OG Chicago', preco: 1399.00, estoque: 6, descricao: 'Ícone histórico do basquete e da cultura sneaker em tons clássicos vermelho e preto.' },
                        { nome: 'Tênis Adidas Originals Forum Low Classic', preco: 599.90, estoque: 18, descricao: 'Silhueta dos anos 80 revisitada com cabedal em couro e faixa aderente no tornozelo.' },
                        { nome: 'Tênis Vans Old Skool Classic Black/White', preco: 389.90, estoque: 30, descricao: 'O clássico skate shoe com a icônica sidestripe e lona resistente.' },
                        { nome: 'Tênis Puma Suede Classic XXI Preto', preco: 349.90, estoque: 16, descricao: 'Clássico em camurça genuína com visual atemporal e palmilha confortável.' }
                    ]
                },
                {
                    nome: 'Performance & Corrida',
                    produtos: [
                        { nome: 'Tênis Adidas Ultraboost Light 23', preco: 999.00, estoque: 14, descricao: 'Amortecimento Boost 30% mais leve com resposta de energia incomparável.' },
                        { nome: 'Tênis Nike ZoomX Vaporfly NEXT% 3', preco: 1799.00, estoque: 5, descricao: 'Tênis de elite para maratona com placa de fibra de carbono e espuma ZoomX.' },
                        { nome: 'Tênis Asics Gel-Nimbus 26 Conforto', preco: 899.90, estoque: 12, descricao: 'Máximo amortecimento com tecnologia PureGEL para corridas de longa distância.' },
                        { nome: 'Tênis Olympikus Corre 3 Superleve', preco: 399.90, estoque: 28, descricao: 'O tênis de corrida brasileiro mais premiado, pesando apenas 210g.' }
                    ]
                }
            ]
        },
        {
            nome: 'Moda Masculina & Streetwear',
            subcategorias: [
                {
                    nome: 'Camisas & Camisetas',
                    produtos: [
                        { nome: 'Camiseta Oversized Streetwear 100% Algodão 260g', preco: 119.90, estoque: 40, descricao: 'Modelagem boxy com caimento pesado e gola canelada de 3cm.' },
                        { nome: 'Camisa Manga Longa Linho Premium Slim Fit', preco: 219.00, estoque: 22, descricao: 'Tecido de puro linho respirável ideal para eventos formais e casuais.' },
                        { nome: 'Camisa Polo Piquet Clássica Bicolor', preco: 139.90, estoque: 35, descricao: 'Malha piquet encorpada com bordado discreto no peito.' },
                        { nome: 'Moletom Canguru Heavyweight com Capuz Forrado', preco: 279.00, estoque: 18, descricao: 'Algodão felpado 3 cabos de alta densidade contra o frio intenso.' }
                    ]
                },
                {
                    nome: 'Calças & Bermudas',
                    produtos: [
                        { nome: 'Calça Jeans Masculina Straight Leg Raw Denim', preco: 229.90, estoque: 25, descricao: 'Jeans 100% algodão 13oz com costura reforçada e lavagem clássica.' },
                        { nome: 'Calça Cargo Utilitária Tática com 6 Bolsos', preco: 199.90, estoque: 20, descricao: 'Tecido ripstop resistente a rasgos com ajuste elástico na barra.' },
                        { nome: 'Calça Chino Casual Algodão com Elastano', preco: 179.90, estoque: 24, descricao: 'Versatilidade e conforto com corte alfaiataria moderno.' },
                        { nome: 'Bermuda Moletom Casual Minimalist', preco: 99.90, estoque: 30, descricao: 'Bermuda leve com bolsos laterais fundos e cordão com ponteira de metal.' }
                    ]
                }
            ]
        },
        {
            nome: 'Moda Feminina & Acessórios',
            subcategorias: [
                {
                    nome: 'Vestuário Feminino',
                    produtos: [
                        { nome: 'Vestido Midi Canelado Manga Longa com Fenda', preco: 189.90, estoque: 15, descricao: 'Malha premium com toque macio e excelente elasticidade.' },
                        { nome: 'Blazer Alfaiataria Feminino Estruturado', preco: 299.00, estoque: 12, descricao: 'Ombreiras sutis, forro em cetim e caimento impecável.' },
                        { nome: 'Jaqueta Puffer Cropped Térmica Impermeável', preco: 259.90, estoque: 14, descricao: 'Enchimento térmico isolante com acabamento acetinado resistente a garoa.' },
                        { nome: 'Calça Wide Leg Jeans Feminina Cintura Alta', preco: 189.00, estoque: 22, descricao: 'Corte reto amplo e elegante que valoriza a silhueta.' }
                    ]
                },
                {
                    nome: 'Acessórios & Bonés',
                    produtos: [
                        { nome: 'Boné New Era 9FORTY Strapback New York Yankees', preco: 179.90, estoque: 25, descricao: 'Aba curvada com coroa estruturada e bordado frontal 3D em alta definição.' },
                        { nome: 'Cinto de Couro Legítimo Dupla Face com Fivela Giratória', preco: 119.00, estoque: 30, descricao: 'Couro nobre marrom de um lado e preto do outro.' },
                        { nome: 'Mochila Urbana Antifurto Impermeável para Notebook', preco: 219.00, estoque: 15, descricao: 'Zíperes embutidos ocultos, porta USB externa e compartimento acolchoado.' },
                        { nome: 'Kit 3 Pares de Meia Cano Alto Nike Everyday Cushioned', preco: 79.90, estoque: 50, descricao: 'Tecnologia Dri-FIT para manter os pés secos com reforço no calcanhar.' }
                    ]
                }
            ]
        }
    ]
};

// 12 outros lojistas com nomes, e-mails, nichos e 20 a 25 produtos cada
const outrosLojistasDef: { nome: string; email: string; nicho: string; uIdx: number; cats: { nome: string; subs: { nome: string; prods: { nome: string; preco: number; estoque: number }[] }[] }[] }[] = [
    {
        nome: 'Marcos Som & Acessórios',
        email: 'marcos.audio@loja.com',
        nicho: 'Som Automotivo e Acessórios para Carros',
        uIdx: 2,
        cats: [
            {
                nome: 'Som & Multimídia',
                subs: [
                    {
                        nome: 'Centrais Multimídia',
                        prods: [
                            { nome: 'Central Multimídia Android 10 Pol Pioneer DMH-ZF9350BT', preco: 3890.00, estoque: 6 },
                            { nome: 'Multimídia 7 Pol 2 Din com Apple CarPlay & Android Auto', preco: 980.00, estoque: 15 },
                            { nome: 'Rádio MP3 Player Automotivo Bluetooth FM/USB', preco: 129.90, estoque: 40 }
                        ]
                    },
                    {
                        nome: 'Alto-falantes & Módulos',
                        prods: [
                            { nome: 'Kit Duas Vias 6 Pol JBL Club 6500C 180W', preco: 389.00, estoque: 20 },
                            { nome: 'Subwoofer 12 Pol Pioneer Cara Preta Champion 1400W', preco: 499.00, estoque: 18 },
                            { nome: 'Módulo Amplificador Taramps MD 1200.1 1 Canal', preco: 450.00, estoque: 12 },
                            { nome: 'Módulo Amplificador Soundigital 800.4 EVOX 4 Canais', preco: 420.00, estoque: 14 }
                        ]
                    }
                ]
            },
            {
                nome: 'Segurança & Iluminação',
                subs: [
                    {
                        nome: 'Alarmes e Travas',
                        prods: [
                            { nome: 'Alarme Automotivo Pósitron Cyber Exact EX360', preco: 249.90, estoque: 25 },
                            { nome: 'Trava Elétrica Universal 4 Portas Duplo Comando', preco: 119.00, estoque: 30 },
                            { nome: 'Sensor de Estacionamento 4 Pontos com Display LED', preco: 89.90, estoque: 35 }
                        ]
                    },
                    {
                        nome: 'Lâmpadas LED & Faróis',
                        prods: [
                            { nome: 'Kit Par Lâmpada Ultra LED H7 6000K Super Branca', preco: 149.00, estoque: 28 },
                            { nome: 'Kit Par Lâmpada Ultra LED H4 Farol Alto/Baixo', preco: 169.00, estoque: 24 },
                            { nome: 'Fita LED Drl Dual Color com Seta Sequencial 60cm', preco: 79.90, estoque: 40 },
                            { nome: 'Carregador Veicular Rápido Turbo 38W USB-C + USB-A', preco: 59.90, estoque: 50 },
                            { nome: 'Suporte Magnético para Celular Saída de Ar Veicular', preco: 39.90, estoque: 60 },
                            { nome: 'Aspirador de Pó Portátil 12V para Carro com Filtro HEPA', preco: 119.00, estoque: 18 },
                            { nome: 'Câmera de Ré Borboleta 2 em 1 Visão Noturna HD', preco: 69.90, estoque: 32 },
                            { nome: 'Jogo de Tapetes Borracha Universal 4 Peças Pesado', preco: 89.00, estoque: 35 },
                            { nome: 'Capa Protetora de Carro Impermeável Forrada G', preco: 189.00, estoque: 10 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Patrícia Cosméticos & Skincare',
        email: 'patricia.cosmeticos@loja.com',
        nicho: 'Perfumaria, Beleza e Cuidados Pessoais',
        uIdx: 3,
        cats: [
            {
                nome: 'Skincare Facial',
                subs: [
                    {
                        nome: 'Séruns & Hidratantes',
                        prods: [
                            { nome: 'Sérum Facial Vitamina C 15% Pura La Roche-Posay', preco: 219.90, estoque: 20 },
                            { nome: 'Sérum Retinol Puro Noturno Anti-idade LOréal', preco: 129.00, estoque: 25 },
                            { nome: 'Hidratante Facial Ácido Hialurônico Neutrogena Hydro Boost', preco: 79.90, estoque: 40 },
                            { nome: 'Protetor Solar Facial com Cor FPS 60 Isdin Fusion Water', preco: 99.90, estoque: 35 }
                        ]
                    },
                    {
                        nome: 'Limpeza & Tônicos',
                        prods: [
                            { nome: 'Gel de Limpeza Facial Effaclar Concentrado 300g', preco: 89.90, estoque: 30 },
                            { nome: 'Água Micelar Demaquilante Bifásica Garnier 400ml', preco: 42.90, estoque: 45 },
                            { nome: 'Esfoliante Facial Suave Apricot St. Ives 170g', preco: 49.90, estoque: 25 }
                        ]
                    }
                ]
            },
            {
                nome: 'Perfumaria & Cabelos',
                subs: [
                    {
                        nome: 'Perfumes Importados',
                        prods: [
                            { nome: 'Perfume Masculino Sauvage Eau de Toilette Dior 100ml', preco: 789.00, estoque: 8 },
                            { nome: 'Perfume Feminino La Vie Est Belle Lancôme 50ml', preco: 549.00, estoque: 10 },
                            { nome: 'Perfume Unissex CK One Calvin Klein 200ml', preco: 349.00, estoque: 15 },
                            { nome: 'Perfume Good Girl Carolina Herrera 80ml', preco: 689.00, estoque: 7 }
                        ]
                    },
                    {
                        nome: 'Tratamento Capilar',
                        prods: [
                            { nome: 'Máscara Reconstrutora Kérastase Résistance 200ml', preco: 299.00, estoque: 14 },
                            { nome: 'Óleo Capilar Extraordinário LOréal Elseve 100ml', preco: 45.90, estoque: 50 },
                            { nome: 'Kit Shampoo e Condicionador Wella Professionals Fusion', preco: 189.00, estoque: 22 },
                            { nome: 'Protetor Térmico Spray Lowell Liso Mágico 200ml', preco: 59.90, estoque: 35 },
                            { nome: 'Batom Líquido Matte Maybelline SuperStay 24h', preco: 69.90, estoque: 40 },
                            { nome: 'Base Líquida Boca Rosa Beauty Matte Alta Cobertura', preco: 59.00, estoque: 30 },
                            { nome: 'Paleta de Sombras 18 Cores Nude Océane', preco: 89.00, estoque: 18 },
                            { nome: 'Máscara de Cílios Lash Sensational Maybelline Sky High', preco: 64.90, estoque: 35 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Rodrigo Games & Colecionáveis',
        email: 'rodrigo.games@loja.com',
        nicho: 'Consoles, Jogos e Acessórios Gamers',
        uIdx: 4,
        cats: [
            {
                nome: 'Consoles & Acessórios',
                subs: [
                    {
                        nome: 'PlayStation & Xbox',
                        prods: [
                            { nome: 'Console PlayStation 5 Slim 1TB Edição Digital', preco: 3699.00, estoque: 6 },
                            { nome: 'Controle Sem Fio DualSense Midnight Black PS5', preco: 429.00, estoque: 18 },
                            { nome: 'Controle Sem Fio Xbox Series Robot White', preco: 399.00, estoque: 15 },
                            { nome: 'Console Nintendo Switch OLED 64GB Neon', preco: 2199.00, estoque: 9 },
                            { nome: 'Base de Carregamento Duplo para DualSense PS5', preco: 149.90, estoque: 20 }
                        ]
                    }
                ]
            },
            {
                nome: 'Jogos & Colecionáveis',
                subs: [
                    {
                        nome: 'Jogos em Mídia Física',
                        prods: [
                            { nome: 'Jogo God of War Ragnarök PS5 Mídia Física', preco: 249.90, estoque: 25 },
                            { nome: 'Jogo The Last of Us Part I Remake PS5', preco: 239.00, estoque: 20 },
                            { nome: 'Jogo EA Sports FC 24 PS5', preco: 199.90, estoque: 30 },
                            { nome: 'Jogo The Legend of Zelda: Tears of the Kingdom Switch', preco: 329.00, estoque: 15 },
                            { nome: 'Jogo Marvels Spider-Man 2 PS5', preco: 279.00, estoque: 22 }
                        ]
                    },
                    {
                        nome: 'Action Figures & Funko',
                        prods: [
                            { nome: 'Boneco Funko Pop! Marvel Homem-Aranha No Way Home', preco: 119.90, estoque: 25 },
                            { nome: 'Boneco Funko Pop! Harry Potter com Varinha', preco: 119.90, estoque: 20 },
                            { nome: 'Action Figure Batman Arkham Knight 18cm Articulado', preco: 199.00, estoque: 12 },
                            { nome: 'Luminária Pixel PlayStation Icons Light Paladone', preco: 169.90, estoque: 15 },
                            { nome: 'Caneca Térmica Game Over Cerâmica 400ml', preco: 49.90, estoque: 35 },
                            { nome: 'Volante com Pedais Logitech G29 Driving Force', preco: 1899.00, estoque: 5 },
                            { nome: 'Óculos de Realidade Virtual Meta Quest 3 128GB', preco: 4290.00, estoque: 3 },
                            { nome: 'Cabo HDMI 2.1 Ultra High Speed 8K 60Hz 2m', preco: 59.90, estoque: 40 },
                            { nome: 'Grip Ergonômico de Silicone para Nintendo Switch', preco: 45.00, estoque: 30 },
                            { nome: 'Capa Case Rígida de Transporte para Nintendo Switch', preco: 79.90, estoque: 25 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Luciana Joias & Relógios',
        email: 'luciana.joias@loja.com',
        nicho: 'Joias de Prata, Ouro e Relógios de Luxo',
        uIdx: 0,
        cats: [
            {
                nome: 'Relógios de Pulso',
                subs: [
                    {
                        nome: 'Relógios Masculinos',
                        prods: [
                            { nome: 'Relógio Masculino Technos Cronógrafo Dourado Aço', preco: 599.00, estoque: 12 },
                            { nome: 'Relógio Masculino Casio G-Shock GA-2100 Carbon Core', preco: 689.00, estoque: 15 },
                            { nome: 'Relógio Masculino Orient Automático Submariner Prata', preco: 1190.00, estoque: 8 },
                            { nome: 'Relógio Smartwatch Amazfit GTS 4 Mini AMOLED', preco: 489.00, estoque: 18 }
                        ]
                    },
                    {
                        nome: 'Relógios Femininos',
                        prods: [
                            { nome: 'Relógio Feminino Mondaine Rosé com Cristais no Mostrador', preco: 329.00, estoque: 16 },
                            { nome: 'Relógio Feminino Casio Vintage Digital Dourado', preco: 219.00, estoque: 25 },
                            { nome: 'Relógio Feminino Technos Elegance Mini Prateado', preco: 389.00, estoque: 14 }
                        ]
                    }
                ]
            },
            {
                nome: 'Prata 925 & Semijoias',
                subs: [
                    {
                        nome: 'Correntes & Pulseiras',
                        prods: [
                            { nome: 'Corrente Masculina Grumet 70cm Prata 925 Italiana', preco: 289.00, estoque: 20 },
                            { nome: 'Pulseira Masculina Elo Veneziano 21cm Prata 925', preco: 149.00, estoque: 22 },
                            { nome: 'Pulseira Feminina Estilo Pandora Prata 925 com Trava', preco: 299.00, estoque: 15 },
                            { nome: 'Berloque Charm Coração Esmaltado Prata 925', preco: 69.90, estoque: 40 },
                            { nome: 'Colar Feminino Ponto de Luz Zircônia Prata 925', preco: 89.90, estoque: 35 },
                            { nome: 'Brinco Argola Fecho Click Zircônias Prata 925', preco: 79.90, estoque: 30 },
                            { nome: 'Anel Solitário Noivado Prata 925 com Pedra Zircônia 6mm', preco: 119.00, estoque: 20 },
                            { nome: 'Porta-Joias Portátil com Zíper e Divisórias Veludo', preco: 59.90, estoque: 30 },
                            { nome: 'Flanela Mágica para Limpeza de Joias em Prata', preco: 15.00, estoque: 80 },
                            { nome: 'Escapulário Sagrado Coração de Jesus Prata 925 60cm', preco: 159.00, estoque: 18 },
                            { nome: 'Tornozeleira Bolinhas Prata 925 Delicada 24cm', preco: 69.00, estoque: 25 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Felipe Suplementos & Nutrição',
        email: 'felipe.fitness@loja.com',
        nicho: 'Suplementação Esportiva e Fitness',
        uIdx: 1,
        cats: [
            {
                nome: 'Proteínas & Aminoácidos',
                subs: [
                    {
                        nome: 'Whey Protein',
                        prods: [
                            { nome: '100% Whey Protein Concentrado 900g Max Titanium', preco: 119.90, estoque: 40 },
                            { nome: 'Iso Triple Zero Whey Isolado 900g Integralmédica', preco: 189.90, estoque: 25 },
                            { nome: 'Whey Gold Standard 100% 907g Optimum Nutrition', preco: 249.00, estoque: 18 },
                            { nome: 'Proteína Vegana 100% Plant Protein 900g Dux Nutrition', preco: 169.00, estoque: 15 }
                        ]
                    },
                    {
                        nome: 'Creatina & Aminoácidos',
                        prods: [
                            { nome: 'Creatina Monohidratada 100% Pura 300g Max Titanium', preco: 89.90, estoque: 60 },
                            { nome: 'Creatina Creapure 300g Dux Nutrition Selo Alemão', preco: 149.90, estoque: 30 },
                            { nome: 'BCAA 2400mg 100 Cápsulas Max Titanium', preco: 49.90, estoque: 35 },
                            { nome: 'Glutamina 100% Pura 300g Integralmédica', preco: 69.90, estoque: 28 }
                        ]
                    }
                ]
            },
            {
                nome: 'Energia & Acessórios',
                subs: [
                    {
                        nome: 'Pré-Treinos & Termogênicos',
                        prods: [
                            { nome: 'Pré-Treino Égide 300g Frutas Vermelhas Max Titanium', preco: 119.00, estoque: 25 },
                            { nome: 'Pré-Treino C4 Beta Pump 225g New Millen', preco: 99.90, estoque: 20 },
                            { nome: 'Cafeína 420mg 60 Cápsulas Termogênico Pura Energia', preco: 39.90, estoque: 45 },
                            { nome: 'Pasta de Amendoim Integral 1kg Dr. Peanut Avelã', preco: 59.90, estoque: 35 }
                        ]
                    },
                    {
                        nome: 'Acessórios de Treino',
                        prods: [
                            { nome: 'Coqueteleira Shaker com Mola Inox 600ml BlenderBottle', preco: 49.90, estoque: 50 },
                            { nome: 'Strap de Treino Algodão Reforçado com Neoprene Par', preco: 35.00, estoque: 40 },
                            { nome: 'Cinto de Musculação Lombar em Couro com Fivela Dupla', preco: 129.00, estoque: 15 },
                            { nome: 'Kit 5 Mini Bands Elásticos de Resistência Musculação', preco: 39.90, estoque: 30 },
                            { nome: 'Corda de Pular Crossfit Rolamento Duplo Speed Rope', preco: 45.00, estoque: 25 },
                            { nome: 'Multivitamínico Daily Complete 120 Cápsulas Growth', preco: 45.00, estoque: 40 },
                            { nome: 'Ômega 3 Ultra Concentrado 1000mg 120 Cápsulas', preco: 79.90, estoque: 30 },
                            { nome: 'Barra de Proteína Crisp Protein Bar Caixa 12x45g', preco: 89.90, estoque: 22 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Beatriz Casa & Decoração',
        email: 'beatriz.decor@loja.com',
        nicho: 'Móveis, Decoração e Utilidades Domésticas',
        uIdx: 2,
        cats: [
            {
                nome: 'Iluminação & Sala',
                subs: [
                    {
                        nome: 'Luminárias & Abajures',
                        prods: [
                            { nome: 'Luminária de Chão Coluna Tripé Madeira Nórdica', preco: 299.00, estoque: 10 },
                            { nome: 'Abajur de Mesa Base Cerâmica com Cúpula de Linho', preco: 149.90, estoque: 18 },
                            { nome: 'Pendente Lustre Sputnik 6 Lâmpadas Dourado Fosco', preco: 249.00, estoque: 12 },
                            { nome: 'Fita LED Inteligente Wi-Fi RGB 5m Compatível Alexa', preco: 89.90, estoque: 30 }
                        ]
                    },
                    {
                        nome: 'Almofadas & Tapetes',
                        prods: [
                            { nome: 'Kit 4 Capas de Almofada Linho Geométrico 45x45cm', preco: 79.90, estoque: 35 },
                            { nome: 'Tapete Sala Geométrico Escandinavo 2,00m x 1,50m', preco: 349.00, estoque: 8 },
                            { nome: 'Manta para Sofá Jacquard Algodão com Franjas 140x180cm', preco: 89.00, estoque: 20 },
                            { nome: 'Quadro Decorativo Minimalista Canvas 3 Peças 60x40cm', preco: 179.00, estoque: 15 }
                        ]
                    }
                ]
            },
            {
                nome: 'Cozinha & Organização',
                subs: [
                    {
                        nome: 'Mesa Posta & Vidros',
                        prods: [
                            { nome: 'Aparelho de Jantar 20 Peças Cerâmica Oxford Daily', preco: 289.00, estoque: 12 },
                            { nome: 'Jogo 6 Taças de Vinho Cristal Ecológico 450ml Bohemia', preco: 139.90, estoque: 16 },
                            { nome: 'Faqueiro 24 Peças Aço Inox com Cabo de Madeira Tramontina', preco: 99.90, estoque: 25 },
                            { nome: 'Jogo 6 Copos de Vidro Canelado Long Drink 380ml', preco: 69.90, estoque: 28 },
                            { nome: 'Kit 5 Potes Herméticos de Vidro com Tampa de Bambu', preco: 119.00, estoque: 22 },
                            { nome: 'Organizador Giratório Multiuso Acrílico para Temperos', preco: 59.90, estoque: 30 },
                            { nome: 'Difusor de Aromas Elétrico Ultrassônico Madeira 300ml', preco: 89.00, estoque: 25 },
                            { nome: 'Vaso Decorativo Cerâmica Fosca Estilo Escandinavo', preco: 69.00, estoque: 20 },
                            { nome: 'Espelho Redondo Adnet com Alça de Couro 60cm Preto', preco: 159.00, estoque: 14 },
                            { nome: 'Porta-Retrato Moldura Madeira Vidro Duplo 15x20cm', preco: 39.90, estoque: 40 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Gabriel Celulares & Acessórios',
        email: 'gabriel.celulares@loja.com',
        nicho: 'Smartphones, Acessórios e Carregadores',
        uIdx: 3,
        cats: [
            {
                nome: 'Smartphones',
                subs: [
                    {
                        nome: 'Apple & Samsung',
                        prods: [
                            { nome: 'iPhone 15 Apple 128GB Preto Tela 6.1 Pol', preco: 4999.00, estoque: 5 },
                            { nome: 'Smartphone Samsung Galaxy S24 256GB 5G Onyx Black', preco: 4499.00, estoque: 6 },
                            { nome: 'Smartphone Xiaomi Redmi Note 13 128GB 6GB RAM', preco: 1199.00, estoque: 15 },
                            { nome: 'Smartphone Motorola Moto G84 5G 256GB 8GB RAM', preco: 1399.00, estoque: 12 }
                        ]
                    }
                ]
            },
            {
                nome: 'Acessórios & Proteção',
                subs: [
                    {
                        nome: 'Carregadores & Cabos',
                        prods: [
                            { nome: 'Carregador Rápido 20W USB-C Original Apple', preco: 189.00, estoque: 30 },
                            { nome: 'Carregador Turbo 25W Samsung Super Fast Charging', preco: 119.00, estoque: 35 },
                            { nome: 'Cabo Trançado Reforçado USB-C para Lightning 1.2m Baseus', preco: 49.90, estoque: 50 },
                            { nome: 'Power Bank Carregador Portátil 20.000mAh 22.5W Anker', preco: 199.00, estoque: 20 }
                        ]
                    },
                    {
                        nome: 'Capas, Películas & Fones',
                        prods: [
                            { nome: 'Película de Vidro 3D Cerâmica Flexível Anti-Impacto', preco: 29.90, estoque: 80 },
                            { nome: 'Capa MagSafe Transparente Antiamarelamento iPhone 15', preco: 79.90, estoque: 40 },
                            { nome: 'Capa Silicone Anti-Impacto com Interior Aveludado', preco: 45.00, estoque: 50 },
                            { nome: 'Fone de Ouvido Bluetooth TWS JBL Wave Buds', preco: 249.00, estoque: 22 },
                            { nome: 'Fone de Ouvido Apple AirPods Pro 2ª Geração USB-C', preco: 1899.00, estoque: 7 },
                            { nome: 'Fone de Ouvido Bluetooth QCY T13 ANC com Cancelamento de Ruído', preco: 149.00, estoque: 28 },
                            { nome: 'Suporte de Mesa Articulado para Celular e Tablet Alumínio', preco: 59.90, estoque: 35 },
                            { nome: 'Limpador de Telas Spray com Flanela Microfibra Embutida', preco: 25.00, estoque: 60 },
                            { nome: 'Cartão de Memória MicroSD 128GB SanDisk Ultra 100MB/s', preco: 69.90, estoque: 30 },
                            { nome: 'Adaptador de Áudio USB-C para P2 Fêmea 3.5mm', preco: 39.00, estoque: 45 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Juliana Pet Shop & Cuidados',
        email: 'juliana.petshop@loja.com',
        nicho: 'Rações, Brinquedos e Artigos para Pets',
        uIdx: 4,
        cats: [
            {
                nome: 'Cães & Gatos',
                subs: [
                    {
                        nome: 'Alimentação & Rações',
                        prods: [
                            { nome: 'Ração Premier Formula Cães Adultos Frango 15kg', preco: 239.90, estoque: 18 },
                            { nome: 'Ração Royal Canin Gatos Castrados 7.5kg', preco: 279.00, estoque: 12 },
                            { nome: 'Petisco Bifinho Keldog Carne para Cães 500g', preco: 24.90, estoque: 40 },
                            { nome: 'Sachê Whiskas Gatos Adultos Salmão ao Molho 85g', preco: 3.50, estoque: 120 }
                        ]
                    },
                    {
                        nome: 'Higiene & Acessórios',
                        prods: [
                            { nome: 'Areia Sanitária para Gatos Pipicat Floral 12kg', preco: 39.90, estoque: 30 },
                            { nome: 'Tapete Higiênico Chalesco para Cães 30 Unidades', preco: 69.90, estoque: 25 },
                            { nome: 'Shampoo Neutro Antipulgas para Cães e Gatos 500ml', preco: 32.90, estoque: 30 },
                            { nome: 'Caminha Pet Nuvem Almofada Redonda Ultra Macia 60cm', preco: 99.00, estoque: 15 }
                        ]
                    }
                ]
            },
            {
                nome: 'Brinquedos & Passeio',
                subs: [
                    {
                        nome: 'Brinquedos e Coleiras',
                        prods: [
                            { nome: 'Brinquedo Mordedor Kong Classic Vermelho Tamanho G', preco: 109.90, estoque: 20 },
                            { nome: 'Guia Retrátil Fita 5 Metros para Cães até 25kg', preco: 69.90, estoque: 22 },
                            { nome: 'Peitoral Antipuxão para Cães com Alça de Segurança', preco: 89.00, estoque: 18 },
                            { nome: 'Arranhador para Gatos com Torre de Pelúcia e Sisal 60cm', preco: 139.00, estoque: 10 },
                            { nome: 'Comedouro Lento Interativo Labirinto para Cães', preco: 45.00, estoque: 25 },
                            { nome: 'Bebedouro Fonte Automática para Gatos Bivolt 2 Litros', preco: 89.90, estoque: 16 },
                            { nome: 'Cortador de Unhas Pet com Limitador de Segurança', preco: 29.90, estoque: 35 },
                            { nome: 'Escova Rasqueadeira para Cães e Gatos Autolimpante', preco: 39.90, estoque: 30 },
                            { nome: 'Brinquedo Varinha com Penas e Guizo para Gatos', preco: 18.00, estoque: 50 },
                            { nome: 'Remédio Antipulgas e Carrapatos Simparic 20mg para Cães', preco: 98.00, estoque: 25 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Diego Ferramentas & Máquinas',
        email: 'diego.ferramentas@loja.com',
        nicho: 'Ferramentas Manuais, Elétricas e Equipamentos',
        uIdx: 0,
        cats: [
            {
                nome: 'Ferramentas Elétricas',
                subs: [
                    {
                        nome: 'Furadeiras & Parafusadeiras',
                        prods: [
                            { nome: 'Parafusadeira Furadeira de Impacto 12V Bivolt Bosch GSB 120-LI', preco: 429.00, estoque: 12 },
                            { nome: 'Furadeira de Impacto 1/2 Pol 710W DeWalt DWD502', preco: 349.00, estoque: 15 },
                            { nome: 'Esmerilhadeira Angular 4.1/2 Pol 850W Makita M9510', preco: 289.00, estoque: 14 },
                            { nome: 'Serra Tico-Tico 450W com Guia Laser Philco', preco: 189.90, estoque: 18 }
                        ]
                    },
                    {
                        nome: 'Ferramentas Manuais',
                        prods: [
                            { nome: 'Jogo de Chaves Soquetes e Catraca 46 Peças Aço Cromo Vanádio', preco: 89.90, estoque: 30 },
                            { nome: 'Alicate Universal 8 Pol Isolado 1000V Tramontina PRO', preco: 49.90, estoque: 35 },
                            { nome: 'Jogo de Chaves Combinadas 6 a 22mm 12 Peças Gedore Red', preco: 129.00, estoque: 22 },
                            { nome: 'Martelo Unha 27mm Cabo de Fibra de Vidro Emborrachado', preco: 39.90, estoque: 40 }
                        ]
                    }
                ]
            },
            {
                nome: 'Medição & Segurança',
                subs: [
                    {
                        nome: 'Instrumentos & EPI',
                        prods: [
                            { nome: 'Trena a Laser Digital Alcance 40m com Nível Bosch GLM 40', preco: 299.00, estoque: 10 },
                            { nome: 'Nível a Laser Autonivelante 2 Linhas Cruzadas 15m', preco: 199.00, estoque: 14 },
                            { nome: 'Trena Métrica Profissional 8 Metros com Trava Lufkin', preco: 42.90, estoque: 50 },
                            { nome: 'Maleta Caixa de Ferramentas Plástica com Bandeja 19 Pol', preco: 69.90, estoque: 25 },
                            { nome: 'Óculos de Proteção Antirrisco e Anti-embaçante 3M', preco: 22.00, estoque: 60 },
                            { nome: 'Luva de Proteção Mecânica Revestida com Poliuretano Par', preco: 12.00, estoque: 80 },
                            { nome: 'Kit Jogo de Brocas para Concreto Madeira e Metal 16 Peças', preco: 49.90, estoque: 35 },
                            { nome: 'Multímetro Digital Portátil com Testador de Continuidade', preco: 59.90, estoque: 25 },
                            { nome: 'Pistola de Cola Quente Profissional 60W Bivolt', preco: 39.90, estoque: 30 },
                            { nome: 'Fita Isolante 3M Imperial 19mm x 20m Antichama', preco: 14.90, estoque: 100 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Carla Papelaria & Livros',
        email: 'carla.papelaria@loja.com',
        nicho: 'Material Escolar, Escritório e Livraria',
        uIdx: 1,
        cats: [
            {
                nome: 'Escrita & Papéis',
                subs: [
                    {
                        nome: 'Canetas & Marcadores',
                        prods: [
                            { nome: 'Kit Canetas Marca Texto Stabilo Boss 8 Cores Pastel', preco: 79.90, estoque: 35 },
                            { nome: 'Kit Canetas Gel Ponta Fina EnerGel 0.5mm Pentel 5 Cores', preco: 59.90, estoque: 40 },
                            { nome: 'Estojo de Canetas Ponta Pincel Brush Pen 12 Cores CIS', preco: 49.90, estoque: 30 },
                            { nome: 'Caixa de Caneta Esferográfica BIC Cristal Azul 50 Unidades', preco: 45.00, estoque: 45 }
                        ]
                    },
                    {
                        nome: 'Cadernos & Planners',
                        prods: [
                            { nome: 'Caderno Inteligente Grande A4 80 Folhas Reposicionáveis', preco: 119.00, estoque: 20 },
                            { nome: 'Planner Anual Espiral Capa Dura Wire-o 2026', preco: 79.90, estoque: 25 },
                            { nome: 'Bloco de Notas Autoadesivas Post-it 4 Cores 76x76mm', preco: 24.90, estoque: 60 },
                            { nome: 'Caderno Universitário 10 Matérias 160 Folhas Tilibra', preco: 29.90, estoque: 50 }
                        ]
                    }
                ]
            },
            {
                nome: 'Livros & Acessórios',
                subs: [
                    {
                        nome: 'Livros Best-Sellers',
                        prods: [
                            { nome: 'Livro Hábitos Atômicos - James Clear', preco: 49.90, estoque: 30 },
                            { nome: 'Livro O Homem Mais Rico da Babilônia - George S. Clason', preco: 29.90, estoque: 35 },
                            { nome: 'Livro Box Trilogia O Senhor dos Anéis Edição de Luxo', preco: 179.00, estoque: 12 },
                            { nome: 'Livro A Psicologia Financeira - Morgan Housel', preco: 42.90, estoque: 28 },
                            { nome: 'Estojo Escolar Duplo Grande com Zíper Reforçado', preco: 39.90, estoque: 35 },
                            { nome: 'Lápis de Cor Faber-Castell SuperSoft 50 Cores', preco: 109.90, estoque: 20 },
                            { nome: 'Grampeador de Mesa Médio Metálico para até 25 Folhas', preco: 28.00, estoque: 40 },
                            { nome: 'Porta-Canetas Organizador de Mesa Acrílico Giratório', preco: 39.90, estoque: 30 },
                            { nome: 'Luminária Clip de Leitura para Livros LED Flexível', preco: 32.90, estoque: 35 },
                            { nome: 'Calculadora Científica 240 Funções Casio FX-82MS', preco: 69.90, estoque: 25 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Tiago Vinhos & Destilados',
        email: 'tiago.bebidas@loja.com',
        nicho: 'Vinhos Finos, Destilados e Cervejas Especiais',
        uIdx: 2,
        cats: [
            {
                nome: 'Vinhos & Espumantes',
                subs: [
                    {
                        nome: 'Vinhos Tintos & Brancos',
                        prods: [
                            { nome: 'Vinho Chileno Tinto Cabernet Sauvignon Casillero del Diablo 750ml', preco: 59.90, estoque: 30 },
                            { nome: 'Vinho Argentino Malbec Angelica Zapata 750ml', preco: 299.00, estoque: 10 },
                            { nome: 'Vinho Português Verde Casal Garcia 750ml', preco: 49.90, estoque: 35 },
                            { nome: 'Espumante Brut Chandon Reserve 750ml', preco: 98.90, estoque: 24 }
                        ]
                    }
                ]
            },
            {
                nome: 'Destilados & Coquetelaria',
                subs: [
                    {
                        nome: 'Whisky, Gin & Licores',
                        prods: [
                            { nome: 'Whisky Escocês 12 Anos Johnnie Walker Black Label 1L', preco: 159.90, estoque: 20 },
                            { nome: 'Whisky Single Malt Glenfiddich 12 Anos 750ml', preco: 289.00, estoque: 8 },
                            { nome: 'Gin Inglês Bombay Sapphire London Dry 750ml', preco: 119.90, estoque: 22 },
                            { nome: 'Vodka Sueca Absolut Original 1 Litro', preco: 89.90, estoque: 25 },
                            { nome: 'Licor Creme de Cassis Baileys Irish Cream 750ml', preco: 99.00, estoque: 18 },
                            { nome: 'Xarope para Drinks Monin Maçã Verde 700ml', preco: 59.90, estoque: 15 },
                            { nome: 'Kit Coqueteleira Inox Profissional 750ml com Dosador e Coador', preco: 89.90, estoque: 20 },
                            { nome: 'Abridor Sacarrolhas Elétrico de Vinho a Pilha com Corta-Gotas', preco: 79.90, estoque: 22 },
                            { nome: 'Conjunto 4 Copos de Whisky Cristal Lapidado 300ml', preco: 99.00, estoque: 16 },
                            { nome: 'Cerveja Artesanal IPA Colorado Indica 600ml Garrafa', preco: 16.90, estoque: 60 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        nome: 'Renata Óculos & Relógios',
        email: 'renata.oticas@loja.com',
        nicho: 'Óptica, Óculos de Sol e Armações de Grau',
        uIdx: 3,
        cats: [
            {
                nome: 'Óculos de Sol',
                subs: [
                    {
                        nome: 'Solares Masculinos e Femininos',
                        prods: [
                            { nome: 'Óculos de Sol Ray-Ban Aviador Clássico Dourado G-15', preco: 699.00, estoque: 12 },
                            { nome: 'Óculos de Sol Ray-Ban Wayfarer Preto Polarizado', preco: 750.00, estoque: 10 },
                            { nome: 'Óculos de Sol Oakley Holbrook Matte Black Prizm Black', preco: 620.00, estoque: 14 },
                            { nome: 'Óculos de Sol Feminino Gatinho Acetato Tartaruga', preco: 289.00, estoque: 18 }
                        ]
                    }
                ]
            },
            {
                nome: 'Armações & Acessórios',
                subs: [
                    {
                        nome: 'Armações de Grau',
                        prods: [
                            { nome: 'Armação de Grau Unissex Clip-on 2 em 1 Solar Polarizado', preco: 249.00, estoque: 20 },
                            { nome: 'Armação de Grau Titânio Ultraleve Flexível Redonda', preco: 329.00, estoque: 15 },
                            { nome: 'Armação de Grau Transparente Cristal Acetato Quadrada', preco: 189.00, estoque: 22 },
                            { nome: 'Óculos para Computador Filtro Luz Azul Anti-Fadiga Ocular', preco: 119.90, estoque: 35 },
                            { nome: 'Estojo Rígido Case para Óculos com Forro de Camurça', preco: 39.90, estoque: 40 },
                            { nome: 'Kit Limpa Lentes Spray 60ml + 2 Lenços Microfibra Especial', preco: 24.90, estoque: 70 },
                            { nome: 'Corrente Cordão para Óculos Banhada a Prata com Silicone', preco: 35.00, estoque: 30 },
                            { nome: 'Chaveiro Mini Chave de Fenda para Conserto de Óculos', preco: 15.00, estoque: 50 },
                            { nome: 'Suporte de Silicone Antideslizante para Orelha Par', preco: 12.00, estoque: 80 },
                            { nome: 'Lente de Aumento Lupa de Mão com Luz LED 3x Zoom', preco: 45.00, estoque: 25 }
                        ]
                    }
                ]
            }
        ]
    }
];

async function run() {
    try {
        console.log('🚀 Iniciando recriação completa e população do banco api_kamikase...');
        const connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Limpar tabelas mantendo integridade
        console.log('🧹 Limpando dados anteriores...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE itens_venda');
        await connection.execute('TRUNCATE TABLE vendas');
        await connection.execute('TRUNCATE TABLE produtos');
        await connection.execute('TRUNCATE TABLE categorias');
        await connection.execute('TRUNCATE TABLE usuarios');
        await connection.execute('TRUNCATE TABLE unidades');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Inserir Unidades
        console.log('🏢 Criando Filiais e Unidades...');
        const unidadesIds: number[] = [];
        for (const nome of UNIDADES) {
            const [res]: any = await connection.execute('INSERT INTO unidades (nome) VALUES (?)', [nome]);
            unidadesIds.push(res.insertId);
        }

        // Senha padrão "123" para todos os usuários
        const senhaHash = await bcrypt.hash('123', 10);

        // 3. Inserir Administrador
        console.log('👑 Criando Administrador Geral (admin@admin.com)...');
        await connection.execute(
            'INSERT INTO usuarios (nome, email, senha, is_admin, ativo, unidade_id) VALUES (?, ?, ?, ?, ?, ?)',
            ['Diretoria Executiva (Admin)', 'admin@admin.com', senhaHash, true, true, unidadesIds[0]]
        );

        // Helper para inserir um lojista completo com categorias, produtos e vendas
        const cadastrarLojistaCompleto = async (def: {
            nome: string;
            email: string;
            unidadeId: number;
            categorias: { nome: string; subcategorias: { nome: string; produtos: { nome: string; preco: number; estoque: number; descricao?: string }[] }[] }[];
        }) => {
            console.log(`👤 Cadastrando lojista: ${def.nome} (${def.email})...`);
            const [userRes]: any = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, is_admin, ativo, unidade_id) VALUES (?, ?, ?, ?, ?, ?)',
                [def.nome, def.email, senhaHash, false, true, def.unidadeId]
            );
            const uId = userRes.insertId;

            const produtosInseridos: { id: number; preco: number }[] = [];

            for (const cat of def.categorias) {
                const [catRes]: any = await connection.execute(
                    'INSERT INTO categorias (nome, usuarios_id, parent_id) VALUES (?, ?, NULL)',
                    [cat.nome, uId]
                );
                const parentId = catRes.insertId;

                for (const sub of cat.subcategorias) {
                    const [subRes]: any = await connection.execute(
                        'INSERT INTO categorias (nome, usuarios_id, parent_id) VALUES (?, ?, ?)',
                        [sub.nome, uId, parentId]
                    );
                    const subId = subRes.insertId;

                    for (const prod of sub.produtos) {
                        const [prodRes]: any = await connection.execute(
                            'INSERT INTO produtos (nome, preco, descricao, estoque, categorias_id, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)',
                            [prod.nome, prod.preco, prod.descricao || `Produto ${prod.nome} de excelente procedência`, prod.estoque, subId, uId]
                        );
                        produtosInseridos.push({ id: prodRes.insertId, preco: prod.preco });
                    }
                }
            }

            // Gerar de 8 a 18 vendas realistas para este lojista
            const formas = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];
            const numVendas = Math.floor(Math.random() * 11) + 8; // 8 a 18 vendas

            for (let v = 0; v < numVendas; v++) {
                const forma = formas[Math.floor(Math.random() * formas.length)];
                const parcelas = forma === 'Cartão de Crédito' ? (Math.random() > 0.4 ? Math.floor(Math.random() * 6) + 1 : 1) : 1;
                const desconto = Math.random() > 0.6 ? Number((Math.random() * 30 + 5).toFixed(2)) : 0;

                // Data retroativa nos últimos 30 dias
                const diasAtras = Math.floor(Math.random() * 30);
                const horasAtras = Math.floor(Math.random() * 24);
                const dataVenda = new Date(Date.now() - (diasAtras * 24 * 3600 * 1000) - (horasAtras * 3600 * 1000));

                const [vendaRes]: any = await connection.execute(
                    'INSERT INTO vendas (usuarios_id, valor_total, desconto, forma_pagamento, parcelas, created_at) VALUES (?, 0, ?, ?, ?, ?)',
                    [uId, desconto, forma, parcelas, dataVenda]
                );
                const vendaId = vendaRes.insertId;

                // Escolhe de 1 a 4 produtos diferentes para esta venda
                const qtdItensNaVenda = Math.floor(Math.random() * 4) + 1;
                let subtotalVenda = 0;

                for (let k = 0; k < qtdItensNaVenda; k++) {
                    const p = produtosInseridos[Math.floor(Math.random() * produtosInseridos.length)];
                    const qtd = Math.floor(Math.random() * 2) + 1;

                    await connection.execute(
                        'INSERT INTO itens_venda (vendas_id, produtos_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                        [vendaId, p.id, qtd, p.preco]
                    );
                    subtotalVenda += Number(p.preco) * qtd;
                }

                const totalLiquido = Math.max(1, subtotalVenda - desconto);
                await connection.execute('UPDATE vendas SET valor_total = ? WHERE id = ?', [totalLiquido, vendaId]);
            }

            console.log(`   ✅ ${produtosInseridos.length} produtos cadastrados | ${numVendas} vendas geradas.`);
        };

        // 4. Cadastrar User 01 (Informática)
        await cadastrarLojistaCompleto({
            nome: userInformatica.nome,
            email: userInformatica.email,
            unidadeId: unidadesIds[userInformatica.unidadeIndex % unidadesIds.length],
            categorias: userInformatica.categorias
        });

        // 5. Cadastrar User 02 (Moda)
        await cadastrarLojistaCompleto({
            nome: userModa.nome,
            email: userModa.email,
            unidadeId: unidadesIds[userModa.unidadeIndex % unidadesIds.length],
            categorias: userModa.categorias
        });

        // 6. Cadastrar os outros 12 Lojistas
        for (const lojista of outrosLojistasDef) {
            await cadastrarLojistaCompleto({
                nome: lojista.nome,
                email: lojista.email,
                unidadeId: unidadesIds[lojista.uIdx % unidadesIds.length],
                categorias: lojista.cats.map(c => ({
                    nome: c.nome,
                    subcategorias: c.subs.map(s => ({
                        nome: s.nome,
                        produtos: s.prods.map(p => ({
                            nome: p.nome,
                            preco: p.preco,
                            estoque: p.estoque,
                            descricao: `Produto original de alta performance ${p.nome}`
                        }))
                    }))
                }))
            });
        }

        await connection.commit();
        connection.release();
        console.log('🎉 BANCO DE DADOS POPULADO COM SUCESSO!');
        console.log('----------------------------------------------------');
        console.log('🔑 Credenciais para Acesso:');
        console.log('👉 Admin: admin@admin.com | Senha: 123');
        console.log('👉 User 01 (TI): ale.ramos.oliveira@hotmail.com | Senha: 123');
        console.log('👉 User 02 (Moda): ale.ramos.oliveira@gmail.com | Senha: 123');
        console.log('👉 12 Outros Lojistas | Senha para todos: 123');
        console.log('----------------------------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
}

run();
