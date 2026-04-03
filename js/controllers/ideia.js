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

  async salvar(e) {
    e.preventDefault();
    const id = document.getElementById('i-id').value;
    const tags = document.getElementById('i-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
    const data = {
      titulo: document.getElementById('i-titulo').value.trim(),
      descricao: document.getElementById('i-desc').value.trim(),
      prioridade: document.getElementById('i-prior').value,
      status: document.getElementById('i-status').value,
      tags, autor_id: Auth.currentUser.id,
    };
    if (id) {
      const existing = await DB.getIdeias();
      const item = existing.find(x => x.id === id);
      await DB.updateIdeia({ ...item, ...data });
      Toast.show('Ideia atualizada!', 'success');
    } else {
      await DB.addIdeia({ id: DB.uid(), votos: 0, criado_em: DB.now(), ...data });
      Toast.show('Ideia criada! 💡', 'success');
    }
    Modal.close();
    Views.ideias();
  },

  async del(id) {
    if (!confirm('Excluir esta ideia?')) return;
    await DB.deleteIdeia(id);
    Toast.show('Ideia excluída', 'info');
    Views.ideias();
  },

  async mover(id, novoStatus) {
    const ideias = await DB.getIdeias();
    const i = ideias.find(x => x.id === id);
    if (!i) return;
    await DB.updateIdeia({ ...i, status: novoStatus });
    Toast.show(`Ideia movida para ${novoStatus}`, 'info');
    Views.ideias();
  },

  async votar(id) {
    const ideias = await DB.getIdeias();
    const i = ideias.find(x => x.id === id);
    if (!i) return;
    await DB.updateIdeia({ ...i, votos: (i.votos||0) + 1 });
    Views.ideias();
  },
};