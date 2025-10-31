-- Adicionar coluna titulo_secao à tabela redes_sociais
ALTER TABLE public.redes_sociais 
ADD COLUMN IF NOT EXISTS titulo_secao TEXT;

-- Atualizar registros existentes com um valor padrão se necessário
UPDATE public.redes_sociais 
SET titulo_secao = 'REDES SOCIAIS' 
WHERE titulo_secao IS NULL;