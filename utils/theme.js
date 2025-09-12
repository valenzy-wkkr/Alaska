/*
  Sistema de Tema Claro/Oscuro
  -------------------------------------------------
  - Usa data-theme en <html>: 'light' | 'dark'
  - Persiste preferencia en localStorage (clave: 'theme')
  - Si no hay preferencia guardada, respeta prefers-color-scheme
  - Inserta un botón accesible en la barra de navegación o crea uno flotante
  - Evita FOUC gracias al snippet inline que se añade en cada <head>
*/
(function(){
  const THEME_KEY = 'theme';
  const root = document.documentElement;
  function getSystemPreference(){
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light';
  }
  function getStoredTheme(){
    try { return localStorage.getItem(THEME_KEY); } catch(_) { return null; }
  }
  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch(_){/* ignore */}
    updateToggleUI(theme);
  }
  function toggleTheme(){
    const current = root.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }
  // Crea botón toggle
  function createToggle(){
    const btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-live','polite');
    btn.addEventListener('click', toggleTheme);
    const icon = document.createElement('i');
    icon.className = 'theme-toggle-icon fas';
    const span = document.createElement('span');
    span.className = 'theme-toggle-text';
    btn.append(icon, span);
    return btn;
  }
  function updateToggleUI(theme){
    const btn = document.getElementById('themeToggle');
    if(!btn) return;
    const icon = btn.querySelector('.theme-toggle-icon');
    const text = btn.querySelector('.theme-toggle-text');
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    if(icon){ icon.className = 'theme-toggle-icon fas ' + (isDark ? 'fa-moon':'fa-sun'); }
    if(text){ text.textContent = isDark ? 'Claro' : 'Oscuro'; }
  }
  function mountToggle(){
    // Intentar en la navegación existente
    let navList = document.querySelector('.lista-navegacion');
    const toggle = createToggle();
    if(navList){
      const li = document.createElement('li');
      li.className = 'theme-toggle-wrapper';
      li.appendChild(toggle);
      navList.appendChild(li);
    } else {
      // Fallback: botón flotante
      toggle.style.position='fixed';
      toggle.style.bottom='1rem';
      toggle.style.left='1rem';
      toggle.style.zIndex='1300';
      document.body.appendChild(toggle);
    }
    // Aplicar estado inicial
    updateToggleUI(root.getAttribute('data-theme')||'light');
  }
  document.addEventListener('DOMContentLoaded', function(){
    const stored = getStoredTheme();
    applyTheme(stored || (root.getAttribute('data-theme')|| getSystemPreference()));
    mountToggle();
    // Reaccionar a cambio del sistema si el usuario nunca eligió manualmente
    if(!stored){
      try {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', (e)=>{ if(!getStoredTheme()){ applyTheme(e.matches ? 'dark':'light'); } });
      } catch(_){}
    }
  });
})();
