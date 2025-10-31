-- Adicionar campos 'status' e 'regiao' à tabela eventos_calendario
-- Migração para melhorias do sistema de calendário

-- Adicionar campo status com valores permitidos e valor padrão
ALTER TABLE eventos_calendario 
ADD COLUMN status VARCHAR(20) DEFAULT 'inscricoes_abertas' 
CHECK (status IN ('inscricoes_abertas', 'em_andamento', 'encerrado'));

-- Adicionar campo regiao
ALTER TABLE eventos_calendario 
ADD COLUMN regiao VARCHAR(100);

-- Criar índices para otimizar consultas com filtros
CREATE INDEX idx_eventos_calendario_status ON eventos_calendario(status);
CREATE INDEX idx_eventos_calendario_regiao ON eventos_calendario(regiao);
CREATE INDEX idx_eventos_calendario_data_status ON eventos_calendario(data_evento, status);

-- Atualizar eventos existentes com status padrão
UPDATE eventos_calendario 
SET status = 'inscricoes_abertas' 
WHERE status IS NULL;

-- Configurar permissões RLS para novos campos
-- Permitir leitura pública dos novos campos
GRANT SELECT ON eventos_calendario TO anon;
GRANT SELECT ON eventos_calendario TO authenticated;

-- Permitir inserção/atualização apenas para usuários autenticados
GRANT INSERT, UPDATE, DELETE ON eventos_calendario TO authenticated;

-- Comentários para documentação
COMMENT ON COLUMN eventos_calendario.status IS 'Status do evento: inscricoes_abertas, em_andamento, encerrado';
COMMENT ON COLUMN eventos_calendario.regiao IS 'Região onde o evento será realizado';