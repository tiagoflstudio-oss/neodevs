/* ============================================================
   DevHub — Application Logic (Supabase)
   ============================================================ */

const SUPABASE_URL = 'https://wipwvjuikcmsmpvqedis.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcHd2anVpa2Ntc21wdnFlZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDM5NjgsImV4cCI6MjA5MDU3OTk2OH0.eG-vZp3w8qeJySAcGtDjB2Gkl_HQyR2Ri9va2QdPnFw';

/* ──────────────────────────────────────────────
   SUPABASE CLIENT
────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   DATABASE (Supabase)
────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   AUTH
────────────────────────────────────────────── */
const Auth = {
  currentUser: null,
  tipo: null,
  data: null,

  async init() {
    this.data = await DB.load();
    const sid = DB.getSessao();
    const tipo = DB.getTipoSessao();
    if (sid) {
      if (tipo === 'dev') {
        this.currentUser = await DB.getUser(sid);
      } else if (tipo === 'cliente') {
        this.currentUser = await DB.getCliente(sid);
      }
      if (this.currentUser) {
        this.tipo = tipo;
        this.showApp();
        return;
      }
    }
    this.showAuth();
  },

  showAuth() {
    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    initThreeBg();
  },

  showApp() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('topbar-avatar').textContent = this.currentUser.avatar;
    document.getElementById('topbar-name').textContent = this.currentUser.nome.split(' ')[0];
    stopThreeBg();
    Router.init();
    ChatCtrl.init();
    
    if (this.tipo === 'cliente') {
      document.getElementById('menu-dashboard').style.display = 'none';
      document.getElementById('menu-ideias').style.display = 'none';
      document.getElementById('menu-projetos').style.display = 'none';
      document.getElementById('menu-tarefas').style.display = 'none';
      document.getElementById('menu-equipes').style.display = 'none';
      document.getElementById('menu-devs').style.display = 'flex';
      document.getElementById('menu-contratos').style.display = 'flex';
    } else {
      document.getElementById('menu-dashboard').style.display = 'flex';
      document.getElementById('menu-ideias').style.display = 'flex';
      document.getElementById('menu-projetos').style.display = 'flex';
      document.getElementById('menu-tarefas').style.display = 'flex';
      document.getElementById('menu-equipes').style.display = 'flex';
      document.getElementById('menu-devs').style.display = 'flex';
      document.getElementById('menu-contratos').style.display = 'none';
    }
  },

  showTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  },

  showTipo(tipo) {
    document.getElementById('tipo-dev').classList.toggle('active', tipo === 'dev');
    document.getElementById('tipo-cliente').classList.toggle('active', tipo === 'cliente');
    document.getElementById('login-form').dataset.tipo = tipo;
    document.getElementById('register-form').dataset.tipo = tipo;
    document.getElementById('grp-empresa').style.display = tipo === 'cliente' ? 'flex' : 'none';
    
    const hint = document.getElementById('login-hint');
    if (tipo === 'cliente') {
      hint.innerHTML = '🔑 Demo Cliente: <strong>demo@empresa.com</strong> / <strong>demo123</strong>';
      document.getElementById('login-email').value = 'demo@empresa.com';
      document.getElementById('login-password').value = 'demo123';
    } else {
      hint.innerHTML = '🔑 Demo Dev: <strong>demo@devhub.com</strong> / <strong>demo123</strong>';
      document.getElementById('login-email').value = 'demo@devhub.com';
      document.getElementById('login-password').value = 'demo123';
    }
  },

  async login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-password').value;
    const tipo = document.getElementById('login-form').dataset.tipo || 'dev';
    
    if (tipo === 'dev') {
      const user = await DB.findUser(email);
      if (!user || user.senha !== senha) { Toast.show('Email ou senha incorretos', 'error'); return; }
      this.currentUser = user;
      this.tipo = 'dev';
      DB.setSessao(user.id, 'dev');
      Toast.show('Bem-vindo, ' + user.nome.split(' ')[0] + '! 👋', 'success');
    } else {
      const cliente = await DB.findCliente(email);
      if (!cliente || cliente.senha !== senha) { Toast.show('Email ou senha incorretos', 'error'); return; }
      this.currentUser = cliente;
      this.tipo = 'cliente';
      DB.setSessao(cliente.id, 'cliente');
      Toast.show('Bem-vindo, ' + cliente.nome.split(' ')[0] + '! 🏢', 'success');
    }
    this.showApp();
  },

  async register(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const senha = document.getElementById('reg-password').value;
    const tipo = document.getElementById('register-form').dataset.tipo || 'dev';
    
    if (tipo === 'dev') {
      const existing = await DB.findUser(email);
      if (existing) { Toast.show('Este email já está cadastrado', 'error'); return; }
      const user = { id: DB.uid(), nome, email, senha, avatar: '🧑‍💻', tipo: 'dev', criado_em: DB.now() };
      await DB.addUser(user);
      this.currentUser = user;
      this.tipo = 'dev';
      DB.setSessao(user.id, 'dev');
      Toast.show('Conta criada! Bem-vindo, ' + nome.split(' ')[0] + '! 🎉', 'success');
    } else {
      const empresa = document.getElementById('reg-empresa').value.trim();
      const existing = await DB.findCliente(email);
      if (existing) { Toast.show('Este email já está cadastrado', 'error'); return; }
      const cliente = { id: DB.uid(), nome, email, senha, empresa, avatar: '🏢', tipo: 'cliente', criado_em: DB.now() };
      await DB.addCliente(cliente);
      this.currentUser = cliente;
      this.tipo = 'cliente';
      DB.setSessao(cliente.id, 'cliente');
      Toast.show('Conta criada! Bem-vindo, ' + nome.split(' ')[0] + '! 🏢', 'success');
    }
    this.showApp();
  },

  logout() {
    DB.clearSessao();
    this.currentUser = null;
    this.tipo = null;
    Toast.show('Até logo! 👋', 'info');
    this.showAuth();
  },

  isDev() { return this.tipo === 'dev'; },
  isCliente() { return this.tipo === 'cliente'; },
};

/* ──────────────────────────────────────────────
   ROUTER
────────────────────────────────────────────── */
const Router = {
  current: 'dashboard',

  init() {
    const defaultRoute = Auth.isCliente() ? 'cliente' : 'dashboard';
    const hash = location.hash.replace('#', '') || defaultRoute;
    this.navigate(hash);
    window.addEventListener('hashchange', () => {
      const r = location.hash.replace('#', '') || defaultRoute;
      this.render(r);
    });
  },

  navigate(route) {
    location.hash = route;
    this.render(route);
  },

  render(route) {
    if (Auth.isCliente() && ['dashboard','ideias','projetos','tarefas','equipes'].includes(route)) {
      this.navigate('cliente');
      return;
    }
    if (Auth.isDev() && route === 'cliente') {
      this.navigate('dashboard');
      return;
    }
    this.current = route;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === route);
    });
    const mc = document.getElementById('main-content');
    mc.innerHTML = '<div class="spinner"></div>';
    setTimeout(async () => {
      const views = { 
        dashboard: Views.dashboard, 
        ideias: Views.ideias, 
        projetos: Views.projetos, 
        tarefas: Views.tarefas, 
        perfil: Views.perfil,
        desenvolvedores: Auth.isDev() ? Views.desenvolvedores : null,
        contratos: Views.contratos,
        equipes: Views.equipes,
        cliente: Views.cliente,
      };
      const fn = views[route];
      if (fn) await fn(); 
      else mc.innerHTML = '<p style="padding:40px;color:var(--muted)">Página não encontrada.</p>';
    }, 80);
  },
};

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
function badge(val, type) {
  const labels = {
    alta:'Alta', media:'Média', baixa:'Baixa',
    planejamento:'Planejamento','em-andamento':'Em Andamento', pausado:'Pausado', concluido:'Concluído',
    rascunho:'Rascunho','em-analise':'Em Análise', aprovada:'Aprovada', rejeitada:'Rejeitada',
    pendente:'Pendente','em-andamento-t':'Em Andamento', revisao:'Revisão', concluida:'Concluída',
  };
  const key = type === 'tarefa-status' && val === 'em-andamento' ? 'em-andamento' : val;
  return `<span class="badge badge-${val}">${labels[val] || val}</span>`;
}

function prazoLabel(prazoStr) {
  if (!prazoStr) return '';
  const dias = Math.ceil((new Date(prazoStr) - new Date()) / 86400000);
  const cls = dias <= 3 ? 'urgente' : '';
  const txt = dias < 0 ? 'Atrasado' : dias === 0 ? 'Hoje' : `${dias}d`;
  return `<span class="prazo ${cls}">📅 ${txt}</span>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('pt-BR');
}

/* ──────────────────────────────────────────────
   VIEWS
────────────────────────────────────────────── */
const Views = {

  /* ── DASHBOARD ── */
  async dashboard() {
    const ideias = await DB.getIdeias();
    const projetos = await DB.getProjetos();
    const tarefas = await DB.getTarefas();
    const usuarios = await supabaseFetch('usuarios', { query: '?tipo=eq.dev' });
    const ativos = projetos.filter(p => p.status === 'em-andamento').length;
    const pendentes = tarefas.filter(t => t.status === 'pendente' || t.status === 'em-andamento').length;
    const concluidas = tarefas.filter(t => t.status === 'concluida').length;
    const mediaProgresso = projetos.length ? Math.round(projetos.reduce((acc,p) => acc + p.progresso, 0) / projetos.length) : 0;
    
    const ideasAprovadas = ideias.filter(i => i.status === 'aprovada').length;
    const tarefasAltaPri = tarefas.filter(t => t.prioridade === 'alta' && t.status !== 'concluida').length;
    const projetosCriticos = projetos.filter(p => p.status === 'em-andamento' && p.progresso < 30).length;
    
    const recentProjetos = [...projetos].sort((a,b) => b.criado_em.localeCompare(a.criado_em)).slice(0,4);
    const urgentTarefas = tarefas
      .filter(t => t.status !== 'concluida' && t.prazo)
      .sort((a,b) => a.prazo.localeCompare(b.prazo)).slice(0,5);

    const teamStats = usuarios.map(u => {
      const userTarefas = tarefas.filter(t => t.responsavel_id === u.id);
      const userConcluidas = userTarefas.filter(t => t.status === 'concluida').length;
      return { nome: u.nome.split(' ')[0], avatar: u.avatar, concluidas: userConcluidas, total: userTarefas.length };
    });

    const statuses = ['pendente','em-andamento','revisao','concluida'];
    const counts = statuses.map(s => tarefas.filter(t => t.status === s).length);
    const maxC = Math.max(...counts, 1);
    const colors = ['rgba(255,255,255,.3)','#00d4ff','#f59e0b','#10b981'];
    const chartBars = statuses.map((s,i) => `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${Math.round((counts[i]/maxC)*80)+4}px;background:${colors[i]}"></div>
        <div class="chart-lbl">${['Pend.','And.','Rev.','Conc.'][i]}<br>${counts[i]}</div>
      </div>`).join('');

    const projStatusData = projetos.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    const projChartHtml = ['planejamento','em-andamento','pausado','concluido'].map(s => {
      const c = ['#7c3aed','#00d4ff','#f59e0b','#10b981'][['planejamento','em-andamento','pausado','concluido'].indexOf(s)];
      const v = projStatusData[s] || 0;
      return `<div class="donut-segment" style="--v:${v};--c:${c};--t:${projetos.length}"><span class="donut-label">${v}</span></div>`;
    }).join('');

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral dos seus projetos e tarefas</p>
        </div>
        <button class="btn btn-primary" onclick="DashboardCtrl.openChat()">💬 Chat da Equipe</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card cyan">
          <div class="stat-label">💡 Total de Ideias</div>
          <div class="stat-value">${ideias.length}</div>
          <div class="stat-change">${ideasAprovadas} aprovadas</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-label">📁 Projetos Ativos</div>
          <div class="stat-value">${ativos}</div>
          <div class="stat-change">${mediaProgresso}% média progresso</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-label">⏳ Tarefas Abertas</div>
          <div class="stat-value">${pendentes}</div>
          <div class="stat-change">${tarefasAltaPri} alta prioridade</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">✅ Tarefas Concluídas</div>
          <div class="stat-value">${concluidas}</div>
          <div class="stat-change">${tarefas.length > 0 ? Math.round(concluidas/tarefas.length*100) : 0}% de conclusão</div>
        </div>
      </div>

      <div class="stats-grid" style="margin-bottom:0">
        <div class="stat-card purple" style="flex:1">
          <div class="stat-label">🔥 Projetos Críticos</div>
          <div class="stat-value">${projetosCriticos}</div>
          <div class="stat-change">menos de 30% concluídos</div>
        </div>
        <div class="stat-card cyan" style="flex:1">
          <div class="stat-label">👥 Membros da Equipe</div>
          <div class="stat-value">${usuarios.length}</div>
          <div class="stat-change">${projetos.length} projetos ativos</div>
        </div>
        <div class="stat-card green" style="flex:1">
          <div class="stat-label">📈 Taxa de Conclusão</div>
          <div class="stat-value">${tarefas.length ? Math.round(concluidas/tarefas.length*100) : 0}%</div>
          <div class="stat-change">${concluidas} de ${tarefas.length} tarefas</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="section-title">
            📁 Projetos Recentes
            <a onclick="Router.navigate('projetos')">Ver todos →</a>
          </div>
          ${recentProjetos.length === 0 ? '<p style="color:var(--muted);font-size:14px">Nenhum projeto ainda.</p>' :
            recentProjetos.map(p => `
              <div class="project-mini">
                <div class="project-mini-info">
                  <div class="project-mini-name">${escHtml(p.titulo)}</div>
                  <div class="progress-bar"><div class="progress-fill" style="width:${p.progresso}%"></div></div>
                </div>
                <div class="project-mini-pct">${p.progresso}%</div>
              </div>`).join('')}
        </div>

        <div class="card">
          <div class="section-title">
            ⚡ Tarefas com Prazo Próximo
            <a onclick="Router.navigate('tarefas')">Ver todas →</a>
          </div>
          ${urgentTarefas.length === 0 ? '<p style="color:var(--muted);font-size:14px">Nenhuma tarefa com prazo.</p>' :
            urgentTarefas.map(t => `
              <div class="task-mini">
                <div class="task-mini-title">${escHtml(t.titulo)}</div>
                ${badge(t.prioridade)}
                ${prazoLabel(t.prazo)}
              </div>`).join('')}
        </div>

        <div class="card">
          <div class="section-title">📊 Tarefas por Status</div>
          <div class="chart-bars">${chartBars}</div>
        </div>

        <div class="card">
          <div class="section-title">📈 Projetos por Status</div>
          <div class="donut-chart">${projChartHtml}</div>
          <div class="donut-legend">
            <span><span style="display:inline-block;width:10px;height:10px;background:#7c3aed;border-radius:2px;margin-right:5px"></span>Planejamento</span>
            <span><span style="display:inline-block;width:10px;height:10px;background:#00d4ff;border-radius:2px;margin-right:5px"></span>Em Andamento</span>
            <span><span style="display:inline-block;width:10px;height:10px;background:#f59e0b;border-radius:2px;margin-right:5px"></span>Pausado</span>
            <span><span style="display:inline-block;width:10px;height:10px;background:#10b981;border-radius:2px;margin-right:5px"></span>Concluído</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:18px">
        <div class="section-title">👥 Desempenho da Equipe</div>
        <div class="team-grid">
          ${teamStats.map(m => `
            <div class="team-member">
              <div class="team-avatar">${m.avatar}</div>
              <div class="team-info">
                <div class="team-name">${escHtml(m.nome)}</div>
                <div class="team-stats">${m.concluidas}/${m.total} tarefas concluídas</div>
                <div class="team-bar"><div class="team-fill" style="width:${m.total ? (m.concluidas/m.total*100) : 0}%"></div></div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  },

  /* ── IDEIAS ── */
  async ideias() {
    const ideias = await DB.getIdeias();
    const cols = [
      { key: 'rascunho', label: 'Rascunho' },
      { key: 'em-analise', label: 'Em Análise' },
      { key: 'aprovada', label: 'Aprovada' },
      { key: 'rejeitada', label: 'Rejeitada' },
    ];

    function renderCol(col) {
      const items = ideias.filter(i => i.status === col.key);
      const cards = items.map(i => `
        <div class="k-card" id="kc-${i.id}">
          <div class="k-card-title">${escHtml(i.titulo)}</div>
          <div class="k-card-desc">${escHtml(i.descricao)}</div>
          <div class="k-card-footer">
            <div class="k-card-tags">
              ${badge(i.prioridade)}
              ${(i.tags||[]).map(t=>`<span class="tag">${escHtml(t)}</span>`).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:5px">
              <button class="vote-btn" onclick="IdeiaCtrl.votar('${i.id}')">⬆ ${i.votos||0}</button>
              <div class="k-card-actions">
                <button class="act-btn" onclick="IdeiaCtrl.edit('${i.id}')">✏️</button>
                <button class="act-btn del" onclick="IdeiaCtrl.del('${i.id}')">🗑</button>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">
            ${cols.filter(c=>c.key!==col.key).map(c=>`
              <button class="move-btn" onclick="IdeiaCtrl.mover('${i.id}','${c.key}')">→ ${c.label}</button>`).join('')}
          </div>
        </div>`).join('') || '<p style="color:var(--dim);font-size:13px;text-align:center;padding:20px 0">Sem itens</p>';
      return `
        <div class="kanban-column">
          <div class="kanban-col-header">
            <span class="kanban-col-title">${col.label}</span>
            <span class="kanban-col-count">${items.length}</span>
          </div>
          <div class="kanban-cards">${cards}</div>
        </div>`;
    }

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">💡 Ideias</h1>
          <p class="page-subtitle">Registre e gerencie as ideias do time</p>
        </div>
        <button class="btn btn-primary" onclick="IdeiaCtrl.novo()">+ Nova Ideia</button>
      </div>
      <div class="kanban-board kanban-4">${cols.map(renderCol).join('')}</div>`;
  },

  /* ── PROJETOS ── */
  async projetos(filtro) {
    const todos = await DB.getProjetos();
    const f = filtro || 'todos';
    const lista = f === 'todos' ? todos : todos.filter(p => p.status === f);
    const statusOpts = ['todos','planejamento','em-andamento','pausado','concluido'];
    const statusLabels = { todos:'Todos', planejamento:'Planejamento','em-andamento':'Em Andamento', pausado:'Pausado', concluido:'Concluído' };

    const cards = lista.map(p => `
      <div class="proj-card">
        <div class="proj-card-top">
          <div>
            <div class="proj-card-name">${escHtml(p.titulo)}</div>
            ${badge(p.status)}
          </div>
          <div class="proj-card-actions">
            <button class="act-btn" onclick="event.stopPropagation();ProjetoCtrl.edit('${p.id}')">✏️</button>
            <button class="act-btn del" onclick="event.stopPropagation();ProjetoCtrl.del('${p.id}')">🗑</button>
          </div>
        </div>
        <div class="proj-card-desc">${escHtml(p.descricao)}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${p.progresso}%"></div></div>
        <div class="proj-card-meta">
          <span>${p.categoria || ''}</span>
          <span>${p.progresso}% concluído</span>
          ${prazoLabel(p.prazo)}
        </div>
      </div>`).join('');

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">📁 Projetos</h1>
          <p class="page-subtitle">${todos.length} projetos no total</p>
        </div>
        <button class="btn btn-primary" onclick="ProjetoCtrl.novo()">+ Novo Projeto</button>
      </div>
      <div class="filters-bar">
        ${statusOpts.map(s => `<button class="filter-chip ${f===s?'active':''}" onclick="Views.projetos('${s}')">${statusLabels[s]}</button>`).join('')}
      </div>
      ${lista.length === 0
        ? `<div class="empty"><div class="empty-icon">📁</div><div class="empty-title">Nenhum projeto aqui</div><div class="empty-desc">Crie seu primeiro projeto!</div><button class="btn btn-primary" onclick="ProjetoCtrl.novo()">+ Novo Projeto</button></div>`
        : `<div class="projects-grid">${cards}</div>`}`;
  },

  /* ── TAREFAS ── */
  async tarefas(filtroProj) {
    const tarefas = await DB.getTarefas();
    const projetos = await DB.getProjetos();
    const fp = filtroProj || 'todos';
    const lista = fp === 'todos' ? tarefas : tarefas.filter(t => t.projeto_id === fp);

    const cols = [
      { key: 'pendente', label: 'Pendente' },
      { key: 'em-andamento', label: 'Em Andamento' },
      { key: 'revisao', label: 'Revisão' },
      { key: 'concluida', label: 'Concluída' },
    ];

    function renderCol(col) {
      const items = lista.filter(t => t.status === col.key);
      const cards = items.map(t => {
        const proj = projetos.find(p => p.id === t.projeto_id);
        return `
          <div class="k-card">
            <div class="k-card-title">${escHtml(t.titulo)}</div>
            <div class="k-card-desc">${escHtml(t.descricao)}</div>
            <div class="k-card-footer">
              <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
                ${badge(t.prioridade)}
                ${proj ? `<span class="tag">📁 ${escHtml(proj.titulo)}</span>` : ''}
                ${prazoLabel(t.prazo)}
              </div>
              <div class="k-card-actions">
                <button class="act-btn" onclick="TarefaCtrl.edit('${t.id}')">✏️</button>
                <button class="act-btn del" onclick="TarefaCtrl.del('${t.id}')">🗑</button>
              </div>
            </div>
            <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">
              ${cols.filter(c=>c.key!==col.key).map(c=>`
                <button class="move-btn" onclick="TarefaCtrl.mover('${t.id}','${c.key}')">→ ${c.label}</button>`).join('')}
            </div>
          </div>`;
      }).join('') || '<p style="color:var(--dim);font-size:13px;text-align:center;padding:20px 0">Sem tarefas</p>';
      return `
        <div class="kanban-column">
          <div class="kanban-col-header">
            <span class="kanban-col-title">${col.label}</span>
            <span class="kanban-col-count">${items.length}</span>
          </div>
          <div class="kanban-cards">${cards}</div>
        </div>`;
    }

    const projOpts = `<option value="todos">Todos os projetos</option>` +
      projetos.map(p => `<option value="${p.id}" ${fp===p.id?'selected':''}>${escHtml(p.titulo)}</option>`).join('');

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">✅ Tarefas</h1>
          <p class="page-subtitle">${tarefas.length} tarefas no total</p>
        </div>
        <button class="btn btn-primary" onclick="TarefaCtrl.novo()">+ Nova Tarefa</button>
      </div>
      <div class="filters-bar">
        <select onchange="Views.tarefas(this.value)">${projOpts}</select>
      </div>
      <div class="kanban-board kanban-4">${cols.map(renderCol).join('')}</div>`;
  },

  /* ── PERFIL ── */
  async perfil() {
    const u = Auth.currentUser;
    const ideias = (await DB.getIdeias()).filter(i => i.autor_id === u.id);
    const tarefas = await DB.getTarefas();
    const concluidas = tarefas.filter(t => t.responsavel_id === u.id && t.status === 'concluida').length;
    const projetos = (await DB.getProjetos()).filter(p => (p.equipe_id) === u.id);
    const avatares = ['🧑‍💻','👨‍💻','👩‍💻','🦸','🧙','🤖','🎮','🚀','⚡','🔥'];

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1 class="page-title">👤 Perfil</h1>
      </div>
      <div class="profile-head">
        <div class="profile-avatar" id="prof-av">${u.avatar}</div>
        <div>
          <div class="profile-name">${escHtml(u.nome)}</div>
          <div class="profile-email">${escHtml(u.email)}</div>
          ${u.empresa ? `<div class="profile-email">🏢 ${escHtml(u.empresa)}</div>` : ''}
          <button class="btn btn-ghost btn-sm" style="margin-top:14px" onclick="PerfilCtrl.editarPerfil()">✏️ Editar Perfil</button>
        </div>
      </div>
      ${Auth.isDev() ? `
      <div class="profile-stats-grid">
        <div class="p-stat"><div class="p-stat-val">${ideias.length}</div><div class="p-stat-lbl">💡 Ideias criadas</div></div>
        <div class="p-stat"><div class="p-stat-val">${projetos.length}</div><div class="p-stat-lbl">📁 Projetos</div></div>
        <div class="p-stat"><div class="p-stat-val">${concluidas}</div><div class="p-stat-lbl">✅ Tarefas concluídas</div></div>
      </div>
      <div class="card">
        <div class="section-title">🎨 Escolher Avatar</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
          ${avatares.map(av => `<button onclick="PerfilCtrl.setAvatar('${av}')" style="font-size:28px;background:${av===u.avatar?'rgba(0,212,255,.15)':'rgba(255,255,255,.05)'};border:1px solid ${av===u.avatar?'rgba(0,212,255,.4)':'var(--border)'};border-radius:12px;padding:10px 14px;cursor:pointer;transition:.2s">${av}</button>`).join('')}
        </div>
      </div>` : `
      <div class="profile-stats-grid">
        <div class="p-stat"><div class="p-stat-val">${projetos.length}</div><div class="p-stat-lbl">📁 Projetos Ativos</div></div>
        <div class="p-stat"><div class="p-stat-val">${(await DB.getContratos()).filter(c => c.cliente_id === u.id).length}</div><div class="p-stat-lbl">📋 Contratos</div></div>
        <div class="p-stat"><div class="p-stat-val">${concluidas}</div><div class="p-stat-lbl">✅ Tarefas Concluídas</div></div>
      </div>`}
    `;
  },

  /* ── DESENVOLVEDORES (para clientes) ── */
  async desenvolvedores() {
    const devs = await supabaseFetch('usuarios', { query: '?tipo=eq.dev' });
    const tarefas = await DB.getTarefas();
    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">👥 Desenvolvedores</h1>
          <p class="page-subtitle">Equipe disponível para contratação</p>
        </div>
      </div>
      <div class="devs-grid-full">
        ${devs.map(d => `
          <div class="dev-card-full">
            <div class="dev-card-full-header">
              <div class="dev-avatar-full">${d.avatar}</div>
              <div class="dev-info-full">
                <div class="dev-name-full">${escHtml(d.nome)}</div>
                <div class="dev-email-full">${escHtml(d.email)}</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="ClienteCtrl.contratar('${d.id}')">Contratar</button>
            </div>
            <div class="dev-skills-full">
              <span class="skill-tag">Full Stack</span>
              <span class="skill-tag">Web</span>
              <span class="skill-tag">Mobile</span>
            </div>
            <div class="dev-stats-full">
              <div class="dev-stat-full">
                <div class="dev-stat-val-full">${tarefas.filter(t => t.responsavel_id === d.id).length}</div>
                <div class="dev-stat-label-full">Tarefas</div>
              </div>
              <div class="dev-stat-full">
                <div class="dev-stat-val-full">${tarefas.filter(t => t.responsavel_id === d.id && t.status === 'concluida').length}</div>
                <div class="dev-stat-label-full">Concluídas</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>`;
  },

  /* ── CONTRATOS (para clientes) ── */
  async contratos() {
    const contratos = (await DB.getContratos()).filter(c => c.cliente_id === Auth.currentUser.id);
    const html = `
      <div class="page-header">
        <div>
          <h1 class="page-title">📋 Meus Contratos</h1>
          <p class="page-subtitle">Gerencie seus contratos de desenvolvedores</p>
        </div>
      </div>
      ${contratos.length === 0 ? `
        <div class="empty">
          <div class="empty-icon">📋</div>
          <div class="empty-title">Nenhum contrato ainda</div>
          <div class="empty-desc">Contrate um desenvolvedor para começar!</div>
          <button class="btn btn-primary" onclick="Router.navigate('desenvolvedores')">Ver Desenvolvedores</button>
        </div>
      ` : `
        <div class="contratos-list">
          ${contratos.map(async c => {
            const dev = await DB.getUser(c.dev_id);
            return `
              <div class="contrato-card">
                <div class="contrato-header">
                  <div class="contrato-dev">
                    <span style="font-size:28px">${dev?.avatar || '👤'}</span>
                    <div>
                      <div class="contrato-dev-name">${escHtml(dev?.nome || 'Desenvolvedor')}</div>
                      <div class="contrato-dev-email">${escHtml(dev?.email || '')}</div>
                    </div>
                  </div>
                  <span class="badge badge-${c.status}">${c.status}</span>
                </div>
                <div class="contrato-body">
                  <div class="contrato-info">
                    <span class="contrato-label">Tipo:</span>
                    <span>${c.tipo}</span>
                  </div>
                  <div class="contrato-info">
                    <span class="contrato-label">Valor:</span>
                    <span>R$ ${c.valor.toLocaleString('pt-BR')}</span>
                  </div>
                  <div class="contrato-info">
                    <span class="contrato-label">Início:</span>
                    <span>${formatDate(c.data_inicio)}</span>
                  </div>
                  ${c.data_fim ? `
                  <div class="contrato-info">
                    <span class="contrato-label">Fim:</span>
                    <span>${formatDate(c.data_fim)}</span>
                  </div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}`;
    document.getElementById('main-content').innerHTML = html;
  },

  /* ── EQUIPES ── */
  async equipes() {
    const equipes = await DB.getMinhasEquipes();
    const allEquipes = await DB.getEquipes();
    const usuarios = await supabaseFetch('usuarios', { query: '?tipo=eq.dev' });
    const convites = await DB.getConvitesPendentes();
    const convitesHtml = convites.length > 0 ? `
      <div class="card" style="margin-bottom:20px;border:2px solid var(--primary)">
        <div class="section-title">🎯 Convites Pendentes</div>
        ${convites.map(c => `
          <div style="padding:15px;margin-top:10px;background:rgba(0,212,255,.1);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:bold">${escHtml(c.email)}</div>
              <div style="font-size:12px;color:var(--muted)">Quero te adicionar na equipe!</div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="EquipeCtrl.aceitar('${c.id}', '${c.equipe_id}')">✓ Aceitar</button>
              <button class="btn btn-ghost btn-sm" onclick="EquipeCtrl.recusar('${c.id}')">✕ Recusar</button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">👨‍👩‍👧‍👦 Equipes</h1>
          <p class="page-subtitle">Gerencie suas equipes de desenvolvimento</p>
        </div>
        <button class="btn btn-primary" onclick="EquipeCtrl.nova()">+ Nova Equipe</button>
      </div>
      ${convitesHtml}
      <div class="card" style="margin-bottom:20px">
        <div class="section-title">Entrar em uma Equipe</div>
        <form onsubmit="EquipeCtrl.entrar(event)" style="display:flex;gap:10px;margin-top:10px">
          <input type="text" id="codigo-convite" placeholder="Código de convite" style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)">
          <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
      </div>
      ${equipes.length === 0 ? `
        <div class="empty">
          <div class="empty-icon">👨‍👩‍👧‍👦</div>
          <div class="empty-title">Nenhuma equipe ainda</div>
          <div class="empty-desc">Crie ou entre em uma equipe para colaborar!</div>
        </div>
      ` : `
        <div class="projects-grid">
          ${equipes.map(eq => {
            const membros = allEquipes.filter(e => e.id === eq.id).length > 0 ? [] : [];
            return `
              <div class="proj-card">
                <div class="proj-card-top">
                  <div>
                    <div class="proj-card-name">${escHtml(eq.nome)}</div>
                    <span style="font-size:12px;color:var(--muted)">${eq.descricao || ''}</span>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="EquipeCtrl.convidar('${eq.id}', '${escHtml(eq.nome)}')">+ Convidar</button>
                </div>
                <div style="margin-top:10px;padding:10px;background:rgba(0,212,255,.1);border-radius:8px">
                  <div style="font-size:12px;color:var(--primary)">Código de convite:</div>
                  <div style="font-size:18px;font-weight:bold;letter-spacing:2px">${eq.codigo_convite}</div>
                </div>
                <div class="proj-card-meta">
                  <span>${eq.codigo_convite ? 'Ativo' : 'Inativo'}</span>
                  <span>${formatDate(eq.criado_em)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        `}`;
  },

  /* ── ÁREA DO CLIENTE ── */
  async cliente() {
    const devs = await supabaseFetch('usuarios', { query: '?tipo=eq.dev' });
    const contratos = (await DB.getContratos()).filter(c => c.cliente_id === Auth.currentUser.id);
    
    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">🏢 Área do Cliente</h1>
          <p class="page-subtitle">Bem-vindo, ${escHtml(Auth.currentUser.nome)}!</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card cyan">
          <div class="stat-label">👥 Desenvolvedores Disponíveis</div>
          <div class="stat-value">${devs.length}</div>
          <div class="stat-change">prontos para contratar</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-label">📋 Contratos Ativos</div>
          <div class="stat-value">${contratos.filter(c => c.status === 'ativo').length}</div>
          <div class="stat-change">${contratos.length} total</div>
        </div>
      </div>

      <div class="stats-grid" style="margin-bottom:0">
        <button class="btn btn-primary" style="flex:1;padding:20px;font-size:16px" onclick="Router.navigate('desenvolvedores')">
          🔍 Buscar Desenvolvedores
        </button>
        <button class="btn btn-secondary" style="flex:1;padding:20px;font-size:16px" onclick="Router.navigate('contratos')">
          📋 Meus Contratos
        </button>
      </div>

      <div class="card" style="margin-top:18px">
        <div class="section-title">💡 Como Funciona</div>
        <div style="line-height:1.8;color:var(--text);font-size:14px">
          <p><strong>1. Busque Desenvolvedores:</strong> Navegue pela lista de desenvolvedores disponíveis e escolha o melhor para seu projeto.</p>
          <p><strong>2. Contrate:</strong> Entre em contato diretamente com o desenvolvedor e formalize o contrato.</p>
          <p><strong>3. Acompanhe:</strong> Gerencie seus contratos e acompanhe o progresso do seu projeto.</p>
          <p><strong>4. Gerencie:</strong> Acesse "Meus Contratos" para visualizar todos os contratos ativos e histórico.</p>
        </div>
      </div>`;
  },
};

/* ──────────────────────────────────────────────
   MODAL
────────────────────────────────────────────── */
const Modal = {
  open(title, bodyHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },
  close() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },
};

/* ──────────────────────────────────────────────
   TOAST
────────────────────────────────────────────── */
const Toast = {
  show(msg, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="ti">${icons[type]}</span><span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3500);
  },
};

/* ──────────────────────────────────────────────
   IDEIA CONTROLLER
────────────────────────────────────────────── */
const IdeiaCtrl = {
  novo() {
    Modal.open('Nova Ideia', `
      <form class="modal-form" onsubmit="IdeiaCtrl.salvar(event)">
        <div class="form-group"><label>Título *</label><input id="i-titulo" required placeholder="Nome da ideia"></div>
        <div class="form-group"><label>Descrição</label><textarea id="i-desc" placeholder="Descreva a ideia..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Prioridade</label>
            <select id="i-prior"><option value="baixa">Baixa</option><option value="media" selected>Média</option><option value="alta">Alta</option></select>
          </div>
          <div class="form-group"><label>Status</label>
            <select id="i-status"><option value="rascunho" selected>Rascunho</option><option value="em-analise">Em Análise</option><option value="aprovada">Aprovada</option></select>
          </div>
        </div>
        <div class="form-group"><label>Tags (separadas por vírgula)</label><input id="i-tags" placeholder="ex: backend, api"></div>
        <input type="hidden" id="i-id" value="">
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar Ideia</button>
        </div>
      </form>`);
  },

  edit(id) {
    const i = DB.getIdeias().find(x => x.id === id);
    if (!i) return;
    this.novo();
    document.getElementById('i-id').value = id;
    document.getElementById('i-titulo').value = i.titulo;
    document.getElementById('i-desc').value = i.descricao;
    document.getElementById('i-prior').value = i.prioridade;
    document.getElementById('i-status').value = i.status;
    document.getElementById('i-tags').value = (i.tags||[]).join(', ');
    document.getElementById('modal-title').textContent = 'Editar Ideia';
  },

  salvar(e) {
    e.preventDefault();
    const id = document.getElementById('i-id').value;
    const tags = document.getElementById('i-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
    const data = {
      titulo: document.getElementById('i-titulo').value.trim(),
      descricao: document.getElementById('i-desc').value.trim(),
      prioridade: document.getElementById('i-prior').value,
      status: document.getElementById('i-status').value,
      tags, autorId: Auth.currentUser.id,
    };
    if (id) {
      const existing = DB.getIdeias().find(x => x.id === id);
      DB.updateIdeia({ ...existing, ...data });
      Toast.show('Ideia atualizada!', 'success');
    } else {
      DB.addIdeia({ id: DB.uid(), votos: 0, criadoEm: DB.now(), ...data });
      Toast.show('Ideia criada! 💡', 'success');
    }
    Modal.close();
    Views.ideias();
  },

  del(id) {
    if (!confirm('Excluir esta ideia?')) return;
    DB.deleteIdeia(id);
    Toast.show('Ideia excluída', 'info');
    Views.ideias();
  },

  mover(id, novoStatus) {
    const i = DB.getIdeias().find(x => x.id === id);
    if (!i) return;
    DB.updateIdeia({ ...i, status: novoStatus });
    Toast.show(`Ideia movida para ${novoStatus}`, 'info');
    Views.ideias();
  },

  votar(id) {
    const i = DB.getIdeias().find(x => x.id === id);
    if (!i) return;
    DB.updateIdeia({ ...i, votos: (i.votos||0) + 1 });
    Views.ideias();
  },
};

/* ──────────────────────────────────────────────
   PROJETO CONTROLLER
────────────────────────────────────────────── */
const ProjetoCtrl = {
  novo() {
    Modal.open('Novo Projeto', `
      <form class="modal-form" onsubmit="ProjetoCtrl.salvar(event)">
        <div class="form-group"><label>Nome *</label><input id="p-titulo" required placeholder="Nome do projeto"></div>
        <div class="form-group"><label>Descrição</label><textarea id="p-desc" placeholder="Descreva o projeto..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Status</label>
            <select id="p-status">
              <option value="planejamento" selected>Planejamento</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="pausado">Pausado</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
          <div class="form-group"><label>Categoria</label>
            <select id="p-cat">
              <option value="web">Web</option><option value="mobile">Mobile</option>
              <option value="backend">Backend</option><option value="design">Design</option><option value="outro">Outro</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Progresso (%)</label><input type="number" id="p-prog" min="0" max="100" value="0"></div>
          <div class="form-group"><label>Prazo</label><input type="date" id="p-prazo"></div>
        </div>
        <input type="hidden" id="p-id" value="">
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar Projeto</button>
        </div>
      </form>`);
  },

  edit(id) {
    const p = DB.getProjetos().find(x => x.id === id);
    if (!p) return;
    this.novo();
    document.getElementById('p-id').value = id;
    document.getElementById('p-titulo').value = p.titulo;
    document.getElementById('p-desc').value = p.descricao;
    document.getElementById('p-status').value = p.status;
    document.getElementById('p-cat').value = p.categoria || 'web';
    document.getElementById('p-prog').value = p.progresso;
    document.getElementById('p-prazo').value = p.prazo || '';
    document.getElementById('modal-title').textContent = 'Editar Projeto';
  },

  salvar(e) {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const data = {
      titulo: document.getElementById('p-titulo').value.trim(),
      descricao: document.getElementById('p-desc').value.trim(),
      status: document.getElementById('p-status').value,
      categoria: document.getElementById('p-cat').value,
      progresso: parseInt(document.getElementById('p-prog').value) || 0,
      prazo: document.getElementById('p-prazo').value,
      equipe: [Auth.currentUser.id],
    };
    if (id) {
      const ex = DB.getProjetos().find(x => x.id === id);
      DB.updateProjeto({ ...ex, ...data });
      Toast.show('Projeto atualizado!', 'success');
    } else {
      DB.addProjeto({ id: DB.uid(), criadoEm: DB.now(), ...data });
      Toast.show('Projeto criado! 📁', 'success');
    }
    Modal.close();
    Views.projetos();
  },

  del(id) {
    if (!confirm('Excluir este projeto e suas tarefas?')) return;
    DB.deleteProjeto(id);
    DB.getTarefas().filter(t => t.projetoId === id).forEach(t => DB.deleteTarefa(t.id));
    Toast.show('Projeto excluído', 'info');
    Views.projetos();
  },
};

/* ──────────────────────────────────────────────
   TAREFA CONTROLLER
────────────────────────────────────────────── */
const TarefaCtrl = {
  novo() {
    const projetos = DB.getProjetos();
    const projOpts = projetos.map(p => `<option value="${p.id}">${escHtml(p.titulo)}</option>`).join('');
    Modal.open('Nova Tarefa', `
      <form class="modal-form" onsubmit="TarefaCtrl.salvar(event)">
        <div class="form-group"><label>Título *</label><input id="t-titulo" required placeholder="Nome da tarefa"></div>
        <div class="form-group"><label>Descrição</label><textarea id="t-desc" placeholder="Detalhes da tarefa..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Projeto</label>
            <select id="t-proj">${projOpts || '<option value="">Sem projeto</option>'}</select>
          </div>
          <div class="form-group"><label>Prioridade</label>
            <select id="t-prior"><option value="baixa">Baixa</option><option value="media" selected>Média</option><option value="alta">Alta</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Status</label>
            <select id="t-status">
              <option value="pendente" selected>Pendente</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="revisao">Revisão</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
          <div class="form-group"><label>Prazo</label><input type="date" id="t-prazo"></div>
        </div>
        <input type="hidden" id="t-id" value="">
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar Tarefa</button>
        </div>
      </form>`);
  },

  edit(id) {
    const t = DB.getTarefas().find(x => x.id === id);
    if (!t) return;
    this.novo();
    document.getElementById('t-id').value = id;
    document.getElementById('t-titulo').value = t.titulo;
    document.getElementById('t-desc').value = t.descricao;
    document.getElementById('t-proj').value = t.projetoId || '';
    document.getElementById('t-prior').value = t.prioridade;
    document.getElementById('t-status').value = t.status;
    document.getElementById('t-prazo').value = t.prazo || '';
    document.getElementById('modal-title').textContent = 'Editar Tarefa';
  },

  salvar(e) {
    e.preventDefault();
    const id = document.getElementById('t-id').value;
    const data = {
      titulo: document.getElementById('t-titulo').value.trim(),
      descricao: document.getElementById('t-desc').value.trim(),
      projetoId: document.getElementById('t-proj').value,
      prioridade: document.getElementById('t-prior').value,
      status: document.getElementById('t-status').value,
      prazo: document.getElementById('t-prazo').value,
      responsavelId: Auth.currentUser.id,
    };
    if (id) {
      const ex = DB.getTarefas().find(x => x.id === id);
      DB.updateTarefa({ ...ex, ...data });
      Toast.show('Tarefa atualizada!', 'success');
    } else {
      DB.addTarefa({ id: DB.uid(), criadoEm: DB.now(), ...data });
      Toast.show('Tarefa criada! ✅', 'success');
    }
    Modal.close();
    Views.tarefas();
  },

  del(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    DB.deleteTarefa(id);
    Toast.show('Tarefa excluída', 'info');
    Views.tarefas();
  },

  mover(id, novoStatus) {
    const t = DB.getTarefas().find(x => x.id === id);
    if (!t) return;
    DB.updateTarefa({ ...t, status: novoStatus });
    Toast.show(`Tarefa movida para ${novoStatus}`, 'info');
    Views.tarefas();
  },
};

/* ──────────────────────────────────────────────
    PERFIL CONTROLLER
────────────────────────────────────────────── */
const PerfilCtrl = {
  editarPerfil() {
    const u = Auth.currentUser;
    Modal.open('Editar Perfil', `
      <form class="modal-form" onsubmit="PerfilCtrl.salvar(event)">
        <div class="form-group"><label>Nome *</label><input id="pf-nome" value="${escHtml(u.nome)}" required></div>
        <div class="form-group"><label>Email *</label><input type="email" id="pf-email" value="${escHtml(u.email)}" required></div>
        <div class="form-group"><label>Nova Senha (deixar em branco para manter)</label><input type="password" id="pf-senha" placeholder="Nova senha..." minlength="6"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`);
  },

  salvar(e) {
    e.preventDefault();
    const u = { ...Auth.currentUser };
    u.nome = document.getElementById('pf-nome').value.trim();
    u.email = document.getElementById('pf-email').value.trim();
    const nova = document.getElementById('pf-senha').value;
    if (nova) u.senha = nova;
    DB.updateUser(u);
    Auth.currentUser = u;
    DB.setSessao(u.id);
    document.getElementById('topbar-avatar').textContent = u.avatar;
    document.getElementById('topbar-name').textContent = u.nome.split(' ')[0];
    Toast.show('Perfil atualizado!', 'success');
    Modal.close();
    Views.perfil();
  },

  setAvatar(av) {
    const u = { ...Auth.currentUser, avatar: av };
    DB.updateUser(u);
    Auth.currentUser = u;
    document.getElementById('topbar-avatar').textContent = av;
    Toast.show('Avatar atualizado!', 'success');
    Views.perfil();
  },
};

/* ──────────────────────────────────────────────
    CHAT CONTROLLER
────────────────────────────────────────────── */
const DashboardCtrl = {
  openChat() {
    ChatCtrl.toggle();
  },
};

const ChatCtrl = {
  open: false,
  messages: [],
  newCount: 0,

  init() {
    const data = DB.load();
    this.messages = data.mensagens || [];
    this.render();
  },

  toggle() {
    this.open = !this.open;
    const panel = document.getElementById('chat-panel');
    const toggle = document.getElementById('chat-toggle');
    panel.classList.toggle('hidden', !this.open);
    toggle.classList.remove('has-new');
    this.newCount = 0;
    if (this.open) {
      this.render();
      document.getElementById('chat-input').focus();
    }
  },

  render() {
    const msgs = this.messages.slice(-50);
    const html = msgs.map(m => {
      const isOwn = m.userId === Auth.currentUser?.id;
      const user = DB.getUser(m.userId);
      const time = new Date(m.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="chat-msg ${isOwn ? 'own' : 'other'}">
          ${!isOwn ? `<div style="font-size:11px;color:var(--primary);margin-bottom:4px">${user?.nome || 'Usuário'}</div>` : ''}
          ${escHtml(m.texto)}
          <div class="chat-msg-time">${time}</div>
        </div>`;
    }).join('');
    document.getElementById('chat-messages').innerHTML = html || '<div style="text-align:center;color:var(--muted);padding:40px 0">Nenhuma mensagem ainda. Comece a conversa! 💬</div>';
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
  },

  send() {
    const input = document.getElementById('chat-input');
    const texto = input.value.trim();
    if (!texto) return;
    const msg = { id: DB.uid(), userId: Auth.currentUser.id, texto, criadoEm: DB.now() };
    this.messages.push(msg);
    const data = DB.load();
    data.mensagens = this.messages;
    DB.save(data);
    input.value = '';
    this.render();
  },
};

/* ──────────────────────────────────────────────
    EQUIPE CONTROLLER
───────────────────────────────────────────── */
const EquipeCtrl = {
  nova() {
    Modal.open('Criar Equipe', `
      <form class="modal-form" onsubmit="EquipeCtrl.salvar(event)">
        <div class="form-group"><label>Nome da Equipe *</label><input id="eq-nome" required placeholder="Nome da equipe"></div>
        <div class="form-group"><label>Descrição</label><textarea id="eq-desc" placeholder="Descrição da equipe..."></textarea></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Criar Equipe</button>
        </div>
      </form>`);
  },

  salvar(e) {
    e.preventDefault();
    const nome = document.getElementById('eq-nome').value.trim();
    const desc = document.getElementById('eq-desc').value.trim();
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const equipe = {
      id: DB.uid(),
      nome,
      descricao: desc,
      dono_id: Auth.currentUser.id,
      codigo_convite: codigo,
      criado_em: DB.now()
    };
    
    DB.addEquipe(equipe);
    DB.addMembro({ id: DB.uid(), equipe_id: equipe.id, usuario_id: Auth.currentUser.id, funcao: 'dono' });
    
    Toast.show('Equipe criada! Código: ' + codigo, 'success');
    Modal.close();
    Views.equipes();
  },

  entrar(e) {
    e.preventDefault();
    const codigo = document.getElementById('codigo-convite').value.trim().toUpperCase();
    if (!codigo) return;
    
    DB.joinEquipe(codigo).then(equipe => {
      if (equipe) {
        Toast.show('Você entrou na equipe: ' + equipe.nome, 'success');
        Views.equipes();
      } else {
        Toast.show('Código de convite inválido', 'error');
      }
    });
  },

  async aceitar(conviteId, equipeId) {
    await DB.aceitarConvite(conviteId, equipeId);
    Toast.show('Você entrou na equipe! 🎉', 'success');
    Views.equipes();
  },

  async recusar(conviteId) {
    await DB.recusarConvite(conviteId);
    Toast.show('Convite recusado', 'info');
    Views.equipes();
  },

  convidar(equipeId, nomeEquipe) {
    const devs = Auth.data?.usuarios || [];
    const devsOptions = devs.map(d => `<option value="${d.email}">${d.nome} (${d.email})</option>`).join('');
    
    Modal.open('Convidar para ' + nomeEquipe, `
      <form class="modal-form" onsubmit="EquipeCtrl.salvarConvite(event, '${equipeId}')">
        <div class="form-group">
          <label>Selecione ou digite o email:</label>
          <input type="email" id="convite-email" placeholder="email@exemplo.com" required list="devs-list">
          <datalist id="devs-list">${devsOptions}</datalist>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Enviar Convite</button>
        </div>
      </form>`);
  },

  async salvarConvite(e, equipeId) {
    e.preventDefault();
    const email = document.getElementById('convite-email').value.trim();
    if (!email) return;
    
    await DB.addConvite({
      id: DB.uid(),
      equipe_id: equipeId,
      email: email,
      convidado_por: Auth.currentUser.id,
      status: 'pendente',
      criado_em: DB.now()
    });
    
    Toast.show('Convite enviado para ' + email, 'success');
    Modal.close();
  },
};

/* ──────────────────────────────────────────────
    SEARCH
───────────────────────────────────────────── */
const ClienteCtrl = {
  contratar(devId) {
    const dev = DB.getUser(devId);
    if (!dev) return;
    
    Modal.open('Contratar Desenvolvedor', `
      <form class="modal-form" onsubmit="ClienteCtrl.salvarContrato(event, '${devId}')">
        <div class="form-group">
          <label>Tipo de Contrato</label>
          <select id="c-tipo">
            <option value="projeto">Projeto Único</option>
            <option value="mensal">Desenvolvedor Mensal</option>
            <option value="equipe">Equipe Dedicada</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Valor (R$)</label>
            <input type="number" id="c-valor" placeholder="5000" required min="1">
          </div>
          <div class="form-group">
            <label>Data Início</label>
            <input type="date" id="c-inicio" required>
          </div>
        </div>
        <div class="form-group">
          <label>Data Fim (opcional)</label>
          <input type="date" id="c-fim">
        </div>
        <div class="form-group">
          <label>Descrição do Projeto</label>
          <textarea id="c-desc" placeholder="Descreva o que você precisa..."></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Confirmar Contrato</button>
        </div>
      </form>`);
    
    document.getElementById('c-inicio').valueAsDate = new Date();
  },

  salvarContrato(e, devId) {
    e.preventDefault();
    const contrato = {
      id: DB.uid(),
      clienteId: Auth.currentUser.id,
      devId: devId,
      tipo: document.getElementById('c-tipo').value,
      valor: parseInt(document.getElementById('c-valor').value),
      dataInicio: document.getElementById('c-inicio').value,
      dataFim: document.getElementById('c-fim').value || null,
      descricao: document.getElementById('c-desc').value,
      status: 'ativo',
      criadoEm: DB.now(),
    };
    DB.addContrato(contrato);
    Toast.show('Contrato criado com sucesso! 🎉', 'success');
    Modal.close();
    Router.navigate('contratos');
  },
};

function handleSearch(q) {
  if (!q || q.length < 2) return;
  q = q.toLowerCase();
  const ideias = DB.getIdeias().filter(i => i.titulo.toLowerCase().includes(q));
  const projetos = DB.getProjetos().filter(p => p.titulo.toLowerCase().includes(q));
  const tarefas = DB.getTarefas().filter(t => t.titulo.toLowerCase().includes(q));

  const mc = document.getElementById('main-content');
  const total = ideias.length + projetos.length + tarefas.length;
  if (total === 0) {
    mc.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">Nada encontrado</div><div class="empty-desc">Nenhum resultado para "${escHtml(q)}"</div></div>`;
    return;
  }

  let html = `<div class="page-header"><h1 class="page-title">🔍 Resultados para "${escHtml(q)}"</h1></div>`;
  if (ideias.length) html += `<h3 style="margin-bottom:12px;color:var(--muted);font-size:14px">💡 IDEIAS</h3><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">${ideias.map(i=>`<div class="card" style="cursor:pointer" onclick="Router.navigate('ideias')"><b>${escHtml(i.titulo)}</b><br><span style="font-size:13px;color:var(--muted)">${escHtml(i.descricao)}</span></div>`).join('')}</div>`;
  if (projetos.length) html += `<h3 style="margin-bottom:12px;color:var(--muted);font-size:14px">📁 PROJETOS</h3><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">${projetos.map(p=>`<div class="card" style="cursor:pointer" onclick="Router.navigate('projetos')"><b>${escHtml(p.titulo)}</b><br><span style="font-size:13px;color:var(--muted)">${escHtml(p.descricao)}</span></div>`).join('')}</div>`;
  if (tarefas.length) html += `<h3 style="margin-bottom:12px;color:var(--muted);font-size:14px">✅ TAREFAS</h3><div style="display:flex;flex-direction:column;gap:8px">${tarefas.map(t=>`<div class="card" style="cursor:pointer" onclick="Router.navigate('tarefas')"><b>${escHtml(t.titulo)}</b><br><span style="font-size:13px;color:var(--muted)">${escHtml(t.descricao)}</span></div>`).join('')}</div>`;
  mc.innerHTML = html;
}

/* ──────────────────────────────────────────────
   SIDEBAR MOBILE
────────────────────────────────────────────── */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sb-overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('show');
}

/* ──────────────────────────────────────────────
   THREE.JS BACKGROUND (Auth only)
────────────────────────────────────────────── */
let threeRenderer = null;
let threeAnimId = null;

function initThreeBg() {
  const container = document.getElementById('canvas-bg');
  if (!container || !window.THREE) return;
  if (threeRenderer) { container.innerHTML = ''; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  threeRenderer = renderer;

  const count = 1500;
  const pos = new Float32Array(count * 3);
  const vel = [];
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    pos[i3] = (Math.random() - .5) * 10;
    pos[i3+1] = (Math.random() - .5) * 10;
    pos[i3+2] = (Math.random() - .5) * 10;
    vel.push({ x:(Math.random()-.5)*.003, y:(Math.random()-.5)*.003, z:(Math.random()-.5)*.003 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.025, transparent: true, opacity: 0.6, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  camera.position.z = 5;

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = (e.clientX/window.innerWidth)*2-1; my = -(e.clientY/window.innerHeight)*2+1; });

  function ani() {
    threeAnimId = requestAnimationFrame(ani);
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i*3;
      p[i3] += vel[i].x; p[i3+1] += vel[i].y; p[i3+2] += vel[i].z;
      if (Math.abs(p[i3]) > 5) vel[i].x *= -1;
      if (Math.abs(p[i3+1]) > 5) vel[i].y *= -1;
      if (Math.abs(p[i3+2]) > 5) vel[i].z *= -1;
    }
    geo.attributes.position.needsUpdate = true;
    pts.rotation.y += mx * 0.0008;
    pts.rotation.x += my * 0.0008;
    renderer.render(scene, camera);
  }
  ani();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function stopThreeBg() {
  if (threeAnimId) { cancelAnimationFrame(threeAnimId); threeAnimId = null; }
  if (threeRenderer) { threeRenderer.dispose(); threeRenderer = null; }
  const c = document.getElementById('canvas-bg');
  if (c) c.innerHTML = '';
}

/* ──────────────────────────────────────────────
   BOOT
────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  DB.load(); // seed if needed
  Auth.init();
});
