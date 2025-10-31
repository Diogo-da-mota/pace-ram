-- Políticas RLS para tabela corridas
CREATE POLICY "Usuários autenticados podem ver corridas publicadas" 
ON public.corridas 
FOR SELECT 
USING (publicado = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar corridas" 
ON public.corridas 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar corridas" 
ON public.corridas 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar corridas" 
ON public.corridas 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para tabela eventos_calendario
CREATE POLICY "Usuários autenticados podem ver eventos publicados" 
ON public.eventos_calendario 
FOR SELECT 
USING (publicado = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar eventos" 
ON public.eventos_calendario 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar eventos" 
ON public.eventos_calendario 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar eventos" 
ON public.eventos_calendario 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para tabela fotos_corrida
CREATE POLICY "Todos podem ver fotos aprovadas" 
ON public.fotos_corrida 
FOR SELECT 
USING (aprovado = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem enviar fotos" 
ON public.fotos_corrida 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar fotos" 
ON public.fotos_corrida 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para tabela categorias
CREATE POLICY "Todos podem ver categorias ativas" 
ON public.categorias 
FOR SELECT 
USING (ativo = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem gerenciar categorias" 
ON public.categorias 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para tabela usuarios (caso seja necessário)
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários autenticados podem criar perfil" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);