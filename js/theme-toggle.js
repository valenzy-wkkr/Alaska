// Theme toggle logic
(function(){
  const STORAGE_KEY = 'alaska_theme';
  const SESSION_KEY = 'alaska_theme_session';
  const root = document.documentElement; // <html>
  let syncing = false;

  // SVG icon cache
  const ICONS = {
    sun: `<svg class="tt-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon: `<svg class="tt-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/></svg>`
  };

  // Inject minimal styles (once) if not present
  (function injectStyles(){
    if(document.getElementById('theme-toggle-inline-styles')) return;
    const css = `
      .theme-toggle-btn{cursor:pointer;display:inline-flex;align-items:center;justify-content:center;background:var(--color-primary, #ff7043);color:#fff;border:none;border-radius:50%;width:40px;height:40px;box-shadow:0 4px 12px rgba(0,0,0,.25);transition:background .3s, transform .3s;position:relative;}
      .theme-toggle-btn:hover{background:var(--color-primary-hover, #ff865f);transform:translateY(-2px);}
      .theme-toggle-btn:active{transform:scale(.92);} 
      [data-theme='dark'] .theme-toggle-btn{background:var(--color-primary, #ff7043);color:#fff;}
      .theme-toggle-btn .tt-icon{pointer-events:none;}
      .theme-toggle-btn .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;}
    `;
    const style = document.createElement('style');
    style.id='theme-toggle-inline-styles';
    style.textContent = css;
    document.head.appendChild(style);
  })();

  function persist(theme){
    localStorage.setItem(STORAGE_KEY, theme);
    sessionStorage.setItem(SESSION_KEY, theme);
  }

  function applyTheme(theme, opts={save:true}){
    if(!theme) return;
    root.setAttribute('data-theme', theme);
    if(opts.save) persist(theme);
    updateBtn(theme);
    // Future: server sync
    // if(window.__userLogged && !syncing){ syncServer(theme); }
  }

  async function syncServer(theme){ /* reservado */ }

  function getButton(){
    return document.querySelector('[data-theme-toggle]');
  }

  function updateBtn(theme){
    const btn = getButton();
    if(!btn) return;
    const dark = theme === 'dark';
    btn.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    btn.title = btn.getAttribute('aria-label');
    btn.innerHTML = `<span class="sr-only">${btn.title}</span>` + (dark ? ICONS.sun : ICONS.moon);
  }

  function placeButton(nav){
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className='theme-toggle-btn';
    btn.type='button';
    btn.setAttribute('data-theme-toggle','');
    li.appendChild(btn);
    // Insert before avatar (circle with class inicial-circulo) if exists
    const items = nav.querySelectorAll('li');
    const last = items[items.length-1];
    if(last && last.querySelector('.inicial-circulo')){
      nav.insertBefore(li, last);
    } else {
      nav.appendChild(li);
    }
    return btn;
  }

  function initBtn(){
    let btn = getButton();
    if(!btn){
      const nav = document.querySelector('.navegacion-principal .lista-navegacion');
      if(nav){ btn = placeButton(nav); }
    }
    if(btn && !btn._bound){
      btn.addEventListener('click', ()=>{
        const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(current, {save:true});
      });
      btn._bound = true;
    }
  }

  // Establish preferred theme
  const storedSession = sessionStorage.getItem(SESSION_KEY);
  const storedLocal = localStorage.getItem(STORAGE_KEY);
  const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const preferred = storedSession || storedLocal || systemPref;
  applyTheme(preferred, {save:false});

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ initBtn(); updateBtn(preferred); });
  } else { initBtn(); updateBtn(preferred); }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e=>{
    const stored = localStorage.getItem(STORAGE_KEY);
    if(!stored){ applyTheme(e.matches ? 'dark':'light', {save:false}); }
  });
})();
