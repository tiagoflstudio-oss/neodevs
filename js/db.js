const SUPABASE_URL = 'https://wipwvjuikcmsmpvqedis.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcHd2anVpa2Ntc21wdnFlZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDM5NjgsImV4cCI6MjA5MDU3OTk2OH0.eG-vZp3w8qeJySAcGtDjB2Gkl_HQyR2Ri9va2QdPnFw';

const supabaseFetch = async (table, options = {}) => {
  const { method = 'GET', body = null, query = '' } = options;
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
  if (method === 'GET' || method === 'POST') {
    const data = await res.json();
    return res.ok ? data : [];
  }
  return res.ok;
};

const DB = {
  now: () => new Date().toISOString(),
  uid: () => '_' + Math.random().toString(36).slice(2, 10),

  async init() {
    const { data: usuarios } = await supabaseFetch('usuarios', { query: '?limit=1' });
    if (usuarios && usuarios.length > 0) return;
    
    const n = this.now();
    await supabaseFetch('usuarios', { method: 'POST', body: { id: 'u1', nome: 'Dev Demo', email: 'demo@devhub.com', senha: 'demo123', avatar: '🧑‍💻', tipo: 'dev', criado_em: n } });
    await supabaseFetch('usuarios', { method: 'POST', body: { id: 'c1', nome: 'Empresa Demo', email: 'demo@empresa.com', senha: 'demo123', avatar: '🏢', tipo: 'cliente', empresa: 'Demo Corp', criado_em: n } });
    await supabaseFetch('ideias', { method: 'POST', body: { id: 'i1', titulo: 'Notificações Push em Tempo Real', descricao: 'Implementar notificações usando WebSockets para alertar devs sobre mudanças nos projetos.', status: 'aprovada', prioridade: 'alta', autor_id: 'u1', tags: ['backend','websocket'], votos: 5, criado_em: n } });
    await supabaseFetch('projetos', { method: 'POST', body: { id: 'p1', titulo: 'DevHub Platform', descricao: 'Plataforma principal de gestão para desenvolvedores.', status: 'em-andamento', progresso: 65, prazo: '2026-06-30', categoria: 'web', criado_em: n } });
    await supabaseFetch('tarefas', { method: 'POST', body: { id: 't1', titulo: 'Configurar autenticação JWT', descricao: 'Login seguro com tokens JWT e refresh tokens.', projeto_id: 'p1', responsavel_id: 'u1', status: 'concluida', prioridade: 'alta', prazo: '2026-04-10', criado_em: n } });
  },

  async load() {
    await this.init();
    const [usuarios, clientes, ideias, projetos, tarefas, mensagens, contratos] = await Promise.all([
      supabaseFetch('usuarios', { query: '?tipo=eq.dev' }),
      supabaseFetch('usuarios', { query: '?tipo=eq.cliente' }),
      supabaseFetch('ideias', { query: '?order=criado_em.desc' }),
      supabaseFetch('projetos', { query: '?order=criado_em.desc' }),
      supabaseFetch('tarefas', { query: '?order=criado_em.desc' }),
      supabaseFetch('mensagens', { query: '?order=criado_em.desc&limit=50' }),
      supabaseFetch('contratos', { query: '?order=criado_em.desc' }),
    ]);
    return { usuarios, clientes, ideias, projetos, tarefas, mensagens, contratos };
  },

  getSessao() { return localStorage.getItem('devhub_sessao'); },
  getTipoSessao() { return localStorage.getItem('devhub_tipo'); },
  setSessao(userId, tipo) { localStorage.setItem('devhub_sessao', userId); localStorage.setItem('devhub_tipo', tipo); },
  clearSessao() { localStorage.removeItem('devhub_sessao'); localStorage.removeItem('devhub_tipo'); },

  async findUser(email) {
    const data = await supabaseFetch('usuarios', { query: `?email=eq.${encodeURIComponent(email)}&tipo=eq.dev&limit=1` });
    return data[0] || null;
  },
  async getUser(id) {
    const data = await supabaseFetch('usuarios', { query: `?id=eq.${id}&limit=1` });
    return data[0] || null;
  },
  async addUser(user) { await supabaseFetch('usuarios', { method: 'POST', body: user }); },
  async updateUser(updated) { await supabaseFetch(`usuarios?id=eq.${updated.id}`, { method: 'PATCH', body: updated }); },

  async findCliente(email) {
    const data = await supabaseFetch('usuarios', { query: `?email=eq.${encodeURIComponent(email)}&tipo=eq.cliente&limit=1` });
    return data[0] || null;
  },
  async getCliente(id) {
    const data = await supabaseFetch('usuarios', { query: `?id=eq.${id}&limit=1` });
    return data[0] || null;
  },
  async addCliente(c) { await supabaseFetch('usuarios', { method: 'POST', body: c }); },
  async updateCliente(updated) { await supabaseFetch(`usuarios?id=eq.${updated.id}`, { method: 'PATCH', body: updated }); },

  async getIdeias() { return await supabaseFetch('ideias', { query: '?order=criado_em.desc' }); },
  async addIdeia(i) { await supabaseFetch('ideias', { method: 'POST', body: i }); },
  async updateIdeia(item) { await supabaseFetch(`ideias?id=eq.${item.id}`, { method: 'PATCH', body: item }); },
  async deleteIdeia(id) { await supabaseFetch(`ideias?id=eq.${id}`, { method: 'DELETE' }); },

  async getProjetos() { return await supabaseFetch('projetos', { query: '?order=criado_em.desc' }); },
  async addProjeto(p) { await supabaseFetch('projetos', { method: 'POST', body: p }); },
  async updateProjeto(item) { await supabaseFetch(`projetos?id=eq.${item.id}`, { method: 'PATCH', body: item }); },
  async deleteProjeto(id) { await supabaseFetch(`projetos?id=eq.${id}`, { method: 'DELETE' }); },

  async getTarefas() { return await supabaseFetch('tarefas', { query: '?order=criado_em.desc' }); },
  async addTarefa(t) { await supabaseFetch('tarefas', { method: 'POST', body: t }); },
  async updateTarefa(item) { await supabaseFetch(`tarefas?id=eq.${item.id}`, { method: 'PATCH', body: item }); },
  async deleteTarefa(id) { await supabaseFetch(`tarefas?id=eq.${id}`, { method: 'DELETE' }); },

  async getMensagens() { return await supabaseFetch('mensagens', { query: '?order=criado_em.desc&limit=50' }); },
  async addMensagem(m) { await supabaseFetch('mensagens', { method: 'POST', body: m }); },

  async getContratos() { return await supabaseFetch('contratos', { query: '?order=criado_em.desc' }); },
  async addContrato(c) { await supabaseFetch('contratos', { method: 'POST', body: c }); },

  async getEquipes() { return await supabaseFetch('equipes', { query: '?order=criado_em.desc' }); },
  async addEquipe(e) { await supabaseFetch('equipes', { method: 'POST', body: e }); },
  async getEquipe(id) {
    const data = await supabaseFetch('equipes', { query: `?id=eq.${id}&limit=1` });
    return data[0] || null;
  },
  async getMembros(equipeId) {
    return await supabaseFetch('membros_equipes', { query: `?equipe_id=eq.${equipeId}` });
  },
  async addMembro(m) { await supabaseFetch('membros_equipes', { method: 'POST', body: m }); },
  async addConvite(c) { await supabaseFetch('convites', { method: 'POST', body: c }); },
  async getMyEquipes() {
    const membros = await supabaseFetch('membros_equipes', { query: `?usuario_id=eq.${this.getSessao()}` });
    const equipeIds = membros.map(m => m.equipe_id);
    if (equipeIds.length === 0) return [];
    const equipes = await this.getEquipes();
    return equipes.filter(e => equipeIds.includes(e.id));
  },
  async joinEquipe(codigo) {
    const equipes = await supabaseFetch('equipes', { query: `?codigo_convite=eq.${codigo}&limit=1` });
    if (!equipes.length) return null;
    const equipe = equipes[0];
    await this.addMembro({ id: this.uid(), equipe_id: equipe.id, usuario_id: this.getSessao(), funcao: 'membro' });
    return equipe;
  },
  async getMinhasEquipes() {
    const membros = await supabaseFetch('membros_equipes', { query: `?usuario_id=eq.${this.getSessao()}` });
    const ids = membros.map(m => m.equipe_id);
    if (!ids.length) return [];
    const eqs = await this.getEquipes();
    return eqs.filter(e => ids.includes(e.id));
  },
  async getConvitesPendentes() {
    const user = this.getSessao();
    const usuarios = await supabaseFetch('usuarios', { query: `?email=eq.${encodeURIComponent(user)}&limit=1` });
    if (!usuarios.length) return [];
    const email = usuarios[0].email;
    return await supabaseFetch('convites', { query: `?email=eq.${encodeURIComponent(email)}&status=eq.pendente` });
  },
  async aceitarConvite(conviteId, equipeId) {
    await supabaseFetch(`convites?id=eq.${conviteId}`, { method: 'PATCH', body: { status: 'aceito' } });
    await this.addMembro({ id: this.uid(), equipe_id: equipeId, usuario_id: this.getSessao(), funcao: 'membro' });
  },
  async recusarConvite(conviteId) {
    await supabaseFetch(`convites?id=eq.${conviteId}`, { method: 'PATCH', body: { status: 'recusado' } });
  },
};