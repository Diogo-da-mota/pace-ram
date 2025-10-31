-- Correcao do trigger para a tabela outros_conteudos
-- Remove trigger incorreto se existir e cria o trigger correto

-- Remove o trigger se existir (para casos onde foi criado incorretamente)
DROP TRIGGER IF EXISTS update_outros_conteudos_updated_at ON outros_conteudos;

-- Verifica se a funcao update_updated_at_column existe antes de criar o trigger
DO $$
BEGIN
    -- Verifica se a funcao existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column' 
        AND pg_function_is_visible(oid)
    ) THEN
        -- Cria o trigger se a funcao existir
        EXECUTE '
            CREATE TRIGGER update_outros_conteudos_updated_at
                BEFORE UPDATE ON outros_conteudos
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ';
        
        RAISE NOTICE 'Trigger update_outros_conteudos_updated_at criado com sucesso';
    ELSE
        RAISE EXCEPTION 'Funcao update_updated_at_column() nao encontrada. Verifique se a migracao 001_create_usuarios_table.sql foi executada.';
    END IF;
END
$$;

-- Comentario sobre o trigger
COMMENT ON TRIGGER update_outros_conteudos_updated_at ON outros_conteudos IS 'Trigger para atualizar automaticamente o campo atualizado_em';