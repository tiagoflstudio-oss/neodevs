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
    window.location.href = 'index.html';
  },

  isDev() { return this.tipo === 'dev'; },
  isCliente() { return this.tipo === 'cliente'; },
};