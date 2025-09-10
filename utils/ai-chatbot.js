(function() {
  /**
   * =============================================================
   * Chatbot Alaska – Widget de asistencia sobre cuidado de mascotas
   * =============================================================
   * PROPOSITO
   *   Orientar al usuario en temas generales (higiene, alimentación, bienestar
   *   y comportamiento). No reemplaza consejos ni diagnósticos veterinarios.
   *
   * CAPAS
   *   1. Inyección de estilos (scoped con prefijo .ai-chatbot-*)
   *   2. Utilidades DOM + sistema de iconos SVG inline
   *   3. Filtro semántico (bloquea consultas médicas directas)
   *   4. Construcción del widget (estructura, ARIA, eventos)
   *   5. Render de mensajes + indicador de escritura
   *   6. Comunicación fetch -> api/chat.php (backend PHP + OpenAI)
   *   7. Chips de sugerencias rápidas
   *   8. Inicialización resiliente (carga tardía del script)
   *
   * CONTRATO BACKEND (api/chat.php)
   *   Request : { question: string }
   *   Response: { answer: string }
   *   Error   : HTTP != 200 -> mensaje genérico seguro
   *
   * ACCESIBILIDAD
   *   - role="region" y aria-label en contenedor raíz
   *   - role="dialog" + aria-modal en el panel
   *   - Iconos con aria-hidden y texto alternativo oculto (.ai-sr-only)
   *
   * TEMATIZACIÓN
   *   Usa variables globales del sitio (--color-primario, --color-secundario…)
   *   para adaptarse automáticamente a modo claro/oscuro existente.
   *
   * EXTENSION FUTURA (ideas)
   *   - Historial persistente (localStorage / backend)
   *   - Streaming de tokens (SSE / incremental)
   *   - Métricas / analítica de uso
   *   - Internacionalización (diccionario i18n)
   *
   * LIMITACIONES
   *   - Filtro médico: RegExp simple (puede requerir refinamiento contextual)
   *   - No guarda contexto de turnos; el backend decide truncado del historial
   *
   * Última actualización documental: 2025-09-10
   * =============================================================
   */
  // =============================================================
  // 1. ESTILOS
  // =============================================================
  const css = `
  /* Chatbot – versión simplificada (revert design) conservando iconos y botón naranja */
  :root {
    --ak-font: var(--font-base,'Poppins','Montserrat',Arial,sans-serif);
    --ak-orange: var(--color-secundario,#ff7043);
    --ak-orange-dark: #e65922;
    --ak-green: var(--color-primario,#5b8c5a);
    --ak-green-dark: var(--color-primario-oscuro,#3a6b39);
    --ak-bg: var(--fondo-claro,#ffffff);
    --ak-border: var(--color-borde,#e0e0e0);
    --ak-text: var(--color-texto,#333333);
    --ak-muted: var(--color-texto-claro,#666666);
    --ak-panel: #ffffff;
    --ak-panel-dark: #22272b;
  }
  @media (prefers-color-scheme: dark){
    :root { --ak-bg:#181c1e; --ak-panel:#202528; --ak-border:#32383c; --ak-text:#e2e5e7; --ak-muted:#9aa3a9; }
  }
  .ai-chatbot-animal { position:fixed; right:20px; bottom:20px; z-index:9999; font-family:var(--ak-font); }
  /* Botón flotante circular naranja */
  .ai-chatbot-btn { width:56px; height:56px; border-radius:50%; border:none; cursor:pointer; background:var(--ak-orange); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px -3px rgba(0,0,0,.35); transition:background .25s, transform .25s, box-shadow .25s; }
  .ai-chatbot-btn:hover { background:var(--ak-orange-dark); transform:translateY(-3px); box-shadow:0 8px 18px -6px rgba(0,0,0,.45); }
  .ai-chatbot-btn:active { transform:translateY(-1px); }
  .ai-chatbot-btn .ai-ic { width:26px; height:26px; }
  /* Panel */
  .ai-chatbot-panel { position:fixed; right:20px; bottom:86px; width:360px; max-width:calc(100vw - 32px); max-height:70vh; display:none; background:rgba(255,255,255,0.9); backdrop-filter:blur(14px) saturate(1.15); -webkit-backdrop-filter:blur(14px) saturate(1.15); border:1px solid rgba(0,0,0,.07); border-radius:20px; box-shadow:0 10px 32px -10px rgba(0,0,0,.4), 0 4px 14px -6px rgba(0,0,0,.25); overflow:hidden; }
  @media (prefers-color-scheme: dark){ .ai-chatbot-panel { background:rgba(32,37,40,0.9); border:1px solid rgba(255,255,255,.06); } }
  /* Header simplificado */
  .ai-chatbot-header { background:linear-gradient(135deg,var(--ak-green) 0%, var(--ak-green-dark) 100%); color:#fff; padding:.7rem .95rem; display:flex; align-items:center; justify-content:space-between; box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); }
  .ai-chatbot-title { display:flex; align-items:center; gap:.55rem; font-size:.9rem; font-weight:600; }
  .ai-chatbot-avatar { width:32px; height:32px; border-radius:10px; background:linear-gradient(135deg,var(--ak-orange),var(--ak-green)); display:flex; align-items:center; justify-content:center; color:#fff; }
  .ai-chatbot-actions { display:flex; gap:.4rem; }
  .ai-chatbot-iconbtn { width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.4); background:rgba(255,255,255,.18); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .25s,color .25s; }
  .ai-chatbot-iconbtn:hover { background:#fff; color:var(--ak-green-dark); }
  /* Cuerpo mensajes */
  .ai-chatbot-body { padding:.95rem .95rem .85rem; height:260px; overflow:auto; display:flex; flex-direction:column; gap:.75rem; scrollbar-width:thin; scrollbar-color:var(--ak-orange) transparent; }
  .ai-chatbot-body::-webkit-scrollbar { width:8px; }
  .ai-chatbot-body::-webkit-scrollbar-thumb { background:var(--ak-orange); border-radius:4px; }
  .ai-chatbot-row { display:flex; gap:.55rem; }
  .ai-chatbot-row-user { justify-content:flex-end; }
  .ai-chatbot-msg { max-width:78%; padding:.7rem .85rem .65rem; font-size:.85rem; line-height:1.4; background:linear-gradient(180deg,#fdfdfd 0%,#f3f3f3 100%); color:var(--ak-text); border:1px solid #e5e5e5; border-radius:16px; position:relative; box-shadow:0 2px 4px -2px rgba(0,0,0,.15); }
  @media (prefers-color-scheme: dark){ .ai-chatbot-msg { background:linear-gradient(180deg,#2d3437 0%,#262c2f 100%); border-color:#40484c; } }
  .ai-chatbot-msg-user { background:linear-gradient(135deg,var(--ak-orange) 0%, var(--ak-orange-dark) 100%); border-color:var(--ak-orange-dark); color:#fff; box-shadow:0 4px 12px -4px rgba(255,112,67,.55); }
  .ai-chatbot-msg-bot .ai-chatbot-info { display:block; font-size:.6rem; margin-top:.4rem; color:var(--ak-orange); font-weight:600; letter-spacing:.4px; }
  .ai-chatbot-time { display:block; margin-top:.3rem; font-size:.55rem; opacity:.6; letter-spacing:.4px; text-transform:uppercase; }
  /* Indicador escribiendo */
  .ai-chatbot-typing { display:inline-flex; gap:5px; background:linear-gradient(180deg,#f5f5f5 0%,#ececec 100%); border:1px solid #dedede; padding:.45rem .6rem; border-radius:14px; }
  @media (prefers-color-scheme: dark){ .ai-chatbot-typing { background:#2d3437; border-color:#40484c; } }
  .ai-dot { width:6px; height:6px; background:var(--ak-orange); border-radius:50%; animation:dotBounce 1.1s infinite; }
  .ai-dot:nth-child(2){animation-delay:.18s;} .ai-dot:nth-child(3){animation-delay:.36s;}
  @keyframes dotBounce { 0%,80%,100%{opacity:.4; transform:translateY(0);} 40%{opacity:1; transform:translateY(-5px);} }
  /* Sugerencias */
  .ai-chatbot-suggestions { display:flex; flex-wrap:wrap; gap:.5rem; padding:0 .95rem .4rem; }
  .ai-chatbot-chip { background:#ffffff; border:1px solid var(--ak-border); color:var(--ak-muted); padding:.4rem .85rem; font-size:.63rem; border-radius:999px; cursor:pointer; transition:background .25s,color .25s,border-color .25s, box-shadow .25s; letter-spacing:.4px; }
  .ai-chatbot-chip:hover { background:var(--ak-orange); color:#fff; border-color:var(--ak-orange); box-shadow:0 4px 10px -4px rgba(255,112,67,.55); }
  @media (prefers-color-scheme: dark){ .ai-chatbot-chip { background:#262d30; } }
  /* Input */
  .ai-chatbot-input { display:flex; gap:.65rem; padding:.75rem .9rem .85rem; border-top:1px solid var(--ak-border); background:linear-gradient(180deg,rgba(255,255,255,.85) 0%,rgba(255,255,255,.65) 100%); backdrop-filter:blur(10px); }
  .ai-chatbot-input input { flex:1; padding:.6rem .75rem; border:1px solid var(--ak-border); border-radius:14px; font-size:.82rem; background:#fff; color:#111; outline:none; transition:border-color .25s, box-shadow .25s, background .25s; }
  .ai-chatbot-input input::placeholder { color:#666; opacity:.9; }
  .ai-chatbot-input input:focus { border-color:var(--ak-orange); box-shadow:0 0 0 2px rgba(255,112,67,.35); background:#fff; }
  @media (prefers-color-scheme: dark){ .ai-chatbot-input { background:linear-gradient(180deg,rgba(32,37,40,.9) 0%,rgba(32,37,40,.7) 100%); } .ai-chatbot-input input { background:#2d3437; border-color:#40484c; color:#f1f3f4; } .ai-chatbot-input input::placeholder { color:#98a2a7; } }
  .ai-chatbot-send { background:linear-gradient(135deg,var(--ak-orange) 0%, var(--ak-orange-dark) 100%); color:#fff; border:none; border-radius:14px; padding:.65rem 1rem; font-size:.7rem; font-weight:600; letter-spacing:.6px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background .25s, transform .25s, box-shadow .25s; box-shadow:0 6px 18px -8px rgba(255,112,67,.55); text-transform:uppercase; }
  .ai-chatbot-send:hover { background:linear-gradient(135deg,var(--ak-orange-dark) 0%, var(--ak-orange) 100%); transform:translateY(-2px); box-shadow:0 10px 26px -10px rgba(255,112,67,.6); }
  .ai-chatbot-send:active { transform:translateY(0); }
  .ai-chatbot-send .ai-ic { width:16px; height:16px; }
  /* Icon wrapper */
  .ai-ic { display:inline-block; width:20px; height:20px; line-height:0; }
  .ai-ic svg { width:100%; height:100%; display:block; }
  .ai-chatbot-info .ai-ic { width:13px; height:13px; margin-right:3px; vertical-align:middle; }
  .ai-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
  /* Responsive avanzado */
  @media (max-width:600px){
    .ai-chatbot-panel { right:10px; bottom:84px; width:calc(100vw - 20px); max-height:70vh; }
    .ai-chatbot-body { height:220px; }
  }
  @media (max-width:480px){
    .ai-chatbot-panel { left:0; right:0; bottom:0; width:100%; max-height:65vh; border-radius:20px 20px 0 0; box-shadow:0 -2px 18px -4px rgba(0,0,0,.4); }
    .ai-chatbot-body { height:calc(65vh - 150px); }
    .ai-chatbot-animal { right:14px; bottom:14px; }
  }
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce){
    .ai-chatbot-btn, .ai-chatbot-send, .ai-chatbot-chip { transition:none; }
    .ai-dot { animation:none; }
  }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // =============================================================
  // 2. UTILIDADES DOM + ICONOS + TIEMPO
  // =============================================================
  /**
   * Crea un elemento DOM de forma declarativa.
   * Atributos especiales:
   *   - class: asigna className
   *   - text : asigna textContent
   * Resto de atributos se aplican vía setAttribute para soportar aria-*.
   */
  function el(tag, attrs={}, children=[]) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{ if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else e.setAttribute(k,v); });
    children.forEach(c=>e.appendChild(c));
    return e;
  }
  /** Hora actual en formato HH:MM (local) */
  const nowTime = ()=> new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  /**
   * Sistema simple de iconos SVG inline.
   * Ventajas: sin dependencias externas, escalable, hereda color (currentColor).
   * Cada icono se encapsula en un span.ai-ic con aria-hidden.
   */
  function createIcon(name){
    const icons = {
      chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>',
      minimize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/></svg>',
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M3 22a9 9 0 0 1 18 0"/></svg>',
      bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M12 7V3"/><path d="M8 3h8"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
    };
    const span = document.createElement('span');
    span.className = 'ai-ic';
    span.innerHTML = icons[name] || '';
    span.setAttribute('aria-hidden','true');
    return span;
  }
  // =============================================================
  // 3. FILTRO SEMÁNTICO (bloqueo de consultas médicas específicas)
  // =============================================================
  /** Retorna true si la pregunta contiene términos que implican diagnóstico/tratamiento. */
  function isMedical(q) {
    const rx = /(medic|tratam|cirug|recet|pastilla|inyecci|urgenc|hospital|veterinari[oa]|enfermedad|síntoma|sintoma|fármaco|farmaco|remedio|cura|diagnóstic|diagnostic|prescrip|anestesi|antibiótic|antibiotic|analgésic|analgesic|antiinflamatorio|antiinflamatorio|vacuna|desparasit|parásito|parasito|pulga|garrapata|vomito|diarrea|sangrado|fractura|convulsion|convulsión|herida|dolor|malestar|urgente|urgencia|emergencia|hospital|clínica|clinica|consulta)/i;
    return rx.test(q);
  }

  // =============================================================
  // 4. CONSTRUCCIÓN DEL WIDGET
  // =============================================================
  function createWidget() {
    const root = el('div', { class: 'ai-chatbot-animal', role:'region', 'aria-label':'Chatbot de cuidado de mascotas' });
  const btn = el('button', { class:'ai-chatbot-btn', title:'Abrir chat', 'aria-label':'Abrir chat' }, [createIcon('chat'), el('span',{class:'ai-sr-only', text:'Chat'})]);
    const panel = el('div', { class:'ai-chatbot-panel', role:'dialog', 'aria-modal':'true' });
    const header = el('div', { class:'ai-chatbot-header' }, [
      el('div', { class:'ai-chatbot-title' }, [
  el('div', { class:'ai-chatbot-avatar', title:'Bot' }, [createIcon('bot')]),
  el('span', { text:'Asistente Alaska' })
      ]),
      el('div', { class:'ai-chatbot-actions' }, [
        el('button', { class:'ai-chatbot-iconbtn', title:'Minimizar', 'aria-label':'Minimizar' }, [createIcon('minimize')]),
        el('button', { class:'ai-chatbot-iconbtn', title:'Cerrar', 'aria-label':'Cerrar' }, [createIcon('close')])
      ])
    ]);
    const body = el('div', { class:'ai-chatbot-body' });
    const suggestions = el('div', { class:'ai-chatbot-suggestions' });
    const inputWrap = el('div', { class:'ai-chatbot-input' });
    const input = el('input', { type:'text', placeholder:'Escribe aquí tu pregunta sobre el cuidado de tu mascota…' });
    const send = el('button', { class:'ai-chatbot-send', type:'button', title:'Enviar', 'aria-label':'Enviar' }, [
      createIcon('send'),
      el('span', { class:'ai-send-label', text:'Enviar' })
    ]);
    inputWrap.append(input, send);
    panel.append(header, body, suggestions, inputWrap);
    root.append(btn, panel);

  // -------------------------------------------------------------
  // 4.1 Render de mensajes (content + avatar + timestamp + disclaimer)
  // -------------------------------------------------------------
  /**
   * addMsg
   * @param {string} text  Texto del mensaje
   * @param {'user'|'bot'} who  Emisor
   * @param {'user'|'bot'|'chat'} avatar  Tipo de icono a mostrar
   */
    function addMsg(text, who, avatar) {
      const row = el('div', { class:'ai-chatbot-row ' + (who==='user' ? 'ai-chatbot-row-user' : '') });
      const m = el('div', { class: 'ai-chatbot-msg ai-chatbot-msg-' + who });
      if(who==='bot') {
        const textSpan = el('span');
        textSpan.textContent = text;
        const info = el('span', { class:'ai-chatbot-info' });
        info.appendChild(createIcon('warning'));
        info.appendChild(document.createTextNode(' Recuerda: No damos diagnósticos ni consejos médicos. Ante cualquier duda o síntoma, acude a un veterinario certificado.'));
        m.append(textSpan, info);
      } else {
        m.textContent = text;
      }
      const t = el('span', { class:'ai-chatbot-time', text: nowTime() });
      if (avatar) {
        const av = el('span', {class:'ai-chatbot-avatar'});
        if(avatar === 'bot') av.appendChild(createIcon('bot'));
        else if(avatar === 'user') av.appendChild(createIcon('user'));
        else av.appendChild(createIcon('chat'));
        m.prepend(av);
      }
      m.appendChild(t);
      row.appendChild(m);
      body.appendChild(row);
      body.scrollTop = body.scrollHeight;
    }

  // -------------------------------------------------------------
  // 4.2 Indicador de "escribiendo" (simulación de latencia IA)
  // -------------------------------------------------------------
    let typingEl = null;
    function showTyping(show){
      if(show){
        typingEl = el('div', { class:'ai-chatbot-row' }, [
          el('div', { class:'ai-chatbot-msg ai-chatbot-msg-bot' }, [
            el('span', { class:'ai-chatbot-typing' }, [
              el('span', { class:'ai-dot' }), el('span', { class:'ai-dot' }), el('span', { class:'ai-dot' })
            ])
          ])
        ]);
        body.appendChild(typingEl); body.scrollTop = body.scrollHeight;
      } else if(typingEl){
        typingEl.remove(); typingEl = null;
      }
    }

  // -------------------------------------------------------------
  // 4.3 Apertura / cierre del panel flotante
  // -------------------------------------------------------------
    function open(){ panel.style.display = 'block'; input.focus(); }
    function close(){ panel.style.display = 'none'; }
    btn.addEventListener('click', ()=>{ panel.style.display === 'block' ? close() : open(); });
    header.querySelectorAll('.ai-chatbot-iconbtn')[0].addEventListener('click', close);
    header.querySelectorAll('.ai-chatbot-iconbtn')[1].addEventListener('click', close);

  // -------------------------------------------------------------
  // 4.4 Envío de mensaje (validación + filtro + fetch backend)
  // -------------------------------------------------------------
  /**
   * handleSend: gestiona todo el ciclo de envío y respuesta.
   * Errores controlados -> mensaje genérico para no exponer detalles.
   */
    async function handleSend(){
      const q = input.value.trim(); if(!q) return;
  addMsg(q, 'user', 'user'); input.value = '';
      showTyping(true);

  // Filtro médico previo
      if(isMedical(q)){
        setTimeout(()=>{
          showTyping(false);
          addMsg('No puedo dar consejos médicos. Consulta un veterinario certificado.', 'bot', 'bot');
        }, 700);
        return;
      }

  // Llamada al backend (PHP -> OpenAI)
      try {
  const resp = await fetch('api/chat.php', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ question: q })
        });
        if (resp && resp.ok) {
          const data = await resp.json();
          showTyping(false);
          addMsg(data.answer, 'bot', 'bot');
        } else {
          showTyping(false);
          addMsg('Error de conexión con el asistente. Intenta más tarde.', 'bot', 'bot');
        }
      } catch(e) {
        showTyping(false);
  addMsg('No se obtuvo respuesta. Revisa tu conexión.', 'bot', 'bot');
      }
    }
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); handleSend(); }});

  // -------------------------------------------------------------
  // 4.5 Chips de sugerencias (prompts predefinidos)
  // -------------------------------------------------------------
    const chips = [
      'Cómo bañar a mi perro',
      'Mejores juguetes para gatos',
      'Alimentación adecuada para un cachorro',
      '¿Cómo socializar a mi mascota?',
      '¿Cuántas veces debo sacar a pasear a mi perro?'
    ];
    chips.forEach(c=>{
      const chip = el('button', { class:'ai-chatbot-chip', type:'button' }, [el('span', {text:c})]);
      chip.addEventListener('click', ()=>{ input.value = c; input.focus(); });
      suggestions.appendChild(chip);
    });

  // -------------------------------------------------------------
  // 4.6 Mensaje inicial de contexto
  // -------------------------------------------------------------
  addMsg('Hola, soy Alaska (versión simplificada). Pregunta sobre cuidado general, alimentación, higiene, comportamiento y bienestar. No proporciono diagnósticos médicos.', 'bot', 'bot');

    document.body.appendChild(root);
  }

  // =============================================================
  // 5. INICIALIZACIÓN RESILIENTE (soporta carga tardía del script)
  // =============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
