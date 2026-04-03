const DashboardCtrl = {
  openChat() {
    ChatCtrl.toggle();
  },
};

const ChatCtrl = {
  open: false,
  messages: [],
  newCount: 0,

  async init() {
    const data = await DB.load();
    this.messages = data.mensagens || [];
    this.render();
  },

  toggle() {
    this.open = !this.open;
    const panel = document.getElementById('chat-panel');
    const toggle = document.getElementById('chat-toggle');
    panel.classList.toggle('hidden', !this.open);
    toggle.classList.remove('has-new');
    this.newCount = 0;
    if (this.open) {
      this.render();
      document.getElementById('chat-input').focus();
    }
  },

  async render() {
    const msgs = this.messages.slice(-50);
    const html = await Promise.all(msgs.map(async m => {
      const isOwn = m.userId === Auth.currentUser?.id;
      const user = await DB.getUser(m.userId);
      const time = new Date(m.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="chat-msg ${isOwn ? 'own' : 'other'}">
          ${!isOwn ? `<div style="font-size:11px;color:var(--primary);margin-bottom:4px">${user?.nome || 'Usuário'}</div>` : ''}
          ${escHtml(m.texto)}
          <div class="chat-msg-time">${time}</div>
        </div>`;
    }));
    document.getElementById('chat-messages').innerHTML = html.join('') || '<div style="text-align:center;color:var(--muted);padding:40px 0">Nenhuma mensagem ainda. Comece a conversa! 💬</div>';
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
  },

  async send() {
    const input = document.getElementById('chat-input');
    const texto = input.value.trim();
    if (!texto) return;
    const msg = { id: DB.uid(), user_id: Auth.currentUser.id, texto, criado_em: DB.now() };
    await DB.addMensagem(msg);
    const data = await DB.load();
    this.messages = data.mensagens || [];
    input.value = '';
    this.render();
  },
};