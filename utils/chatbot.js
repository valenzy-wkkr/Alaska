(function(){
  // Diseño equilibrado, ordenado y profesional, colores cálidos y tamaños proporcionados
  const css = `
  .alaska-chatbot{position:fixed;right:20px;bottom:20px;z-index:9999;font-family:'Poppins', 'Montserrat', Arial, sans-serif;}
  .alaska-chatbot__btn{background:#ff9800;color:#fff;border:none;border-radius:50%;width:48px;height:48px;box-shadow:0 4px 16px rgba(255,152,0,.15);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s, box-shadow .15s;}
  .alaska-chatbot__btn:hover{transform:scale(1.08);box-shadow:0 8px 24px rgba(255,152,0,.22);}
  .alaska-chatbot__panel{position:fixed;right:20px;bottom:72px;width:320px;max-width:95vw;max-height:70vh;background:#fdf6ee;border-radius:14px;box-shadow:0 8px 32px rgba(67,160,71,.10);display:none;overflow:hidden;border:1.5px solid #43a047;}
  .alaska-chatbot__header{background:linear-gradient(90deg,#ff9800 60%,#43a047 100%);color:#fff;padding:0.7rem 1rem;font-weight:600;display:flex;gap:.5rem;justify-content:space-between;align-items:center;}
  .alaska-chatbot__title{display:flex;align-items:center;gap:.5rem;}
  .alaska-chatbot__avatar{width:28px;height:28px;border-radius:50%;background:#fff3;display:inline-flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 1px 4px rgba(255,152,0,.08);}
  .alaska-chatbot__actions{display:flex;gap:.2rem;}
  .alaska-chatbot__iconbtn{background:transparent;border:none;color:#fff;opacity:.9;font-size:16px;cursor:pointer;}
  .alaska-chatbot__body{padding:0.7rem;height:260px;overflow:auto;display:flex;flex-direction:column;gap:.5rem;background:#fdf6ee;}
  .alaska-chatbot__suggestions{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.2rem;}
  .alaska-chip{background:#43a047;color:#fff;border:none;border-radius:999px;padding:.22rem .7rem;font-size:.85rem;cursor:pointer;box-shadow:0 1px 4px rgba(67,160,71,.06);transition:background .15s;}
  .alaska-chip:hover{background:#388e3c;}
  .alaska-chatbot__row{display:flex;gap:.4rem;}
  .alaska-chatbot__row--user{justify-content:flex-end;}
  .alaska-chatbot__msg{padding:.5rem .7rem;border-radius:10px;max-width:80%;position:relative;line-height:1.4;box-shadow:0 1px 4px rgba(255,152,0,.05);font-size:.95rem;}
  .alaska-chatbot__msg--user{background:#ffe0b2;color:#388e3c;border:1px solid #ffcc80;}
  .alaska-chatbot__msg--bot{background:#fffde7;color:#6d4c41;border:1px solid #ffe0b2;}
  .alaska-chatbot__msg--bot .alaska-chatbot__info{display:block;font-size:.8rem;color:#ff9800;margin-top:.3rem;}
  .alaska-chatbot__time{display:block;margin-top:.15rem;font-size:.7rem;color:#43a047;opacity:.7;}
  .alaska-chatbot__typing{display:inline-flex;gap:3px;align-items:center;}
  .alaska-dot{width:6px;height:6px;border-radius:50%;background:#43a047;opacity:.7;animation:alaska-bounce 1.2s infinite;}
  .alaska-dot:nth-child(2){animation-delay:.15s;}
  .alaska-dot:nth-child(3){animation-delay:.3s;}
  @keyframes alaska-bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-3px);opacity:1}}
  .alaska-chatbot__input{display:flex;gap:.4rem;padding:.5rem;border-top:1px solid #ffcc80;background:#fdf6ee;}
  .alaska-chatbot__input input{flex:1;padding:.5rem;border:1px solid #ffcc80;border-radius:8px;font-size:.95rem;background:#fffde7;}
  .alaska-chatbot__send{background:#ff9800;color:#fff;border:none;border-radius:8px;padding:.5rem .8rem;font-weight:600;cursor:pointer;box-shadow:0 1px 4px rgba(255,152,0,.08);font-size:.95rem;}
  .alaska-chatbot__send:hover{background:#43a047;}

  @media (max-width: 480px){
    .alaska-chatbot__panel{width:calc(100vw - 32px);max-height:60vh;}
    .alaska-chatbot__body{height:160px;}
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
      if(who==='bot') {
        m.innerHTML = `<span>${text}</span><span class="alaska-chatbot__info">⚠️ Recuerda: Esta información es solo orientativa. Ante cualquier duda o síntoma, lo más recomendable es acudir a un veterinario profesional.</span>`;
      } else {
        m.textContent = text;
      }
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
  addMsg('¡Hola! Soy tu asistente Alaska. Te ayudo con información sobre alimentación, salud, higiene, comportamiento y vacunas de mascotas. Recuerda que siempre es mejor consultar a un veterinario profesional ante cualquier duda o síntoma.', 'bot');
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
