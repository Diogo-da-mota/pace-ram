-- Migração para adicionar campo distancia na tabela eventos_calendario
-- Adiciona coluna distancia como TEXT para suportar JSON array

-- Adicionar coluna distancia se não existir
ALTER TABLE eventos_calendario 
ADD COLUMN IF NOT EXISTS distancia TEXT;

-- Comentário na coluna
COMMENT ON COLUMN eventos_calendario.distancia IS 'Array JSON de distâncias da corrida: ["caminhada", "3k", "5k", "6k", "7k", "8k", "10k", "15k", "21k", "42k"]';