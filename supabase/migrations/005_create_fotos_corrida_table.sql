-- Criação da tabela fotos_corrida
-- Esta tabela armazena as fotos das corridas com sistema de aprovação

CREATE TABLE fotos_corrida (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corrida_id UUID REFERENCES corridas(id) ON DELETE CASCADE,
    url_foto VARCHAR(500) NOT NULL,
    titulo VARCHAR(200),
    descricao TEXT,
    numero_peito VARCHAR(20),
    enviado_por UUID REFERENCES usuarios(id),
    aprovado BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE fotos_corrida IS 'Tabela de fotos das corridas do Pace Run Hub';
COMMENT ON COLUMN fotos_corrida.id IS 'Identificador único da foto';
COMMENT ON COLUMN fotos_corrida.corrida_id IS 'Referência para a corrida relacionada';
COMMENT ON COLUMN fotos_corrida.url_foto IS 'URL da foto armazenada';
COMMENT ON COLUMN fotos_corrida.titulo IS 'Título opcional da foto';
COMMENT ON COLUMN fotos_corrida.descricao IS 'Descrição opcional da foto';
COMMENT ON COLUMN fotos_corrida.numero_peito IS 'Número do peito do corredor (para busca)';
COMMENT ON COLUMN fotos_corrida.enviado_por IS 'Usuário que enviou a foto';
COMMENT ON COLUMN fotos_corrida.aprovado IS 'Status de aprovação da foto';
COMMENT ON COLUMN fotos_corrida.criado_em IS 'Data e hora de criação do registro';

-- Índices para otimização de consultas
CREATE INDEX idx_fotos_corrida_id ON fotos_corrida(corrida_id);
CREATE INDEX idx_fotos_aprovado ON fotos_corrida(aprovado);
CREATE INDEX idx_fotos_numero_peito ON fotos_corrida(numero_peito);
CREATE INDEX idx_fotos_enviado_por ON fotos_corrida(enviado_por);
CREATE INDEX idx_fotos_criado_em ON fotos_corrida(criado_em DESC);
CREATE INDEX idx_fotos_corrida_aprovado ON fotos_corrida(corrida_id, aprovado);
CREATE INDEX idx_fotos_numero_peito_corrida ON fotos_corrida(corrida_id, numero_peito) WHERE numero_peito IS NOT NULL;

-- Constraints adicionais
ALTER TABLE fotos_corrida ADD CONSTRAINT check_url_foto_formato 
    CHECK (url_foto ~ '^https?://.*\.(jpg|jpeg|png|webp)$');

ALTER TABLE fotos_corrida ADD CONSTRAINT check_numero_peito_formato 
    CHECK (numero_peito IS NULL OR numero_peito ~ '^[0-9A-Za-z-]+$');

-- Habilitar Row Level Security
ALTER TABLE fotos_corrida ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver fotos aprovadas
CREATE POLICY "Todos podem ver fotos aprovadas" ON fotos_corrida
    FOR SELECT USING (aprovado = true);

-- Política: Editores e admins podem ver todas as fotos
CREATE POLICY "Editores podem ver todas fotos" ON fotos_corrida
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
    );

-- Política: Usuários autenticados podem enviar fotos
CREATE POLICY "Usuários podem enviar fotos" ON fotos_corrida
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND enviado_por = auth.uid()
    );

-- Política: Usuários podem ver suas próprias fotos
CREATE POLICY "Usuários podem ver próprias fotos" ON fotos_corrida
    FOR SELECT USING (enviado_por = auth.uid());

-- Política: Editores podem aprovar/reprovar fotos
CREATE POLICY "Editores podem gerenciar fotos" ON fotos_corrida
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
    );

-- Política: Apenas admins podem deletar fotos
CREATE POLICY "Apenas admins podem deletar fotos" ON fotos_corrida
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Função para buscar fotos aprovadas de uma corrida
CREATE OR REPLACE FUNCTION get_fotos_corrida(corrida_uuid UUID)
RETURNS TABLE(
    id UUID,
    url_foto VARCHAR(500),
    titulo VARCHAR(200),
    descricao TEXT,
    numero_peito VARCHAR(20),
    criado_em TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id, f.url_foto, f.titulo, f.descricao, f.numero_peito, f.criado_em
    FROM fotos_corrida f
    WHERE f.corrida_id = corrida_uuid
      AND f.aprovado = true
    ORDER BY f.criado_em DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar fotos por número do peito
CREATE OR REPLACE FUNCTION get_fotos_por_numero_peito(corrida_uuid UUID, numero VARCHAR)
RETURNS TABLE(
    id UUID,
    url_foto VARCHAR(500),
    titulo VARCHAR(200),
    descricao TEXT,
    numero_peito VARCHAR(20),
    criado_em TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id, f.url_foto, f.titulo, f.descricao, f.numero_peito, f.criado_em
    FROM fotos_corrida f
    WHERE f.corrida_id = corrida_uuid
      AND f.aprovado = true
      AND f.numero_peito ILIKE '%' || numero || '%'
    ORDER BY f.criado_em DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar fotos pendentes de aprovação
CREATE OR REPLACE FUNCTION get_fotos_pendentes_aprovacao()
RETURNS TABLE(
    id UUID,
    corrida_id UUID,
    corrida_titulo VARCHAR(200),
    url_foto VARCHAR(500),
    titulo VARCHAR(200),
    numero_peito VARCHAR(20),
    enviado_por_nome VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id, f.corrida_id, c.titulo as corrida_titulo,
        f.url_foto, f.titulo, f.numero_peito,
        u.nome as enviado_por_nome, f.criado_em
    FROM fotos_corrida f
    JOIN corridas c ON f.corrida_id = c.id
    JOIN usuarios u ON f.enviado_por = u.id
    WHERE f.aprovado = false
    ORDER BY f.criado_em ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aprovar foto
CREATE OR REPLACE FUNCTION aprovar_foto(foto_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    usuario_tipo VARCHAR(20);
BEGIN
    -- Verificar se o usuário é admin ou editor
    SELECT tipo_usuario INTO usuario_tipo
    FROM usuarios
    WHERE id = auth.uid();
    
    IF usuario_tipo NOT IN ('admin', 'editor') THEN
        RETURN FALSE;
    END IF;
    
    -- Aprovar a foto
    UPDATE fotos_corrida
    SET aprovado = true
    WHERE id = foto_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para reprovar foto
CREATE OR REPLACE FUNCTION reprovar_foto(foto_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    usuario_tipo VARCHAR(20);
BEGIN
    -- Verificar se o usuário é admin ou editor
    SELECT tipo_usuario INTO usuario_tipo
    FROM usuarios
    WHERE id = auth.uid();
    
    IF usuario_tipo NOT IN ('admin', 'editor') THEN
        RETURN FALSE;
    END IF;
    
    -- Reprovar a foto (deletar)
    DELETE FROM fotos_corrida
    WHERE id = foto_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar fotos por corrida
CREATE OR REPLACE FUNCTION count_fotos_corrida(corrida_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_fotos INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_fotos
    FROM fotos_corrida
    WHERE corrida_id = corrida_uuid
      AND aprovado = true;
    
    RETURN COALESCE(total_fotos, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;