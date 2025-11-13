/* accessibility.js
  Painel de acessibilidade - funcionalidades:
  - aumentar / diminuir / resetar o tamanho base da fonte (variável CSS --base-font-size)
  - ativar/desativar modo para daltónicos (paleta de cores segura)
  - ativar/desativar modo de leitura para dislexia (espacamento e fonte)
  - persistência das preferências em localStorage
  - feedback para leitores de tela via elemento com aria-live

  Estrutura básica:
  - constantes KEY_* para armazenar preferências
  - funções get/set para leitura/escrita no localStorage
  - funções apply* que alteram atributos/variáveis no elemento root (document.documentElement)
  - listeners adicionados no DOMContentLoaded para tornar o módulo passivo até a página carregar
*/
(function(){
  const KEY_FONT = 'baseFontSize';
  const KEY_COLOR = 'colorBlindMode';
  const KEY_DYS = 'dyslexiaMode';

  const MIN = 12; // px
  const MAX = 28; // px
  const STEP = 2; // px
  const DEFAULT = 16; // px

  function getStoredFont(){
    try { return parseInt(localStorage.getItem(KEY_FONT)) || DEFAULT; }
    catch(e){ return DEFAULT; }
  }
  function setStoredFont(value){ try { localStorage.setItem(KEY_FONT, String(value)); } catch(e){} }

  function getStoredBool(key, fallback=false){
    try { const v = localStorage.getItem(key); return v === null ? fallback : v === 'true'; }
    catch(e){ return fallback; }
  }
  function setStoredBool(key, value){ try { localStorage.setItem(key, value ? 'true' : 'false'); } catch(e){} }

  function applyFontSize(px){
    const root = document.documentElement;
    root.style.setProperty('--base-font-size', px + 'px');
    const announcer = document.getElementById('accessibility-announcer');
    if(announcer) announcer.textContent = `Tamanho da fonte ajustado para ${px} pixels`;
  }

  function applyColorBlind(on){
    const root = document.documentElement;
    if(on) root.setAttribute('data-color-blind','true');
    else root.removeAttribute('data-color-blind');
    const btn = document.getElementById('toggle-colorblind');
    if(btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const announcer = document.getElementById('accessibility-announcer');
    if(announcer) announcer.textContent = on ? 'Modo para daltônicos ativado' : 'Modo para daltônicos desativado';
  }

  function applyDyslexia(on){
    const root = document.documentElement;
    if(on) root.setAttribute('data-dyslexia','true');
    else root.removeAttribute('data-dyslexia');
    const btn = document.getElementById('toggle-dyslexia');
    if(btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const announcer = document.getElementById('accessibility-announcer');
    if(announcer) announcer.textContent = on ? 'Modo leitura para dislexia ativado' : 'Modo leitura para dislexia desativado';
  }

  function clamp(v){ return Math.min(MAX, Math.max(MIN, v)); }

  document.addEventListener('DOMContentLoaded', ()=>{
    const decrease = document.getElementById('decrease-font');
    const increase = document.getElementById('increase-font');
    const reset = document.getElementById('reset-font');
    const toggleColor = document.getElementById('toggle-colorblind');
    const toggleDys = document.getElementById('toggle-dyslexia');

    // Carrega estado armazenado
    let current = getStoredFont();
    const colorStored = getStoredBool(KEY_COLOR, false);
    const dysStored = getStoredBool(KEY_DYS, false);

    applyFontSize(current);
    applyColorBlind(colorStored);
    applyDyslexia(dysStored);

    function updateFont(v){
      current = clamp(v);
      applyFontSize(current);
      setStoredFont(current);
    }

    decrease?.addEventListener('click', ()=> updateFont(current - STEP));
    increase?.addEventListener('click', ()=> updateFont(current + STEP));
    reset?.addEventListener('click', ()=> updateFont(DEFAULT));

    toggleColor?.addEventListener('click', ()=>{
      const newVal = !(document.documentElement.getAttribute('data-color-blind') === 'true');
      applyColorBlind(newVal);
      setStoredBool(KEY_COLOR, newVal);
    });

    toggleDys?.addEventListener('click', ()=>{
      const newVal = !(document.documentElement.getAttribute('data-dyslexia') === 'true');
      applyDyslexia(newVal);
      setStoredBool(KEY_DYS, newVal);
    });

    // keyboard support for toggle buttons
    [decrease, increase, reset, toggleColor, toggleDys].forEach(btn=>{
      if(!btn) return;
      btn.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    });
  });
})();
