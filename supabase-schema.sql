-- ============================================================
-- DevHub — Script SQL para Supabase
-- Projeto: wipwvjuikcmsmpvqedis
-- Sistema de Equipes com Convites
-- ============================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  avatar TEXT DEFAULT '🧑‍💻',
  equipe_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE EQUIPES
CREATE TABLE IF NOT EXISTS equipes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  dono_id TEXT REFERENCES usuarios(id),
  codigo_convite TEXT UNIQUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE CONVITES
CREATE TABLE IF NOT EXISTS convites (
  id TEXT PRIMARY KEY,
  equipe_id TEXT REFERENCES equipes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  convidado_por TEXT REFERENCES usuarios(id),
  status TEXT DEFAULT 'pendente',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE IDEIAS (adicionado equipe_id)
CREATE TABLE IF NOT EXISTS ideias (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'rascunho',
  prioridade TEXT DEFAULT 'media',
  autor_id TEXT REFERENCES usuarios(id),
  equipe_id TEXT REFERENCES equipes(id),
  tags TEXT[] DEFAULT '{}',
  votos INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE PROJETOS (adicionado equipe_id)
CREATE TABLE IF NOT EXISTS projetos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'planejamento',
  progresso INTEGER DEFAULT 0,
  equipe_id TEXT REFERENCES equipes(id),
  prazo DATE,
  categoria TEXT DEFAULT 'web',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE TAREFAS (adicionado equipe_id)
CREATE TABLE IF NOT EXISTS tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  projeto_id TEXT REFERENCES projetos(id) ON DELETE CASCADE,
  responsavel_id TEXT REFERENCES usuarios(id),
  equipe_id TEXT REFERENCES equipes(id),
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'media',
  prazo DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE SERVIÇOS (adicionado equipe_id)
CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT DEFAULT '🔧',
  categoria TEXT DEFAULT 'desenvolvimento',
  preco TEXT DEFAULT 'Sob consulta',
  equipe_id TEXT REFERENCES equipes(id),
  recursos TEXT[] DEFAULT '{}',
  destaque BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_equipes_codigo ON equipes(codigo_convite);
CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_status ON convites(status);
CREATE INDEX IF NOT EXISTS idx_ideias_equipe ON ideias(equipe_id);
CREATE INDEX IF NOT EXISTS idx_projetos_equipe ON projetos(equipe_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_equipe ON tarefas(equipe_id);
CREATE INDEX IF NOT EXISTS idx_servicos_equipe ON servicos(equipe_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideias ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permissivo para app demo)
CREATE POLICY "Permitir todas operações em usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em equipes" ON equipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em convites" ON convites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em ideias" ON ideias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em projetos" ON projetos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em tarefas" ON tarefas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em servicos" ON servicos FOR ALL USING (true) WITH CHECK (true);

-- Permissões de acesso anônimo
GRANT ALL ON usuarios TO anon;
GRANT ALL ON equipes TO anon;
GRANT ALL ON convites TO anon;
GRANT ALL ON ideias TO anon;
GRANT ALL ON projetos TO anon;
GRANT ALL ON tarefas TO anon;
GRANT ALL ON servicos TO anon;
