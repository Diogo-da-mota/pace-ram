-- Migração para corrigir recursão infinita nas políticas RLS da tabela usuarios
-- Data: 2025-01-11
-- Problema: Políticas fazem SELECT na própria tabela usuarios causando recursão infinita

-- Remover todas as políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON usuarios;
DROP POLICY IF EXISTS "Apenas admins podem inserir usuários" ON usuarios;
DROP POLICY IF EXISTS "Apenas admins podem deletar usuários" ON usuarios;

-- Manter a política básica de SELECT para próprio perfil (não causa recursão)
-- Esta política já existe: "Usuários podem ver próprio perfil"

-- Manter a política básica de UPDATE para próprio perfil (não causa recursão)
-- Esta política já existe: "Usuários podem atualizar próprio perfil"

-- Criar política simples para INSERT sem recursão
-- Permite que usuários autenticados criem seu próprio registro
CREATE POLICY "usuarios_insert_own" ON usuarios
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Criar política para permitir que usuários autenticados vejam dados básicos
-- necessários para verificação de existência (sem recursão)
CREATE POLICY "usuarios_select_basic" ON usuarios
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Comentário sobre funcionalidades de admin:
-- Para funcionalidades administrativas, será necessário implementar uma abordagem diferente
-- que não dependa de políticas RLS que fazem SELECT na própria tabela usuarios.
-- Sugestões:
-- 1. Usar uma tabela separada para roles/permissões
-- 2. Usar claims no JWT token
-- 3. Implementar verificações no lado do servidor/API