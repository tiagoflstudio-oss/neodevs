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
    const projetos = await DB.getProjetos();
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
      prazo: document.getElementById('p-prazo').value,
      equipe: [Auth.currentUser.id],
    };
    if (id) {
      const projetos = await DB.getProjetos();
      const ex = projetos.find(x => x.id === id);
      await DB.updateProjeto({ ...ex, ...data });
      Toast.show('Projeto atualizado!', 'success');
    } else {
      await DB.addProjeto({ id: DB.uid(), criado_em: DB.now(), ...data });
      Toast.show('Projeto criado! 📁', 'success');
    }
    Modal.close();
    Views.projetos();
  },

  async del(id) {
    if (!confirm('Excluir este projeto e suas tarefas?')) return;
    const tarefas = await DB.getTarefas();
    for (const t of tarefas.filter(t => t.projeto_id === id)) {
      await DB.deleteTarefa(t.id);
    }
    await DB.deleteProjeto(id);
    Toast.show('Projeto excluído', 'info');
    Views.projetos();
  },
};