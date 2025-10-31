-- Adicionar campos horario e participantes na tabela eventos_calendario
ALTER TABLE eventos_calendario 
ADD COLUMN horario TIME,
ADD COLUMN participantes INTEGER;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN eventos_calendario.horario IS 'Horário do evento (formato HH:MM)';
COMMENT ON COLUMN eventos_calendario.participantes IS 'Quantidade de participantes do evento';