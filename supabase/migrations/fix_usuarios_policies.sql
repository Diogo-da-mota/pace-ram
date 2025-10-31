-- Corrigir políticas RLS da tabela usuarios para evitar recursão infinita

-- Remover todas as políticas existentes da tabela usuarios
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Admins podem atualizar todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;

-- Criar políticas simples e seguras

-- Política para SELECT: usuários autenticados podem ver seu próprio perfil
CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT
    USING (auth.uid() = id);

-- Política para INSERT: usuários autenticados podem criar seu próprio registro
CREATE POLICY "usuarios_insert_own" ON usuarios
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Política para UPDATE: usuários autenticados podem atualizar seu próprio perfil
CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Garantir que as permissões básicas estão configuradas
GRANT SELECT, INSERT, UPDATE ON usuarios TO authenticated;
GRANT SELECT ON usuarios TO anon;

-- Comentário para documentar as mudanças
COMMENT ON TABLE usuarios IS 'Tabela de usuários com políticas RLS corrigidas para evitar recursão infinita';