-- Migração para adicionar campo distancia na tabela eventos_calendario
-- Esta migração adiciona apenas o campo que está faltando para evitar conflitos

-- Adicionar coluna distancia na tabela eventos_calendario
ALTER TABLE eventos_calendario 
ADD COLUMN IF NOT EXISTS distancia VARCHAR(50);

-- Adicionar constraint para validar os valores de distância permitidos
ALTER TABLE eventos_calendario 
ADD CONSTRAINT IF NOT EXISTS eventos_calendario_distancia_check 
CHECK (distancia IN (
  'caminhada', 
  '3k', 
  '5k', 
  '6k', 
  '7k', 
  '8k', 
  '10k', 
  '15k', 
  '21k', 
  '42k'
));

-- Criar índice para melhorar performance nas consultas por distância
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_distancia 
ON eventos_calendario(distancia);

-- Comentário na coluna para documentação
COMMENT ON COLUMN eventos_calendario.distancia IS 'Distância da corrida: caminhada, 3k, 5k, 6k, 7k, 8k, 10k, 15k, 21k (meia maratona), 42k (maratona)';

-- Atualizar eventos existentes com valor padrão (opcional)
-- UPDATE eventos_calendario 
-- SET distancia = '10k' 
-- WHERE distancia IS NULL;