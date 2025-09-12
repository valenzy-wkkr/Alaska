/* =============================================================
   Chatbot Alaska - Mejora UX/UI, Responsive, Accesibilidad
   ---------------------------------------------------------
   Cambios respecto a la versión previa:
   - Reestructuración CSS: uso de tokens existentes (var(--color-primario), surfaces, dark mode) y adaptación automática al tema global.
   - Responsive avanzado: panel tipo "sheet" en móvil (<600px). Altura adaptativa y mejor uso de viewport.
   - Accesibilidad: aria-live para respuestas, aria-labels claros, focus trap opcional, navegación con teclado, botones con texto accesible.
   - Persistencia temporal: guarda la sesión actual en sessionStorage (no base de datos) para restaurar tras cerrar/reabrir mientras dure la pestaña.
   - Manejo estados: deshabilita envío mientras espera respuesta, evita múltiples requests paralelos, indicador de estado claro.
   - Comportamiento teclado: Enter envía, Shift+Enter nueva línea.
   - Mejora de diseño: bordes suaves, sombras consistentes, micro‑interacciones, placeholder para botón de adjuntos.
   - Seguridad/performance: abort controller con timeout configurable, safe guards contra inyección en DOM (textContent). 
   - Comentarios explicativos para futuras extensiones (adjuntos, historial persistente, streaming).
   Nota: No se reescribe desde cero — se conserva la filosofía y fetch a /api/chat — sólo se refactoriza y amplía.
============================================================= */
(function(){
  'use strict';

  /* ----------------------- Configuración ----------------------- */
  const ENDPOINT = '/api/chat';
  const FETCH_TIMEOUT_MS = 9000; // Aumentado para conexiones lentas
  const STORAGE_KEY = 'alaskaChatSession';
  const MAX_MESSAGES_STORED = 60; // Rotación simple
  let isRequestPending = false;
  let messages = []; // {role:'user'|'bot', text, ts}

  /* ----------------------- Utilidades ------------------------- */
  const nowTime = () => new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const el = (tag, attrs={}, children=[]) => { const e=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else e.setAttribute(k,v);} children.forEach(c=>e.appendChild(c)); return e; };
  const saveSession = () => { try { const slice = messages.slice(-MAX_MESSAGES_STORED); sessionStorage.setItem(STORAGE_KEY, JSON.stringify(slice)); } catch(_){/* ignore */} };
  const restoreSession = () => { try { const raw = sessionStorage.getItem(STORAGE_KEY); if(!raw) return []; const arr = JSON.parse(raw); return Array.isArray(arr)?arr:[]; } catch(_){ return []; } };
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------- Estilos mejorados ------------------ */
  const style = document.createElement('style');
  style.textContent = `/* Chatbot Alaska UI Futurista */
  :root { --alaska-glow-accent: var(--color-secundario); --alaska-glow-prim: var(--color-primario); }
  .alaska-chatbot{position:fixed;right:16px;bottom:16px;z-index:1200;font-family:var(--fuente-base,'Poppins',system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial);}
  .alaska-chatbot *{box-sizing:border-box;}
  /* Botón flotante con órbita animada */
  .alaska-chatbot__btn{background:radial-gradient(circle at 30% 30%,var(--color-primario) 0%,var(--color-primario-oscuro) 70%);color:#fff;border:none;border-radius:50%;width:62px;height:62px;box-shadow:0 6px 18px -2px rgba(0,0,0,.35),0 0 0 0 rgba(255,255,255,.15);font-size:26px;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;transition:background .4s, transform .28s, box-shadow .5s;overflow:hidden;}
  .alaska-chatbot__btn::before,.alaska-chatbot__btn::after{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,var(--alaska-glow-accent),var(--color-primario),var(--alaska-glow-accent));mix-blend-mode:overlay;opacity:.25;animation:alaska-spin 6s linear infinite;}
  .alaska-chatbot__btn::after{animation-direction:reverse;animation-duration:9s;opacity:.35;filter:blur(4px);}
  .alaska-chatbot__btn:hover{transform:translateY(-4px) scale(1.03);box-shadow:0 12px 28px -6px rgba(0,0,0,.55),0 0 0 6px rgba(255,255,255,.06);}
  .alaska-chatbot__btn:focus-visible{outline:2px solid var(--color-acento);outline-offset:4px;}
  .alaska-chatbot__badge{position:absolute;top:-4px;right:-4px;background:linear-gradient(135deg,var(--color-secundario),var(--color-acento));color:#fff;font-size:.58rem;padding:2px 6px;border-radius:10px;box-shadow:0 0 0 1px rgba(255,255,255,.35),0 4px 10px -2px rgba(0,0,0,.4);letter-spacing:.5px;font-weight:600;}
  @keyframes alaska-spin{to{transform:rotate(360deg);}}

  /* Panel con glassmorphism + borde gradiente animado */
  .alaska-chatbot__panel{position:fixed;right:16px;bottom:94px;width:400px;max-height:74vh;display:none;flex-direction:column;border-radius:26px;padding:1px;backdrop-filter:saturate(180%) blur(18px);background:linear-gradient(145deg,rgba(255,255,255,.55),rgba(255,255,255,.15));box-shadow:0 24px 60px -12px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.18);overflow:hidden;isolation:isolate;}
  .alaska-chatbot__panel::before{content:"";position:absolute;inset:0;padding:1.2px;border-radius:inherit;background:linear-gradient(130deg,var(--color-primario),var(--color-secundario),var(--color-acento),var(--color-primario));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:borderShift 8s linear infinite;opacity:.9;pointer-events:none;}
  @keyframes borderShift{0%{filter:hue-rotate(0deg);}50%{filter:hue-rotate(160deg);}100%{filter:hue-rotate(360deg);}}
  .alaska-chatbot__panel[data-open='true']{display:flex;animation:chatPanelIn .55s cubic-bezier(.16,.84,.44,1);} 
  @keyframes chatPanelIn{0%{opacity:0;transform:translateY(18px) scale(.96);}60%{opacity:1;transform:translateY(-2px) scale(1);}100%{opacity:1;transform:translateY(0) scale(1);}}
  .alaska-chatbot__panel[data-expanded='true']{top:50%;left:50%;right:auto;bottom:auto;width:clamp(520px,70vw,960px);height:clamp(540px,80vh,880px);max-height:880px;transform:translate(-50%,-50%);border-radius:30px;}
  .alaska-chatbot__panel[data-expanded='true'] .alaska-chatbot__body{flex:1;}

  /* Cabecera futurista */
  .alaska-chatbot__header{background:linear-gradient(120deg,var(--color-primario) 0%,var(--color-primario-oscuro) 55%,var(--color-secundario) 140%);color:#fff;padding:.95rem .95rem .85rem;display:flex;align-items:center;gap:.75rem;position:relative;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15),0 4px 14px -4px rgba(0,0,0,.5);}
  .alaska-chatbot__header::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(255,255,255,.35),transparent 60%);mix-blend-mode:overlay;opacity:.35;pointer-events:none;}
  .alaska-chatbot__titlewrap{display:flex;gap:.6rem;align-items:center;min-width:0;}
  .alaska-chatbot__avatar{width:40px;height:40px;border-radius:14px;background:linear-gradient(145deg,rgba(255,255,255,.35),rgba(255,255,255,.06));display:flex;align-items:center;justify-content:center;font-size:1.15rem;backdrop-filter:blur(6px) brightness(1.05);box-shadow:0 2px 6px -1px rgba(0,0,0,.4);}
  .alaska-chatbot__titles{display:flex;flex-direction:column;line-height:1.05;}
  .alaska-chatbot__title{font-size:1rem;font-weight:600;letter-spacing:.5px;text-shadow:0 1px 2px rgba(0,0,0,.35);}
  .alaska-chatbot__subtitle{font-size:.6rem;opacity:.85;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}
  .alaska-chatbot__actions{display:flex;align-items:center;gap:.45rem;margin-left:auto;}
  .alaska-chatbot__iconbtn, .alaska-chatbot__clear{--btn-bg:rgba(255,255,255,.18);background:var(--btn-bg);border:1px solid rgba(255,255,255,.4);color:#fff;padding:.5rem .65rem;border-radius:12px;font-size:.65rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;transition:background .35s,border-color .35s,transform .35s,box-shadow .4s;backdrop-filter:blur(8px) saturate(140%);position:relative;min-height:32px;}
  .alaska-chatbot__iconbtn::before,.alaska-chatbot__clear::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(120deg,var(--color-secundario),transparent 55%);opacity:0;mix-blend-mode:overlay;transition:opacity .5s;}
  .alaska-chatbot__iconbtn:hover::before,.alaska-chatbot__clear:hover::before{opacity:1;}
  .alaska-chatbot__iconbtn:hover, .alaska-chatbot__clear:hover{background:rgba(255,255,255,.28);box-shadow:0 4px 14px -4px rgba(0,0,0,.55);}
  .alaska-chatbot__iconbtn:focus-visible, .alaska-chatbot__clear:focus-visible{outline:2px solid var(--color-acento);outline-offset:2px;}
  .alaska-chatbot__drag-handle{position:absolute;top:5px;left:50%;transform:translateX(-50%);width:56px;height:5px;border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,.55),rgba(255,255,255,.15));}

  /* Cuerpo mensajes */
  .alaska-chatbot__body{padding:1.05rem .95rem .85rem;overflow:auto;display:flex;flex-direction:column;gap:1rem;scrollbar-width:thin;background:linear-gradient(185deg,var(--surface-1,#ffffffcc),var(--surface-2,#eef3f8cc));mask:linear-gradient(#000,rgba(0,0,0,.6));}
  .alaska-chatbot__body::-webkit-scrollbar{width:10px;} .alaska-chatbot__body::-webkit-scrollbar-track{background:linear-gradient(180deg,transparent,rgba(0,0,0,.08));border-radius:50px;} .alaska-chatbot__body::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--color-primario),var(--color-secundario));border-radius:50px;}

  .alaska-chatbot__row{display:flex;gap:.7rem;align-items:flex-start;}
  .alaska-chatbot__row--user{justify-content:flex-end;}
  .alaska-chatbot__msg{padding:.75rem .95rem .85rem;border-radius:18px;max-width:78%;position:relative;line-height:1.45;font-size:.84rem;white-space:pre-wrap;word-break:break-word;box-shadow:0 4px 10px -4px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.25);backdrop-filter:blur(4px) saturate(140%);}
  .alaska-chatbot__msg--user{background:linear-gradient(135deg,var(--color-primario-claro,#cfe8d1),#b2dfbb);color:#0d3218;font-weight:600;}
  .alaska-chatbot__msg--bot{background:linear-gradient(145deg,var(--surface-2,#f1f5f9),var(--surface-1,#fff));color:var(--text-primary,#1c2a32);border:1px solid var(--border-color,#dfe4e7);}
  .alaska-chatbot__msg--bot:focus-within{outline:2px solid var(--color-secundario);}
  .alaska-chatbot__msg::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:0 0 0 0 rgba(255,255,255,.4);transition:box-shadow .6s;}
  .alaska-chatbot__msg:hover::after{box-shadow:0 0 0 2px rgba(255,255,255,.35);}
  .alaska-chatbot__time{display:block;margin-top:.4rem;font-size:.58rem;opacity:.55;letter-spacing:.6px;font-weight:500;}

  /* Indicador escribiendo */
  .alaska-chatbot__typing-dots{display:inline-flex;gap:6px;align-items:center;padding:.55rem .8rem;border-radius:18px;background:linear-gradient(145deg,var(--surface-2,#f1f5f9),var(--surface-1,#fff));border:1px solid var(--border-color,#e1e5e8);box-shadow:0 3px 10px -4px rgba(0,0,0,.35);}
  .alaska-dot{width:7px;height:7px;border-radius:50%;background:var(--color-primario-claro,#aacfb1);animation:alaska-bounce 1.2s infinite ease-in-out;box-shadow:0 0 0 0 rgba(255,255,255,.6);}
  .alaska-dot:nth-child(2){animation-delay:.18s} .alaska-dot:nth-child(3){animation-delay:.36s}
  @keyframes alaska-bounce{0%,80%,100%{transform:translateY(0) scale(.85);opacity:.45}40%{transform:translateY(-5px) scale(1.15);opacity:1}}

  /* Sugerencias */
  .alaska-chatbot__suggestions{display:flex;flex-wrap:wrap;gap:.5rem;padding:0 .95rem .55rem;}
  .alaska-chip{background:linear-gradient(135deg,var(--surface-2,#eef3f5),var(--surface-1,#fff));color:var(--text-primary,#1d2b32);border:1px solid var(--border-color,#d9dfe2);border-radius:999px;padding:.4rem .85rem;font-size:.66rem;cursor:pointer;font-weight:600;letter-spacing:.55px;position:relative;overflow:hidden;transition:color .4s, border-color .4s, background .5s, transform .35s;}
  .alaska-chip::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 0 0,rgba(255,255,255,.6),transparent 60%);opacity:0;transition:opacity .6s;}
  .alaska-chip:hover{background:linear-gradient(135deg,var(--color-primario-claro,#d9f2db),var(--color-primario));color:#0d3218;border-color:var(--color-primario);transform:translateY(-3px);} 
  .alaska-chip:hover::before{opacity:.55;}
  .alaska-chip:focus-visible{outline:2px solid var(--color-secundario);outline-offset:2px;}

  /* Footer / Entrada */
  .alaska-chatbot__footer{display:flex;flex-direction:column;gap:.45rem;padding:.65rem .7rem .7rem;border-top:1px solid var(--border-color,#e0e5e8);background:linear-gradient(160deg,var(--surface-1,#ffffffcc),var(--surface-2,#f2f6f9cc));backdrop-filter:blur(14px) saturate(140%);}
  .alaska-chatbot__tools{display:flex;align-items:center;gap:.5rem;}
  .alaska-chatbot__input-wrap{display:flex;align-items:flex-end;gap:.55rem;}
  .alaska-chatbot__textarea{flex:1;resize:none;min-height:48px;max-height:150px;padding:.7rem .8rem;border:1px solid var(--border-color,#d4d9df);border-radius:16px;font-size:.8rem;line-height:1.38;font-family:inherit;background:linear-gradient(160deg,var(--surface-inset,#fff),var(--surface-2,#f1f3f5));color:var(--text-primary,#222);transition:border .35s, background .55s, box-shadow .4s;box-shadow:0 2px 4px -2px rgba(0,0,0,.25) inset,0 1px 1px rgba(255,255,255,.5);}
  .alaska-chatbot__textarea:focus{outline:none;border-color:var(--color-primario);box-shadow:0 0 0 3px rgba(91,140,90,.25),0 2px 10px -4px rgba(0,0,0,.4);}
  .alaska-chatbot__send{background:linear-gradient(135deg,var(--color-secundario),var(--color-acento));color:#fff;border:none;border-radius:16px;padding:.7rem 1rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:.45rem;font-size:.72rem;letter-spacing:.5px;transition:background .4s,transform .25s, box-shadow .45s;box-shadow:0 4px 14px -6px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.3);}
  .alaska-chatbot__send[disabled]{opacity:.55;cursor:not-allowed;filter:grayscale(.2);}
  .alaska-chatbot__send:hover:not([disabled]){background:linear-gradient(135deg,var(--color-acento),var(--color-secundario));transform:translateY(-3px);box-shadow:0 10px 28px -8px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.4);}
  .alaska-chatbot__send:focus-visible{outline:2px solid var(--color-primario);outline-offset:2px;}
  .alaska-chatbot__attach{background:linear-gradient(135deg,var(--surface-2,#f1f3f5),var(--surface-1,#fff));border:1px solid var(--border-color,#d5dade);color:var(--text-secondary,#445);width:42px;height:42px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.05rem;transition:background .45s, border-color .35s, transform .35s, box-shadow .45s;position:relative;box-shadow:0 3px 8px -4px rgba(0,0,0,.5);}
  .alaska-chatbot__attach:hover{background:linear-gradient(135deg,var(--color-primario-claro,#d9f2db),var(--color-primario));border-color:var(--color-primario);color:#0d3218;transform:translateY(-3px);box-shadow:0 10px 22px -10px rgba(0,0,0,.6);} 
  .alaska-chatbot__attach:focus-visible{outline:2px solid var(--color-secundario);outline-offset:2px;}
  .alaska-chatbot__status{font-size:.55rem;opacity:.7;padding:0 .25rem .25rem .4rem;display:flex;align-items:center;gap:.45rem;color:var(--text-secondary,#556);letter-spacing:.5px;}
  .alaska-chatbot__status span{display:inline-flex;align-items:center;gap:.25rem;}

  /* Toast */
  .alaska-chatbot__toast{position:absolute;bottom:6.6rem;left:50%;transform:translateX(-50%) translateY(18px);background:linear-gradient(135deg,#222,#111);color:#fff;padding:.6rem .95rem;font-size:.68rem;border-radius:12px;box-shadow:0 10px 30px -8px rgba(0,0,0,.65);opacity:0;pointer-events:none;transition:opacity .45s, transform .55s;z-index:40;letter-spacing:.5px;font-weight:500;border:1px solid rgba(255,255,255,.15);}
  .alaska-chatbot__toast[data-show='true']{opacity:1;transform:translateX(-50%) translateY(0);}

  /* Botón expandir indicador estado expandido */
  .alaska-chatbot__iconbtn[data-active='true']{background:rgba(255,255,255,.32);box-shadow:0 4px 14px -4px rgba(0,0,0,.55);} 

  /* Dark Mode overrides usando tokens globales */
  html[data-theme='dark'] .alaska-chatbot__panel{background:linear-gradient(155deg,rgba(27,33,37,.86),rgba(34,42,47,.82));border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 60px -14px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.05);}
  html[data-theme='dark'] .alaska-chatbot__panel::before{opacity:.55;}
  html[data-theme='dark'] .alaska-chatbot__body{background:linear-gradient(185deg,var(--surface-1,#1b2125cc),var(--surface-2,#222a2fcc));}
  html[data-theme='dark'] .alaska-chatbot__msg--bot{background:linear-gradient(140deg,var(--surface-2,#222a2f),var(--surface-1,#1b2125));}
  html[data-theme='dark'] .alaska-chatbot__msg--user{background:linear-gradient(140deg,#2d5b37,#254b30);color:#d5f8e0;}
  html[data-theme='dark'] .alaska-chatbot__textarea{background:linear-gradient(140deg,var(--surface-inset,#262f35),var(--surface-2,#222a2f));color:var(--text-primary);}
  html[data-theme='dark'] .alaska-chatbot__attach{background:linear-gradient(135deg,var(--surface-2,#222a2f),var(--surface-inset,#262f35));}
  html[data-theme='dark'] .alaska-chatbot__chip{background:linear-gradient(135deg,var(--surface-2,#222a2f),var(--surface-inset,#262f35));color:var(--text-secondary);}
  html[data-theme='dark'] .alaska-chatbot__send{box-shadow:0 6px 24px -10px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.2);} 
  html[data-theme='dark'] .alaska-chatbot__send:hover:not([disabled]){box-shadow:0 16px 40px -12px rgba(0,0,0,.95);} 

  /* Móvil: sheet / full width */
  @media (max-width:640px){
    .alaska-chatbot__panel{right:0;left:0;bottom:0;margin:0 auto;width:100%;max-width:100%;border-radius:26px 26px 0 0;height:max(66vh,430px);max-height:88vh;}
    .alaska-chatbot__panel[data-expanded='true']{top:0;left:0;right:0;bottom:0;transform:none;width:100%;height:100%;border-radius:0;}
    .alaska-chatbot__body{flex:1;}
  }
  @media (max-width:430px){
    .alaska-chatbot__btn{width:56px;height:56px;font-size:23px;}
    .alaska-chatbot__panel{bottom:94px;}
  }
  @media (max-width:360px){
    .alaska-chatbot__panel{height:max(70vh,420px);} 
    .alaska-chatbot__msg{max-width:84%;}
  }

  /* Reduced motion respeta animaciones */
  @media (prefers-reduced-motion:reduce){
    .alaska-chatbot__panel,.alaska-chatbot__btn::before,.alaska-chatbot__btn::after,.alaska-chatbot__msg::after,.alaska-chatbot__chip,.alaska-chatbot__btn{animation:none!important;transition:none!important;}
  }
  `;
  document.head.appendChild(style);

  /* ----------------------- Creación Widget -------------------- */
  function createWidget(){
    const root = el('div', { class:'alaska-chatbot', role:'region', 'aria-label':'Chatbot de cuidado de mascotas' });
    const openBtn = el('button', { class:'alaska-chatbot__btn', 'aria-label':'Abrir chat de ayuda', title:'Abrir asistente' }, [document.createTextNode('💬')]);
    const badge = el('span', { class:'alaska-chatbot__badge', text:'AI' }); openBtn.appendChild(badge);
    const panel = el('div', { class:'alaska-chatbot__panel', role:'dialog', 'aria-modal':'true', 'aria-labelledby':'chatbotTitle' });

    // Header
    const dragHandle = el('div', { class:'alaska-chatbot__drag-handle', 'aria-hidden':'true' });
    const avatar = el('div', { class:'alaska-chatbot__avatar', title:'Asistente Alaska' }, [document.createTextNode('🐾')]);
    const title = el('span', { id:'chatbotTitle', class:'alaska-chatbot__title', text:'Asistente Alaska' });
    const subtitle = el('span', { class:'alaska-chatbot__subtitle', text:'Bienestar · Ética · Cuidado' });
    const titlesWrap = el('div', { class:'alaska-chatbot__titles' }, [title, subtitle]);
    const titleWrap = el('div', { class:'alaska-chatbot__titlewrap' }, [avatar, titlesWrap]);
    const clearBtn = el('button', { class:'alaska-chatbot__clear', type:'button', 'aria-label':'Limpiar conversación', title:'Limpiar conversación' }, [document.createTextNode('Limpiar')]);
  const expandBtn = el('button', { class:'alaska-chatbot__iconbtn', type:'button', 'aria-label':'Expandir', title:'Expandir / Contraer' }, [document.createTextNode('⛶')]);
  const minimizeBtn = el('button', { class:'alaska-chatbot__iconbtn', type:'button', 'aria-label':'Minimizar', title:'Minimizar' }, [document.createTextNode('–')]);
    const closeBtn = el('button', { class:'alaska-chatbot__iconbtn', type:'button', 'aria-label':'Cerrar', title:'Cerrar' }, [document.createTextNode('×')]);
  const actions = el('div', { class:'alaska-chatbot__actions' }, [clearBtn, expandBtn, minimizeBtn, closeBtn]);
    const header = el('div', { class:'alaska-chatbot__header' }, [dragHandle, titleWrap, actions]);

    // Body + live region
    const body = el('div', { class:'alaska-chatbot__body', id:'alaskaChatBody' });
    const live = el('div', { 'aria-live':'polite', 'aria-atomic':'false', class:'visually-hidden', style:'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;' });
    body.appendChild(live);

    // Suggestions container (will populate after first bot message)
    const suggestions = el('div', { class:'alaska-chatbot__suggestions', role:'list' });

    // Footer (tools + input)
    const footer = el('div', { class:'alaska-chatbot__footer' });
    const tools = el('div', { class:'alaska-chatbot__tools' });
    const attachBtn = el('button', { class:'alaska-chatbot__attach', type:'button', 'aria-label':'Adjuntar archivo (futuro)', title:'Adjuntar (no implementado aún)' }, [document.createTextNode('📎')]);
    // Hidden input placeholder para futuras extensiones de adjuntos
    const hiddenInput = el('input', { type:'file', style:'display:none' });
    attachBtn.addEventListener('click', ()=>{ /* Futuro: hiddenInput.click(); */ showToast('Función de adjuntar próximamente'); });
    tools.append(attachBtn);

    const inputWrap = el('div', { class:'alaska-chatbot__input-wrap' });
    const textarea = el('textarea', { class:'alaska-chatbot__textarea', placeholder:'Escribe tu pregunta... (Enter para enviar, Shift+Enter salto de línea)', rows:'1', 'aria-label':'Escribe tu mensaje' });
    const sendBtn = el('button', { class:'alaska-chatbot__send', type:'button', 'aria-label':'Enviar mensaje' }, [
      el('span', { text:'Enviar' })
    ]);
    inputWrap.append(textarea, sendBtn);
    const status = el('div', { class:'alaska-chatbot__status' }, [el('span', { text:'Listo para ayudar' })]);
    footer.append(tools, inputWrap, status);

    panel.append(header, body, suggestions, footer);
    root.append(openBtn, panel);

    /* ----------------------- Estado & Helpers ------------------ */
    let typingEl = null;
    let lastFocusedElement = null;

    function scrollToBottom(){ body.scrollTop = body.scrollHeight; }
    function setStatus(msg){ status.firstChild.textContent = msg; }
    function setSending(state){ if(state){ sendBtn.setAttribute('disabled','true'); setStatus('Generando respuesta...'); } else { sendBtn.removeAttribute('disabled'); setStatus('Listo para ayudar'); } }

    function addMessage(text, role){
      const row = el('div', { class:'alaska-chatbot__row ' + (role==='user'?'alaska-chatbot__row--user':'') });
      const msg = el('div', { class:'alaska-chatbot__msg alaska-chatbot__msg--'+role, tabIndex: role==='bot'? '0': undefined });
      msg.textContent = text;
      msg.appendChild(el('span', { class:'alaska-chatbot__time', text: nowTime() }));
      row.appendChild(msg);
      body.appendChild(row);
      messages.push({ role, text, ts: Date.now() });
      saveSession();
      if(role==='bot') live.textContent = 'Asistente: '+ text.slice(0,140); // lector de pantalla
      scrollToBottom();
    }

    function showTyping(show){
      if(show && !typingEl){
        typingEl = el('div', { class:'alaska-chatbot__row' }, [
          el('div', { class:'alaska-chatbot__typing-dots', 'aria-label':'El asistente está escribiendo' }, [
            el('span', { class:'alaska-dot' }), el('span', { class:'alaska-dot' }), el('span', { class:'alaska-dot' })
          ])
        ]);
        body.appendChild(typingEl); scrollToBottom();
      } else if(!show && typingEl){ typingEl.remove(); typingEl=null; }
    }

    function showToast(text){
      let toast = panel.querySelector('.alaska-chatbot__toast');
      if(!toast){ toast = el('div', { class:'alaska-chatbot__toast' }); panel.appendChild(toast); }
      toast.textContent = text; toast.setAttribute('data-show','true');
      setTimeout(()=>{ toast.removeAttribute('data-show'); }, 2600);
    }

    function resizeTextarea(){ textarea.style.height='auto'; textarea.style.height = Math.min(textarea.scrollHeight, 140)+'px'; }
    textarea.addEventListener('input', resizeTextarea);

    function restoreConversation(){
      const restored = restoreSession();
      if(restored.length){
        restored.forEach(m=> addMessage(m.text, m.role));
      } else {
        addMessage('Hola, soy tu asistente de bienestar animal. Pregunta sobre: alimentación, vacunas, higiene, comportamiento, ética, conservación o primeros auxilios. Ej: "Calendario vacunas perro"', 'bot');
      }
    }

    function populateSuggestions(){
      suggestions.innerHTML='';
      const chips = [
        'Calendario vacunas perro','Alimentación gato adulto','Ansiedad por separación','Primeros auxilios herida','Parásitos externos control'
      ];
      chips.forEach(c=>{
        const chip = el('button', { class:'alaska-chip', type:'button', role:'listitem', 'aria-label':'Insertar sugerencia '+c }, [document.createTextNode(c)]);
        chip.addEventListener('click', ()=>{ textarea.value = c; resizeTextarea(); textarea.focus(); });
        suggestions.appendChild(chip);
      });
    }

    /* ----------------------- Networking ------------------------ */
    async function sendMessage(){
      if(isRequestPending) return; // evita solapes
      const val = textarea.value.trim();
      if(!val) return;
      addMessage(val, 'user');
      textarea.value=''; resizeTextarea();
      isRequestPending = true; setSending(true); showTyping(true);
      let controller = new AbortController();
      const timer = setTimeout(()=> controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const resp = await fetch(ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question: val }), signal: controller.signal });
        clearTimeout(timer);
        if(resp.status === 429){
            const data = await resp.json().catch(()=>({ error:'Demasiadas peticiones. Intenta luego.' }));
            addMessage(data.error || 'Rate limit excedido. Espera un momento.', 'bot');
        } else if(resp.ok){
            const data = await resp.json();
            let answer = data.answer || 'No se obtuvo respuesta.';
            if(data.category) answer += `\n(Categoría: ${data.category})`;
            if(data.disclaimer) answer += `\n${data.disclaimer}`;
            if(typeof data.rate_limit_remaining==='number') answer += `\nQuedan ${data.rate_limit_remaining} consultas.`;
            addMessage(answer, 'bot');
        } else {
            addMessage('No se pudo procesar tu solicitud. Código: '+resp.status, 'bot');
        }
      } catch(err){
        if(err.name === 'AbortError') addMessage('Tiempo de espera excedido. Intenta de nuevo.', 'bot');
        else addMessage('Error de red. Verifica tu conexión.', 'bot');
      } finally {
        isRequestPending = false; setSending(false); showTyping(false);
      }
    }

    /* ----------------------- Eventos UI ------------------------ */
    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', e=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
    });
    clearBtn.addEventListener('click', ()=>{
      body.innerHTML=''; messages=[]; saveSession(); restoreConversation(); populateSuggestions(); showToast('Conversación reiniciada');
    });
    expandBtn.addEventListener('click', ()=>{
      const expanded = panel.getAttribute('data-expanded')==='true';
      if(expanded){ panel.removeAttribute('data-expanded'); expandBtn.removeAttribute('data-active'); }
      else { panel.setAttribute('data-expanded','true'); expandBtn.setAttribute('data-active','true'); }
    });
    minimizeBtn.addEventListener('click', ()=>{ closePanel(); });
    closeBtn.addEventListener('click', ()=>{ closePanel(true); });
    document.addEventListener('keydown', e=>{
      if(e.key==='Escape' && panel.getAttribute('data-open')==='true'){ closePanel(); }
    });

    openBtn.addEventListener('click', ()=>{
      if(panel.getAttribute('data-open')==='true') { closePanel(); return; }
      openPanel();
    });

    function openPanel(){
      lastFocusedElement = document.activeElement;
      panel.setAttribute('data-open','true');
      panel.style.display='flex';
      // Delay focus to allow animation to start and avoid scroll jump
      setTimeout(()=> textarea.focus(), 80);
      restoreIfFirst();
    }
    function closePanel(restoreFocus){
      panel.removeAttribute('data-open');
      panel.style.display='none';
      if(restoreFocus && lastFocusedElement) lastFocusedElement.focus();
    }

    function restoreIfFirst(){ if(!messages.length){ restoreConversation(); populateSuggestions(); } }
    restoreIfFirst(); // If reopened in same tab with stored messages loaded later
    populateSuggestions();

    // Focus trap simple
    panel.addEventListener('keydown', e=>{
      if(e.key==='Tab'){
        const focusables = panel.querySelectorAll('button,textarea,[tabindex]:not([tabindex="-1"])');
        if(!focusables.length) return;
        const list = Array.from(focusables).filter(f=>!f.disabled && f.offsetParent!==null);
        const first = list[0]; const last = list[list.length-1];
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    });

    // Insert root
    document.body.appendChild(root);
  }

  /* ----------------------- Inicio ----------------------------- */
  document.addEventListener('DOMContentLoaded', createWidget);
})();
