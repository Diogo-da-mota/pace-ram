CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whatsapp_numero VARCHAR(20),
  whatsapp_mensagem TEXT,
  whatsapp_ativo BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir configuração inicial
INSERT INTO configuracoes (whatsapp_numero, whatsapp_mensagem, whatsapp_ativo)
VALUES ('', 'Olá! Gostaria de mais informações sobre as corridas.', false);

-- Configurar permissões para a tabela configuracoes
GRANT ALL PRIVILEGES ON configuracoes TO authenticated;
GRANT SELECT ON configuracoes TO anon;