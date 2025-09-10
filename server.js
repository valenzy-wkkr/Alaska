/**
 * Archivo de entrada del servidor web
 * Usa Express si está disponible; si no, usa un servidor HTTP nativo como fallback.
 */

const path = require('path');
const fs = require('fs');
const https = require('https');
const { URL } = require('url');
const port = process.env.PORT || 3000;

let appOrServer = null;
let usingExpress = false;

// --- Shared safety and LLM helpers ---
const HARMFUL_RX = /(matar|lastimar|herir|golpear|pegar|maltratar|abandonar|envenen|veneno|ahogar|asfixiar|electrocutar|castigo\s*f[ií]sico|tortura|hacer\s*daño)/i;
const ANIMAL_RX = /(perro|gato|mascota|animal|conejo|hur[oó]n|ave|pez|hamster|veterin|vacuna|par[aá]sito|aliment|entren|higiene|uñas|pelo|garrapata|pulga|desparas|esteriliz|cachorro|kitten|senior|diarrea|v[oó]mito|herida)/i;
const EMERGENCY_RX = /(convulsi[óo]n|no\s*respira|sangrado\s*abundante|fractura|veneno|envenen)/i;

const KB_ITEMS = [
  { k:['vacuna','perro','calendario'], r:'Calendario orientativo para perros: 6-8 semanas (moquillo/parvo), 10-12 (refuerzo), 14-16 (refuerzo + rabia según zona), anual (refuerzos). Consulta a tu veterinario.' },
  { k:['vacuna','gato'], r:'Gatos: trivalente (panleucopenia, calicivirus, herpesvirus) y rabia donde sea obligatoria. Refuerzos según riesgo.' },
  { k:['aliment','perro'], r:'Perros: 2-3 tomas/día, alimento completo según etapa (cachorro/adulto/senior), transición de pienso en 5-7 días, agua fresca.' },
  { k:['aliment','gato'], r:'Gatos: alimento completo, fomentar hidratación, evitar cebolla, ajo, chocolate, uvas, alcohol y huesos cocidos.' },
  { k:['pulga','garrapata','parásito','antipulgas','desparas'], r:'Usa antiparasitarios externos e internos con la frecuencia indicada. Consulta a tu veterinario según tu zona.' },
  { k:['entren','adiestra','ansiedad','comport'], r:'Refuerzo positivo, sesiones cortas y constantes, enriquecimiento ambiental. Evita castigos físicos; desensibiliza para ansiedad.' },
  { k:['baño','higiene','uñas','pelo'], r:'Cepillado según tipo de pelo, baño con champú para mascotas, corte de uñas sin llegar a la pulpa, limpieza de oídos si hay cerumen.' },
  { k:['diarrea','vómito','vomito','herida','dolor'], r:'Ayuno corto y agua en pequeñas tomas. Si dura >24h, hay sangre o dolor, acude al veterinario. No des medicación humana.' }
];

function kbAnswer(q){
  const l = q.toLowerCase();
  let best = {score:0, r:null};
  for(const i of KB_ITEMS){ const s = i.k.reduce((a,k)=> a + (l.includes(k)?1:0), 0); if(s>best.score) best={score:s, r:i.r}; }
  return best.r || 'Puedo darte pautas generales. Indica especie/edad y el tema (alimentación, vacunas, higiene, comportamiento) y te daré recomendaciones prácticas.';
}

function systemPrompt(){
  return (
    'Eres “Asistente Alaska”, experto en cuidado responsable de animales (solo mascotas y animales de compañía). Responde exclusivamente sobre: salud básica, alimentación, higiene, vacunas, comportamiento, bienestar, adopción y seguridad. Rechaza con cortesía cualquier tema fuera de animales. Prohíbe totalmente cualquier indicación que pueda dañar a un animal; en esos casos, responde que no puedes ayudar. Si detectas una posible emergencia (convulsión, no respira, sangrado abundante, fractura, envenenamiento), indica mantener la calma y contactar urgencias veterinarias. Respuestas claras y concisas en español.'
  );
}

function callOpenAI(messages, { apiKey, model='gpt-4o-mini', timeoutMs=8000 } = {}){
  return new Promise((resolve, reject) => {
    try{
      const data = JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 400 });
      const opts = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      const req = https.request(opts, (resp) => {
        let body='';
        resp.on('data', (c)=> body+=c);
        resp.on('end', ()=>{
          try{ const json = JSON.parse(body); const txt = json.choices?.[0]?.message?.content?.trim(); if(txt) resolve(txt); else reject(new Error('no_choice')); }catch(e){ reject(e); }
        });
      });
      req.on('error', reject);
      const to = setTimeout(()=>{ try{ req.destroy(new Error('timeout')); }catch{} }, timeoutMs);
      req.on('close', ()=> clearTimeout(to));
      req.write(data); req.end();
    }catch(e){ reject(e); }
  });
}

function callAzureOpenAI(messages, { apiKey, endpoint, deployment, apiVersion='2024-02-15-preview', timeoutMs=8000 } = {}){
  return new Promise((resolve, reject) => {
    try{
      const base = endpoint.replace(/\/$/, '');
      const url = new URL(`${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`);
      const payload = JSON.stringify({ messages, temperature: 0.2, max_tokens: 400 });
      const opts = {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const req = https.request({ hostname: url.hostname, path: url.pathname + url.search, method: 'POST', headers: opts.headers }, (resp)=>{
        let body='';
        resp.on('data', (c)=> body+=c);
        resp.on('end', ()=>{
          try{ const json = JSON.parse(body); const txt = json.choices?.[0]?.message?.content?.trim(); if(txt) resolve(txt); else reject(new Error('no_choice')); }catch(e){ reject(e); }
        });
      });
      req.on('error', reject);
      const to = setTimeout(()=>{ try{ req.destroy(new Error('timeout')); }catch{} }, timeoutMs);
      req.on('close', ()=> clearTimeout(to));
      req.write(payload); req.end();
    }catch(e){ reject(e); }
  });
}

async function answerWithLLM(q){
  const provider = (process.env.CHAT_PROVIDER||'').toLowerCase();
  const userMsg = { role: 'user', content: q };
  const sysMsg = { role: 'system', content: systemPrompt() };
  if (provider === 'azure' && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT) {
    return await callAzureOpenAI([sysMsg, userMsg], {
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return await callOpenAI([sysMsg, userMsg], {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    });
  }
  return null; // No provider configured
}

async function safeChatAnswer(q){
  const l = String(q||'').toLowerCase();
  if (HARMFUL_RX.test(l)) {
    return 'No puedo ayudar con acciones que dañen o pongan en riesgo a los animales. Busca apoyo profesional con un veterinario o etólogo. Promuevo el bienestar animal.';
  }
  if (!ANIMAL_RX.test(l)) {
    return 'Respondo únicamente preguntas sobre cuidado responsable de animales (salud, alimentación, higiene, comportamiento, vacunas). ¿En qué te ayudo con tu mascota?';
  }
  if (EMERGENCY_RX.test(l)) {
    return 'Podría ser una emergencia. Mantén a tu mascota calmada y contacta urgencias veterinarias de inmediato. No administres medicación humana sin indicación profesional.';
  }
  // Try LLM first; fall back to KB
  try {
    const llm = await answerWithLLM(q);
    if (llm && typeof llm === 'string') return llm;
  } catch(_){}
  return kbAnswer(q);
}

try {
  // Intentar usar Express si está instalado
  const express = require('express');
  const app = express();
  usingExpress = true;

  // Middleware para parsear el body
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Servir archivos estáticos desde el directorio raíz del proyecto
  app.use(express.static(path.join(__dirname)));

  // Rutas de páginas
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
  });

  app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacto.html'));
  });

  // Auth y dashboard
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
  });
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  });

  // ================= ADMIN API (JWT / Roles simplificado) =================
  // Nota: Para producción mover a archivos separados y añadir persistencia real.
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  const SECRET = process.env.ADMIN_JWT_SECRET || 'dev-secret-change';
  const roles = ['admin','moderator','editor'];

  // Demo in-memory (sustituir por DB)
  const mem = {
    users: [
      { id:1, correo:'admin@demo', nombre:'Admin', role:'admin', hash: bcrypt.hashSync('admin',10), status:'active' },
      { id:2, correo:'mod@demo', nombre:'Moderador', role:'moderator', hash: bcrypt.hashSync('mod',10), status:'active' },
      { id:3, correo:'editor@demo', nombre:'Editor', role:'editor', hash: bcrypt.hashSync('editor',10), status:'active' }
    ],
    pets: [ { id:1, nombre:'Luna', especie:'Perro', duenoId:1 }, { id:2, nombre:'Mishi', especie:'Gato', duenoId:2 } ],
    appointments: [ { id:1, petId:1, ownerId:1, fecha:'2025-09-15', hora:'10:00', motivo:'Vacuna', estado:'programada' } ],
    blog: [ { id:1, title:'Bienestar general', category:'Salud', tags:'cuidado', status:'published', author:1 }, { id:2, title:'Alimentación natural', category:'Alimentación', tags:'dieta', status:'draft', author:1 } ],
    socialPosts: [ { id:1, author:1, content:'Foto de Luna feliz', tags:['luna','feliz'], likes:2, comments:1 } ],
    socialComments: [ { id:1, postId:1, author:2, content:'Genial!' } ],
    socialReports: [ { id:1, target_type:'post', target_id:1, user_id:2, reason:'Spam', created_at:new Date().toISOString() } ]
  };

  function issueToken(user){
    return jwt.sign({ sub:user.id, role:user.role }, SECRET, { expiresIn:'8h' });
  }
  function auth(req,res,next){
    const h = req.headers.authorization||'';
    const token = h.startsWith('Bearer ')? h.slice(7):null;
    if(!token) return res.status(401).json({ok:false,error:'no_token'});
    try { req.user = jwt.verify(token, SECRET); next(); } catch(e){ return res.status(401).json({ok:false,error:'bad_token'}); }
  }
  function permit(...allowed){
    return (req,res,next)=>{
      if(!req.user) return res.status(401).json({ok:false,error:'unauth'});
      if(!allowed.includes(req.user.role)) return res.status(403).json({ok:false,error:'forbidden'});
      next();
    }
  }

  app.post('/admin-api/login',(req,res)=>{
    const { correo, password } = req.body||{};
    const u = mem.users.find(x=>x.correo===correo);
    if(!u) return res.status(400).json({ok:false,error:'user_not_found'});
    if(!bcrypt.compareSync(password||'', u.hash)) return res.status(400).json({ok:false,error:'invalid_password'});
    const token = issueToken(u);
    res.json({ok:true, token, role:u.role, user:{id:u.id, nombre:u.nombre, correo:u.correo}});
  });

  // Métricas
  app.get('/admin-api/metrics', auth, permit('admin','moderator','editor'), (req,res)=>{
    res.json({
      usersActive: mem.users.length,
      pets: mem.pets.length,
      upcomingAppointments: mem.appointments.length,
      blogPosts: mem.blog.length,
      socialPosts: mem.socialPosts.length,
      socialComments: mem.socialComments.length,
      trendUsers: [ {day:'Lun',value:4},{day:'Mar',value:6},{day:'Mié',value:5},{day:'Jue',value:7},{day:'Vie',value:5},{day:'Sáb',value:9},{day:'Dom',value:3} ],
      trendPosts: [ {day:'Lun',blog:1,social:4},{day:'Mar',blog:2,social:5},{day:'Mié',blog:0,social:3},{day:'Jue',blog:2,social:6},{day:'Vie',blog:1,social:4},{day:'Sáb',blog:2,social:7},{day:'Dom',blog:1,social:2} ]
    });
  });

  // Usuarios
  app.get('/admin-api/users', auth, permit('admin','moderator'), (req,res)=>{
    const items = mem.users.map(u=> ({ id:u.id, correo:u.correo, nombre:u.nombre, role:u.role, status:u.status }));
    res.json({ok:true, items});
  });

  // Mascotas
  app.get('/admin-api/pets', auth, permit('admin','moderator','editor'), (req,res)=>{
    const items = mem.pets.map(p=> ({ id:p.id, nombre:p.nombre, especie:p.especie, duenoNombre: mem.users.find(u=>u.id===p.duenoId)?.nombre||null, citasProximas: mem.appointments.filter(a=>a.petId===p.id).length }));
    res.json({ok:true, items});
  });

  // Citas
  app.get('/admin-api/appointments', auth, permit('admin','moderator','editor'), (req,res)=>{
    const items = mem.appointments.map(a=> ({ id:a.id, petNombre: mem.pets.find(p=>p.id===a.petId)?.nombre, ownerCorreo: mem.users.find(u=>u.id===a.ownerId)?.correo, fecha:a.fecha, hora:a.hora, motivo:a.motivo, estado:a.estado }));
    res.json({ok:true, items});
  });

  // Blog
  app.get('/admin-api/blog', auth, permit('admin','editor'), (req,res)=>{
    const items = mem.blog.map(p=> ({ id:p.id, title:p.title, category:p.category, tags:p.tags, status:p.status }));
    res.json({ok:true, items});
  });

  // Social
  app.get('/admin-api/social/posts', auth, permit('admin','moderator'), (req,res)=>{
    const items = mem.socialPosts.map(p=> ({ id:p.id, author: mem.users.find(u=>u.id===p.author)?.nombre || 'User', content:p.content, tags:p.tags, likes:p.likes, comments: mem.socialComments.filter(c=>c.postId===p.id).length }));
    res.json({ok:true, items});
  });
  app.get('/admin-api/social/reports', auth, permit('admin','moderator'), (req,res)=>{
    const items = mem.socialReports.map(r=> ({ id:r.id, target_type:r.target_type, target_id:r.target_id, user_id:r.user_id, reason:r.reason, created_at:r.created_at }));
    res.json({ok:true, items});
  });

  // CORS para admin-react (desarrollo)
  const cors = require('cors');
  app.use(cors({ origin:true }));

  // Endpoints de ejemplo para API
  app.get('/api/users', (req, res) => {
    res.json({ message: 'Obtener todos los usuarios' });
  });

  app.get('/api/users/:id', (req, res) => {
    res.json({ message: 'Obtener usuario por ID', id: req.params.id });
  });

  app.post('/api/users', (req, res) => {
    res.json({ message: 'Crear nuevo usuario', data: req.body });
  });

  app.put('/api/users/:id', (req, res) => {
    res.json({ message: 'Actualizar usuario', id: req.params.id, data: req.body });
  });

  app.delete('/api/users/:id', (req, res) => {
    res.json({ message: 'Eliminar usuario', id: req.params.id });
  });

  // API de mascotas
  app.get('/api/pets', (req, res) => {
    res.json({ message: 'Obtener todas las mascotas' });
  });

  app.get('/api/pets/:id', (req, res) => {
    res.json({ message: 'Obtener mascota por ID', id: req.params.id });
  });

  app.post('/api/pets', (req, res) => {
    res.json({ message: 'Crear nueva mascota', data: req.body });
  });

  app.put('/api/pets/:id', (req, res) => {
    res.json({ message: 'Actualizar mascota', id: req.params.id, data: req.body });
  });

  app.delete('/api/pets/:id', (req, res) => {
    res.json({ message: 'Eliminar mascota', id: req.params.id });
  });

  // Blog feed de ejemplo (simula datos externos)
  function escapeHTML(s){
    return String(s||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  app.get('/api/blog', async (req, res) => {
    // Intentar cargar desde un feed externo si está configurado; si no, usar posts locales.
    const localPosts = [
      { id: 1, title: 'Consejos para la primera visita al veterinario', category: 'Salud', date: '2025-08-01', image: '/img/blog1.avif', excerpt: 'Guía rápida para tu primera cita veterinaria.' },
      { id: 2, title: 'Cómo elegir el mejor pienso', category: 'Alimentación', date: '2025-07-22', image: '/img/blog2.avif', excerpt: 'Claves para seleccionar un alimento de calidad.' },
      { id: 3, title: 'Rutinas de paseo según la edad', category: 'Paseos', date: '2025-07-01', image: '/img/blog3.avif', excerpt: 'Adapta la actividad a cada etapa.' }
    ];
    try{
      const external = await fetchExternalBlog();
      const items = (external && Array.isArray(external) && external.length>0 ? external : localPosts)
        .map(p=>({
          id: p.id,
          title: escapeHTML(p.title),
          category: escapeHTML(p.category),
          date: p.date,
          image: typeof p.image === 'string' && p.image.startsWith('http') ? p.image : (p.image || '/img/blog1.avif'),
          excerpt: escapeHTML(p.excerpt)
        }));
      res.json({ items });
    }catch(_){
      res.json({ items: localPosts.map(p=>({
        id: p.id,
        title: escapeHTML(p.title),
        category: escapeHTML(p.category),
        date: p.date,
        image: p.image,
        excerpt: escapeHTML(p.excerpt)
      })) });
    }
  });

  // Chat seguro (tema: cuidado de animales) con proveedor opcional
  app.post('/api/chat', async (req, res) => {
    try {
      const q = (req.body && (req.body.question || req.body.q || '')) || '';
      const answer = await safeChatAnswer(q);
      res.json({ ok: true, answer });
    } catch (e) {
      res.status(500).json({ ok:false, error:'chat_failed' });
    }
  });

  // 404
  app.use((req, res) => {
    const file404 = path.join(__dirname, '404.html');
    if (fs.existsSync(file404)) return res.status(404).sendFile(file404);
    res.status(404).send('Página no encontrada');
  });

  // Errores
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal en el servidor' });
  });

  app.listen(port, () => {
    console.log(`Servidor (Express) escuchando en http://localhost:${port}`);
  });

  async function fetchExternalBlog() {
    return new Promise((resolve) => {
      const feedUrl = process.env.BLOG_FEED_URL;
      if (!feedUrl) return resolve(null);
      try {
        https.get(feedUrl, (resp) => {
          let data = '';
          resp.on('data', (chunk) => data += chunk);
          resp.on('end', () => {
            // Try JSON first
            try {
              const json = JSON.parse(data);
              const items = Array.isArray(json) ? json : (json.items || json.articles || []);
              const mapped = (items || []).slice(0, 6).map((p, i) => ({
                id: p.id || i + 1,
                title: p.title || 'Entrada',
                category: p.category || p.tags?.[0] || 'General',
                date: p.date || p.publishedAt || new Date().toISOString(),
                image: p.image || p.imageUrl || '/img/blog1.avif',
                excerpt: p.excerpt || p.summary || ''
              }));
              return resolve(mapped);
            } catch (_) {
              // Naive RSS parsing
              const items = [];
              const itemRegex = /<item[\s\S]*?<\/item>/g;
              const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i;
              const dateRegex = /<pubDate>(.*?)<\/pubDate>/i;
              const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i;
              const matches = data.match(itemRegex) || [];
              for (let i = 0; i < Math.min(matches.length, 6); i++) {
                const it = matches[i];
                const t = it.match(titleRegex);
                const d = it.match(dateRegex);
                const ex = it.match(descRegex);
                items.push({
                  id: i + 1,
                  title: (t && (t[1] || t[2])) || 'Entrada',
                  category: 'RSS',
                  date: (d && d[1]) || new Date().toISOString(),
                  image: '/img/blog1.avif',
                  excerpt: (ex && (ex[1] || ex[2] || '')).replace(/<[^>]*>/g, '').slice(0, 180)
                });
              }
              resolve(items);
            }
          });
        }).on('error', () => resolve(null));
      } catch (_) {
        resolve(null);
      }
    });
  }
  appOrServer = app;
} catch (e) {
  // Fallback: servidor HTTP nativo
  const http = require('http');
  const url = require('url');

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
  };

  const serveFile = (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          const notFoundPath = path.join(__dirname, '404.html');
          if (fs.existsSync(notFoundPath)) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            return fs.createReadStream(notFoundPath).pipe(res);
          }
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('404 - Recurso no encontrado');
        }
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 - Error interno del servidor');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  };

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // POST /api/chat (cuerpo pequeño, JSON)
    if (req.method === 'POST' && pathname === '/api/chat') {
      let body = '';
      req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.connection.destroy(); });
      req.on('end', async () => {
        try {
          const data = body ? JSON.parse(body) : {};
          const q = String(data.question || data.q || '');
          const answer = await safeChatAnswer(q);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok:true, answer }));
        } catch(_) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok:false, error: 'chat_failed' }));
        }
      });
      return;
    }

    // API simulada para blog
    if (pathname === '/api/blog') {
      const posts = [
        { id: 1, title: 'Consejos para la primera visita al veterinario', category: 'Salud', date: '2025-08-01', image: '/img/blog1.avif', excerpt: 'Guía rápida para tu primera cita veterinaria.' },
        { id: 2, title: 'Cómo elegir el mejor pienso', category: 'Alimentación', date: '2025-07-22', image: '/img/blog2.avif', excerpt: 'Claves para seleccionar un alimento de calidad.' },
        { id: 3, title: 'Rutinas de paseo según la edad', category: 'Paseos', date: '2025-07-01', image: '/img/blog3.avif', excerpt: 'Adapta la actividad a cada etapa.' }
      ];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ items: posts }));
      return;
    }

    // Rutas amigables
    if (pathname === '/') pathname = '/index.html';
  if (pathname === '/blog') pathname = '/blog.html';
  if (pathname === '/contacto') pathname = '/contacto.html';
  if (pathname === '/login') pathname = '/login.html';
  if (pathname === '/dashboard') pathname = '/dashboard.html';

    // Evitar path traversal
    const safePath = path.normalize(path.join(__dirname, pathname)).replace(/\\/g, '/');
    if (!safePath.startsWith(path.normalize(__dirname).replace(/\\/g, '/'))) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('400 - Solicitud inválida');
      return;
    }

    // Servir archivo
    serveFile(res, safePath);
  });

  server.listen(port, () => {
    console.log(`Servidor (HTTP nativo) escuchando en http://localhost:${port}`);
    console.warn('Express no está instalado. Usando servidor HTTP nativo como fallback.');
  });

  appOrServer = server;
}

module.exports = appOrServer;