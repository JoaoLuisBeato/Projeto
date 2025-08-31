-- Esquema do Sistema de Gestão de Equipamentos e Manutenção

-- Tabela de Equipamentos
CREATE TABLE equipamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    modelo VARCHAR(100),
    fabricante VARCHAR(100),
    numero_serie VARCHAR(100),
    categoria VARCHAR(50),
    localizacao VARCHAR(100),
    status ENUM('ativo', 'inativo', 'manutencao', 'defeito') DEFAULT 'ativo',
    data_aquisicao DATE,
    valor_aquisicao DECIMAL(10,2),
    garantia_ate DATE,
    especificacoes_tecnicas TEXT,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Manutenções
CREATE TABLE manutencoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipamento_id INT NOT NULL,
    tipo ENUM('preventiva', 'corretiva', 'calibracao') NOT NULL,
    descricao TEXT NOT NULL,
    data_agendada DATE,
    data_realizada DATE,
    status ENUM('agendada', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'agendada',
    prioridade ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
    responsavel VARCHAR(100),
    fornecedor VARCHAR(100),
    custo DECIMAL(10,2),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- Tabela de Histórico de Manutenções
CREATE TABLE historico_manutencoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipamento_id INT NOT NULL,
    manutencao_id INT,
    tipo_acao ENUM('criacao', 'atualizacao', 'conclusao', 'cancelamento') NOT NULL,
    descricao TEXT,
    usuario VARCHAR(100),
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (manutencao_id) REFERENCES manutencoes(id) ON DELETE SET NULL
);

-- Tabela de Calendário de Manutenções
CREATE TABLE calendario_manutencoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipamento_id INT NOT NULL,
    tipo_manutencao ENUM('preventiva', 'calibracao') NOT NULL,
    frequencia_dias INT NOT NULL,
    ultima_realizada DATE,
    proxima_agendada DATE,
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- Tabela de Relatórios de Equipamentos
CREATE TABLE relatorios_equipamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipamento_id INT NOT NULL,
    tipo_relatorio ENUM('status', 'manutencao', 'calibracao', 'inventario') NOT NULL,
    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dados_relatorio JSON,
    gerado_por VARCHAR(100),
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX idx_equipamentos_status ON equipamentos(status);
CREATE INDEX idx_equipamentos_categoria ON equipamentos(categoria);
CREATE INDEX idx_manutencoes_status ON manutencoes(status);
CREATE INDEX idx_manutencoes_data_agendada ON manutencoes(data_agendada);
CREATE INDEX idx_calendario_proxima_agendada ON calendario_manutencoes(proxima_agendada);

-- Inserir dados de exemplo
INSERT INTO equipamentos (codigo, nome, modelo, fabricante, categoria, localizacao, status, data_aquisicao, valor_aquisicao) VALUES
('HPLC-001', 'Cromatógrafo Líquido', 'LC-20AT', 'Shimadzu', 'HPLC', 'Laboratório A - Sala 101', 'ativo', '2023-01-15', 150000.00),
('ESP-001', 'Espectrofotômetro UV-Vis', 'UV-1800', 'Shimadzu', 'Espectrômetro', 'Laboratório B - Sala 102', 'ativo', '2023-02-20', 45000.00),
('BAL-001', 'Balança Analítica', 'AUY220', 'Shimadzu', 'Balança', 'Laboratório A - Sala 101', 'manutencao', '2022-11-10', 12000.00),
('MIC-001', 'Microscópio Óptico', 'BX53', 'Olympus', 'Microscópio', 'Laboratório C - Sala 103', 'ativo', '2023-03-05', 35000.00),
('PH-001', 'pHmetro', 'pH-100', 'Hanna Instruments', 'pHmetro', 'Laboratório B - Sala 102', 'ativo', '2022-12-15', 2500.00);

-- Inserir manutenções de exemplo
INSERT INTO manutencoes (equipamento_id, tipo, descricao, data_agendada, status, prioridade, responsavel) VALUES
(3, 'corretiva', 'Problema na calibração - erro de 0.5g', '2024-01-15', 'agendada', 'alta', 'Técnico João Silva'),
(1, 'preventiva', 'Manutenção preventiva trimestral - troca de filtros e limpeza', '2024-01-20', 'agendada', 'media', 'Técnico Maria Santos'),
(2, 'calibracao', 'Calibração anual do espectrofotômetro', '2024-02-01', 'agendada', 'media', 'Fornecedor Shimadzu');

-- Inserir calendário de manutenções
INSERT INTO calendario_manutencoes (equipamento_id, tipo_manutencao, frequencia_dias, ultima_realizada, proxima_agendada) VALUES
(1, 'preventiva', 90, '2023-10-15', '2024-01-15'),
(2, 'calibracao', 365, '2023-02-20', '2024-02-20'),
(3, 'preventiva', 180, '2023-07-10', '2024-01-10');



