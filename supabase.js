/* ============================================================
   Supabase Configuration — DevHub
   ============================================================ */

const SUPABASE_URL = 'https://wipwvjuikcmsmpvqedis.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcHd2anVpa2Ntc21wdnFlZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDM5NjgsImV4cCI6MjA5MDU3OTk2OH0.eG-vZp3w8qeJySAcGtDjB2Gkl_HQyR2Ri9va2QdPnFw';

// Inicializar cliente Supabase (v2 API)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ──────────────────────────────────────────────
   SUPABASE DATABASE (substitui localStorage)
   ────────────────────────────────────────────── */
const SupaDB = {
  // Helper
  uid: () => '_' + Math.random().toString(36).slice(2, 10),
  now: () => new Date().toISOString(),

  // ── USUÁRIOS ──
  async getUsuarios() {
    const { data, error } = await supabaseClient.from('usuarios').select('*');
    if (error) { console.error('Erro ao buscar usuários:', error); return []; }
    return data || [];
  },

  async findUser(email) {
    const { data, error } = await supabaseClient.from('usuarios').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') { console.error('Erro ao buscar usuário:', error); return null; }
    return data;
  },

  async getUser(id) {
    const { data, error } = await supabaseClient.from('usuarios').select('*').eq('id', id).single();
    if (error) { console.error('Erro ao buscar usuário:', error); return null; }
    return data;
  },

  async addUser(user) {
    const { data, error } = await supabaseClient.from('usuarios').insert([user]).select().single();
    if (error) { console.error('Erro ao adicionar usuário:', error); return null; }
    return data;
  },

  async updateUser(user) {
    const { data, error } = await supabaseClient.from('usuarios').update(user).eq('id', user.id).select().single();
    if (error) { console.error('Erro ao atualizar usuário:', error); return null; }
    return data;
  },

  // ── SESSÃO (localStorage para sessão) ──
  getSessao() { return localStorage.getItem('devhub_session'); },
  setSessao(userId) { localStorage.setItem('devhub_session', userId); },
  clearSessao() { localStorage.removeItem('devhub_session'); },

  // ── IDEIAS ──
  async getIdeias() {
    const { data, error } = await supabaseClient.from('ideias').select('*').order('criado_em', { ascending: false });
    if (error) { console.error('Erro ao buscar ideias:', error); return []; }
    return data || [];
  },

  async addIdeia(ideia) {
    const { data, error } = await supabaseClient.from('ideias').insert([ideia]).select().single();
    if (error) { console.error('Erro ao adicionar ideia:', error); return null; }
    return data;
  },

  async updateIdeia(ideia) {
    const { data, error } = await supabaseClient.from('ideias').update(ideia).eq('id', ideia.id).select().single();
    if (error) { console.error('Erro ao atualizar ideia:', error); return null; }
    return data;
  },

  async deleteIdeia(id) {
    const { error } = await supabaseClient.from('ideias').delete().eq('id', id);
    if (error) { console.error('Erro ao deletar ideia:', error); return false; }
    return true;
  },

  // ── PROJETOS ──
  async getProjetos() {
    const { data, error } = await supabaseClient.from('projetos').select('*').order('criado_em', { ascending: false });
    if (error) { console.error('Erro ao buscar projetos:', error); return []; }
    return data || [];
  },

  async addProjeto(projeto) {
    const { data, error } = await supabaseClient.from('projetos').insert([projeto]).select().single();
    if (error) { console.error('Erro ao adicionar projeto:', error); return null; }
    return data;
  },

  async updateProjeto(projeto) {
    const { data, error } = await supabaseClient.from('projetos').update(projeto).eq('id', projeto.id).select().single();
    if (error) { console.error('Erro ao atualizar projeto:', error); return null; }
    return data;
  },

  async deleteProjeto(id) {
    const { error } = await supabaseClient.from('projetos').delete().eq('id', id);
    if (error) { console.error('Erro ao deletar projeto:', error); return false; }
    return true;
  },

  // ── TAREFAS ──
  async getTarefas() {
    const { data, error } = await supabaseClient.from('tarefas').select('*').order('criado_em', { ascending: false });
    if (error) { console.error('Erro ao buscar tarefas:', error); return []; }
    return data || [];
  },

  async addTarefa(tarefa) {
    const { data, error } = await supabaseClient.from('tarefas').insert([tarefa]).select().single();
    if (error) { console.error('Erro ao adicionar tarefa:', error); return null; }
    return data;
  },

  async updateTarefa(tarefa) {
    const { data, error } = await supabaseClient.from('tarefas').update(tarefa).eq('id', tarefa.id).select().single();
    if (error) { console.error('Erro ao atualizar tarefa:', error); return null; }
    return data;
  },

  async deleteTarefa(id) {
    const { error } = await supabaseClient.from('tarefas').delete().eq('id', id);
    if (error) { console.error('Erro ao deletar tarefa:', error); return false; }
    return true;
  },

  // ── SERVIÇOS ──
  async getServicos() {
    const { data, error } = await supabaseClient.from('servicos').select('*').order('criado_em', { ascending: false });
    if (error) { console.error('Erro ao buscar serviços:', error); return []; }
    return data || [];
  },

  async addServico(servico) {
    const { data, error } = await supabaseClient.from('servicos').insert([servico]).select().single();
    if (error) { console.error('Erro ao adicionar serviço:', error); return null; }
    return data;
  },

  async updateServico(servico) {
    const { data, error } = await supabaseClient.from('servicos').update(servico).eq('id', servico.id).select().single();
    if (error) { console.error('Erro ao atualizar serviço:', error); return null; }
    return data;
  },

  async deleteServico(id) {
    const { error } = await supabaseClient.from('servicos').delete().eq('id', id);
    if (error) { console.error('Erro ao deletar serviço:', error); return false; }
    return true;
  },

  // ── SEED (criar dados iniciais se vazio) ──
  async seed() {
    const usuarios = await this.getUsuarios();
    if (usuarios.length > 0) return; // Já tem dados

    const n = this.now();

    // Usuário demo
    await this.addUser({
      id: 'u1',
      nome: 'Dev Demo',
      email: 'demo@devhub.com',
      senha: 'demo123',
      avatar: '🧑‍💻',
      criado_em: n
    });

    // Ideias iniciais
    const ideias = [
      { id: 'i1', titulo: 'Notificações Push em Tempo Real', descricao: 'Implementar notificações usando WebSockets para alertar devs sobre mudanças nos projetos.', status: 'aprovada', prioridade: 'alta', autor_id: 'u1', tags: ['backend', 'websocket'], votos: 5, criado_em: n },
      { id: 'i2', titulo: 'App Mobile React Native', descricao: 'Versão mobile do DevHub para acompanhar projetos e tarefas de qualquer lugar.', status: 'em-analise', prioridade: 'media', autor_id: 'u1', tags: ['mobile', 'react-native'], votos: 3, criado_em: n },
      { id: 'i3', titulo: 'Integração com GitHub', descricao: 'Sincronizar projetos com repositórios do GitHub mostrando commits e pull requests.', status: 'rascunho', prioridade: 'alta', autor_id: 'u1', tags: ['api', 'github'], votos: 7, criado_em: n },
    ];
    for (const i of ideias) await this.addIdeia(i);

    // Projetos iniciais
    const projetos = [
      { id: 'p1', titulo: 'DevHub Platform', descricao: 'Plataforma principal de gestão para desenvolvedores.', status: 'em-andamento', progresso: 65, equipe: ['u1'], prazo: '2026-06-30', categoria: 'web', criado_em: n },
      { id: 'p2', titulo: 'API Gateway', descricao: 'Centralizar chamadas de API com autenticação e rate limiting.', status: 'planejamento', progresso: 20, equipe: ['u1'], prazo: '2026-08-15', categoria: 'backend', criado_em: n },
      { id: 'p3', titulo: 'Design System', descricao: 'Componentes reutilizáveis e tokens de design para padronizar a UI.', status: 'concluido', progresso: 100, equipe: ['u1'], prazo: '2026-03-01', categoria: 'design', criado_em: n },
    ];
    for (const p of projetos) await this.addProjeto(p);

    // Tarefas iniciais
    const tarefas = [
      { id: 't1', titulo: 'Configurar autenticação JWT', descricao: 'Login seguro com tokens JWT e refresh tokens.', projeto_id: 'p1', responsavel_id: 'u1', status: 'concluida', prioridade: 'alta', prazo: '2026-04-10', criado_em: n },
      { id: 't2', titulo: 'Modelar banco de dados (ERD)', descricao: 'Entidades e relacionamentos do banco de dados.', projeto_id: 'p2', responsavel_id: 'u1', status: 'em-andamento', prioridade: 'alta', prazo: '2026-04-05', criado_em: n },
      { id: 't3', titulo: 'Prototipar telas no Figma', descricao: 'Wireframes e protótipos de alta fidelidade.', projeto_id: 'p3', responsavel_id: 'u1', status: 'revisao', prioridade: 'media', prazo: '2026-04-08', criado_em: n },
    ];
    for (const t of tarefas) await this.addTarefa(t);

    // Serviços iniciais
    const servicos = [
      { id: 's1', titulo: 'Desenvolvimento de Sistemas', descricao: 'Criamos sistemas personalizados sob medida para o seu negócio.', icone: '💻', categoria: 'desenvolvimento', preco: 'Sob consulta', recursos: ['Aplicações Web', 'Sistemas Desktop', 'Apps Mobile', 'APIs RESTful'], destaque: true, criado_em: n },
      { id: 's2', titulo: 'UI/UX Design', descricao: 'Projetamos interfaces modernas e intuitivas que encantam seus usuários.', icone: '🎨', categoria: 'design', preco: 'Sob consulta', recursos: ['Wireframes', 'Design System', 'Testes de Usabilidade'], destaque: true, criado_em: n },
      { id: 's3', titulo: 'DevOps & Cloud', descricao: 'Implementamos pipelines de CI/CD e infraestrutura em nuvem.', icone: '☁️', categoria: 'infraestrutura', preco: 'Sob consulta', recursos: ['CI/CD Pipeline', 'AWS / Azure', 'Docker & Kubernetes'], destaque: false, criado_em: n },
    ];
    for (const s of servicos) await this.addServico(s);

    console.log('✅ Dados iniciais criados no Supabase!');
  }
};
