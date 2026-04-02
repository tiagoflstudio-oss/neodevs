const Views = {

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