-- Criação da tabela usuarios
-- Esta tabela armazena informações dos usuários do sistema

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) DEFAULT 'usuario' CHECK (tipo_usuario IN ('admin', 'editor', 'usuario')),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema Pace Run Hub';
COMMENT ON COLUMN usuarios.id IS 'Identificador único do usuário';
COMMENT ON COLUMN usuarios.email IS 'Email único do usuário para login';
COMMENT ON COLUMN usuarios.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN usuarios.senha_hash IS 'Hash da senha do usuário';
COMMENT ON COLUMN usuarios.tipo_usuario IS 'Tipo de usuário: admin, editor ou usuario';
COMMENT ON COLUMN usuarios.ativo IS 'Status ativo/inativo do usuário';
COMMENT ON COLUMN usuarios.criado_em IS 'Data e hora de criação do registro';
COMMENT ON COLUMN usuarios.atualizado_em IS 'Data e hora da última atualização';

-- Índices para otimização de consultas
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuarios_criado_em ON usuarios(criado_em);

-- Trigger para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário administrador padrão
INSERT INTO usuarios (email, nome, senha_hash, tipo_usuario) VALUES
('paceram@gmail.com', 'Administrador PACE RAM', '$2b$10$exemplo_hash_senha_deve_ser_alterado', 'admin');

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Usuários podem ver próprio perfil" ON usuarios
    FOR SELECT USING (auth.uid() = id);

-- Política: Admins podem ver todos os usuários
CREATE POLICY "Admins podem ver todos usuários" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Política: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Política: Apenas admins podem inserir novos usuários
CREATE POLICY "Apenas admins podem inserir usuários" ON usuarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Política: Apenas admins podem deletar usuários
CREATE POLICY "Apenas admins podem deletar usuários" ON usuarios
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );