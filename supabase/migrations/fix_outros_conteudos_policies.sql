-- Corrigir políticas RLS da tabela outros_conteudos
-- Problema: Políticas complexas estão impedindo atualizações na aba "Outros"
-- Solução: Alinhar com o padrão simples das outras tabelas

-- Remover políticas antigas complexas
DROP POLICY IF EXISTS "Todos podem ver conteúdos publicados" ON outros_conteudos;
DROP POLICY IF EXISTS "Editores podem ver todos conteúdos" ON outros_conteudos;
DROP POLICY IF EXISTS "Editores podem criar conteúdos" ON outros_conteudos;
DROP POLICY IF EXISTS "Criadores podem editar próprios conteúdos" ON outros_conteudos;
DROP POLICY IF EXISTS "Apenas admins podem deletar conteúdos" ON outros_conteudos;

-- Criar políticas simples alinhadas com outras tabelas
-- SELECT: Usuários autenticados podem ver todos os conteúdos
CREATE POLICY "Authenticated users can view outros_conteudos" ON outros_conteudos
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT: Usuários autenticados podem criar conteúdos
CREATE POLICY "Authenticated users can insert outros_conteudos" ON outros_conteudos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuários autenticados podem atualizar conteúdos
CREATE POLICY "Authenticated users can update outros_conteudos" ON outros_conteudos
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- DELETE: Usuários autenticados podem deletar conteúdos
CREATE POLICY "Authenticated users can delete outros_conteudos" ON outros_conteudos
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Garantir que RLS está habilitado
ALTER TABLE outros_conteudos ENABLE ROW LEVEL SECURITY;