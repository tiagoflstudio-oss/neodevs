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

  async salvar(e) {
    e.preventDefault();
    const u = { ...Auth.currentUser };
    u.nome = document.getElementById('pf-nome').value.trim();
    u.email = document.getElementById('pf-email').value.trim();
    const nova = document.getElementById('pf-senha').value;
    if (nova) u.senha = nova;
    await DB.updateUser(u);
    Auth.currentUser = u;
    DB.setSessao(u.id);
    document.getElementById('topbar-avatar').textContent = u.avatar;
    document.getElementById('topbar-name').textContent = u.nome.split(' ')[0];
    Toast.show('Perfil atualizado!', 'success');
    Modal.close();
    Views.perfil();
  },

  async setAvatar(av) {
    const u = { ...Auth.currentUser, avatar: av };
    await DB.updateUser(u);
    Auth.currentUser = u;
    document.getElementById('topbar-avatar').textContent = av;
    Toast.show('Avatar atualizado!', 'success');
    Views.perfil();
  },
};