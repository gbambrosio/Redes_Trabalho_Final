/* chatbot.js
   Responsável pela interface do mini-chat embutido:
   - controle de abrir/fechar chat (foco + aria)
   - renderização de mensagens (usuário e bot)
   - indicador de digitação
   - envio de mensagens para o endpoint proxy (/api/openai) e tratamento de respostas
   Observações de acessibilidade:
   - usa aria-hidden/aria-expanded para sinalizar estado
   - o campo de entrada recebe foco automaticamente ao abrir
*/
document.addEventListener('DOMContentLoaded', () => {
  const bubble = document.getElementById('chat-bubble');
  const win = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  function openChat(){
    win.setAttribute('aria-hidden','false');
    bubble.setAttribute('aria-expanded','true');
    // indica que o diálogo foi aberto e foca o campo de entrada
    input.focus();
  }
  function closeChat(){
    win.setAttribute('aria-hidden','true');
    bubble.setAttribute('aria-expanded','false');
    // devolve o foco para o botão que abriu o chat
    bubble.focus();
  }

  bubble.addEventListener('click', openChat);
  bubble.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') openChat(); });
  closeBtn.addEventListener('click', closeChat);

  // render message helpers
  function appendMessage(text, sender){
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg ' + (sender==='user' ? 'user' : 'bot');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function setTyping(on){
    let el = messages.querySelector('.typing-indicator');
    if(on){
      if(!el){
        el = document.createElement('div');
        el.className = 'chat-msg bot typing-indicator';
        el.innerHTML = '<div class="bubble typing">Digitando...</div>';
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
      }
    } else {
      if(el) el.remove();
    }
  }

  async function sendMessage(){
    const text = input.value && input.value.trim();
    if(!text) return;
    appendMessage(text, 'user');
    input.value = '';
    setTyping(true);

    try{
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({message: text})
      });

      if(!res.ok){
        const err = await res.json().catch(()=>({error:'Erro no servidor'}));
        appendMessage('Desculpe, ocorreu um erro: ' + (err.error||res.statusText), 'bot');
        setTyping(false);
        return;
      }

      const data = await res.json();
      const reply = data.reply || 'Desculpe, não obtive resposta.';
      setTyping(false);
      appendMessage(reply, 'bot');
    }catch(e){
      setTyping(false);
      appendMessage('Erro de conexão: ' + (e.message||e), 'bot');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendMessage(); });

  // welcome message
  const welcome = 'Olá! Sou o assistente do Novembro Azul. Posso responder perguntas sobre prevenção, exames e orientações. Como posso ajudar você hoje?';
  appendMessage(welcome, 'bot');
});
