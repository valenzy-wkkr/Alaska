// Social feed with backend integration
(function(){
  const form = document.getElementById('composerForm');
  const contentEl = document.getElementById('composerContent');
  const imageEl = document.getElementById('composerImage');
  const tagsEl = document.getElementById('composerTags');
  const publishBtn = document.getElementById('publishBtn');
  const feed = document.getElementById('feedContainer');
  const trendingBox = document.getElementById('trendingTags');
  const recentMini = document.getElementById('recentMini');
  const state = { page:1, pages:1, loading:false, tag:null, q:null, posts:[] };

  function escapeHtml(str){ return str.replace(/[&<>"']/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])); }
  function slugifyTag(t){ return t.toLowerCase().replace(/[^a-z0-9áéíóúüñ]+/gi,'-').replace(/^-+|-+$/g,''); }

  async function fetchPosts(reset=false){
    if(state.loading) return; state.loading=true;
    if(reset){ state.page=1; state.posts=[]; }
    try{
      const params = new URLSearchParams({page: state.page});
      if(state.tag) params.set('tag', state.tag);
      if(state.q) params.set('q', state.q);
      const res = await fetch(`api/posts_list.php?${params.toString()}`);
      if(!res.ok) throw new Error('network');
      const data = await res.json();
      if(data.ok){
        state.pages = data.pages; state.total = data.total;
        state.posts = state.posts.concat(data.posts.map(mutatePost));
        render(); updateLoadMore();
      }
    }catch(e){ console.error(e); }
    finally{ state.loading=false; }
  }

  function mutatePost(p){
    p.created_ts = Date.parse(p.created_at || p.created || Date.now());
    p.user = p.user || 'usuario'; // placeholder, backend could join
    return p;
  }

  function render(){
    feed.innerHTML = state.posts.map(p=> renderPostHTML(p)).join('');
    renderTrending();
    renderRecent();
  }

  function renderPostHTML(p){
    const date = new Date(p.created_ts).toLocaleString();
    const initials = p.user.charAt(0).toUpperCase();
    const tags = p.tags && p.tags.length ? `<div class="feed-item-tags">${p.tags.map(t=>`<span class="tag" data-tag="${t}">#${escapeHtml(t)}</span>`).join('')}</div>`:'';
    return `<article class="feed-item" data-id="${p.id}">
      <div class="feed-item-header">
        <div class="avatar" aria-hidden="true">${initials}</div>
        <div class="feed-item-user"><strong>${escapeHtml(p.user)}</strong><span>${date}</span></div>
      </div>
      <div class="feed-item-content">${escapeHtml(p.content)}</div>
      ${p.image? `<div class="feed-item-media"><img src="../uploads/${p.image}" alt="Imagen adjunta"></div>`:''}
      ${tags}
      <div class="feed-item-actions">
        <button data-action="like" data-id="${p.id}"><i class="fa-regular fa-heart"></i> <span>${p.likes_count||0}</span></button>
        <button data-action="comment" data-id="${p.id}"><i class="fa-regular fa-comment"></i> <span>${p.comments_count||0}</span></button>
      </div>
      <div class="comments add-comment-inline" data-comments="${p.id}">
        <div class="add-comment">
          <input type="text" placeholder="Añadir comentario" data-input-comment="${p.id}">
          <button data-submit-comment="${p.id}">Enviar</button>
        </div>
      </div>
    </article>`;
  }

  function renderTrending(){
    if(!trendingBox) return; const counts={};
    state.posts.forEach(p=> (p.tags||[]).forEach(t=> counts[t]=(counts[t]||0)+1));
    const sorted = Object.entries(counts).sort((a,b)=> b[1]-a[1]).slice(0,20);
    trendingBox.innerHTML = sorted.map(([t,c])=> `<a href="#" data-filter-tag="${t}">#${escapeHtml(t)}</a>`).join('');
  }
  function renderRecent(){
    if(!recentMini) return;
    recentMini.innerHTML = state.posts.slice(0,5).map(p=> `<div style="display:flex;gap:.5rem;align-items:center;font-size:.65rem;"> <div class="avatar" style="width:28px;height:28px;font-size:.6rem;">${p.user.charAt(0).toUpperCase()}</div><div style="display:flex;flex-direction:column;"> <strong style="font-size:.65rem;line-height:1.1;">${escapeHtml(p.content.substring(0,30))}${p.content.length>30?'…':''}</strong> <span style="opacity:.6;">${new Date(p.created_ts).toLocaleDateString()}</span> </div></div>`).join('');
  }

  function updateLoadMore(){
    if(state.page >= state.pages){ document.getElementById('loadMoreBtn')?.remove(); return; }
    if(!document.getElementById('loadMoreBtn')){
      const btn = document.createElement('button');
      btn.id='loadMoreBtn';
      btn.textContent='Cargar más';
      btn.style.cssText='margin:1rem auto;display:block;padding:.6rem 1rem;border-radius:10px;border:1px solid var(--color-borde);background:var(--fondo-claro);cursor:pointer;';
      btn.addEventListener('click',()=>{ state.page++; fetchPosts(); });
      feed.parentElement.appendChild(btn);
    }
  }

  // Publish
  contentEl.addEventListener('input', ()=> { publishBtn.disabled = contentEl.value.trim().length < 5; });
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    if(publishBtn.disabled) return;
    const fd = new FormData(form);
    try {
      publishBtn.disabled = true; publishBtn.textContent='Publicando…';
      const res = await fetch('api/posts_create.php', {method:'POST', body: fd});
      const data = await res.json();
      if(data.ok){ state.page=1; state.posts=[]; fetchPosts(true); form.reset(); }
    } finally { publishBtn.textContent='Publicar'; publishBtn.disabled = true; }
  });

  // Delegated actions
  feed.addEventListener('click', async e=>{
    const likeBtn = e.target.closest('button[data-action="like"]');
    if(likeBtn){
      const id = likeBtn.dataset.id;
      const fd = new FormData(); fd.append('post_id', id);
      const res = await fetch('api/like_toggle.php',{method:'POST', body: fd});
      const data = await res.json(); if(data.ok){ state.page=1; state.posts=[]; fetchPosts(true);} return;
    }
    const tagEl = e.target.closest('.tag[data-tag]');
    if(tagEl){ e.preventDefault(); state.tag = tagEl.dataset.tag; state.page=1; state.posts=[]; fetchPosts(true); }
  });

  feed.addEventListener('click', async e=>{
    const submit = e.target.closest('button[data-submit-comment]');
    if(submit){
      const id = submit.dataset.submitComment; const input = feed.querySelector(`input[data-input-comment="${id}"]`);
      if(!input || input.value.trim().length<2) return;
      const res = await fetch('api/comment_create.php',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({post_id:id, text: input.value.trim()})});
      const data = await res.json(); if(data.ok){ input.value=''; state.page=1; state.posts=[]; fetchPosts(true);} }
  });

  trendingBox && trendingBox.addEventListener('click', e=>{
    const a = e.target.closest('a[data-filter-tag]');
    if(a){ e.preventDefault(); state.tag = a.dataset.filterTag; state.page=1; state.posts=[]; fetchPosts(true); }
  });

  // init
  fetchPosts(true);
})();
