-- Corrige políticas RLS para a tabela portfolio_links
-- Permite leitura pública de links ativos e CRUD restrito ao usuário autenticado

-- Garantir que RLS esteja habilitado
alter table if exists public.portfolio_links enable row level security;

-- Definir default do campo criado_por para o usuário autenticado
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_links'
      and column_name = 'criado_por'
  ) then
    alter table public.portfolio_links
      alter column criado_por set default auth.uid();
  end if;
end $$;

-- Remover políticas anteriores se existirem
drop policy if exists "public_read_active_portfolio_links" on public.portfolio_links;
drop policy if exists "insert_own_portfolio_links" on public.portfolio_links;
drop policy if exists "update_own_portfolio_links" on public.portfolio_links;
drop policy if exists "delete_own_portfolio_links" on public.portfolio_links;

-- Leitura pública: qualquer usuário (inclusive anon) pode ler links ativos
create policy "public_read_active_portfolio_links"
  on public.portfolio_links
  for select
  to public
  using (ativo = true);

-- Inserção: somente usuários autenticados, vinculando o registro ao próprio usuário
create policy "insert_own_portfolio_links"
  on public.portfolio_links
  for insert
  to authenticated
  with check (criado_por = auth.uid());

-- Atualização: somente o dono do registro
create policy "update_own_portfolio_links"
  on public.portfolio_links
  for update
  to authenticated
  using (criado_por = auth.uid())
  with check (criado_por = auth.uid());

-- Exclusão: somente o dono do registro
create policy "delete_own_portfolio_links"
  on public.portfolio_links
  for delete
  to authenticated
  using (criado_por = auth.uid());