const TarefaCtrl = {
  async novo() {
    const projetos = await DB.getProjetos();
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
    const tarefas = await DB.getTarefas();
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
      projeto_id: document.getElementById('t-proj').value,
      prioridade: document.getElementById('t-prior').value,
      status: document.getElementById('t-status').value,
      prazo: document.getElementById('t-prazo').value,
      responsavel_id: Auth.currentUser.id,
    };
    if (id) {
      const tarefas = await DB.getTarefas();
      const ex = tarefas.find(x => x.id === id);
      await DB.updateTarefa({ ...ex, ...data });
      Toast.show('Tarefa atualizada!', 'success');
    } else {
      await DB.addTarefa({ id: DB.uid(), criado_em: DB.now(), ...data });
      Toast.show('Tarefa criada! ✅', 'success');
    }
    Modal.close();
    Views.tarefas();
  },

  async del(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    await DB.deleteTarefa(id);
    Toast.show('Tarefa excluída', 'info');
    Views.tarefas();
  },

  async mover(id, novoStatus) {
    const tarefas = await DB.getTarefas();
    const t = tarefas.find(x => x.id === id);
    if (!t) return;
    await DB.updateTarefa({ ...t, status: novoStatus });
    Toast.show(`Tarefa movida para ${novoStatus}`, 'info');
    Views.tarefas();
  },
};