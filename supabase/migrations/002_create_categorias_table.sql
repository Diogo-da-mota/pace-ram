-- Criação da tabela categorias
-- Esta tabela armazena as categorias de corridas disponíveis no sistema

CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    cor_hex VARCHAR(7) DEFAULT '#3B82F6',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE categorias IS 'Tabela de categorias de corridas do Pace Run Hub';
COMMENT ON COLUMN categorias.id IS 'Identificador único da categoria';
COMMENT ON COLUMN categorias.nome IS 'Nome único da categoria';
COMMENT ON COLUMN categorias.descricao IS 'Descrição detalhada da categoria';
COMMENT ON COLUMN categorias.cor_hex IS 'Cor em hexadecimal para identificação visual';
COMMENT ON COLUMN categorias.ativo IS 'Status ativo/inativo da categoria';
COMMENT ON COLUMN categorias.criado_em IS 'Data e hora de criação do registro';

-- Índices para otimização de consultas
CREATE INDEX idx_categorias_nome ON categorias(nome);
CREATE INDEX idx_categorias_ativo ON categorias(ativo);
CREATE INDEX idx_categorias_criado_em ON categorias(criado_em);

-- Constraint para validar formato da cor hexadecimal
ALTER TABLE categorias ADD CONSTRAINT check_cor_hex_format 
    CHECK (cor_hex ~ '^#[0-9A-Fa-f]{6}$');

-- Inserir categorias padrão do sistema
INSERT INTO categorias (nome, descricao, cor_hex) VALUES
('Maratona', 'Corridas de 42,195 km - A distância clássica olímpica', '#E11D48'),
('Meia Maratona', 'Corridas de 21,097 km - Metade da distância da maratona', '#3B82F6'),
('10K', 'Corridas de 10 quilômetros - Distância popular para iniciantes', '#10B981'),
('5K', 'Corridas de 5 quilômetros - Ideal para iniciantes', '#F59E0B'),
('Trail Run', 'Corridas em trilhas e montanhas - Contato com a natureza', '#8B5CF6'),
('Corrida Rústica', 'Corridas em terrenos variados - Desafio misto', '#EF4444'),
('Corrida Noturna', 'Corridas realizadas à noite - Experiência única', '#6366F1'),
('Ultramaratona', 'Corridas acima de 42,195 km - Para atletas experientes', '#DC2626'),
('Corrida de Rua', 'Corridas urbanas em asfalto - Modalidade tradicional', '#059669'),
('Corrida Infantil', 'Corridas para crianças e adolescentes', '#F97316');

-- Habilitar Row Level Security
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem visualizar categorias ativas
CREATE POLICY "Todos podem ver categorias ativas" ON categorias
    FOR SELECT USING (ativo = true);

-- Política: Admins e editores podem ver todas as categorias
CREATE POLICY "Admins e editores podem ver todas categorias" ON categorias
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
    );

-- Política: Apenas admins podem gerenciar categorias
CREATE POLICY "Apenas admins podem gerenciar categorias" ON categorias
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Função para buscar categorias ativas
CREATE OR REPLACE FUNCTION get_categorias_ativas()
RETURNS TABLE(
    id UUID,
    nome VARCHAR(100),
    descricao TEXT,
    cor_hex VARCHAR(7)
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nome, c.descricao, c.cor_hex
    FROM categorias c
    WHERE c.ativo = true
    ORDER BY c.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;