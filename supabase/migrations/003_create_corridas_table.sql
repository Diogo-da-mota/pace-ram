-- Criação da tabela corridas
-- Esta tabela armazena informações sobre as corridas/eventos esportivos

CREATE TABLE corridas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    data_evento DATE NOT NULL,
    local VARCHAR(200) NOT NULL,
    descricao TEXT,
    imagem_principal VARCHAR(500),
    link_externo VARCHAR(500),
    texto_rodape VARCHAR(100),
    categoria_id UUID REFERENCES categorias(id),
    criado_por UUID REFERENCES usuarios(id),
    publicado BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE corridas IS 'Tabela de corridas e eventos esportivos do Pace Run Hub';
COMMENT ON COLUMN corridas.id IS 'Identificador único da corrida';
COMMENT ON COLUMN corridas.titulo IS 'Título/nome da corrida';
COMMENT ON COLUMN corridas.data_evento IS 'Data de realização da corrida';
COMMENT ON COLUMN corridas.local IS 'Local de realização da corrida';
COMMENT ON COLUMN corridas.descricao IS 'Descrição detalhada da corrida';
COMMENT ON COLUMN corridas.imagem_principal IS 'URL da imagem principal da corrida';
COMMENT ON COLUMN corridas.link_externo IS 'Link para inscrições ou mais informações';
COMMENT ON COLUMN corridas.texto_rodape IS 'Texto adicional para o rodapé do card';
COMMENT ON COLUMN corridas.categoria_id IS 'Referência para a categoria da corrida';
COMMENT ON COLUMN corridas.criado_por IS 'Usuário que criou o registro';
COMMENT ON COLUMN corridas.publicado IS 'Status de publicação da corrida';
COMMENT ON COLUMN corridas.criado_em IS 'Data e hora de criação do registro';
COMMENT ON COLUMN corridas.atualizado_em IS 'Data e hora da última atualização';

-- Índices para otimização de consultas
CREATE INDEX idx_corridas_data_evento ON corridas(data_evento DESC);
CREATE INDEX idx_corridas_publicado ON corridas(publicado);
CREATE INDEX idx_corridas_categoria ON corridas(categoria_id);
CREATE INDEX idx_corridas_criado_por ON corridas(criado_por);
CREATE INDEX idx_corridas_titulo ON corridas USING gin(to_tsvector('portuguese', titulo));
CREATE INDEX idx_corridas_local ON corridas USING gin(to_tsvector('portuguese', local));
CREATE INDEX idx_corridas_data_publicado ON corridas(data_evento DESC, publicado);

-- Constraints adicionais
ALTER TABLE corridas ADD CONSTRAINT check_data_evento_futura 
    CHECK (data_evento >= CURRENT_DATE - INTERVAL '1 year');

ALTER TABLE corridas ADD CONSTRAINT check_url_imagem_formato 
    CHECK (imagem_principal IS NULL OR imagem_principal ~ '^https?://.*\.(jpg|jpeg|png|webp)$');

ALTER TABLE corridas ADD CONSTRAINT check_link_externo_formato 
    CHECK (link_externo IS NULL OR link_externo ~ '^https?://.*');

-- Trigger para atualizar automaticamente o campo atualizado_em
CREATE TRIGGER update_corridas_updated_at
    BEFORE UPDATE ON corridas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE corridas ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver corridas publicadas
CREATE POLICY "Todos podem ver corridas publicadas" ON corridas
    FOR SELECT USING (publicado = true);

-- Política: Editores e admins podem ver todas as corridas
CREATE POLICY "Editores podem ver todas corridas" ON corridas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
    );

-- Política: Editores podem criar corridas
CREATE POLICY "Editores podem criar corridas" ON corridas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
        AND criado_por = auth.uid()
    );

-- Política: Criadores podem editar suas próprias corridas
CREATE POLICY "Criadores podem editar próprias corridas" ON corridas
    FOR UPDATE USING (
        criado_por = auth.uid() OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Política: Apenas admins podem deletar corridas
CREATE POLICY "Apenas admins podem deletar corridas" ON corridas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Função para buscar corridas publicadas com informações da categoria
CREATE OR REPLACE FUNCTION get_corridas_publicadas(limite INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    titulo VARCHAR(200),
    data_evento DATE,
    local VARCHAR(200),
    descricao TEXT,
    imagem_principal VARCHAR(500),
    link_externo VARCHAR(500),
    texto_rodape VARCHAR(100),
    categoria_nome VARCHAR(100),
    categoria_cor VARCHAR(7),
    criado_em TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.titulo, c.data_evento, c.local, c.descricao,
        c.imagem_principal, c.link_externo, c.texto_rodape,
        cat.nome as categoria_nome, cat.cor_hex as categoria_cor,
        c.criado_em
    FROM corridas c
    LEFT JOIN categorias cat ON c.categoria_id = cat.id
    WHERE c.publicado = true
    ORDER BY c.data_evento DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar corridas por categoria
CREATE OR REPLACE FUNCTION get_corridas_por_categoria(categoria_nome VARCHAR)
RETURNS TABLE(
    id UUID,
    titulo VARCHAR(200),
    data_evento DATE,
    local VARCHAR(200),
    imagem_principal VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.titulo, c.data_evento, c.local, c.imagem_principal
    FROM corridas c
    JOIN categorias cat ON c.categoria_id = cat.id
    WHERE c.publicado = true 
      AND cat.nome ILIKE categoria_nome
      AND cat.ativo = true
    ORDER BY c.data_evento DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;