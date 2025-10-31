PRD (Documento de Requisitos de Produto) — Upload de Imagens para o bucket "Imagem Background"
Resumo

Objetivo: Implementar upload seguro, consistente e com experiência confiável para enviar imagens de background do site para o bucket "Imagem Background" no Supabase Storage e gravar metadados na tabela background_configuracoes.
Público-alvo: Desenvolvedores front-end e back-end, QA e product owner.
Escopo: Upload de imagens via site, validação no cliente, envio ao Supabase Storage, gravação/atualização da tabela background_configuracoes, exibição segura da imagem no front-end e controle de permissões.
Requisitos funcionais

Upload de imagem

O usuário (autenticado) pode enviar uma imagem para o bucket "Imagem Background".
Tipos de arquivo aceitos: image/jpeg, image/png, image/webp (configurável).
Tamanho máximo: 5 MB (configurável).
Validação de dimensões (opcional): largura/altura mínima ou máxima conforme design.
Enquanto o upload ocorre, mostrar barra de progresso ou spinner.
Armazenamento

Arquivos devem ser salvos no bucket "Imagem Background" em caminho com padrão seguro, por exemplo:
imagens/backgrounds/{user_id}/{timestamp}_{uuid}.{ext}
Metadata: salvar content-type e, opcionalmente, dimensões e hash.
Gravação de metadados no banco

Ao concluir upload com sucesso, inserir ou atualizar um registro em background_configuracoes contendo:
tipo_dispositivo (ex.: desktop, mobile)
url_imagem (URL pública assíncrona ou caminho no storage)
posicao_x, posicao_y, zoom, opacidade (valores padrão se não informados)
ativo (boolean)
criado_por (auth.uid())
criado_em / atualizado_em (timestamp)
Garantir consistência: se o upload falhar, não criar/atualizar o registro; se o DB falhar, considerar deletar o arquivo recém enviado (rollback compensatório).
Autenticação e permissões

Usuários anônimos não podem fazer upload diretamente ao bucket (a menos que seja definido caso de uso).
Apenas usuários autenticados (ou roles específicas) podem inserir/atualizar background_configuracoes.
Usar chave anon apenas para leitura pública de imagens se necessário; operações sensíveis (write/delete) devem usar backend com service_role ou proxy autenticado.
Segurança

Validar tipos e tamanhos no cliente e no servidor (defesa em profundidade).
Sanitizar nomes de arquivo e evitar caracteres perigosos.
Gerar nomes únicos (UUID + timestamp) para evitar colisões e exposição de nomes originais.
Controlar acesso: se imagens forem privadas, gerar URLs assinadas (signed URLs) para exibição temporária.
UX

Feedback claro de sucesso/erro (ex.: “Upload concluído”, “Arquivo inválido”).
Mostrar preview da imagem carregada antes do envio (client-side) e após persistir.
Possibilidade de desfazer/remover imagem (deletar do storage + atualizar DB).
Indicar estados: carregando, sucesso, erro, tamanho excedido, tipo inválido._
Não-funcionais

Performance: uploads em background, suportar resume parcial se necessário (opcional).
Escalabilidade: diretório por usuário para evitar problemas de listagem.
Observabilidade: logs de upload, métricas de falha/sucesso.
Backups: políticas de retenção e limpeza para imagens antigas.
Fluxo de alto nível (recomendado)

Front-end valida tipo/tamanho/dimensão e mostra preview.
Front-end solicita URL assinada ao backend (opcional) ou usa Supabase client autenticado para upload direto.
Front-end realiza upload para bucket "Imagem Background".
Ao receber sucesso do Storage, front-end chama endpoint backend (ou faz diretamente via Supabase) para inserir/atualizar background_configuracoes com a url_imagem retornada.
Backend valida dados, grava no banco com criado_por = auth.uid() e timestamps.
Sistema responde ao front-end; UI atualiza e exibe nova imagem.
Prompt sugerido para desenvolvedores (exemplos de instruções)

Para upload direto do front-end usando supabase-js:

Validar arquivo (tipo e tamanho). Em seguida:
Gerar caminho seguro: imagens/backgrounds/${userId}/${Date.now()}_${uuidv4()}.${ext}.
Usar supabase.storage.from('Imagem Background').upload(path, file, { cacheControl: '3600', upsert: false }).
Se o bucket for público, obter publicURL com supabase.storage.from('Imagem Background').getPublicUrl(path). Se privado, gerar signedURL via backend (service_role).
Chamar endpoint que grava/atualiza background_configuracoes com os metadados.
Tratar erros: retry limitado, mostrar mensagem ao usuário, e remover arquivo parcial se necessário.
Para upload via backend (mais seguro):

Front-end envia arquivo ao backend (multipart/form-data).
Backend valida, salva no Storage usando SUPABASE_SERVICE_ROLE_KEY e grava DB em transação.
Retornar URL seguro ao cliente._
Exemplo de campos e validações

tipo_dispositivo: enum('desktop','mobile','tablet') — obrigatório.
url_imagem: string — obrigatório.
posicao_x, posicao_y: integer/decimal — opcional, default 50 (centro).
zoom: decimal — opcional, default 1.0.
opacidade: decimal entre 0 e 1 — padrão 1.0.
ativo: boolean — padrão true.
criado_por: uuid — populated com auth.uid().
criado_em / atualizado_em: timestamps with time zone (DEFAULT now()).
Recomendações de RLS e segurança no banco

Habilitar RLS na tabela background_configuracoes.
Criar policy para que apenas usuários autenticados possam inserir/atualizar seus próprios registros:
SELECT: permitir leitura pública apenas se ativo = true ou se o usuário for proprietário.
INSERT/UPDATE/DELETE: permitir apenas quando (SELECT auth.uid()) = criado_por ou se role for admin via claim JWT.
Exemplo de condição (sintaxe ilustrativa):
USING ((ativo = true) OR (criado_por = (SELECT auth.uid())))
WITH CHECK ((criado_por = (SELECT auth.uid())))
Transações e consistência

Sempre que possível, executar gravação no Storage e gravação no DB de forma que falhas sejam compensadas:
Se upload succeed but DB insert fail => deletar o arquivo.
Se DB insert succeed but upload fail => não deve ocorrer se DB é gravado após upload; garantir ordem correta.
Exemplos de erros comuns e como evitar

Erro: arquivos com mesmo nome sobrescrevendo — usar nomes únicos (UUID).
Erro: falta de permissões — garantir uso de service_role no backend ou políticas RLS adequadas.
Erro: arquivos mal formatados — validar MIME no cliente e double-check no backend.
Erro: URLs expirando — para imagens privadas, usar URLs assinadas com TTL adequado (ex.: 1h) e renovar quando necessário.
Erro: falta de rollback => implementar deleção do arquivo após falha DB.
Checklist de implementação

 Validar extensão e tamanho no front-end.
 Gerar nome de arquivo único.
 Upload para bucket "Imagem Background" com política de cache adequada.
 Gravar/atualizar background_configuracoes com criado_por = auth.uid().
 Implementar RLS policies na tabela.
 Implementar rollback compensatório se qualquer etapa falhar.
 UI com preview, progresso e mensagens de erro.
 Testes end-to-end (upload, exibição, remoção).
 Logs e métricas de upload.
Campos de API / Contrato (exemplo)

Endpoint: POST /api/backgrounds
Body (multipart/form-data): file, tipo_dispositivo, posicao_x, posicao_y, zoom, opacidade, ativo
Autenticação: Bearer token (JWT)
Retorno: 201 { id, tipo_dispositivo, url_imagem, posicao_x, posicao_y, zoom, opacidade, ativo, criado_por, criado_em }
Observações finais

Se preferir upload direto do front usando supabase-js, confirme se o bucket "Imagem Background" está configurado como público ou privado — isso determina se precisa gerar signed URLs no backend.
Posso gerar para você:
Exemplo de código front-end (React) usando supabase-js para upload, obter URL e gravar DB.
Exemplo de endpoint backend (TypeScript/Deno) que recebe arquivo, faz upload via service_role e insere registro na tabela (com rollback).
Recomendações de RLS concretas (SQL) para a tabela background_configuracoes.


ja foi criado
-- Criação da tabela para configurações de background
CREATE TABLE background_configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_dispositivo VARCHAR(10) NOT NULL CHECK (tipo_dispositivo IN ('desktop', 'mobile')),
    url_imagem TEXT NOT NULL,
    posicao_x DECIMAL(5,2) DEFAULT 50.00, -- Posição X em porcentagem (0-100)
    posicao_y DECIMAL(5,2) DEFAULT 50.00, -- Posição Y em porcentagem (0-100)
    zoom DECIMAL(5,2) DEFAULT 100.00, -- Zoom em porcentagem (50-200)
    opacidade DECIMAL(3,2) DEFAULT 1.00, -- Opacidade (0.00-1.00)
    ativo BOOLEAN DEFAULT true,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_background_tipo_dispositivo ON background_configuracoes(tipo_dispositivo);
CREATE INDEX idx_background_ativo ON background_configuracoes(ativo);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_background_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_background_configuracoes_updated_at
    BEFORE UPDATE ON background_configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_background_configuracoes_updated_at();

-- Políticas RLS
ALTER TABLE background_configuracoes ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública para exibição no site
CREATE POLICY "Permitir leitura pública de backgrounds ativos" ON background_configuracoes
    FOR SELECT USING (ativo = true);

-- Permitir CRUD completo para usuários autenticados (administradores)
CREATE POLICY "Permitir CRUD para usuários autenticados" ON background_configuracoes
    FOR ALL USING (auth.role() = 'authenticated');

-- Conceder permissões
GRANT SELECT ON background_configuracoes TO anon;
GRANT ALL PRIVILEGES ON background_configuracoes TO authenticated;




------------------------------------------------------------------------------------------------------------





-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS E STORAGE PARA UPLOAD DE BACKGROUND
-- =====================================================

-- 1. REMOVER POLÍTICAS EXISTENTES (se houver conflitos)
DROP POLICY IF EXISTS "Permitir leitura pública de backgrounds ativos" ON background_configuracoes;
DROP POLICY IF EXISTS "Permitir CRUD para usuários autenticados" ON background_configuracoes;

-- 2. RECRIAR POLÍTICAS RLS MAIS PERMISSIVAS PARA UPLOAD
-- Política para leitura pública de backgrounds ativos
CREATE POLICY "background_select_public" ON background_configuracoes
    FOR SELECT 
    USING (ativo = true);

-- Política para inserção por usuários autenticados
CREATE POLICY "background_insert_authenticated" ON background_configuracoes
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização por usuários autenticados
CREATE POLICY "background_update_authenticated" ON background_configuracoes
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para deleção por usuários autenticados
CREATE POLICY "background_delete_authenticated" ON background_configuracoes
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 3. GARANTIR PERMISSÕES CORRETAS
GRANT SELECT ON background_configuracoes TO anon;
GRANT ALL PRIVILEGES ON background_configuracoes TO authenticated;

-- 4. CRIAR BUCKET SE NÃO EXISTIR (via SQL)
-- Nota: Este comando pode precisar ser executado via dashboard do Supabase
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'imagem-background',
    'imagem-background', 
    true,  -- bucket público para facilitar acesso
    5242880,  -- 5MB em bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 5. POLÍTICAS DE STORAGE PARA O BUCKET
-- Permitir upload para usuários autenticados
CREATE POLICY "background_upload_authenticated" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'imagem-background' 
        AND auth.role() = 'authenticated'
    );

-- Permitir leitura pública das imagens
CREATE POLICY "background_read_public" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'imagem-background');

-- Permitir atualização para usuários autenticados
CREATE POLICY "background_update_authenticated_storage" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'imagem-background' 
        AND auth.role() = 'authenticated'
    );

-- Permitir deleção para usuários autenticados
CREATE POLICY "background_delete_authenticated_storage" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'imagem-background' 
        AND auth.role() = 'authenticated'
    );

-- 6. FUNÇÃO AUXILIAR PARA GERAR CAMINHO SEGURO (opcional)
CREATE OR REPLACE FUNCTION generate_background_path(user_id UUID, file_extension TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'imagens/backgrounds/' || user_id || '/' || 
           EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || 
           gen_random_uuid() || '.' || file_extension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. VERIFICAR SE RLS ESTÁ HABILITADO
ALTER TABLE background_configuracoes ENABLE ROW LEVEL SECURITY;

-- 8. COMENTÁRIOS E INSTRUÇÕES
/*
INSTRUÇÕES PARA APLICAR:

1. Execute este SQL no editor SQL do Supabase Dashboard
2. Se o bucket não for criado automaticamente, crie manualmente:
   - Nome: imagem-background
   - Público: true
   - Tamanho máximo: 5MB
   - Tipos permitidos: image/jpeg, image/png, image/webp

3. Verifique se as políticas foram aplicadas em:
   - Authentication > Policies > background_configuracoes
   - Storage > Policies > objects

4. Teste o upload após aplicar as mudanças

OBSERVAÇÕES:
- Bucket configurado como público para simplificar acesso às imagens
- Políticas permitem operações para usuários autenticados
- Caminho seguro gerado automaticamente pela função auxiliar
*/