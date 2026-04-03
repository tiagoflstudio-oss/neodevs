const Auth = {
  currentUser: null,
  tipo: null,
  data: null,

  async init() {
    this.data = await DB.load();
    const token = DB.getAccessToken();
    const tipo = DB.getTipoSessao();
    const userId = DB.getSessao();
    
    if (token && userId) {
      // Verificar se o token ainda é válido
      try {
        const supabaseUser = await AuthAPI.getUser(token);
        if (supabaseUser.id) {
          const perfil = await DB.getUser(userId);
          if (perfil) {
            this.currentUser = perfil;
            this.tipo = tipo;
            this.showApp();
            return;
          }
        }
      } catch (e) {
        // Token expirado, fazer logout
        DB.clearSessao();
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
    
    // Primeiro tenta login com Supabase Auth
    const result = await AuthAPI.login(email, senha);
    
    if (result.access_token) {
      // Buscar perfil na tabela usuarios
      const perfil = await DB.findUser(email);
      
      if (!perfil) {
        // Se não existe na tabela usuarios, criar
        const novoPerfil = { 
          id: result.user.id, 
          nome: result.user.email.split('@')[0], 
          email: result.user.email, 
          avatar: tipo === 'dev' ? '🧑‍💻' : '🏢', 
          tipo: tipo, 
          criado_em: DB.now() 
        };
        await DB.addUser(novoPerfil);
        this.currentUser = novoPerfil;
      } else {
        this.currentUser = perfil;
      }
      
      this.tipo = tipo;
      DB.setSessao(result.user.id, tipo, result.access_token, result.refresh_token);
      Toast.show('Bem-vindo, ' + this.currentUser.nome.split(' ')[0] + '! 👋', 'success');
      this.showApp();
    } else {
      // Fallback: verificar se é usuário antigo (sem Supabase Auth)
      const perfil = await DB.findUser(email);
      if (perfil && perfil.senha === senha) {
        // Usuário antigo - fazer upgrade para Supabase Auth
        const signupResult = await AuthAPI.signup(email, senha);
        this.currentUser = perfil;
        this.tipo = perfil.tipo || tipo;
        if (signupResult.access_token) {
          DB.setSessao(perfil.id, this.tipo, signupResult.access_token, signupResult.refresh_token);
        } else {
          DB.setSessao(perfil.id, this.tipo);
        }
        Toast.show('Bem-vindo, ' + perfil.nome.split(' ')[0] + '! (conta migrada)', 'success');
        this.showApp();
      } else {
        Toast.show(result.error_description || 'Email ou senha incorretos', 'error');
      }
    }
  },

  async register(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const senha = document.getElementById('reg-password').value;
    const tipo = document.getElementById('register-form').dataset.tipo || 'dev';
    
    // Verificar se já existe usuário com esse email
    const existing = await DB.findUser(email);
    if (existing) { 
      Toast.show('Este email já está cadastrado. Faça login.', 'error'); 
      this.showTab('login');
      return;
    }
    
    // Registrar com Supabase Auth
    const result = await AuthAPI.signup(email, senha);
    
    if (result.access_token || result.id_token || result.user) {
      // Criar perfil na tabela usuarios
      const perfil = { 
        id: result.user?.id || DB.uid(), 
        nome, 
        email, 
        avatar: tipo === 'dev' ? '🧑‍💻' : '🏢', 
        tipo: tipo, 
        empresa: tipo === 'cliente' ? document.getElementById('reg-empresa').value.trim() : null,
        criado_em: DB.now() 
      };
      
      await DB.addUser(perfil);
      this.currentUser = perfil;
      this.tipo = tipo;
      
      // Fazer login automático após registro
      const loginResult = await AuthAPI.login(email, senha);
      if (loginResult.access_token) {
        DB.setSessao(perfil.id, tipo, loginResult.access_token, loginResult.refresh_token);
      } else {
        DB.setSessao(perfil.id, tipo);
      }
      
      Toast.show('Conta criada! Bem-vindo, ' + nome.split(' ')[0] + '! 🎉', 'success');
      this.showApp();
    } else if (result.error) {
      Toast.show(result.error_description || 'Erro ao criar conta', 'error');
    }
  },

  async logout() {
    const token = DB.getAccessToken();
    if (token) {
      await AuthAPI.logout(token);
    }
    DB.clearSessao();
    this.currentUser = null;
    this.tipo = null;
    Toast.show('Até logo! 👋', 'info');
    window.location.href = 'index.html';
  },

  isDev() { return this.tipo === 'dev'; },
  isCliente() { return this.tipo === 'cliente'; },
};