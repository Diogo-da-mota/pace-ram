-- Script para renomear tabela usuarios existente e criar nova estrutura para Pace Run Hub
-- Executado em: $(date)

-- Renomear tabela usuarios existente para preservar dados
ALTER TABLE usuarios RENAME TO usuarios_old;

-- Comentário explicativo
COMMENT ON TABLE usuarios_old IS 'Tabela usuarios original renomeada para preservar dados existentes';