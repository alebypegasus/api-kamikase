-- ==========================================================
-- ESTRUTURA DO BANCO DE DADOS: api_kamikase
-- Kamikase ERP & PDV - Sistema Corporativo de Gestão de Vendas
-- ==========================================================

CREATE DATABASE IF NOT EXISTS api_kamikase;
USE api_kamikase;

-- 1. Tabela de Unidades / Filiais
CREATE TABLE IF NOT EXISTS unidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabela de Usuários (Administradores e Lojistas)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    unidade_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON DELETE SET NULL,
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_is_admin (is_admin),
    INDEX idx_usuarios_ativo (ativo),
    INDEX idx_usuarios_unidade (unidade_id)
);

-- 3. Tabela de Categorias e Subcategorias Hierárquicas
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    usuarios_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categorias(id) ON DELETE CASCADE,
    INDEX idx_categorias_usuario (usuarios_id),
    INDEX idx_categorias_parent (parent_id)
);

-- 4. Tabela de Produtos com Controle de Estoque
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    estoque INT DEFAULT 0,
    categorias_id INT NOT NULL,
    usuarios_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categorias_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_produtos_usuario (usuarios_id),
    INDEX idx_produtos_categoria (categorias_id),
    INDEX idx_produtos_nome (nome)
);

-- 5. Tabela de Clientes Cadastrados
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuarios_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20) DEFAULT NULL,
    telefone VARCHAR(30) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    endereco VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_clientes_usuario (usuarios_id),
    INDEX idx_clientes_nome (nome)
);

-- 6. Tabela de Vendas Realizadas no PDV
CREATE TABLE IF NOT EXISTS vendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuarios_id INT NOT NULL,
    cliente_id INT DEFAULT NULL,
    cliente_nome VARCHAR(255) DEFAULT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0.00,
    forma_pagamento VARCHAR(50),
    parcelas INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    INDEX idx_vendas_usuario (usuarios_id),
    INDEX idx_vendas_cliente (cliente_id),
    INDEX idx_vendas_cliente_nome (cliente_nome),
    INDEX idx_vendas_created (created_at)
);

-- 7. Tabela de Itens de Cada Venda
CREATE TABLE IF NOT EXISTS itens_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendas_id INT NOT NULL,
    produtos_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (vendas_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (produtos_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_itens_venda (vendas_id),
    INDEX idx_itens_produto (produtos_id)
);

-- 8. Tabela de Acompanhamento de Pós-Venda (CRM, Follow-up, Trocas e Fidelização)
CREATE TABLE IF NOT EXISTS pos_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendas_id INT NOT NULL,
    usuarios_id INT NOT NULL,
    cliente_id INT DEFAULT NULL,
    status ENUM('Pendente', 'Contatado', 'Satisfeito', 'Troca/Garantia', 'Concluido') DEFAULT 'Pendente',
    satisfacao INT DEFAULT NULL,
    observacoes TEXT,
    data_contato DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendas_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    INDEX idx_pos_venda_usuario (usuarios_id),
    INDEX idx_pos_venda_venda (vendas_id),
    INDEX idx_pos_venda_cliente (cliente_id),
    INDEX idx_pos_venda_status (status)
);
