-- Criação da tabela outros_conteudos
-- Esta tabela armazena outros tipos de conteúdo diversos

CREATE TABLE outros_conteudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    link_externo VARCHAR(500),
    criado_por UUID REFERENCES usuarios(id),
    publicado BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE outros_conteudos IS 'Tabela de outros conteúdos diversos do Pace Run Hub';
COMMENT ON COLUMN outros_conteudos.id IS 'Identificador único do conteúdo';
COMMENT ON COLUMN outros_conteudos.titulo IS 'Título/nome do conteúdo';
COMMENT ON COLUMN outros_conteudos.link_externo IS 'Link externo relacionado ao conteúdo';
COMMENT ON COLUMN outros_conteudos.criado_por IS 'Usuário que criou o registro';
COMMENT ON COLUMN outros_conteudos.publicado IS 'Status de publicação do conteúdo';
COMMENT ON COLUMN outros_conteudos.criado_em IS 'Data e hora de criação do registro';
COMMENT ON COLUMN outros_conteudos.atualizado_em IS 'Data e hora da última atualização';

-- Índices para otimização de consultas
CREATE INDEX idx_outros_publicado ON outros_conteudos(publicado);
CREATE INDEX idx_outros_criado_por ON outros_conteudos(criado_por);
CREATE INDEX idx_outros_titulo ON outros_conteudos USING gin(to_tsvector('portuguese', titulo));
CREATE INDEX idx_outros_criado_em ON outros_conteudos(criado_em DESC);

-- Constraints adicionais
ALTER TABLE outros_conteudos ADD CONSTRAINT check_link_externo_formato_outros 
    CHECK (link_externo IS NULL OR link_externo ~ '^https?://.*');

-- Trigger será criado em migração separada para evitar problemas de dependência

-- Habilitar Row Level Security
ALTER TABLE outros_conteudos ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver conteúdos publicados
CREATE POLICY "Todos podem ver conteúdos publicados" ON outros_conteudos
    FOR SELECT USING (publicado = true);

-- Política: Editores e admins podem ver todos os conteúdos
CREATE POLICY "Editores podem ver todos conteúdos" ON outros_conteudos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
    );

-- Política: Editores podem criar conteúdos
CREATE POLICY "Editores podem criar conteúdos" ON outros_conteudos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'editor')
        )
        AND criado_por = auth.uid()
    );

-- Política: Criadores podem editar seus próprios conteúdos
CREATE POLICY "Criadores podem editar próprios conteúdos" ON outros_conteudos
    FOR UPDATE USING (
        criado_por = auth.uid() OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Política: Apenas admins podem deletar conteúdos
CREATE POLICY "Apenas admins podem deletar conteúdos" ON outros_conteudos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Função para buscar conteúdos publicados
CREATE OR REPLACE FUNCTION get_outros_conteudos_publicados(limite INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    titulo VARCHAR(200),
    link_externo VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id, o.titulo, o.link_externo, o.criado_em
    FROM outros_conteudos o
    WHERE o.publicado = true
    ORDER BY o.criado_em DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir alguns conteúdos de exemplo
INSERT INTO outros_conteudos (titulo, link_externo, criado_por, publicado) 
SELECT 
    'Dicas de Nutrição para Corredores',
    'https://exemplo.com/nutricao-corredores',
    u.id,
    true
FROM usuarios u WHERE u.tipo_usuario = 'admin' LIMIT 1;

INSERT INTO outros_conteudos (titulo, link_externo, criado_por, publicado) 
SELECT 
    'Equipamentos Essenciais para Running',
    'https://exemplo.com/equipamentos-running',
    u.id,
    true
FROM usuarios u WHERE u.tipo_usuario = 'admin' LIMIT 1;

INSERT INTO outros_conteudos (titulo, link_externo, criado_por, publicado) 
SELECT 
    'Como Evitar Lesões na Corrida',
    'https://exemplo.com/evitar-lesoes',
    u.id,
    true
FROM usuarios u WHERE u.tipo_usuario = 'admin' LIMIT 1;