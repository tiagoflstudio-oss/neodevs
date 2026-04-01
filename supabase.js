/* ============================================================
   Supabase Configuration — DevHub
   ============================================================ */

// ⚠️ SUBSTITUA PELAS CREDENCIAIS DO SEU PROJETO
// Vá em Supabase → Settings → API para encontrar
const SUPABASE_URL = 'https://wipwvjuikcmsmpvqedis.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcHd2anVpa2Ntc21wdnFlZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDM5NjgsImV4cCI6MjA5MDU3OTk2OH0.eG-vZp3w8qeJySAcGtDjB2Gkl_HQyR2Ri9va2QdPnFw';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Função para hash de senha (simples - para demo)
// Em produção, use Supabase Auth ou bcrypt no backend
function hashSenha(senha) {
  let hash = 0;
  for (let i = 0; i < senha.length; i++) {
    const char = senha.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + senha.length;
}

async function supabaseFetch(endpoint, options = {}) {
  const url = SUPABASE_URL + '/rest/v1/' + endpoint;
  
  // Debug: log da URL para verificar conexão
  console.log('[Supabase] Requisição:', endpoint);
  
  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...HEADERS, ...options.headers }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('[Supabase] Erro HTTP:', response.status, errorText);
        let error;
        try { error = JSON.parse(errorText); } catch { error = { message: errorText }; }
        throw new Error(error.message || `Erro HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Supabase] Sucesso:', endpoint, data.length || 'ok');
      return data;
    } catch (e) {
      console.error('[Supabase] Tentativa ' + (i + 1) + ' falhou:', e.message);
      lastError = e;
      if (i < 2) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

/* ──────────────────────────────────────────────
   SUPABASE DATABASE (fetch direto)
   ────────────────────────────────────────────── */
const SupaDB = {
  uid: () => '_' + Math.random().toString(36).slice(2, 10),
  now: () => new Date().toISOString(),

  // ── USUÁRIOS ──
  async getUsuarios() {
    try {
      return await supabaseFetch('usuarios?select=*');
    } catch (e) {
      console.error('Erro ao buscar usuários:', e.message);
      return [];
    }
  },

  async findUser(email) {
    try {
      const data = await supabaseFetch('usuarios?email=eq.' + encodeURIComponent(email) + '&select=*');
      return data[0] || null;
    } catch (e) {
      console.error('Erro ao buscar usuário:', e.message);
      return null;
    }
  },

  async getUser(id) {
    try {
      const data = await supabaseFetch('usuarios?id=eq.' + encodeURIComponent(id) + '&select=*');
      return data[0] || null;
    } catch (e) {
      console.error('Erro ao buscar usuário:', e.message);
      return null;
    }
  },

  async addUser(user) {
    try {
      return await supabaseFetch('usuarios', {
        method: 'POST',
        body: JSON.stringify([user])
      }).then(d => d[0]);
    } catch (e) {
      console.error('Erro ao adicionar usuário:', e.message);
      return { error: e.message };
    }
  },

  async updateUser(user) {
    try {
      return await supabaseFetch('usuarios?id=eq.' + user.id, {
        method: 'PATCH',
        body: JSON.stringify(user)
      }).then(d => d[0]);
    } catch (e) {
      console.error('Erro ao atualizar usuário:', e.message);
      return null;
    }
  },

  // ── SESSÃO ──
  getSessao() { return localStorage.getItem('devhub_session'); },
  setSessao(userId) { localStorage.setItem('devhub_session', userId); },
  clearSessao() { localStorage.removeItem('devhub_session'); },

  // ── IDEIAS ──
  async getIdeias() {
    try {
      return await supabaseFetch('ideias?select=*&order=criado_em.desc');
    } catch (e) { console.error('Erro ao buscar ideias:', e.message); return []; }
  },

  async addIdeia(ideia) {
    try {
      return await supabaseFetch('ideias', {
        method: 'POST',
        body: JSON.stringify([ideia])
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao adicionar ideia:', e.message); return null; }
  },

  async updateIdeia(ideia) {
    try {
      return await supabaseFetch('ideias?id=eq.' + ideia.id, {
        method: 'PATCH',
        body: JSON.stringify(ideia)
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao atualizar ideia:', e.message); return null; }
  },

  async deleteIdeia(id) {
    try {
      await supabaseFetch('ideias?id=eq.' + id, { method: 'DELETE' });
      return true;
    } catch (e) { console.error('Erro ao deletar ideia:', e.message); return false; }
  },

  // ── PROJETOS ──
  async getProjetos() {
    try {
      return await supabaseFetch('projetos?select=*&order=criado_em.desc');
    } catch (e) { console.error('Erro ao buscar projetos:', e.message); return []; }
  },

  async addProjeto(projeto) {
    try {
      return await supabaseFetch('projetos', {
        method: 'POST',
        body: JSON.stringify([projeto])
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao adicionar projeto:', e.message); return null; }
  },

  async updateProjeto(projeto) {
    try {
      return await supabaseFetch('projetos?id=eq.' + projeto.id, {
        method: 'PATCH',
        body: JSON.stringify(projeto)
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao atualizar projeto:', e.message); return null; }
  },

  async deleteProjeto(id) {
    try {
      await supabaseFetch('projetos?id=eq.' + id, { method: 'DELETE' });
      return true;
    } catch (e) { console.error('Erro ao deletar projeto:', e.message); return false; }
  },

  // ── TAREFAS ──
  async getTarefas() {
    try {
      return await supabaseFetch('tarefas?select=*&order=criado_em.desc');
    } catch (e) { console.error('Erro ao buscar tarefas:', e.message); return []; }
  },

  async addTarefa(tarefa) {
    try {
      return await supabaseFetch('tarefas', {
        method: 'POST',
        body: JSON.stringify([tarefa])
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao adicionar tarefa:', e.message); return null; }
  },

  async updateTarefa(tarefa) {
    try {
      return await supabaseFetch('tarefas?id=eq.' + tarefa.id, {
        method: 'PATCH',
        body: JSON.stringify(tarefa)
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao atualizar tarefa:', e.message); return null; }
  },

  async deleteTarefa(id) {
    try {
      await supabaseFetch('tarefas?id=eq.' + id, { method: 'DELETE' });
      return true;
    } catch (e) { console.error('Erro ao deletar tarefa:', e.message); return false; }
  },

  // ── SERVIÇOS ──
  async getServicos() {
    try {
      return await supabaseFetch('servicos?select=*&order=criado_em.desc');
    } catch (e) { console.error('Erro ao buscar serviços:', e.message); return []; }
  },

  async addServico(servico) {
    try {
      return await supabaseFetch('servicos', {
        method: 'POST',
        body: JSON.stringify([servico])
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao adicionar serviço:', e.message); return null; }
  },

  async updateServico(servico) {
    try {
      return await supabaseFetch('servicos?id=eq.' + servico.id, {
        method: 'PATCH',
        body: JSON.stringify(servico)
      }).then(d => d[0]);
    } catch (e) { console.error('Erro ao atualizar serviço:', e.message); return null; }
  },

  async deleteServico(id) {
    try {
      await supabaseFetch('servicos?id=eq.' + id, { method: 'DELETE' });
      return true;
    } catch (e) { console.error('Erro ao deletar serviço:', e.message); return false; }
  },

  // ── SEED ──
  async seed() {
    try {
      const usuarios = await this.getUsuarios();
      if (usuarios.length > 0) return;
      console.log('Seed executado - banco vazio');
    } catch (e) {
      console.log('Seed: erro ao verificar banco');
    }
  }
};
