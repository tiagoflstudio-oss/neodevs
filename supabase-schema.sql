-- ============================================================
-- DevHub — Script SQL para Supabase
-- Copie e cole no SQL Editor do Supabase
-- ============================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  avatar TEXT DEFAULT '🧑‍💻',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE IDEIAS
CREATE TABLE ideias (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'rascunho',
  prioridade TEXT DEFAULT 'media',
  autor_id TEXT REFERENCES usuarios(id),
  tags TEXT[] DEFAULT '{}',
  votos INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PROJETOS
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

-- 4. TABELA DE TAREFAS
CREATE TABLE tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  projeto_id TEXT REFERENCES projetos(id) ON DELETE CASCADE,
  responsavel_id TEXT REFERENCES usuarios(id),
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'media',
  prazo DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE SERVIÇOS
CREATE TABLE servicos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT DEFAULT '🔧',
  categoria TEXT DEFAULT 'desenvolvimento',
  preco TEXT DEFAULT 'Sob consulta',
  recursos TEXT[] DEFAULT '{}',
  destaque BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ideias_status ON ideias(status);
CREATE INDEX idx_projetos_status ON projetos(status);
CREATE INDEX idx_tarefas_status ON tarefas(status);
CREATE INDEX idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX idx_servicos_categoria ON servicos(categoria);

-- Habilitar RLS (Row Level Security) - Permite acesso público de leitura
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideias ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permissivo para app demo)
CREATE POLICY "Permitir todas operações em usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em ideias" ON ideias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em projetos" ON projetos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em tarefas" ON tarefas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em servicos" ON servicos FOR ALL USING (true) WITH CHECK (true);

-- Permissões de acesso anônimo
GRANT ALL ON usuarios TO anon;
GRANT ALL ON ideias TO anon;
GRANT ALL ON projetos TO anon;
GRANT ALL ON tarefas TO anon;
GRANT ALL ON servicos TO anon;
