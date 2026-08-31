# Kamikase ERP & PDV

Sistema completo e profissional de gestão de vendas e PDV (Ponto de Venda), controle de estoque, hierarquia de categorias e painel analítico administrativo multi-lojista.

## 🏗️ Arquitetura

| Camada | Tecnologias |
|--------|------------|
| **Frontend** | React 19, TypeScript, Vite, React Router, Axios, Lucide Icons |
| **Backend** | Express 5, TypeScript, JWT, bcrypt, Zod, Helmet, Rate Limiting, Compression |
| **Banco de Dados** | MySQL 8+ (mysql2 com pool de conexões e transações ACID) |
| **Contêineres** | Docker, Docker Compose, Nginx |

---

## 📁 Estrutura do Projeto

```
kamikase-erp-pdv/
├── backend/                 # API REST (Express + TS)
│   ├── src/
│   │   ├── config/          # Pool MySQL e encerramento gracioso
│   │   ├── controllers/     # Lógica de negócio com Zod
│   │   ├── middlewares/     # Auth, Admin, Rate Limiting, Error Handler
│   │   ├── models/          # Camada de persistência com whitelists
│   │   ├── routes/          # Rotas REST
│   │   ├── scripts/         # Scripts de migração e sementes (seeds)
│   │   ├── types/           # Interfaces TypeScript
│   │   └── server.ts        # Entry point seguro
│   ├── Dockerfile           # Imagem Node.js 20 Alpine multi-stage
│   ├── .env.example         # Template de variáveis de ambiente
│   └── tsconfig.json
├── frontend/                # SPA React 19 (Vite + TS)
│   ├── src/
│   │   ├── components/      # Toast, Modal, ConfirmDialog, Skeleton, Counter
│   │   ├── contexts/        # AuthContext com persistência
│   │   ├── pages/           # Login, PDV, SystemDashboard, AdminDashboard
│   │   └── services/        # Cliente HTTP com interceptors
│   ├── Dockerfile           # Imagem Nginx Alpine multi-stage
│   ├── nginx.conf           # SPA fallback & cache de assets
│   └── .env                 # Variáveis Vite
├── db/
│   └── schema.sql           # Schema DDL do banco de dados
├── docker-compose.yml       # Orquestração completa em 1 comando
└── package.json             # Scripts do monorepo
```

---

## 🚀 Como Executar

### Opção 1: Via Docker (Recomendado para Produção / Avaliação Rápida)

Inicie toda a infraestrutura (MySQL 8 + Backend + Frontend/Nginx) com apenas um comando:

```bash
docker compose up --build -d
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **MySQL**: localhost:3306

---

### Opção 2: Execução Local para Desenvolvimento

#### Pré-requisitos
- **Node.js** 18+
- **MySQL** 8+
- **npm** 9+

#### 1. Instalar dependências
```bash
npm run install:all
```

#### 2. Configurar o banco de dados e variáveis de ambiente
```bash
# Copiar o template de variáveis
cp backend/.env.example backend/.env
# Ajuste as credenciais no arquivo backend/.env

# Inicializar o schema e popular dados de demonstração
npm run db:init
npm run db:seed
```

#### 3. Iniciar a aplicação
```bash
# Executa Backend + Frontend concorrentemente:
npm run dev

# Ou em terminais separados:
npm run dev:backend    # http://localhost:3000
npm run dev:frontend   # http://localhost:5173
```

---

## 💡 Funcionalidades Principais

### 🛒 Ponto de Venda (PDV)
- Busca rápida com atalho `F2`
- Finalização de venda rápida com atalho `F12`
- Descontos customizados (até 20%) e opções de parcelamento com cálculo automático de juros
- **Comprovante / Cupom de Venda Não Fiscal** pronto para impressão térmica ou A4 (`window.print`)
- Atualização atômica de estoque com proteção contra concorrência (`SELECT ... FOR UPDATE`)

### 📊 Painel do Lojista (ERP)
- Métricas em tempo real: Total de Produtos, Categorias Ativas, Faturamento e Patrimônio em Estoque
- Gestão completa de catálogo (CRUD com suporte a hierarquia de categorias Pai/Filho)
- Histórico de transações com **Modal de Detalhes da Venda** (itens, preço unitário, total)
- **Exportação de Relatórios em CSV** (Vendas e Produtos) compatível com Excel (UTF-8 BOM)

### 🛡️ Painel do Administrador (Multi-tenant)
- Visão consolidada da plataforma (faturamento global, lojistas ativos, inventário total)
- Tabela de desempenho por lojista com ordenação dinâmica
- Destaque automático para o lojista com melhor performance (Top Seller)
- Exportação de dados gerais de lojistas para CSV

---

## 🔐 Segurança Implementada

- **Prevenção de Escalação de Privilégios**: Cadastro público restrito estritamente a usuários lojistas padrão.
- **Proteção contra Brute Force (Rate Limiting)**: 20 tentativas por 15 minutos nas rotas de autenticação e 200 req/min gerais.
- **Segurança HTTP com Helmet**: Headers de segurança automatizados (`X-Content-Type-Options`, `X-Frame-Options`, etc.).
- **Criptografia Forte**: Senhas com salt rounds 12 via `bcrypt`.
- **Prevenção de SQL Injection**: Uso de queries parametrizadas (`mysql2`) e whitelists de campos em operações de atualização.
- **Tratamento de Erros Seguro**: Mensagens genéricas em produção para evitar vazamento de dados de infraestrutura.
- **Encerramento Suave (Graceful Shutdown)**: Liberação segura de conexões ativas do pool MySQL ao reiniciar o servidor.

---

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia backend e frontend simultaneamente em desenvolvimento |
| `npm run build` | Compila o backend e o frontend para produção |
| `npm run typecheck` | Checagem estática de tipos TypeScript |
| `npm run db:init` | Executa o script DDL de criação do banco de dados |
| `npm run db:migrate` | Executa scripts de migração de colunas e constraints |
| `npm run db:seed` | Popula o banco com catálogo e lojista demonstrativo |

---

## 📄 Licença

Distribuído sob licença comercial / ISC.
