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