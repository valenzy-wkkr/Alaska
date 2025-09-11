(function(){
  // Styles: modern, compact, accessible
  const css = `
  .alaska-chatbot{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:var(--fuente-base, 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial)}
  .alaska-chatbot__btn{background:#2E86AB;color:#fff;border:none;border-radius:50%;width:56px;height:56px;box-shadow:0 8px 24px rgba(0,0,0,.22);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s ease, box-shadow .15s ease}
  .alaska-chatbot__btn:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(0,0,0,.28)}
  .alaska-chatbot__panel{position:fixed;right:16px;bottom:84px;width:360px;max-height:70vh;background:#fff;border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.25);display:none;overflow:hidden;border:1px solid #e8eef4}
  .alaska-chatbot__header{background:linear-gradient(135deg,#2E86AB,#1e6d8d);color:#fff;padding:.7rem .85rem;font-weight:600;display:flex;gap:.5rem;justify-content:space-between;align-items:center}
  .alaska-chatbot__title{display:flex;align-items:center;gap:.5rem}
  .alaska-chatbot__avatar{width:28px;height:28px;border-radius:50%;background:#fff3;display:inline-flex;align-items:center;justify-content:center}
  .alaska-chatbot__actions{display:flex;gap:.25rem}
  .alaska-chatbot__iconbtn{background:transparent;border:none;color:#fff;opacity:.9;font-size:18px;cursor:pointer}
  .alaska-chatbot__body{padding:.75rem;height:360px;overflow:auto;display:flex;flex-direction:column;gap:.6rem;background:linear-gradient(180deg,#f8fbfe,#fbfcfe)}
  .alaska-chatbot__suggestions{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.25rem}
  .alaska-chip{background:#e8f3f9;color:#0e5571;border:1px solid #d3e6f1;border-radius:999px;padding:.25rem .6rem;font-size:.85rem;cursor:pointer}
  .alaska-chatbot__row{display:flex;gap:.5rem}
  .alaska-chatbot__row--user{justify-content:flex-end}
  .alaska-chatbot__msg{padding:.5rem .65rem;border-radius:12px;max-width:85%;position:relative;line-height:1.35}
  .alaska-chatbot__msg--user{background:#dff1fc;color:#0d4056}
  .alaska-chatbot__msg--bot{background:#f1f5f9;color:#0b2233;border:1px solid #e6ecf2}
  .alaska-chatbot__time{display:block;margin-top:.25rem;font-size:.72rem;color:#6b7a88;opacity:.9}
  .alaska-chatbot__typing{display:inline-flex;gap:4px;align-items:center}
  .alaska-dot{width:6px;height:6px;border-radius:50%;background:#8aa9b9;opacity:.7;animation:alaska-bounce 1.2s infinite}
  .alaska-dot:nth-child(2){animation-delay:.15s}
  .alaska-dot:nth-child(3){animation-delay:.3s}
  @keyframes alaska-bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-3px);opacity:1}}
  .alaska-chatbot__input{display:flex;gap:.45rem;padding:.6rem;border-top:1px solid #e3e6ea;background:#fff}
  .alaska-chatbot__input input{flex:1;padding:.55rem;border:1px solid #d4d9df;border-radius:10px;font-size:.95rem}
  .alaska-chatbot__send{background:#2E86AB;color:#fff;border:none;border-radius:10px;padding:.55rem .8rem;font-weight:600;cursor:pointer}

  @media (max-width: 480px){
    .alaska-chatbot__panel{width:calc(100vw - 32px);max-height:70vh}
  }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // Utilities
  function el(tag, attrs={}, children=[]) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{ if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else e.setAttribute(k,v); });
    children.forEach(c=>e.appendChild(c));
    return e;
  }
  const nowTime = ()=> new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

  // Minimal rule-based "AI" constrained to animal care
  const ANIMAL_KEYWORDS = ['perro','gato','mascota','animal','conejo','hurón','ave','pez','hamster','veterin','vacuna','parásito','antipulgas','antiparasitario','aliment','comida','pienso','lata','entren','adiestra','higiene','baño','uñas','pelo','ansiedad','conducta','comport','garrapata','pulga','desparas','esteriliz','celo','cachorro','kitten','senior','dolor','diarrea','vómito','herida'];
  const HARMFUL_PATTERNS = [
    /matar|lastimar|herir|golpear|pegar|maltratar|abandonar|envenen|veneno|ahogar|asfixiar|electrocutar|castigo\s*f[ií]sico|tortura/i,
    /hacer\s*daño|dañarlo|dañar\s*al\s*animal|estropear\s*al\s*animal/i,
    /dopar|sedar\s*en\s*casa|droga/i,
  ];
  const EMERGENCY_PATTERNS = [/convulsi[óo]n|no\s*respira|sangrado\s*abundante|fractura|veneno|envenen/i];

  const KB = [
    { k:['vacuna','perro','calendario'], r: () => (
      'Calendario orientativo para perros: 6-8 semanas (moquillo/parvo), 10-12 (refuerzo), 14-16 (refuerzo + rabia según zona), anual (refuerzos). Consulta siempre a tu veterinario para ajustar por edad, historial y región.'
    )},
    { k:['vacuna','gato'], r: () => (
      'Vacunas básicas en gatos: trivalente (panleucopenia, calicivirus, herpesvirus) y rabia donde sea obligatoria. Esquema inicial en gatitos y refuerzos anuales o bianuales según riesgo.'
    )},
    { k:['aliment','perro'], r: () => (
      'Alimentación de perros: 2-3 tomas/día. Elegir alimento completo según etapa (cachorro, adulto, senior). Transiciones de pienso en 5-7 días. Agua fresca siempre. Ajusta ración por peso y actividad.'
    )},
    { k:['aliment','gato'], r: () => (
      'Gatos: preferir alimento completo (seco/húmedo) con proteína de calidad. Fomentar hidratación con fuentes/latitas. Evitar cebolla, ajo, chocolate, uvas, alcohol y huesos cocidos.'
    )},
    { k:['pulga','garrapata','parásito','antipulgas','desparas'], r: () => (
      'Control de parásitos: usar antiparasitarios externos (pipetas, collares, comprimidos) y desparasitación interna periódica. Frecuencia según producto y zona. Revisa etiqueta y consulta a tu vet.'
    )},
    { k:['entren','adiestra','ansiedad','comport'], r: () => (
      'Comportamiento: refuerzo positivo, sesiones cortas y constantes, enriquecimiento ambiental. Evita castigos físicos. Para ansiedad por separación, trabaja salidas graduales y estímulos mentales.'
    )},
    { k:['baño','higiene','uñas','pelo'], r: () => (
      'Higiene: cepillado según tipo de pelo, baño con champú para mascotas (cada 3-6 semanas aprox), corte de uñas con cuidado de no llegar a la pulpa, limpieza de oídos si hay cerumen.'
    )},
    { k:['diarrea','vómito','vomito','herida','dolor'], r: () => (
      'Síntomas digestivos o heridas: ayuno corto y agua en pequeñas tomas; observa letargo, sangre o dolor. Si persisten >24h o hay empeoramiento, acude a tu veterinario. No administres medicación humana.'
    )},
  ];

  function isAnimalTopic(q){
    const l = q.toLowerCase();
    return ANIMAL_KEYWORDS.some(w => l.includes(w));
  }
  function isHarmful(q){ return HARMFUL_PATTERNS.some(rx => rx.test(q)); }
  function isEmergency(q){ return EMERGENCY_PATTERNS.some(rx => rx.test(q)); }

  function searchKB(q){
    const l = q.toLowerCase();
    // Score by keyword overlap
    let best = {score:0, item:null};
    for(const item of KB){
      const score = item.k.reduce((acc,k)=> acc + (l.includes(k)?1:0), 0);
      if(score > best.score) best = {score, item};
    }
    return best.item ? best.item.r(q) : null;
  }

  function generateAnswer(q){
    if(isHarmful(q)){
      return {
        text: 'No puedo ayudar con acciones que dañen o pongan en riesgo a los animales. Si tienes dificultades con el comportamiento de tu mascota, busca ayuda profesional de un veterinario o etólogo. Estoy aquí para promover el bienestar animal.',
        safe: false
      };
    }
    if(!isAnimalTopic(q)){
      return { text: 'Respondo únicamente preguntas sobre el cuidado responsable de animales (salud, alimentación, higiene, comportamiento, adopción). ¿En qué puedo ayudarte con tu mascota?', safe: true };
    }
    if(isEmergency(q)){
      return { text: 'Esto podría ser una emergencia. Mantén a tu mascota calmada y contacta de inmediato a tu veterinario o un servicio de urgencias. Evita medicación humana sin indicación profesional.', safe: true };
    }
    const kb = searchKB(q);
    if(kb){
      return { text: kb, safe: true };
    }
    // Generic structured guidance
    return {
      text: 'Puedo ayudarte con pautas generales. Para un consejo preciso se requiere evaluación veterinaria. Indícame especie/edad y el tema (p. ej., alimentación, vacunas, higiene, comportamiento) para darte recomendaciones prácticas.',
      safe: true
    };
  }

  function createWidget(){
    const root = el('div', { class: 'alaska-chatbot', role:'region', 'aria-label':'Chatbot de cuidado de mascotas' });
    const btn = el('button', { class:'alaska-chatbot__btn', title:'Asistente Alaska', 'aria-label':'Abrir asistente' }, [document.createTextNode('💬')]);
    const panel = el('div', { class:'alaska-chatbot__panel', role:'dialog', 'aria-modal':'true' });
    const header = el('div', { class:'alaska-chatbot__header' }, [
      el('div', { class:'alaska-chatbot__title' }, [
        el('div', { class:'alaska-chatbot__avatar', title:'Alaska Bot' }, [document.createTextNode('🐾')]),
        el('span', { text:'Asistente Alaska' })
      ]),
      el('div', { class:'alaska-chatbot__actions' }, [
        el('button', { class:'alaska-chatbot__iconbtn', title:'Minimizar', 'aria-label':'Minimizar' }, [document.createTextNode('–')]),
        el('button', { class:'alaska-chatbot__iconbtn', title:'Cerrar', 'aria-label':'Cerrar' }, [document.createTextNode('×')])
      ])
    ]);
    const body = el('div', { class:'alaska-chatbot__body' });
    const suggestions = el('div', { class:'alaska-chatbot__suggestions' });
    const inputWrap = el('div', { class:'alaska-chatbot__input' });
    const input = el('input', { type:'text', placeholder:'Pregunta sobre tu mascota…' });
    const send = el('button', { class:'alaska-chatbot__send', type:'button' }, [document.createTextNode('Enviar')]);
    inputWrap.append(input, send);
    panel.append(header, body, suggestions, inputWrap);
    root.append(btn, panel);

    function addMsg(text, who){
      const row = el('div', { class:'alaska-chatbot__row ' + (who==='user' ? 'alaska-chatbot__row--user' : '') });
      const m = el('div', { class: 'alaska-chatbot__msg alaska-chatbot__msg--' + who });
      m.textContent = text;
      const t = el('span', { class:'alaska-chatbot__time', text: nowTime() });
      m.appendChild(t);
      row.appendChild(m);
      body.appendChild(row);
      body.scrollTop = body.scrollHeight;
    }

    let typingEl = null;
    function showTyping(show){
      if(show){
        typingEl = el('div', { class:'alaska-chatbot__row' }, [
          el('div', { class:'alaska-chatbot__msg alaska-chatbot__msg--bot' }, [
            el('span', { class:'alaska-chatbot__typing' }, [
              el('span', { class:'alaska-dot' }), el('span', { class:'alaska-dot' }), el('span', { class:'alaska-dot' })
            ])
          ])
        ]);
        body.appendChild(typingEl); body.scrollTop = body.scrollHeight;
      } else if(typingEl){
        typingEl.remove(); typingEl = null;
      }
    }

    function open(){ panel.style.display = 'block'; input.focus(); }
    function close(){ panel.style.display = 'none'; }
    btn.addEventListener('click', ()=>{ panel.style.display === 'block' ? close() : open(); });
    header.querySelectorAll('.alaska-chatbot__iconbtn')[0].addEventListener('click', close);
    header.querySelectorAll('.alaska-chatbot__iconbtn')[1].addEventListener('click', close);

    async function handleSend(){
      const q = input.value.trim(); if(!q) return;
      addMsg(q, 'user'); input.value = '';
      showTyping(true);
      try {
        // Intentar usar backend si existe
        const ctrl = new AbortController();
        const t = setTimeout(()=> ctrl.abort(), 3500);
        const resp = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question: q }), signal: ctrl.signal });
        clearTimeout(t);
        if (resp && resp.ok) {
          const data = await resp.json();
          if (data && data.answer) {
            showTyping(false);
            addMsg(data.answer, 'bot');
            return;
          }
        }
      } catch(_) { /* ignorar */ }
      // Fallback local
      setTimeout(()=>{
        const {text} = generateAnswer(q);
        showTyping(false);
        addMsg(text, 'bot');
      }, 300);
    }
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); handleSend(); }});

    // Welcome + suggestion chips
    addMsg('Hola, soy tu asistente de cuidado animal. Respondo sobre alimentación, salud, higiene, comportamiento y vacunas. ¿En qué te ayudo hoy?', 'bot');
    const chips = [
      'Calendario de vacunas para perros',
      '¿Qué puede comer un gato?',
      'Cómo tratar pulgas y garrapatas',
      'Mi perro tiene diarrea, ¿qué hago?',
      'Consejos para ansiedad por separación'
    ];
    chips.forEach(c=>{
      const chip = el('button', { class:'alaska-chip', type:'button' }, [document.createTextNode(c)]);
      chip.addEventListener('click', ()=>{ input.value = c; input.focus(); });
      suggestions.appendChild(chip);
    });

    document.body.appendChild(root);
  }

  document.addEventListener('DOMContentLoaded', createWidget);
})();
