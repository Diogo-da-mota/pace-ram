-- Criação da tabela eventos_calendario
-- Esta tabela armazena eventos futuros e competições no calendário

CREATE TABLE eventos_calendario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    data_evento DATE NOT NULL,
    local VARCHAR(200),
    descricao TEXT,
    link_externo VARCHAR(500),
    criado_por UUID REFERENCES usuarios(id),
    publicado BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE eventos_calendario IS 'Tabela de eventos do calendário do Pace Run Hub';
COMMENT ON COLUMN eventos_calendario.id IS 'Identificador único do evento';
COMMENT ON COLUMN eventos_calendario.titulo IS 'Título/nome do evento';
COMMENT ON COLUMN eventos_calendario.data_evento IS 'Data de realização do evento';
COMMENT ON COLUMN eventos_calendario.local IS 'Local de realização do evento';
COMMENT ON COLUMN eventos_calendario.descricao IS 'Descrição detalhada do evento';
COMMENT ON COLUMN eventos_calendario.link_externo IS 'Link para inscrições ou mais informações';
COMMENT ON COLUMN eventos_calendario.criado_por IS 'Usuário que criou o registro';
COMMENT ON COLUMN eventos_calendario.publicado IS 'Status de publicação do evento';
COMMENT ON COLUMN eventos_calendario.criado_em IS 'Data e hora de criação do registro';
COMMENT ON COLUMN eventos_calendario.atualizado_em IS 'Data e hora da última atualização';

-- Índices para otimização de consultas
CREATE INDEX idx_eventos_data ON eventos_calendario(data_evento ASC);
CREATE INDEX idx_eventos_publicado ON eventos_calendario(publicado);
CREATE INDEX idx_eventos_criado_por ON eventos_calendario(criado_por);
CREATE INDEX idx_eventos_titulo ON eventos_calendario USING gin(to_tsvector('portuguese', titulo));
CREATE INDEX idx_eventos_local ON eventos_calendario USING gin(to_tsvector('portuguese', local));
CREATE INDEX idx_eventos_data_publicado ON eventos_calendario(data_evento ASC, publicado);
CREATE INDEX idx_eventos_mes_ano ON eventos_calendario(EXTRACT(YEAR FROM data_evento), EXTRACT(MONTH FROM data_evento));

-- Constraints adicionais
ALTER TABLE eventos_calendario ADD CONSTRAINT check_data_evento_futura_calendario 
    CHECK (data_evento >= CURRENT_DATE);

ALTER TABLE eventos_calendario ADD CONSTRAINT check_link_externo_formato_calendario 
    CHECK (link_externo IS NULL OR link_externo ~ '^https?://.*');

-- Trigger para atualizar automaticamente o campo atualizado_em
CREATE TRIGGER update_eventos_calendario_updated_at
    BEFORE UPDATE ON eventos_calendario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE eventos_calendario ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver eventos publicados
CREATE POLICY "Todos podem ver eventos publicados" ON eventos_calendario
    FOR SELECT USING (publicado = true);

-- Política: Editores e admins podem ver todos os eventos
CREATE POLICY "Editores podem ver todos eventos" ON eventos_calendario
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
    );

-- Política: Editores podem criar eventos
CREATE POLICY "Editores podem criar eventos" ON eventos_calendario
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
        AND criado_por = auth.uid()
    );

-- Política: Criadores podem editar seus próprios eventos
CREATE POLICY "Criadores podem editar próprios eventos" ON eventos_calendario
    FOR UPDATE USING (
        criado_por = auth.uid() OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Política: Apenas admins podem deletar eventos
CREATE POLICY "Apenas admins podem deletar eventos" ON eventos_calendario
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Função para buscar eventos futuros
CREATE OR REPLACE FUNCTION get_eventos_futuros(limite INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    titulo VARCHAR(200),
    data_evento DATE,
    local VARCHAR(200),
    descricao TEXT,
    link_externo VARCHAR(500),
    dias_restantes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id, e.titulo, e.data_evento, e.local, e.descricao, e.link_externo,
        (e.data_evento - CURRENT_DATE)::INTEGER as dias_restantes
    FROM eventos_calendario e
    WHERE e.publicado = true
      AND e.data_evento >= CURRENT_DATE
    ORDER BY e.data_evento ASC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar eventos por mês
CREATE OR REPLACE FUNCTION get_eventos_por_mes(ano INTEGER, mes INTEGER)
RETURNS TABLE(
    id UUID,
    titulo VARCHAR(200),
    data_evento DATE,
    local VARCHAR(200),
    link_externo VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.titulo, e.data_evento, e.local, e.link_externo
    FROM eventos_calendario e
    WHERE e.publicado = true
      AND EXTRACT(YEAR FROM e.data_evento) = ano
      AND EXTRACT(MONTH FROM e.data_evento) = mes
    ORDER BY e.data_evento ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar próximos eventos (próximos 30 dias)
CREATE OR REPLACE FUNCTION get_proximos_eventos()
RETURNS TABLE(
    id UUID,
    titulo VARCHAR(200),
    data_evento DATE,
    local VARCHAR(200),
    link_externo VARCHAR(500),
    dias_restantes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id, e.titulo, e.data_evento, e.local, e.link_externo,
        (e.data_evento - CURRENT_DATE)::INTEGER as dias_restantes
    FROM eventos_calendario e
    WHERE e.publicado = true
      AND e.data_evento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    ORDER BY e.data_evento ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir alguns eventos de exemplo
INSERT INTO eventos_calendario (titulo, data_evento, local, descricao, link_externo, criado_por, publicado) 
SELECT 
    'Maratona Internacional de São Paulo 2024',
    CURRENT_DATE + INTERVAL '45 days',
    'São Paulo, SP',
    'A maior maratona da América Latina com percurso pelos principais pontos turísticos da cidade.',
    'https://maratonasp.com.br',
    u.id,
    true
FROM usuarios u WHERE u.tipo_usuario = 'admin' LIMIT 1;

INSERT INTO eventos_calendario (titulo, data_evento, local, descricao, link_externo, criado_por, publicado) 
SELECT 
    'Corrida de Reis - Rio de Janeiro',
    CURRENT_DATE + INTERVAL '60 days',
    'Rio de Janeiro, RJ',
    'Tradicional corrida de início de ano na cidade maravilhosa.',
    'https://corridadereis.com.br',
    u.id,
    true
FROM usuarios u WHERE u.tipo_usuario = 'admin' LIMIT 1;

INSERT INTO eventos_calendario (titulo, data_evento, local, descricao, link_externo, criado_por, publicado) 
SELECT 
    'Trail Run Serra da Mantiqueira',
    CURRENT_DATE + INTERVAL '75 days',
    'Campos do Jordão, SP',
    'Corrida em trilha com paisagens deslumbrantes da Serra da Mantiqueira.',
    'https://trailmantiqueira.com.br',
    u.id,
    true
FROM usuarios u WHERE u.tipo_usuario = 'admin' LIMIT 1;