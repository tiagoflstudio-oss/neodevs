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