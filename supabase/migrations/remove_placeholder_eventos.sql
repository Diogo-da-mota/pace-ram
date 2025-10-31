-- Migração para remover dados placeholder/exemplo da tabela eventos_calendario
-- Data: 2025-01-11
-- Objetivo: Manter apenas dados reais criados pelos usuários

-- Remover eventos de exemplo inseridos pela migração inicial
DELETE FROM eventos_calendario 
WHERE titulo IN (
    'Maratona Internacional de São Paulo 2024',
    'Corrida de Reis - Rio de Janeiro', 
    'Trail Run Serra da Mantiqueira'
);

-- Comentário para documentar a remoção
COMMENT ON TABLE eventos_calendario IS 'Tabela de eventos do calendário - dados placeholder removidos em 2025-01-11';