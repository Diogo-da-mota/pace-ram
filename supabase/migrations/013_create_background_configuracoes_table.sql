-- Criar tabela background_configuracoes
CREATE TABLE IF NOT EXISTS background_configuracoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_dispositivo VARCHAR(20) NOT NULL CHECK (tipo_dispositivo IN ('desktop', 'mobile', 'tablet')),
    url_imagem TEXT NOT NULL,
    posicao_x INTEGER DEFAULT 50,
    posicao_y INTEGER DEFAULT 50,
    zoom DECIMAL(3,2) DEFAULT 1.0,
    opacidade DECIMAL(3,2) DEFAULT 1.0 CHECK (opacidade >= 0 AND opacidade <= 1),
    ativo BOOLEAN DEFAULT true,
    criado_por UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_background_configuracoes_tipo_dispositivo ON background_configuracoes(tipo_dispositivo);
CREATE INDEX idx_background_configuracoes_ativo ON background_configuracoes(ativo);
CREATE INDEX idx_background_configuracoes_criado_por ON background_configuracoes(criado_por);

-- Criar trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_background_configuracoes_updated_at 
    BEFORE UPDATE ON background_configuracoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE background_configuracoes ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: permitir leitura pública apenas se ativo = true ou se o usuário for proprietário
CREATE POLICY "Permitir leitura de backgrounds ativos ou próprios" ON background_configuracoes
    FOR SELECT USING (
        ativo = true OR criado_por = auth.uid()
    );

-- Política para INSERT: permitir apenas usuários autenticados criarem seus próprios registros
CREATE POLICY "Permitir inserção apenas para usuários autenticados" ON background_configuracoes
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND criado_por = auth.uid()
    );

-- Política para UPDATE: permitir apenas proprietários atualizarem seus registros
CREATE POLICY "Permitir atualização apenas para proprietários" ON background_configuracoes
    FOR UPDATE USING (
        criado_por = auth.uid()
    ) WITH CHECK (
        criado_por = auth.uid()
    );

-- Política para DELETE: permitir apenas proprietários deletarem seus registros
CREATE POLICY "Permitir exclusão apenas para proprietários" ON background_configuracoes
    FOR DELETE USING (
        criado_por = auth.uid()
    );

-- Comentários para documentação
COMMENT ON TABLE background_configuracoes IS 'Configurações de imagens de background para diferentes dispositivos';
COMMENT ON COLUMN background_configuracoes.tipo_dispositivo IS 'Tipo de dispositivo: desktop, mobile ou tablet';
COMMENT ON COLUMN background_configuracoes.url_imagem IS 'URL da imagem no Supabase Storage';
COMMENT ON COLUMN background_configuracoes.posicao_x IS 'Posição horizontal da imagem (0-100)';
COMMENT ON COLUMN background_configuracoes.posicao_y IS 'Posição vertical da imagem (0-100)';
COMMENT ON COLUMN background_configuracoes.zoom IS 'Nível de zoom da imagem (0.1-5.0)';
COMMENT ON COLUMN background_configuracoes.opacidade IS 'Opacidade da imagem (0.0-1.0)';
COMMENT ON COLUMN background_configuracoes.ativo IS 'Se a configuração está ativa';