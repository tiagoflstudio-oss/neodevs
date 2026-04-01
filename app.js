/* ============================================================
   DevHub — Application Logic (Supabase Version)
   ============================================================ */

/* ──────────────────────────────────────────────
   AUTH (Supabase)
   ────────────────────────────────────────────── */
const Auth = {
  currentUser: null,

  async init() {
    const sid = SupaDB.getSessao();
    if (sid) {
      this.currentUser = await SupaDB.getUser(sid);
      if (this.currentUser) { await this.showApp(); return; }
    }
    this.showAuth();
  },

  showAuth() {
    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    initThreeBg();
  },

  async showApp() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('topbar-avatar').textContent = this.currentUser.avatar;
    document.getElementById('topbar-name').textContent = this.currentUser.nome.split(' ')[0];
    stopThreeBg();
    await Router.init();
  },

  showTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  },

  async login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-password').value;
    
    Toast.show('Verificando credenciais...', 'info');
    
    const user = await SupaDB.findUser(email);
    if (!user) { 
      Toast.show('Email ou senha incorretos', 'error'); 
      return; 
    }
    
    // Verifica senha (compatível com texto puro e hash)
    const senhaHash = hashSenha(senha);
    if (user.senha !== senha && user.senha !== senhaHash) { 
      Toast.show('Email ou senha incorretos', 'error'); 
      return; 
    }
    
    this.currentUser = user;
    SupaDB.setSessao(user.id);
    Toast.show('Bem-vindo de volta, ' + user.nome.split(' ')[0] + '! 👋', 'success');
    await this.showApp();
  },

  async register(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const senha = document.getElementById('reg-password').value;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show('Email inválido', 'error');
      return;
    }
    
    if (senha.length < 6 || senha.length > 12) {
      Toast.show('Senha deve ter entre 6 e 12 caracteres', 'error');
      return;
    }
    if (!/[A-Z]/.test(senha)) {
      Toast.show('Senha deve ter pelo menos 1 letra maiúscula', 'error');
      return;
    }
    if (!/[0-9]/.test(senha)) {
      Toast.show('Senha deve ter pelo menos 1 número', 'error');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
      Toast.show('Senha deve ter pelo menos 1 caractere especial', 'error');
      return;
    }
    
    Toast.show('Verificando email...', 'info');
    
    const existing = await SupaDB.findUser(email);
    if (existing) { Toast.show('Este email já está cadastrado', 'error'); return; }
    
    // Armazena senha com hash (não texto puro!)
    const user = { 
      id: SupaDB.uid(), 
      nome, 
      email, 
      senha: hashSenha(senha), // ← Hash da senha
      avatar: '🧑‍💻', 
      criado_em: SupaDB.now() 
    };
    
    Toast.show('Criando conta...', 'info');
    
    const result = await SupaDB.addUser(user);
    if (!result || result.error) { 
      Toast.show(result?.error || 'Erro ao criar conta. Tente novamente.', 'error'); 
      return; 
    }
    
    this.currentUser = result;
    SupaDB.setSessao(result.id);
    Toast.show('Conta criada! Bem-vindo, ' + nome.split(' ')[0] + '! 🎉', 'success');
    await this.showApp();
  },

  logout() {
    SupaDB.clearSessao();
    this.currentUser = null;
    Toast.show('Até logo! 👋', 'info');
    this.showAuth();
  },
};

/* ──────────────────────────────────────────────
   ROUTER
   ────────────────────────────────────────────── */
const Router = {
  current: 'dashboard',
  isInit: false,

  async init() {
    const hash = location.hash.replace('#', '') || 'dashboard';
    await this.render(hash);
    if (!this.isInit) {
      window.addEventListener('hashchange', async () => {
        const r = location.hash.replace('#', '') || 'dashboard';
        await this.render(r);
      });
      this.isInit = true;
    }
  },

  async navigate(route) {
    location.hash = route;
    await this.render(route);
  },

  async render(route) {
    this.current = route;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === route);
    });
    const mc = document.getElementById('main-content');
    mc.innerHTML = '<div class="spinner"></div>';
    
    await new Promise(r => setTimeout(r, 80)); // Loading visual
    
    const views = {
      dashboard: Views.dashboard,
      ideias: Views.ideias,
      projetos: Views.projetos,
      tarefas: Views.tarefas,
      servicos: Views.servicos,
      perfil: Views.perfil
    };
    const fn = views[route];
    if (fn) await fn(); else mc.innerHTML = '<p style="padding:40px;color:var(--muted)">Página não encontrada.</p>';
  },
};

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function badge(val, type) {
  const labels = {
    alta: 'Alta', media: 'Média', baixa: 'Baixa',
    planejamento: 'Planejamento', 'em-andamento': 'Em Andamento', pausado: 'Pausado', concluido: 'Concluído',
    rascunho: 'Rascunho', 'em-analise': 'Em Análise', aprovada: 'Aprovada', rejeitada: 'Rejeitada',
    pendente: 'Pendente', revisao: 'Revisão', concluida: 'Concluída',
    web: 'Web', mobile: 'Mobile', backend: 'Backend', design: 'Design', outro: 'Outro',
  };
  const cls = val.replace(/[^a-z-]/g, '');
  return `<span class="badge badge-${cls}">${labels[val] || val}</span>`;
}

function prazoLabel(prazoStr) {
  if (!prazoStr) return '';
  const prazoData = new Date(prazoStr + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.ceil((prazoData - hoje) / 86400000);
  const cls = dias <= 3 ? 'urgente' : '';
  const txt = dias < 0 ? 'Atrasado' : dias === 0 ? 'Hoje' : `${dias}d`;
  return `<span class="prazo ${cls}">📅 ${txt}</span>`;
}

function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    const ideias = await SupaDB.getIdeias();
    const projetos = await SupaDB.getProjetos();
    const tarefas = await SupaDB.getTarefas();
    const servicos = await SupaDB.getServicos();
    const ativos = projetos.filter(p => p.status === 'em-andamento').length;
    const pendentes = tarefas.filter(t => t.status === 'pendente' || t.status === 'em-andamento').length;
    const concluidas = tarefas.filter(t => t.status === 'concluida').length;

    const recentProjetos = [...projetos].sort((a, b) => (b.criado_em || '').localeCompare(a.criado_em || '')).slice(0, 4);
    const urgentTarefas = tarefas
      .filter(t => t.status !== 'concluida' && t.prazo)
      .sort((a, b) => (a.prazo || '').localeCompare(b.prazo || '')).slice(0, 5);

    // mini chart
    const statuses = ['pendente', 'em-andamento', 'revisao', 'concluida'];
    const counts = statuses.map(s => tarefas.filter(t => t.status === s).length);
    const maxC = Math.max(...counts, 1);
    const colors = ['rgba(255,255,255,.3)', '#00d4ff', '#f59e0b', '#10b981'];
    const chartBars = statuses.map((s, i) => `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${Math.round((counts[i] / maxC) * 80) + 4}px;background:${colors[i]}"></div>
        <div class="chart-lbl">${['Pend.', 'And.', 'Rev.', 'Conc.'][i]}<br>${counts[i]}</div>
      </div>`).join('');

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral dos seus projetos e tarefas</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card cyan">
          <div class="stat-label">💡 Total de Ideias</div>
          <div class="stat-value">${ideias.length}</div>
          <div class="stat-change">${ideias.filter(i => i.status === 'aprovada').length} aprovadas</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-label">📁 Projetos Ativos</div>
          <div class="stat-value">${ativos}</div>
          <div class="stat-change">${projetos.length} no total</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-label">⏳ Tarefas Abertas</div>
          <div class="stat-value">${pendentes}</div>
          <div class="stat-change">${tarefas.length} no total</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">✅ Tarefas Concluídas</div>
          <div class="stat-value">${concluidas}</div>
          <div class="stat-change">${tarefas.length > 0 ? Math.round(concluidas / tarefas.length * 100) : 0}% de conclusão</div>
        </div>
      </div>

      <div class="stats-grid" style="margin-top:-10px;margin-bottom:28px">
        <div class="stat-card purple" style="grid-column:span 2">
          <div class="stat-label">🛠️ Serviços Oferecidos</div>
          <div class="stat-value">${servicos.length}</div>
          <div class="stat-change">${servicos.filter(s => s.destaque).length} em destaque</div>
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
          <div class="section-title">💡 Últimas Ideias</div>
          ${ideias.slice(0, 4).map(i => `
            <div class="task-mini">
              <div class="task-mini-title">${escHtml(i.titulo)}</div>
              ${badge(i.status)}
            </div>`).join('')}
        </div>
      </div>`;
  },

  /* ── IDEIAS ── */
  async ideias() {
    const ideias = await SupaDB.getIdeias();
    const cols = [
      { key: 'rascunho', label: 'Rascunho' },
      { key: 'em-analise', label: 'Em Análise' },
      { key: 'aprovada', label: 'Aprovada' },
      { key: 'rejeitada', label: 'Rejeitada' },
    ];

    function renderCol(col) {
      const items = ideias.filter(i => i.status === col.key);
      const cards = items.map(i => `
        <div class="k-card" id="kc-${i.id}" onclick="CardViewer.open('ideia', ${JSON.stringify(i).replace(/"/g, '&quot;')})">
          <div class="k-card-title">${escHtml(i.titulo)}</div>
          <div class="k-card-desc">${escHtml(i.descricao)}</div>
          <div class="k-card-footer">
            <div class="k-card-tags">
              ${badge(i.prioridade)}
              ${(i.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:5px" onclick="event.stopPropagation()">
              <button class="vote-btn" onclick="event.stopPropagation();IdeiaCtrl.votar('${i.id}')">⬆ ${i.votos || 0}</button>
              <div class="k-card-actions">
                <button class="act-btn" onclick="event.stopPropagation();IdeiaCtrl.edit('${i.id}')">✏️</button>
                <button class="act-btn del" onclick="event.stopPropagation();IdeiaCtrl.del('${i.id}')">🗑</button>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap" onclick="event.stopPropagation()">
            ${cols.filter(c => c.key !== col.key).map(c => `
              <button class="move-btn" onclick="event.stopPropagation();IdeiaCtrl.mover('${i.id}','${c.key}')">→ ${c.label}</button>`).join('')}
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
    const todos = await SupaDB.getProjetos();
    const f = filtro || 'todos';
    const lista = f === 'todos' ? todos : todos.filter(p => p.status === f);
    const statusOpts = ['todos', 'planejamento', 'em-andamento', 'pausado', 'concluido'];
    const statusLabels = { todos: 'Todos', planejamento: 'Planejamento', 'em-andamento': 'Em Andamento', pausado: 'Pausado', concluido: 'Concluído' };

    const cards = lista.map(p => `
      <div class="proj-card" onclick="CardViewer.open('projeto', ${JSON.stringify(p).replace(/"/g, '&quot;')})">
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
        ${statusOpts.map(s => `<button class="filter-chip ${f === s ? 'active' : ''}" onclick="Views.projetos('${s}')">${statusLabels[s]}</button>`).join('')}
      </div>
      ${lista.length === 0
        ? `<div class="empty"><div class="empty-icon">📁</div><div class="empty-title">Nenhum projeto aqui</div><div class="empty-desc">Crie seu primeiro projeto!</div><button class="btn btn-primary" onclick="ProjetoCtrl.novo()">+ Novo Projeto</button></div>`
        : `<div class="projects-grid">${cards}</div>`}`;
  },

  /* ── TAREFAS ── */
  async tarefas(filtroProj) {
    const tarefas = await SupaDB.getTarefas();
    const projetos = await SupaDB.getProjetos();
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
          <div class="k-card" onclick="CardViewer.open('tarefa', ${JSON.stringify(t).replace(/"/g, '&quot;')})">
            <div class="k-card-title">${escHtml(t.titulo)}</div>
            <div class="k-card-desc">${escHtml(t.descricao)}</div>
            <div class="k-card-footer">
              <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
                ${badge(t.prioridade)}
                ${proj ? `<span class="tag">📁 ${escHtml(proj.titulo)}</span>` : ''}
                ${prazoLabel(t.prazo)}
              </div>
              <div class="k-card-actions" onclick="event.stopPropagation()">
                <button class="act-btn" onclick="event.stopPropagation();TarefaCtrl.edit('${t.id}')">✏️</button>
                <button class="act-btn del" onclick="event.stopPropagation();TarefaCtrl.del('${t.id}')">🗑</button>
              </div>
            </div>
            <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap" onclick="event.stopPropagation()">
              ${cols.filter(c => c.key !== col.key).map(c => `
                <button class="move-btn" onclick="event.stopPropagation();TarefaCtrl.mover('${t.id}','${c.key}')">→ ${c.label}</button>`).join('')}
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
      projetos.map(p => `<option value="${p.id}" ${fp === p.id ? 'selected' : ''}>${escHtml(p.titulo)}</option>`).join('');

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

  /* ── SERVIÇOS ── */
  async servicos(filtro) {
    const servicos = await SupaDB.getServicos();
    const f = filtro || 'todos';
    const lista = f === 'todos' ? servicos : servicos.filter(s => s.categoria === f);
    const catOpts = ['todos', 'desenvolvimento', 'consultoria', 'design', 'infraestrutura', 'suporte'];
    const catLabels = { todos: 'Todos', desenvolvimento: 'Desenvolvimento', consultoria: 'Consultoria', design: 'Design', infraestrutura: 'Infraestrutura', suporte: 'Suporte' };

    const cards = lista.map(s => `
      <div class="service-card ${s.destaque ? 'destaque' : ''}" onclick="CardViewer.open('servico', ${JSON.stringify(s).replace(/"/g, '&quot;')})">
        ${s.destaque ? '<div class="service-badge">⭐ Destaque</div>' : ''}
        <div class="service-icon">${s.icone}</div>
        <h3 class="service-title">${escHtml(s.titulo)}</h3>
        <p class="service-desc">${escHtml(s.descricao)}</p>
        <div class="service-features">
          ${(s.recursos || []).map(r => `<span class="service-feature">✓ ${escHtml(r)}</span>`).join('')}
        </div>
        <div class="service-footer">
          <span class="service-price">${escHtml(s.preco)}</span>
          <div class="service-actions" onclick="event.stopPropagation()">
            <button class="act-btn" onclick="event.stopPropagation();ServicoCtrl.edit('${s.id}')">✏️</button>
            <button class="act-btn del" onclick="event.stopPropagation();ServicoCtrl.del('${s.id}')">🗑</button>
          </div>
        </div>
      </div>`).join('');

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">🛠️ Nossos Serviços</h1>
          <p class="page-subtitle">Conheça as soluções que oferecemos para o seu negócio</p>
        </div>
        <button class="btn btn-primary" onclick="ServicoCtrl.novo()">+ Novo Serviço</button>
      </div>
      <div class="filters-bar">
        ${catOpts.map(c => `<button class="filter-chip ${f === c ? 'active' : ''}" onclick="Views.servicos('${c}')">${catLabels[c]}</button>`).join('')}
      </div>
      ${lista.length === 0
        ? `<div class="empty"><div class="empty-icon">🛠️</div><div class="empty-title">Nenhum serviço cadastrado</div><div class="empty-desc">Adicione os serviços que sua empresa oferece!</div><button class="btn btn-primary" onclick="ServicoCtrl.novo()">+ Novo Serviço</button></div>`
        : `<div class="services-grid">${cards}</div>`}`;
  },

  /* ── PERFIL ── */
  async perfil() {
    const u = Auth.currentUser;
    const ideias = (await SupaDB.getIdeias()).filter(i => i.autor_id === u.id);
    const tarefas = await SupaDB.getTarefas();
    const concluidas = tarefas.filter(t => t.responsavel_id === u.id && t.status === 'concluida').length;
    const projetos = (await SupaDB.getProjetos()).filter(p => (p.equipe || []).includes(u.id));
    const avatares = ['🧑‍💻', '👨‍💻', '👩‍💻', '🦸', '🧙', '🤖', '🎮', '🚀', '⚡', '🔥'];

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1 class="page-title">👤 Perfil</h1>
      </div>
      <div class="profile-head">
        <div class="profile-avatar" id="prof-av">${u.avatar}</div>
        <div>
          <div class="profile-name">${escHtml(u.nome)}</div>
          <div class="profile-email">${escHtml(u.email)}</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:14px" onclick="PerfilCtrl.editarPerfil()">✏️ Editar Perfil</button>
        </div>
      </div>
      <div class="profile-stats-grid">
        <div class="p-stat"><div class="p-stat-val">${ideias.length}</div><div class="p-stat-lbl">💡 Ideias criadas</div></div>
        <div class="p-stat"><div class="p-stat-val">${projetos.length}</div><div class="p-stat-lbl">📁 Projetos</div></div>
        <div class="p-stat"><div class="p-stat-val">${concluidas}</div><div class="p-stat-lbl">✅ Tarefas concluídas</div></div>
      </div>
      <div class="card">
        <div class="section-title">🎨 Escolher Avatar</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
          ${avatares.map(av => `<button onclick="PerfilCtrl.setAvatar('${av}')" style="font-size:28px;background:${av === u.avatar ? 'rgba(0,212,255,.15)' : 'rgba(255,255,255,.05)'};border:1px solid ${av === u.avatar ? 'rgba(0,212,255,.4)' : 'var(--border)'};border-radius:12px;padding:10px 14px;cursor:pointer;transition:.2s">${av}</button>`).join('')}
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
   CARD VIEWER - Visualizador de Cards
   ────────────────────────────────────────────── */
const CardViewer = {
  open(type, item) {
    let content = '';
    let title = '';
    
    switch(type) {
      case 'ideia':
        title = '💡 ' + item.titulo;
        content = this.renderIdeia(item);
        break;
      case 'projeto':
        title = '📁 ' + item.titulo;
        content = this.renderProjeto(item);
        break;
      case 'tarefa':
        title = '✅ ' + item.titulo;
        content = this.renderTarefa(item);
        break;
      case 'servico':
        title = '🛠️ ' + item.titulo;
        content = this.renderServico(item);
        break;
    }
    
    Modal.open(title, content);
  },
  
  renderIdeia(item) {
    return `
      <div class="viewer-section">
        <div class="viewer-badges">
          ${badge(item.status)} ${badge(item.prioridade)}
        </div>
        <div class="viewer-field">
          <label>Descrição</label>
          <p>${escHtml(item.descricao) || '<em style="color:var(--dim)">Sem descrição</em>'}</p>
        </div>
        <div class="viewer-field">
          <label>Tags</label>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${(item.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('') || '<em style="color:var(--dim)">Sem tags</em>'}
          </div>
        </div>
        <div class="viewer-row">
          <div class="viewer-field">
            <label>Votos</label>
            <p>⬆ ${item.votos || 0}</p>
          </div>
          <div class="viewer-field">
            <label>Criado em</label>
            <p>${formatDate(item.criado_em)}</p>
          </div>
        </div>
        <div class="viewer-actions">
          <button class="btn btn-ghost" onclick="Modal.close()">Fechar</button>
          <button class="btn btn-primary" onclick="Modal.close();IdeiaCtrl.edit('${item.id}')">✏️ Editar</button>
        </div>
      </div>`;
  },
  
  renderProjeto(item) {
    return `
      <div class="viewer-section">
        <div class="viewer-badges">
          ${badge(item.status)} ${badge(item.categoria || 'web')}
        </div>
        <div class="viewer-field">
          <label>Descrição</label>
          <p>${escHtml(item.descricao) || '<em style="color:var(--dim)">Sem descrição</em>'}</p>
        </div>
        <div class="viewer-field">
          <label>Progresso</label>
          <div class="progress-bar" style="height:8px;margin-top:6px">
            <div class="progress-fill" style="width:${item.progresso}%"></div>
          </div>
          <p style="margin-top:6px;font-size:14px;font-weight:600;color:var(--primary)">${item.progresso}% concluído</p>
        </div>
        <div class="viewer-row">
          <div class="viewer-field">
            <label>Prazo</label>
            <p>${item.prazo ? formatDate(item.prazo) : '<em style="color:var(--dim)">Não definido</em>'}</p>
          </div>
          <div class="viewer-field">
            <label>Criado em</label>
            <p>${formatDate(item.criado_em)}</p>
          </div>
        </div>
        <div class="viewer-actions">
          <button class="btn btn-ghost" onclick="Modal.close()">Fechar</button>
          <button class="btn btn-primary" onclick="Modal.close();ProjetoCtrl.edit('${item.id}')">✏️ Editar</button>
        </div>
      </div>`;
  },
  
  renderTarefa(item) {
    return `
      <div class="viewer-section">
        <div class="viewer-badges">
          ${badge(item.status)} ${badge(item.prioridade)}
        </div>
        <div class="viewer-field">
          <label>Descrição</label>
          <p>${escHtml(item.descricao) || '<em style="color:var(--dim)">Sem descrição</em>'}</p>
        </div>
        <div class="viewer-row">
          <div class="viewer-field">
            <label>Prazo</label>
            <p>${item.prazo ? formatDate(item.prazo) : '<em style="color:var(--dim)">Não definido</em>'}</p>
          </div>
          <div class="viewer-field">
            <label>Criado em</label>
            <p>${formatDate(item.criado_em)}</p>
          </div>
        </div>
        <div class="viewer-actions">
          <button class="btn btn-ghost" onclick="Modal.close()">Fechar</button>
          <button class="btn btn-primary" onclick="Modal.close();TarefaCtrl.edit('${item.id}')">✏️ Editar</button>
        </div>
      </div>`;
  },
  
  renderServico(item) {
    return `
      <div class="viewer-section">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
          <div class="service-icon" style="width:50px;height:50px;font-size:24px;margin:0">${item.icone}</div>
          <div>
            <div style="font-size:12px;color:var(--muted)">${item.categoria}</div>
            <div style="font-size:14px;font-weight:600;color:var(--primary)">${escHtml(item.preco)}</div>
          </div>
        </div>
        <div class="viewer-field">
          <label>Descrição</label>
          <p>${escHtml(item.descricao) || '<em style="color:var(--dim)">Sem descrição</em>'}</p>
        </div>
        <div class="viewer-field">
          <label>Recursos inclusos</label>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:6px;margin-top:4px">
            ${(item.recursos || []).map(r => `<li style="font-size:13px;display:flex;align-items:center;gap:6px"><span style="color:var(--success)">✓</span> ${escHtml(r)}</li>`).join('') || '<li style="color:var(--dim)">Sem recursos listados</li>'}
          </ul>
        </div>
        ${item.destaque ? '<div style="background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);border-radius:10px;padding:10px;text-align:center;font-size:13px;color:var(--primary)">⭐ Serviço em Destaque</div>' : ''}
        <div class="viewer-actions">
          <button class="btn btn-ghost" onclick="Modal.close()">Fechar</button>
          <button class="btn btn-primary" onclick="Modal.close();ServicoCtrl.edit('${item.id}')">✏️ Editar</button>
        </div>
      </div>`;
  }
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

  async edit(id) {
    const ideias = await SupaDB.getIdeias();
    const i = ideias.find(x => x.id === id);
    if (!i) return;
    this.novo();
    document.getElementById('i-id').value = id;
    document.getElementById('i-titulo').value = i.titulo;
    document.getElementById('i-desc').value = i.descricao;
    document.getElementById('i-prior').value = i.prioridade;
    document.getElementById('i-status').value = i.status;
    document.getElementById('i-tags').value = (i.tags || []).join(', ');
    document.getElementById('modal-title').textContent = 'Editar Ideia';
  },

  async salvar(e) {
    e.preventDefault();
    const id = document.getElementById('i-id').value;
    const tags = document.getElementById('i-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const data = {
      titulo: document.getElementById('i-titulo').value.trim(),
      descricao: document.getElementById('i-desc').value.trim(),
      prioridade: document.getElementById('i-prior').value,
      status: document.getElementById('i-status').value,
      tags, autor_id: Auth.currentUser.id,
    };
    if (id) {
      await SupaDB.updateIdeia({ id, ...data });
      Toast.show('Ideia atualizada!', 'success');
    } else {
      await SupaDB.addIdeia({ id: SupaDB.uid(), votos: 0, criado_em: SupaDB.now(), ...data });
      Toast.show('Ideia criada! 💡', 'success');
    }
    Modal.close();
    await Views.ideias();
  },

  async del(id) {
    if (!confirm('Excluir esta ideia?')) return;
    await SupaDB.deleteIdeia(id);
    Toast.show('Ideia excluída', 'info');
    await Views.ideias();
  },

  async mover(id, novoStatus) {
    const ideias = await SupaDB.getIdeias();
    const i = ideias.find(x => x.id === id);
    if (!i) return;
    await SupaDB.updateIdeia({ id, status: novoStatus });
    Toast.show(`Ideia movida para ${novoStatus}`, 'info');
    await Views.ideias();
  },

  async votar(id) {
    const ideias = await SupaDB.getIdeias();
    const i = ideias.find(x => x.id === id);
    if (!i) return;
    await SupaDB.updateIdeia({ id, votos: (i.votos || 0) + 1 });
    await Views.ideias();
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

  async edit(id) {
    const projetos = await SupaDB.getProjetos();
    const p = projetos.find(x => x.id === id);
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

  async salvar(e) {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const data = {
      titulo: document.getElementById('p-titulo').value.trim(),
      descricao: document.getElementById('p-desc').value.trim(),
      status: document.getElementById('p-status').value,
      categoria: document.getElementById('p-cat').value,
      progresso: parseInt(document.getElementById('p-prog').value) || 0,
      prazo: document.getElementById('p-prazo').value || null,
      equipe: [Auth.currentUser.id],
    };
    if (id) {
      await SupaDB.updateProjeto({ id, ...data });
      Toast.show('Projeto atualizado!', 'success');
    } else {
      await SupaDB.addProjeto({ id: SupaDB.uid(), criado_em: SupaDB.now(), ...data });
      Toast.show('Projeto criado! 📁', 'success');
    }
    Modal.close();
    await Views.projetos();
  },

  async del(id) {
    if (!confirm('Excluir este projeto e suas tarefas?')) return;
    await SupaDB.deleteProjeto(id);
    const tarefas = await SupaDB.getTarefas();
    for (const t of tarefas) {
      if (t.projeto_id === id) await SupaDB.deleteTarefa(t.id);
    }
    Toast.show('Projeto excluído', 'info');
    await Views.projetos();
  },
};

/* ──────────────────────────────────────────────
   TAREFA CONTROLLER
   ────────────────────────────────────────────── */
const TarefaCtrl = {
  async novo() {
    const projetos = await SupaDB.getProjetos();
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

  async edit(id) {
    const tarefas = await SupaDB.getTarefas();
    const t = tarefas.find(x => x.id === id);
    if (!t) return;
    await this.novo();
    document.getElementById('t-id').value = id;
    document.getElementById('t-titulo').value = t.titulo;
    document.getElementById('t-desc').value = t.descricao;
    document.getElementById('t-proj').value = t.projeto_id || '';
    document.getElementById('t-prior').value = t.prioridade;
    document.getElementById('t-status').value = t.status;
    document.getElementById('t-prazo').value = t.prazo || '';
    document.getElementById('modal-title').textContent = 'Editar Tarefa';
  },

  async salvar(e) {
    e.preventDefault();
    const id = document.getElementById('t-id').value;
    const data = {
      titulo: document.getElementById('t-titulo').value.trim(),
      descricao: document.getElementById('t-desc').value.trim(),
      projeto_id: document.getElementById('t-proj').value || null,
      prioridade: document.getElementById('t-prior').value,
      status: document.getElementById('t-status').value,
      prazo: document.getElementById('t-prazo').value || null,
      responsavel_id: Auth.currentUser.id,
    };
    if (id) {
      await SupaDB.updateTarefa({ id, ...data });
      Toast.show('Tarefa atualizada!', 'success');
    } else {
      await SupaDB.addTarefa({ id: SupaDB.uid(), criado_em: SupaDB.now(), ...data });
      Toast.show('Tarefa criada! ✅', 'success');
    }
    Modal.close();
    await Views.tarefas();
  },

  async del(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    await SupaDB.deleteTarefa(id);
    Toast.show('Tarefa excluída', 'info');
    await Views.tarefas();
  },

  async mover(id, novoStatus) {
    const tarefas = await SupaDB.getTarefas();
    const t = tarefas.find(x => x.id === id);
    if (!t) return;
    await SupaDB.updateTarefa({ id, status: novoStatus });
    Toast.show(`Tarefa movida para ${novoStatus}`, 'info');
    await Views.tarefas();
  },
};

/* ──────────────────────────────────────────────
   SERVIÇO CONTROLLER
   ────────────────────────────────────────────── */
const ServicoCtrl = {
  novo() {
    Modal.open('Novo Serviço', `
      <form class="modal-form" onsubmit="ServicoCtrl.salvar(event)">
        <div class="form-group"><label>Título *</label><input id="s-titulo" required placeholder="Nome do serviço"></div>
        <div class="form-group"><label>Descrição</label><textarea id="s-desc" placeholder="Descreva o serviço..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Ícone (emoji)</label><input id="s-icone" placeholder="ex: 💻" value="💻"></div>
          <div class="form-group"><label>Categoria</label>
            <select id="s-categoria">
              <option value="desenvolvimento">Desenvolvimento</option>
              <option value="consultoria">Consultoria</option>
              <option value="design">Design</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="suporte">Suporte</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Preço</label><input id="s-preco" placeholder="ex: Sob consulta" value="Sob consulta"></div>
          <div class="form-group"><label>Destaque</label>
            <select id="s-destaque">
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>Recursos (um por linha)</label><textarea id="s-recursos" placeholder="Recurso 1&#10;Recurso 2&#10;Recurso 3"></textarea></div>
        <input type="hidden" id="s-id" value="">
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar Serviço</button>
        </div>
      </form>`);
  },

  async edit(id) {
    const servicos = await SupaDB.getServicos();
    const s = servicos.find(x => x.id === id);
    if (!s) return;
    this.novo();
    document.getElementById('s-id').value = id;
    document.getElementById('s-titulo').value = s.titulo;
    document.getElementById('s-desc').value = s.descricao;
    document.getElementById('s-icone').value = s.icone;
    document.getElementById('s-categoria').value = s.categoria;
    document.getElementById('s-preco').value = s.preco;
    document.getElementById('s-destaque').value = String(s.destaque);
    document.getElementById('s-recursos').value = (s.recursos || []).join('\n');
    document.getElementById('modal-title').textContent = 'Editar Serviço';
  },

  async salvar(e) {
    e.preventDefault();
    const id = document.getElementById('s-id').value;
    const recursos = document.getElementById('s-recursos').value.split('\n').map(r => r.trim()).filter(Boolean);
    const data = {
      titulo: document.getElementById('s-titulo').value.trim(),
      descricao: document.getElementById('s-desc').value.trim(),
      icone: document.getElementById('s-icone').value.trim() || '🔧',
      categoria: document.getElementById('s-categoria').value,
      preco: document.getElementById('s-preco').value.trim() || 'Sob consulta',
      destaque: document.getElementById('s-destaque').value === 'true',
      recursos,
    };
    if (id) {
      await SupaDB.updateServico({ id, ...data });
      Toast.show('Serviço atualizado!', 'success');
    } else {
      await SupaDB.addServico({ id: SupaDB.uid(), criado_em: SupaDB.now(), ...data });
      Toast.show('Serviço criado! 🛠️', 'success');
    }
    Modal.close();
    await Views.servicos();
  },

  async del(id) {
    if (!confirm('Excluir este serviço?')) return;
    await SupaDB.deleteServico(id);
    Toast.show('Serviço excluído', 'info');
    await Views.servicos();
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
        <div class="form-group"><label>Nova Senha (deixar em branco para manter)</label><div style="position:relative"><input type="password" id="pf-senha" placeholder="Nova senha..." minlength="6" style="padding-right:40px"><span onclick="document.getElementById('pf-senha').type = document.getElementById('pf-senha').type === 'password' ? 'text' : 'password'" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:18px">👁️</span></div></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`);
  },

  async salvar(e) {
    e.preventDefault();
    const u = { ...Auth.currentUser };
    u.nome = document.getElementById('pf-nome').value.trim();
    u.email = document.getElementById('pf-email').value.trim().toLowerCase();
    const nova = document.getElementById('pf-senha').value;
    const existente = await SupaDB.findUser(u.email);
    if (existente && existente.id !== u.id) {
      Toast.show('Este email já está sendo utilizado', 'error');
      return;
    }
    if (nova) {
      if (nova.length < 6 || nova.length > 12) {
        Toast.show('Senha deve ter entre 6 e 12 caracteres', 'error');
        return;
      }
      if (!/[A-Z]/.test(nova)) {
        Toast.show('Senha deve ter pelo menos 1 letra maiúscula', 'error');
        return;
      }
      if (!/[0-9]/.test(nova)) {
        Toast.show('Senha deve ter pelo menos 1 número', 'error');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(nova)) {
        Toast.show('Senha deve ter pelo menos 1 caractere especial', 'error');
        return;
      }
      u.senha = hashSenha(nova); // ← Hash da nova senha
    }
    await SupaDB.updateUser(u);
    Auth.currentUser = u;
    SupaDB.setSessao(u.id);
    document.getElementById('topbar-avatar').textContent = u.avatar;
    document.getElementById('topbar-name').textContent = u.nome.split(' ')[0];
    Toast.show('Perfil atualizado!', 'success');
    Modal.close();
    await Views.perfil();
  },

  async setAvatar(av) {
    const u = { ...Auth.currentUser, avatar: av };
    await SupaDB.updateUser(u);
    Auth.currentUser = u;
    document.getElementById('topbar-avatar').textContent = av;
    Toast.show('Avatar atualizado!', 'success');
    await Views.perfil();
  },
};

/* ──────────────────────────────────────────────
   SEARCH
   ────────────────────────────────────────────── */
async function handleSearch(q) {
  if (!q) { await Router.render(Router.current); return; }
  if (q.length < 2) return;
  q = q.toLowerCase();
  const ideias = (await SupaDB.getIdeias()).filter(i => i.titulo.toLowerCase().includes(q));
  const projetos = (await SupaDB.getProjetos()).filter(p => p.titulo.toLowerCase().includes(q));
  const tarefas = (await SupaDB.getTarefas()).filter(t => t.titulo.toLowerCase().includes(q));

  const mc = document.getElementById('main-content');
  const total = ideias.length + projetos.length + tarefas.length;
  if (total === 0) {
    mc.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">Nada encontrado</div><div class="empty-desc">Nenhum resultado para "${escHtml(q)}"</div></div>`;
    return;
  }

  let html = `<div class="page-header"><h1 class="page-title">🔍 Resultados para "${escHtml(q)}"</h1></div>`;
  if (ideias.length) html += `<h3 style="margin-bottom:12px;color:var(--muted);font-size:14px">💡 IDEIAS</h3><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">${ideias.map(i => `<div class="card" style="cursor:pointer" onclick="Router.navigate('ideias')"><b>${escHtml(i.titulo)}</b><br><span style="font-size:13px;color:var(--muted)">${escHtml(i.descricao)}</span></div>`).join('')}</div>`;
  if (projetos.length) html += `<h3 style="margin-bottom:12px;color:var(--muted);font-size:14px">📁 PROJETOS</h3><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">${projetos.map(p => `<div class="card" style="cursor:pointer" onclick="Router.navigate('projetos')"><b>${escHtml(p.titulo)}</b><br><span style="font-size:13px;color:var(--muted)">${escHtml(p.descricao)}</span></div>`).join('')}</div>`;
  if (tarefas.length) html += `<h3 style="margin-bottom:12px;color:var(--muted);font-size:14px">✅ TAREFAS</h3><div style="display:flex;flex-direction:column;gap:8px">${tarefas.map(t => `<div class="card" style="cursor:pointer" onclick="Router.navigate('tarefas')"><b>${escHtml(t.titulo)}</b><br><span style="font-size:13px;color:var(--muted)">${escHtml(t.descricao)}</span></div>`).join('')}</div>`;
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
    pos[i3 + 1] = (Math.random() - .5) * 10;
    pos[i3 + 2] = (Math.random() - .5) * 10;
    vel.push({ x: (Math.random() - .5) * .00003, y: (Math.random() - .5) * .00003, z: (Math.random() - .5) * .00003 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.025, transparent: true, opacity: 0.6, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  camera.position.z = 5;

  let mx = 0, my = 0;

  const onMouseMove = e => { mx = (e.clientX / window.innerWidth) * 2 - 1; my = -(e.clientY / window.innerHeight) * 2 + 1; };
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);

  threeRenderer._cleanupEvents = () => {
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
  };

  function ani() {
    threeAnimId = requestAnimationFrame(ani);
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      p[i3] += vel[i].x; p[i3 + 1] += vel[i].y; p[i3 + 2] += vel[i].z;
      if (Math.abs(p[i3]) > 5) vel[i].x *= -1;
      if (Math.abs(p[i3 + 1]) > 5) vel[i].y *= -1;
      if (Math.abs(p[i3 + 2]) > 5) vel[i].z *= -1;
    }
    geo.attributes.position.needsUpdate = true;
    pts.rotation.y += mx * 0.000015;
    pts.rotation.x += my * 0.000015;
    renderer.render(scene, camera);
  }
  ani();
}

function stopThreeBg() {
  if (threeAnimId) { cancelAnimationFrame(threeAnimId); threeAnimId = null; }
  if (threeRenderer) {
    if (threeRenderer._cleanupEvents) threeRenderer._cleanupEvents();
    threeRenderer.dispose();
    threeRenderer = null;
  }
  const c = document.getElementById('canvas-bg');
  if (c) c.innerHTML = '';
}

/* ──────────────────────────────────────────────
   BOOT
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await SupaDB.seed(); // Criar dados iniciais se vazio
  await Auth.init();
});
