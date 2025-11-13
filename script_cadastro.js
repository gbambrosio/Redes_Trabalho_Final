/* script_cadastro.js
   Responsável por:
   - gerenciar tema claro/escuro (tema.js reutilizado aqui)
   - interceptar envio do formulário de cadastro
   - validar dados localmente
   - enviar dados via AJAX para save_cadastro.php
   - exibir mensagem de sucesso/erro com aria-live (acessibilidade)
*/

const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const iconSpan = document.getElementById('theme-icon');

// ========== SEÇÃO 1: Gerenciar Tema ==========
function applyTheme(theme) {
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    iconSpan.textContent = '☀️'; // Sol no tema escuro (pedir claro)
    toggleButton.setAttribute('aria-checked', 'true');
  } else {
    body.classList.remove('dark-mode');
    iconSpan.textContent = '🌙'; // Lua no tema claro (pedir escuro)
    toggleButton.setAttribute('aria-checked', 'false');
  }
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
  applyTheme(savedTheme);
} else if (prefersDark) {
  applyTheme('dark');
} else {
  applyTheme('light');
}

toggleButton.addEventListener('click', () => {
  const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
});

// ========== SEÇÃO 2: Gerenciar Envio de Cadastro ==========
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action="cadastro_bd.php"]');
  
  if (!form) return; // Sai se não houver formulário
  
  // Cria elemento para exibir mensagens (aria-live para leitores de tela)
  const messageContainer = document.createElement('div');
  messageContainer.id = 'form-message';
  messageContainer.setAttribute('aria-live', 'polite');
  messageContainer.setAttribute('role', 'status');
  messageContainer.style.marginTop = '1rem';
  messageContainer.style.padding = '0.75rem';
  messageContainer.style.borderRadius = '4px';
  messageContainer.style.display = 'none';
  form.parentNode.insertBefore(messageContainer, form.nextSibling);
  
  // Função para exibir mensagem (sucesso ou erro)
  function showMessage(text, isSuccess) {
    messageContainer.textContent = text;
    messageContainer.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
    messageContainer.style.color = isSuccess ? '#155724' : '#721c24';
    messageContainer.style.border = isSuccess ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    messageContainer.style.display = 'block';
  }
  
  // Intercepta envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede envio padrão
    
    // Coleta dados do formulário
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Valida campos obrigatórios
    if (!data.nome || !data.email || !data.cpf || !data.idade) {
      showMessage('Por favor, preencha todos os campos obrigatórios.', false);
      return;
    }
    
    // Valida CPF (11 dígitos)
    if (!/^[0-9]{11}$/.test(data.cpf)) {
      showMessage('CPF deve conter 11 dígitos.', false);
      return;
    }
    
    // Valida email básico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      showMessage('E-mail inválido.', false);
      return;
    }
    
    // Valida idade
    const idade = parseInt(data.idade);
    if (idade < 0 || idade > 150) {
      showMessage('Idade deve estar entre 0 e 150 anos.', false);
      return;
    }
    
    try {
      // Envia dados via AJAX (POST JSON) para save_cadastro.php
      const response = await fetch('save_cadastro.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showMessage(result.message, true);
        form.reset(); // Limpa formulário após sucesso
        // Opcionalmente, redireciona após 2 segundos
        setTimeout(() => {
          window.location.href = './index.html';
        }, 2000);
      } else {
        showMessage(result.error || 'Erro ao enviar cadastro.', false);
      }
    } catch (error) {
      showMessage('Erro de conexão: ' + error.message, false);
    }
  });
});