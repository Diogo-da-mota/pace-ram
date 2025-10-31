-- Configuração de permissões para roles anon e authenticated
-- Este script garante que os roles tenham as permissões necessárias para acessar as tabelas

-- Permissões para a tabela usuarios
-- Role anon: apenas SELECT para login/verificação
GRANT SELECT ON usuarios TO anon;
-- Role authenticated: SELECT, UPDATE (para perfil próprio)
GRANT SELECT, UPDATE ON usuarios TO authenticated;

-- Permissões para a tabela categorias
-- Role anon: SELECT para visualizar categorias públicas
GRANT SELECT ON categorias TO anon;
-- Role authenticated: SELECT para visualizar categorias
GRANT SELECT ON categorias TO authenticated;

-- Permissões para a tabela corridas
-- Role anon: SELECT para visualizar corridas publicadas
GRANT SELECT ON corridas TO anon;
-- Role authenticated: SELECT, INSERT, UPDATE, DELETE (controlado por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON corridas TO authenticated;

-- Permissões para a tabela eventos_calendario
-- Role anon: SELECT para visualizar eventos publicados
GRANT SELECT ON eventos_calendario TO anon;
-- Role authenticated: SELECT, INSERT, UPDATE, DELETE (controlado por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON eventos_calendario TO authenticated;

-- Permissões para a tabela fotos_corrida
-- Role anon: SELECT para visualizar fotos aprovadas
GRANT SELECT ON fotos_corrida TO anon;
-- Role authenticated: SELECT, INSERT, UPDATE, DELETE (controlado por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON fotos_corrida TO authenticated;

-- Permissões para sequências (necessário para INSERT)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Permissões para funções personalizadas
-- Funções que podem ser executadas por usuários anônimos
GRANT EXECUTE ON FUNCTION get_categorias_ativas() TO anon;
GRANT EXECUTE ON FUNCTION get_corridas_publicadas() TO anon;
GRANT EXECUTE ON FUNCTION get_corridas_por_categoria(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_eventos_futuros() TO anon;
GRANT EXECUTE ON FUNCTION get_eventos_por_mes(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_proximos_eventos(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_fotos_corrida(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_fotos_por_numero_peito(UUID, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION count_fotos_corrida(UUID) TO anon;

-- Funções que podem ser executadas por usuários autenticados
GRANT EXECUTE ON FUNCTION get_categorias_ativas() TO authenticated;
GRANT EXECUTE ON FUNCTION get_corridas_publicadas() TO authenticated;
GRANT EXECUTE ON FUNCTION get_corridas_por_categoria(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_eventos_futuros() TO authenticated;
GRANT EXECUTE ON FUNCTION get_eventos_por_mes(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_proximos_eventos(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fotos_corrida(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fotos_por_numero_peito(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fotos_pendentes_aprovacao() TO authenticated;
GRANT EXECUTE ON FUNCTION aprovar_foto(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reprovar_foto(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION count_fotos_corrida(UUID) TO authenticated;

-- Comentários sobre as permissões
COMMENT ON TABLE usuarios IS 'Permissões: anon (SELECT), authenticated (SELECT, UPDATE próprio perfil)';
COMMENT ON TABLE categorias IS 'Permissões: anon (SELECT), authenticated (SELECT)';
COMMENT ON TABLE corridas IS 'Permissões: anon (SELECT publicadas), authenticated (CRUD controlado por RLS)';
COMMENT ON TABLE eventos_calendario IS 'Permissões: anon (SELECT publicados), authenticated (CRUD controlado por RLS)';
COMMENT ON TABLE fotos_corrida IS 'Permissões: anon (SELECT aprovadas), authenticated (CRUD controlado por RLS)';

-- Verificação das permissões configuradas
-- Esta consulta pode ser usada para verificar se as permissões foram aplicadas corretamente
/*
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee, privilege_type;
*/