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

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sb-overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('show');
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === 'password' ? 'text' : 'password';
}