-- Corrigir chave estrangeira da tabela outros_conteudos
-- Remover constraint que referencia tabela usuarios inexistente
-- Permitir que qualquer um adicione conteúdo (igual ao calendário)

-- 1. Remover a constraint de chave estrangeira problemática
ALTER TABLE outros_conteudos DROP CONSTRAINT IF EXISTS outros_conteudos_criado_por_fkey;

-- 2. Tornar o campo criado_por nullable para permitir inserções sem autenticação
ALTER TABLE outros_conteudos ALTER COLUMN criado_por DROP NOT NULL;

-- 3. Remover políticas RLS restritivas e criar políticas permissivas
DROP POLICY IF EXISTS "Editores podem criar conteúdos" ON outros_conteudos;
DROP POLICY IF EXISTS "Criadores podem editar próprios conteúdos" ON outros_conteudos;
DROP POLICY IF EXISTS "Apenas admins podem deletar conteúdos" ON outros_conteudos;

-- 4. Criar políticas permissivas (igual ao calendário)
-- Qualquer um pode inserir
CREATE POLICY "Qualquer um pode criar conteúdos" ON outros_conteudos
    FOR INSERT WITH CHECK (true);

-- Qualquer um pode atualizar
CREATE POLICY "Qualquer um pode editar conteúdos" ON outros_conteudos
    FOR UPDATE USING (true);

-- Qualquer um pode deletar
CREATE POLICY "Qualquer um pode deletar conteúdos" ON outros_conteudos
    FOR DELETE USING (true);