-- Criar tabela redes_sociais
CREATE TABLE IF NOT EXISTS public.redes_sociais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    link TEXT NOT NULL,
    icone TEXT NOT NULL CHECK (icone IN ('instagram', 'whatsapp', 'link', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok', 'discord', 'telegram', 'pinterest', 'snapchat')),
    titulo_secao TEXT,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.redes_sociais ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários podem ver suas próprias redes sociais" ON public.redes_sociais
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir suas próprias redes sociais" ON public.redes_sociais
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias redes sociais" ON public.redes_sociais
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias redes sociais" ON public.redes_sociais
    FOR DELETE USING (auth.uid() = usuario_id);

-- Política para permitir leitura pública (para exibir na página inicial)
CREATE POLICY "Permitir leitura pública de redes sociais" ON public.redes_sociais
    FOR SELECT USING (true);

-- Conceder permissões básicas
GRANT SELECT ON public.redes_sociais TO anon;
GRANT ALL PRIVILEGES ON public.redes_sociais TO authenticated;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_redes_sociais_usuario_id ON public.redes_sociais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_redes_sociais_created_at ON public.redes_sociais(created_at);