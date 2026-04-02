-- ============================================================
-- DevHub - Schema COMPLETO Supabase
-- Inclui: usuarios, ideias, projetos, tarefas, mensagens, contratos, equipes, membros_equipes
-- ============================================================

-- DROP todas as tabelas
DROP TABLE IF EXISTS convites CASCADE;
DROP TABLE IF EXISTS membros_equipes CASCADE;
DROP TABLE IF EXISTS equipes CASCADE;
DROP TABLE IF EXISTS contratos CASCADE;
DROP TABLE IF EXISTS mensagens CASCADE;
DROP TABLE IF EXISTS tarefas CASCADE;
DROP TABLE IF EXISTS projetos CASCADE;
DROP TABLE IF EXISTS ideias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. USUARIOS
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  avatar TEXT DEFAULT '🧑‍💻',
  tipo TEXT DEFAULT 'dev',
  empresa TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. IDEIAS
CREATE TABLE ideias (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'rascunho',
  prioridade TEXT DEFAULT 'media',
  autor_id TEXT,
  tags TEXT[] DEFAULT '{}',
  votos INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJETOS
CREATE TABLE projetos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'planejamento',
  progresso INTEGER DEFAULT 0,
  equipe TEXT[] DEFAULT '{}',
  prazo DATE,
  categoria TEXT DEFAULT 'web',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TAREFAS
CREATE TABLE tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  projeto_id TEXT,
  responsavel_id TEXT,
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'media',
  prazo DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MENSAGENS
CREATE TABLE mensagens (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  texto TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTRATOS
CREATE TABLE contratos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT,
  dev_id TEXT,
  tipo TEXT DEFAULT 'projeto',
  valor NUMERIC DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  descricao TEXT,
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EQUIPES
CREATE TABLE equipes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  dono_id TEXT,
  codigo_convite TEXT UNIQUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MEMBROS_EQUIPES
CREATE TABLE membros_equipes (
  id TEXT PRIMARY KEY,
  equipe_id TEXT,
  usuario_id TEXT,
  funcao TEXT DEFAULT 'membro',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONVITES
CREATE TABLE convites (
  id TEXT PRIMARY KEY,
  equipe_id TEXT,
  email TEXT NOT NULL,
  convidado_por TEXT,
  status TEXT DEFAULT 'pendente',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_ideias_autor ON ideias(autor_id);
CREATE INDEX idx_projetos_status ON projetos(status);
CREATE INDEX idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX idx_tarefas_status ON tarefas(status);
CREATE INDEX idx_equipes_codigo ON equipes(codigo_convite);
CREATE INDEX idx_membros_equipe ON membros_equipes(equipe_id);
CREATE INDEX idx_membros_usuario ON membros_equipes(usuario_id);
CREATE INDEX idx_convites_email ON convites(email);

-- RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideias ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
CREATE POLICY "perm_usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_ideias" ON ideias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_projetos" ON projetos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_tarefas" ON tarefas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_mensagens" ON mensagens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_contratos" ON contratos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_equipes" ON equipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_membros" ON membros_equipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "perm_convites" ON convites FOR ALL USING (true) WITH CHECK (true);

-- GRANT
GRANT ALL ON usuarios TO anon, authenticated;
GRANT ALL ON ideias TO anon, authenticated;
GRANT ALL ON projetos TO anon, authenticated;
GRANT ALL ON tarefas TO anon, authenticated;
GRANT ALL ON mensagens TO anon, authenticated;
GRANT ALL ON contratos TO anon, authenticated;
GRANT ALL ON equipes TO anon, authenticated;
GRANT ALL ON membros_equipes TO anon, authenticated;
GRANT ALL ON convites TO anon, authenticated;

-- DADOS DEMO
INSERT INTO usuarios (id, nome, email, senha, avatar, tipo, empresa, criado_em) VALUES
('u1', 'Dev Demo', 'demo@devhub.com', 'demo123', '🧑‍💻', 'dev', NULL, NOW()),
('c1', 'Empresa Demo', 'demo@empresa.com', 'demo123', '🏢', 'cliente', 'Demo Corp', NOW());

INSERT INTO ideias (id, titulo, descricao, status, prioridade, autor_id, tags, votos, criado_em) VALUES
('i1', 'Notificações Push em Tempo Real', 'Implementar notificações usando WebSockets.', 'aprovada', 'alta', 'u1', ARRAY['backend'], 5, NOW());

INSERT INTO projetos (id, titulo, descricao, status, progresso, equipe, prazo, categoria, criado_em) VALUES
('p1', 'DevHub Platform', 'Plataforma principal de gestão.', 'em-andamento', 65, ARRAY['u1'], '2026-06-30', 'web', NOW());

INSERT INTO tarefas (id, titulo, descricao, projeto_id, responsavel_id, status, prioridade, prazo, criado_em) VALUES
('t1', 'Configurar autenticação JWT', 'Login seguro com tokens JWT.', 'p1', 'u1', 'concluida', 'alta', '2026-04-10', NOW());

-- VERIFICAR
SELECT 'OK - Schema completo criado!' as resultado;
