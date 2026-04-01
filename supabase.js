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

  // ── EQUIPES ──
  async getEquipe(id) {
    try {
      const data = await supabaseFetch('equipes?id=eq.' + encodeURIComponent(id) + '&select=*');
      return data[0] || null;
    } catch (e) {
      console.error('Erro ao buscar equipe:', e.message);
      return null;
    }
  },

  async getMinhasEquipes(userId) {
    try {
      // Equipes onde é dono OU membro (via usuario.equipe_id)
      const data = await supabaseFetch('equipes?or=(dono_id.eq.' + userId + ',id.in.(SELECT equipe_id FROM usuarios WHERE id=' + userId + '))&select=*');
      return data;
    } catch (e) {
      console.error('Erro ao buscar equipes:', e.message);
      return [];
    }
  },

  async createEquipe(equipe) {
    try {
      return await supabaseFetch('equipes', {
        method: 'POST',
        body: JSON.stringify([equipe])
      }).then(d => d[0]);
    } catch (e) {
      console.error('Erro ao criar equipe:', e.message);
      return { error: e.message };
    }
  },

  async updateEquipe(equipe) {
    try {
      return await supabaseFetch('equipes?id=eq.' + equipe.id, {
        method: 'PATCH',
        body: JSON.stringify(equipe)
      }).then(d => d[0]);
    } catch (e) {
      console.error('Erro ao atualizar equipe:', e.message);
      return null;
    }
  },

  async findEquipeByCodigo(codigo) {
    try {
      const data = await supabaseFetch('equipes?codigo_convite=eq.' + encodeURIComponent(codigo) + '&select=*');
      return data[0] || null;
    } catch (e) {
      console.error('Erro ao buscar equipe:', e.message);
      return null;
    }
  },

  async getMembrosEquipe(equipeId) {
    try {
      const data = await supabaseFetch('usuarios?equipe_id=eq.' + encodeURIComponent(equipeId) + '&select=*');
      return data;
    } catch (e) {
      console.error('Erro ao buscar membros:', e.message);
      return [];
    }
  },

  // ── CONVITES ──
  async createConvite(convite) {
    try {
      return await supabaseFetch('convites', {
        method: 'POST',
        body: JSON.stringify([convite])
      }).then(d => d[0]);
    } catch (e) {
      console.error('Erro ao criar convite:', e.message);
      return { error: e.message };
    }
  },

  async getConvitesPorEquipe(equipeId) {
    try {
      return await supabaseFetch('convites?equipe_id=eq.' + encodeURIComponent(equipeId) + '&select=*,convidado_por_data:convidado(*)');
    } catch (e) {
      console.error('Erro ao buscar convites:', e.message);
      return [];
    }
  },

  async getMeusConvites(email) {
    try {
      return await supabaseFetch('convites?email=eq.' + encodeURIComponent(email) + '&status=eq.pendente&select=*,equipe:equipe_id(*)');
    } catch (e) {
      console.error('Erro ao buscar convites:', e.message);
      return [];
    }
  },

  async aceitarConvite(conviteId, userId) {
    try {
      // Busca o convite
      const convites = await supabaseFetch('convites?id=eq.' + encodeURIComponent(conviteId) + '&select=*');
      const convite = convites[0];
      if (!convite) throw new Error('Convite não encontrado');

      // Atualiza status do convite
      await supabaseFetch('convites?id=eq.' + conviteId, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'aceito' })
      });

      // Adiciona usuário na equipe
      await supabaseFetch('usuarios?id=eq.' + userId, {
        method: 'PATCH',
        body: JSON.stringify({ equipe_id: convite.equipe_id })
      });

      return convite.equipe_id;
    } catch (e) {
      console.error('Erro ao aceitar convite:', e.message);
      return null;
    }
  },

  async recusarConvite(conviteId) {
    try {
      await supabaseFetch('convites?id=eq.' + conviteId, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'recusado' })
      });
      return true;
    } catch (e) {
      console.error('Erro ao recusar convite:', e.message);
      return false;
    }
  },

  // ── SESSÃO ──
  getSessao() { return localStorage.getItem('devhub_session'); },
  setSessao(userId) { localStorage.setItem('devhub_session', userId); },
  clearSessao() { localStorage.removeItem('devhub_session'); },

  // ── IDEIAS ──
  async getIdeias(equipeId) {
    try {
      const filter = equipeId ? 'equipe_id=eq.' + encodeURIComponent(equipeId) + '&' : '';
      return await supabaseFetch('ideias?' + filter + 'select=*&order=criado_em.desc');
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
  async getProjetos(equipeId) {
    try {
      const filter = equipeId ? 'equipe_id=eq.' + encodeURIComponent(equipeId) + '&' : '';
      return await supabaseFetch('projetos?' + filter + 'select=*&order=criado_em.desc');
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
  async getTarefas(equipeId) {
    try {
      const filter = equipeId ? 'equipe_id=eq.' + encodeURIComponent(equipeId) + '&' : '';
      return await supabaseFetch('tarefas?' + filter + 'select=*&order=criado_em.desc');
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
  async getServicos(equipeId) {
    try {
      const filter = equipeId ? 'equipe_id=eq.' + encodeURIComponent(equipeId) + '&' : '';
      return await supabaseFetch('servicos?' + filter + 'select=*&order=criado_em.desc');
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
