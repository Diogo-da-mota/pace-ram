-- Configuração básica de permissões para roles anon e authenticated
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

-- Comentários sobre as permissões
COMMENT ON TABLE usuarios IS 'Permissões: anon (SELECT), authenticated (SELECT, UPDATE próprio perfil)';
COMMENT ON TABLE categorias IS 'Permissões: anon (SELECT), authenticated (SELECT)';
COMMENT ON TABLE corridas IS 'Permissões: anon (SELECT publicadas), authenticated (CRUD controlado por RLS)';
COMMENT ON TABLE eventos_calendario IS 'Permissões: anon (SELECT publicados), authenticated (CRUD controlado por RLS)';
COMMENT ON TABLE fotos_corrida IS 'Permissões: anon (SELECT aprovadas), authenticated (CRUD controlado por RLS)';