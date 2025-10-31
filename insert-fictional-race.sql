-- Script SQL para inserir corrida fictícia no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard
-- O SQL Editor executa com privilégios elevados, contornando RLS

-- =====================================================
-- INSERIR CORRIDA FICTÍCIA NO PACE RUN HUB
-- =====================================================

-- Primeiro, vamos verificar se já existem dados básicos
SELECT 'Verificando categorias existentes...' as status;
SELECT id, nome, ativo FROM categorias WHERE nome = '10K' LIMIT 1;

SELECT 'Verificando usuários existentes...' as status;
SELECT id, nome, email, tipo_usuario FROM usuarios WHERE tipo_usuario = 'admin' LIMIT 1;

-- =====================================================
-- INSERIR CATEGORIA 10K (se não existir)
-- =====================================================

INSERT INTO categorias (nome, descricao, cor_hex, ativo)
VALUES ('10K', 'Corridas de 10 quilômetros - Distância popular para iniciantes', '#10B981', true)
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- INSERIR USUÁRIO ADMIN (se não existir)
-- =====================================================

INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, ativo)
VALUES ('Admin Sistema', 'admin@pacerunhub.com', '$2b$10$exemplo_hash_senha_admin_deve_ser_alterado_em_producao', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- INSERIR CORRIDA FICTÍCIA
-- =====================================================

INSERT INTO corridas (
    titulo,
    data_evento,
    local,
    descricao,
    imagem_principal,
    link_externo,
    texto_rodape,
    categoria_id,
    criado_por,
    publicado
)
SELECT 
    'Corrida Fictícia do Pace Run Hub' as titulo,
    '2025-06-15'::date as data_evento,
    'Parque Ibirapuera, São Paulo - SP' as local,
    'Uma corrida fictícia criada para demonstração do sistema Pace Run Hub. Percurso de 10K pelas alamedas do Parque Ibirapuera, com largada às 7h da manhã. Evento gratuito com medalha para todos os participantes.' as descricao,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop' as imagem_principal,
    'https://pacerunhub.com/corrida-ficticia' as link_externo,
    'Inscrições abertas até 10/06' as texto_rodape,
    c.id as categoria_id,
    u.id as criado_por,
    true as publicado
FROM categorias c, usuarios u
WHERE c.nome = '10K' 
  AND u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM corridas 
      WHERE titulo = 'Corrida Fictícia do Pace Run Hub'
  );

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

SELECT 'Resultado da inserção:' as status;

SELECT 
    c.id,
    c.titulo,
    c.data_evento,
    c.local,
    c.publicado,
    cat.nome as categoria,
    cat.cor_hex,
    u.nome as criado_por,
    u.email as email_criador,
    c.criado_em
FROM corridas c
LEFT JOIN categorias cat ON c.categoria_id = cat.id
LEFT JOIN usuarios u ON c.criado_por = u.id
WHERE c.titulo = 'Corrida Fictícia do Pace Run Hub';

-- =====================================================
-- ESTATÍSTICAS FINAIS
-- =====================================================

SELECT 'Estatísticas do banco:' as status;

SELECT 
    'categorias' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE ativo = true) as registros_ativos
FROM categorias

UNION ALL

SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE ativo = true) as registros_ativos
FROM usuarios

UNION ALL

SELECT 
    'corridas' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE publicado = true) as registros_publicados
FROM corridas

ORDER BY tabela;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
INSTRUÇÕES PARA EXECUTAR ESTE SCRIPT:

1. Acesse o Supabase Dashboard (https://supabase.com/dashboard)
2. Selecione seu projeto (pace-run-hub)
3. Vá para "SQL Editor" no menu lateral
4. Cole este script completo
5. Clique em "Run" para executar

O script irá:
✅ Verificar dados existentes
✅ Inserir categoria "10K" (se não existir)
✅ Inserir usuário admin (se não existir)
✅ Inserir corrida fictícia (se não existir)
✅ Mostrar resultado final
✅ Exibir estatísticas do banco

APÓS A EXECUÇÃO:
- A corrida fictícia estará disponível na aplicação
- Você pode verificar no frontend em http://localhost:8080
- Os dados estarão visíveis na página inicial e no calendário

OBSERVAÇÕES:
- Este script usa ON CONFLICT para evitar duplicatas
- Executa com privilégios elevados, contornando RLS
- É seguro executar múltiplas vezes
- Não altera dados existentes, apenas insere novos
- O usuário admin criado usa uma senha hash de exemplo
- Em produção, altere a senha do admin através do sistema
*/