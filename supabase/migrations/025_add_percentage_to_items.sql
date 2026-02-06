-- Adicionar coluna de porcentagem na tabela venda_itens
ALTER TABLE venda_itens
ADD COLUMN IF NOT EXISTS porcentagem DECIMAL(5,2) DEFAULT 50.00;

-- Atualizar registros existentes de sócios para ter 50%
UPDATE venda_itens
SET porcentagem = 50.00
WHERE tipo = 'socio' AND porcentagem IS NULL;
