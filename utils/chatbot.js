// Nueva versión: sin fallback local. Todo pasa por /api/chat con controles de rate limit.
(function(){
  const css = `
  .alaska-chatbot{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:var(--fuente-base,'Poppins',system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial)}
  .alaska-chatbot__btn{background:#2E86AB;color:#fff;border:none;border-radius:50%;width:56px;height:56px;box-shadow:0 8px 24px rgba(0,0,0,.22);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s ease, box-shadow .15s ease}
  .alaska-chatbot__btn:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(0,0,0,.28)}
  .alaska-chatbot__panel{position:fixed;right:16px;bottom:84px;width:360px;max-height:70vh;background:#fff;border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.25);display:none;overflow:hidden;border:1px solid #e8eef4}
  .alaska-chatbot__header{background:linear-gradient(135deg,#2E86AB,#1e6d8d);color:#fff;padding:.7rem .85rem;font-weight:600;display:flex;gap:.5rem;justify-content:space-between;align-items:center}
  .alaska-chatbot__title{display:flex;flex-direction:column;align-items:flex-start;gap:0}
  .alaska-chatbot__title-row{display:flex;align-items:center;gap:.5rem}
  .alaska-chatbot__subtitle{font-size:.65rem;font-weight:400;opacity:.85;margin-top:2px}
  .alaska-chatbot__avatar{width:28px;height:28px;border-radius:50%;background:#fff3;display:inline-flex;align-items:center;justify-content:center}
  .alaska-chatbot__actions{display:flex;gap:.35rem;align-items:center}
  .alaska-chatbot__clear{background:#ffffff1c;border:1px solid #ffffff40;color:#fff;padding:.35rem .6rem;border-radius:8px;font-size:.65rem;cursor:pointer}
  .alaska-chatbot__iconbtn{background:transparent;border:none;color:#fff;opacity:.9;font-size:18px;cursor:pointer}
  .alaska-chatbot__body{padding:.75rem;height:360px;overflow:auto;display:flex;flex-direction:column;gap:.6rem;background:linear-gradient(180deg,#f8fbfe,#fbfcfe)}
  .alaska-chatbot__suggestions{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 .75rem .25rem .75rem}
  .alaska-chip{background:#e8f3f9;color:#0e5571;border:1px solid #d3e6f1;border-radius:999px;padding:.25rem .6rem;font-size:.72rem;cursor:pointer}
  .alaska-chatbot__row{display:flex;gap:.5rem}
  .alaska-chatbot__row--user{justify-content:flex-end}
  .alaska-chatbot__msg{padding:.55rem .7rem;border-radius:12px;max-width:85%;position:relative;line-height:1.35;white-space:pre-wrap}
  .alaska-chatbot__msg--user{background:#dff1fc;color:#0d4056}
  .alaska-chatbot__msg--bot{background:#f1f5f9;color:#0b2233;border:1px solid #e6ecf2}
  .alaska-chatbot__time{display:block;margin-top:.25rem;font-size:.65rem;color:#6b7a88;opacity:.9}
  .alaska-chatbot__typing{display:inline-flex;gap:4px;align-items:center}
  .alaska-dot{width:6px;height:6px;border-radius:50%;background:#8aa9b9;opacity:.7;animation:alaska-bounce 1.2s infinite}
  .alaska-dot:nth-child(2){animation-delay:.15s}
  .alaska-dot:nth-child(3){animation-delay:.3s}
  @keyframes alaska-bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-3px);opacity:1}}
  .alaska-chatbot__input{display:flex;gap:.45rem;padding:.6rem;border-top:1px solid #e3e6ea;background:#fff}
  .alaska-chatbot__input input{flex:1;padding:.55rem;border:1px solid #d4d9df;border-radius:10px;font-size:.9rem}
  .alaska-chatbot__send{background:#2E86AB;color:#fff;border:none;border-radius:10px;padding:.55rem .8rem;font-weight:600;cursor:pointer}
  .alaska-chatbot__meta{font-size:.58rem;opacity:.65;margin-top:2px}
  @media (max-width:480px){.alaska-chatbot__panel{width:calc(100vw - 32px);max-height:70vh}}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  function el(tag, attrs={}, children=[]) { const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{ if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else e.setAttribute(k,v);}); children.forEach(c=>e.appendChild(c)); return e; }
  const nowTime = ()=> new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

  function createWidget(){
    const root = el('div', { class: 'alaska-chatbot', role:'region', 'aria-label':'Chatbot de cuidado de mascotas' });
    const btn = el('button', { class:'alaska-chatbot__btn', title:'Asistente Alaska', 'aria-label':'Abrir asistente' }, [document.createTextNode('💬')]);
    const panel = el('div', { class:'alaska-chatbot__panel', role:'dialog', 'aria-modal':'true' });
    const header = el('div', { class:'alaska-chatbot__header' }, [
      el('div', { class:'alaska-chatbot__title' }, [
        el('div', { class:'alaska-chatbot__title-row' }, [
          el('div', { class:'alaska-chatbot__avatar', title:'Alaska Bot' }, [document.createTextNode('�')]),
          el('span', { text:'Asistente Alaska' })
        ]),
        el('div', { class:'alaska-chatbot__subtitle', text:'Cuidado · Bienestar · Ética' })
      ]),
      el('div', { class:'alaska-chatbot__actions' }, [
        el('button', { class:'alaska-chatbot__clear', title:'Borrar conversación', 'aria-label':'Borrar conversación' }, [document.createTextNode('Limpiar')]),
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
    const iconBtns = header.querySelectorAll('.alaska-chatbot__iconbtn');
    iconBtns[0].addEventListener('click', close); // minimizar
    iconBtns[1].addEventListener('click', close); // cerrar
    header.querySelector('.alaska-chatbot__clear').addEventListener('click', ()=>{
      body.innerHTML='';
      addMsg('Conversación reiniciada. Pregunta algo sobre alimentación, bienestar, higiene, ética, primeros auxilios o conservación.', 'bot');
    });

    async function handleSend(){
      const q = input.value.trim(); if(!q) return;
      addMsg(q, 'user'); input.value = '';
      showTyping(true);
      try {
        // Petición directa al backend (sin fallback local)
        const ctrl = new AbortController();
        const t = setTimeout(()=> ctrl.abort(), 3500);
        const resp = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question: q }), signal: ctrl.signal });
        clearTimeout(t);
        if (resp) {
          if (resp.status === 429) {
            const data = await resp.json().catch(()=>({}));
            showTyping(false);
            addMsg((data.error || 'Demasiadas peticiones, espera un minuto.'), 'bot');
            return;
          }
          if (resp.ok) {
            const data = await resp.json();
            showTyping(false);
            let extra = '';
            if (data.category) extra += `\n(Categoría: ${data.category})`;
            if (data.disclaimer) extra += `\n${data.disclaimer}`;
            if (typeof data.rate_limit_remaining === 'number') extra += `\nQuedan ${data.rate_limit_remaining} consultas en esta ventana.`;
            addMsg(data.answer + extra, 'bot');
            return;
          }
        }
      } catch(err) {
        // error / timeout
      }
      showTyping(false);
      addMsg('No se pudo obtener respuesta del servidor en este momento. Intenta más tarde.', 'bot');
    }
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); handleSend(); }});

    // Mensaje inicial + sugerencias
    addMsg('Hola, soy tu asistente de bienestar animal. Pregunta sobre: alimentación, vacunas, higiene, comportamiento, ética, conservación, primeros auxilios básicos. Ej: "Calendario vacunas perro"', 'bot');
    const chips = [
      'Calendario vacunas perro',
      'Alimentación gato adulto',
      'Ansiedad por separación',
      'Primeros auxilios herida',
      'Parásitos externos control'
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
