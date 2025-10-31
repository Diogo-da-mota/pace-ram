-- Script para executar manualmente no painel do Supabase
-- Para corrigir o erro da coluna titulo_secao na tabela redes_sociais

-- 1. Adicionar a coluna titulo_secao se ela não existir
ALTER TABLE public.redes_sociais 
ADD COLUMN IF NOT EXISTS titulo_secao TEXT;

-- 2. Atualizar registros existentes com um valor padrão
UPDATE public.redes_sociais 
SET titulo_secao = 'REDES SOCIAIS' 
WHERE titulo_secao IS NULL;

-- 3. Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'redes_sociais' 
AND table_schema = 'public'
ORDER BY ordinal_position;