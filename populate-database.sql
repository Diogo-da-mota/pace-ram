-- Script SQL para popular o banco Supabase com dados completos
-- Execute este script no SQL Editor do Supabase Dashboard
-- O SQL Editor executa com privilégios elevados, contornando RLS

-- =====================================================
-- POPULAR BANCO DE DADOS - PACE RUN HUB
-- =====================================================

SELECT 'Iniciando população do banco de dados...' as status;

-- =====================================================
-- INSERIR CATEGORIAS
-- =====================================================

SELECT 'Inserindo categorias...' as status;

INSERT INTO categorias (nome, descricao, cor_hex, ativo) VALUES
('Maratona', 'Corridas de 42,195 km - A distância clássica olímpica', '#E11D48', true),
('Meia Maratona', 'Corridas de 21,097 km - Metade da distância da maratona', '#3B82F6', true),
('10K', 'Corridas de 10 quilômetros - Distância popular para iniciantes', '#10B981', true),
('5K', 'Corridas de 5 quilômetros - Ideal para iniciantes', '#F59E0B', true),
('Trail Run', 'Corridas em trilhas e montanhas - Contato com a natureza', '#8B5CF6', true),
('Corrida Rústica', 'Corridas em terrenos variados - Desafio misto', '#EF4444', true),
('Corrida Noturna', 'Corridas realizadas à noite - Experiência única', '#6366F1', true)
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- INSERIR USUÁRIOS
-- =====================================================

SELECT 'Inserindo usuários...' as status;

INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, ativo) VALUES
('Admin Sistema', 'admin@pacerunhub.com', '$2b$10$exemplo_hash_senha_admin_deve_ser_alterado_em_producao', 'admin', true),
('João Silva', 'joao@email.com', '$2b$10$exemplo_hash_senha_usuario', 'usuario', true),
('Maria Santos', 'maria@email.com', '$2b$10$exemplo_hash_senha_usuario', 'usuario', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- INSERIR CORRIDAS
-- =====================================================

SELECT 'Inserindo corridas...' as status;

-- Corrida 1: Maratona Internacional de São Paulo
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
    'Maratona Internacional de São Paulo 2024' as titulo,
    '2024-12-31'::date as data_evento,
    'São Paulo, SP - Ibirapuera' as local,
    'A maior maratona da América Latina com percurso pelos principais pontos turísticos de São Paulo. Largada no Parque Ibirapuera.' as descricao,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop' as imagem_principal,
    'https://maratonasp.com.br' as link_externo,
    'Inscrições até 15/12/2024' as texto_rodape,
    c.id as categoria_id,
    u.id as criado_por,
    true as publicado
FROM categorias c, usuarios u
WHERE c.nome = 'Maratona' 
  AND u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM corridas 
      WHERE titulo = 'Maratona Internacional de São Paulo 2024'
  );

-- Corrida 2: Corrida de Reis - Rio de Janeiro
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
    'Corrida de Reis - Rio de Janeiro 2025' as titulo,
    '2025-01-06'::date as data_evento,
    'Rio de Janeiro, RJ - Copacabana' as local,
    'Tradicional corrida de início de ano na orla de Copacabana. Uma das corridas mais tradicionais do Brasil.' as descricao,
    'https://images.unsplash.com/photo-1544737151-6e4b9d1b2e3f?w=800&h=600&fit=crop' as imagem_principal,
    'https://corridadereis.com.br' as link_externo,
    'Evento gratuito' as texto_rodape,
    c.id as categoria_id,
    u.id as criado_por,
    true as publicado
FROM categorias c, usuarios u
WHERE c.nome = '10K' 
  AND u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM corridas 
      WHERE titulo = 'Corrida de Reis - Rio de Janeiro 2025'
  );

-- Corrida 3: Trail Run Serra da Mantiqueira
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
    'Trail Run Serra da Mantiqueira' as titulo,
    '2025-02-15'::date as data_evento,
    'Campos do Jordão, SP' as local,
    'Corrida em trilha pela Serra da Mantiqueira com paisagens deslumbrantes. Percurso desafiador em meio à natureza.' as descricao,
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop' as imagem_principal,
    'https://trailmantiqueira.com.br' as link_externo,
    'Vagas limitadas' as texto_rodape,
    c.id as categoria_id,
    u.id as criado_por,
    true as publicado
FROM categorias c, usuarios u
WHERE c.nome = 'Trail Run' 
  AND u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM corridas 
      WHERE titulo = 'Trail Run Serra da Mantiqueira'
  );

-- Corrida 4: Meia Maratona de Brasília
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
    'Meia Maratona de Brasília' as titulo,
    '2025-03-20'::date as data_evento,
    'Brasília, DF' as local,
    'Percurso pela Esplanada dos Ministérios e Eixo Monumental. Uma das corridas mais bonitas do país.' as descricao,
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop' as imagem_principal,
    'https://meiamaratonabsb.com.br' as link_externo,
    'Medalha para todos' as texto_rodape,
    c.id as categoria_id,
    u.id as criado_por,
    true as publicado
FROM categorias c, usuarios u
WHERE c.nome = 'Meia Maratona' 
  AND u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM corridas 
      WHERE titulo = 'Meia Maratona de Brasília'
  );

-- Corrida 5: Corrida Noturna Ibirapuera
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
    'Corrida Noturna Ibirapuera' as titulo,
    '2025-04-10'::date as data_evento,
    'São Paulo, SP - Parque Ibirapuera' as local,
    'Corrida noturna pelas alamedas do Parque Ibirapuera. Experiência única correndo sob as luzes da cidade.' as descricao,
    'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&h=600&fit=crop' as imagem_principal,
    'https://corridanoturna.com.br' as link_externo,
    'Kit com camiseta' as texto_rodape,
    c.id as categoria_id,
    u.id as criado_por,
    true as publicado
FROM categorias c, usuarios u
WHERE c.nome = '5K' 
  AND u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM corridas 
      WHERE titulo = 'Corrida Noturna Ibirapuera'
  );

-- Corrida 6: Corrida Rústica de Bonito
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
    'Corrida Rústica de Bonito' as titulo,
    '2025-05-25'::date as data_evento,
    'Bonito, MS' as local,
    'Corrida em terrenos variados pela região de Bonito. Paisagens incríveis e desafios únicos.' as descricao,
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' as imagem_principal,
    'https://corridabonito.com.br' as link_externo,
    'Turismo + Corrida' as texto_rodape,
    c.id as categoria_id,
    u.id as criado_por,
    true as publicado
FROM categorias c, usuarios u
WHERE c.nome = 'Corrida Rústica' 
  AND u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM corridas 
      WHERE titulo = 'Corrida Rústica de Bonito'
  );

-- =====================================================
-- INSERIR EVENTOS DO CALENDÁRIO
-- =====================================================

SELECT 'Inserindo eventos do calendário...' as status;

INSERT INTO eventos_calendario (
    titulo,
    data_evento,
    local,
    descricao,
    link_externo,
    criado_por,
    publicado
)
SELECT 
    'Maratona de Boston 2025' as titulo,
    '2025-04-21'::date as data_evento,
    'Boston, MA - EUA' as local,
    'A mais prestigiosa maratona do mundo. Qualificação necessária.' as descricao,
    'https://www.baa.org' as link_externo,
    u.id as criado_por,
    true as publicado
FROM usuarios u
WHERE u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM eventos_calendario 
      WHERE titulo = 'Maratona de Boston 2025'
  );

INSERT INTO eventos_calendario (
    titulo,
    data_evento,
    local,
    descricao,
    link_externo,
    criado_por,
    publicado
)
SELECT 
    'Maratona de Londres 2025' as titulo,
    '2025-04-27'::date as data_evento,
    'Londres, Reino Unido' as local,
    'Uma das World Marathon Majors. Percurso histórico pela capital inglesa.' as descricao,
    'https://www.virginmoneylondonmarathon.com' as link_externo,
    u.id as criado_por,
    true as publicado
FROM usuarios u
WHERE u.email = 'admin@pacerunhub.com'
  AND NOT EXISTS (
      SELECT 1 FROM eventos_calendario 
      WHERE titulo = 'Maratona de Londres 2025'
  );

-- =====================================================
-- VERIFICAR RESULTADOS
-- =====================================================

SELECT 'Verificando resultados da população...' as status;

-- Estatísticas das tabelas
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

UNION ALL

SELECT 
    'eventos_calendario' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE publicado = true) as registros_publicados
FROM eventos_calendario

ORDER BY tabela;

-- Listar corridas inseridas
SELECT 'Corridas inseridas:' as status;

SELECT 
    c.titulo,
    c.data_evento,
    c.local,
    cat.nome as categoria,
    c.publicado,
    u.nome as criado_por
FROM corridas c
LEFT JOIN categorias cat ON c.categoria_id = cat.id
LEFT JOIN usuarios u ON c.criado_por = u.id
ORDER BY c.data_evento;

-- Listar eventos do calendário
SELECT 'Eventos do calendário:' as status;

SELECT 
    titulo,
    data_evento,
    local,
    publicado
FROM eventos_calendario
ORDER BY data_evento;

SELECT 'População do banco concluída com sucesso!' as status;

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
✅ Inserir 7 categorias de corrida
✅ Inserir 3 usuários (1 admin + 2 usuários)
✅ Inserir 6 corridas de exemplo
✅ Inserir 2 eventos do calendário
✅ Mostrar estatísticas finais
✅ Listar todos os dados inseridos

Após executar:
• Recarregue a aplicação React
• Verifique a página inicial (deve mostrar as corridas)
• Teste o login com: admin@pacerunhub.com
• Acesse o dashboard administrativo
• Verifique a página de calendário

Em caso de erro:
• Verifique se as tabelas existem
• Confirme se as migrações foram aplicadas
• Verifique políticas RLS no Dashboard
*/