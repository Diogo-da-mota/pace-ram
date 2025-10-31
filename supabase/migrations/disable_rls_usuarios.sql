-- Desabilitar temporariamente RLS na tabela usuarios para permitir inserção

-- Desabilitar RLS
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Garantir permissões básicas
GRANT ALL PRIVILEGES ON usuarios TO authenticated;
GRANT SELECT ON usuarios TO anon;

-- Comentário
COMMENT ON TABLE usuarios IS 'RLS temporariamente desabilitado para permitir inserção de usuários';