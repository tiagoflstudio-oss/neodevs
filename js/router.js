const Router = {
  current: 'dashboard',

  init() {
    const defaultRoute = Auth.isCliente() ? 'cliente' : 'dashboard';
    const hash = location.hash.replace('#', '') || defaultRoute;
    this.navigate(hash);
    window.addEventListener('hashchange', () => {
      const r = location.hash.replace('#', '') || defaultRoute;
      this.render(r);
    });
  },

  navigate(route) {
    location.hash = route;
    this.render(route);
  },

  render(route) {
    if (Auth.isCliente() && ['dashboard','ideias','projetos','tarefas','equipes'].includes(route)) {
      this.navigate('cliente');
      return;
    }
    if (Auth.isDev() && route === 'cliente') {
      this.navigate('dashboard');
      return;
    }
    this.current = route;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === route);
    });
    const mc = document.getElementById('main-content');
    mc.innerHTML = '<div class="spinner"></div>';
    setTimeout(async () => {
      const views = { 
        dashboard: Views.dashboard, 
        ideias: Views.ideias, 
        projetos: Views.projetos, 
        tarefas: Views.tarefas, 
        perfil: Views.perfil,
        desenvolvedores: Auth.isDev() ? Views.desenvolvedores : null,
        contratos: Views.contratos,
        equipes: Views.equipes,
        cliente: Views.cliente,
      };
      const fn = views[route];
      if (fn) await fn(); 
      else mc.innerHTML = '<p style="padding:40px;color:var(--muted)">Página não encontrada.</p>';
    }, 80);
  },
};