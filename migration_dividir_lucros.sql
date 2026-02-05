-- Adiciona coluna para controlar divisão de lucros
ALTER TABLE public.venda_eventos 
ADD COLUMN dividir_lucros BOOLEAN DEFAULT TRUE;

-- Atualiza registros existentes para manter o comportamento padrão
UPDATE public.venda_eventos 
SET dividir_lucros = TRUE 
WHERE dividir_lucros IS NULL;
