// Autenticación básica en cliente para demo (no usar en producción)
(function() {
  const STORAGE_KEYS = {
    loggedIn: 'alaska_loggedIn',
    user: 'alaska_user',
    users: 'users'
  };

  // Helper: hash simple (demo)
  function hash(pwd){ return `hashed_${pwd}`; }

  // Dependencia a AlaskaStore (gracia si no está)
  const Store = (typeof window !== 'undefined' && window.AlaskaStore) ? window.AlaskaStore : {
    get: (k, fb)=>{ try{ return JSON.parse(localStorage.getItem('alaska_'+k))||fb; }catch{ return fb; } },
    set: (k, v)=> localStorage.setItem('alaska_'+k, JSON.stringify(v)),
    add: (k, item)=>{ const arr = Store.get(k, []); const withId = { id: Date.now()+"_"+Math.random().toString(36).slice(2,8), ...item }; arr.push(withId); Store.set(k, arr); return withId; }
  };

  function isLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true';
  }

  function login(email, password) {
    // Verificar contra usuarios registrados (si existen)
    const users = Store.get(STORAGE_KEYS.users, []);
    let ok = true;
    let userObj = { email };
    if (Array.isArray(users) && users.length) {
      const u = users.find(u => (u.email||'').toLowerCase() === (email||'').toLowerCase());
      if (!u) ok = false; else if (u.passwordHash && u.passwordHash !== hash(password||'')) ok = false; else userObj = u;
    }
    if (!ok) {
      try{
        const c = document.getElementById('login-error');
        if (c){ c.textContent = 'Credenciales inválidas o usuario no registrado. Regístrate primero.'; c.style.display = 'block'; }
      }catch(_){ /* fallback */ }
      return false;
    }
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ id: userObj.id, email: userObj.email, name: userObj.name, username: userObj.username }));
    window.location.href = '/dashboard';
    return true;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.loggedIn);
    localStorage.removeItem(STORAGE_KEYS.user);
    window.location.href = '/';
  }

  function applyAuthUI() {
    const logged = isLoggedIn();

    // Footer: ocultar info-contacto y enlaces-rapidos si está logueado
    try {
      if (logged) {
        document.querySelectorAll('.pie-pagina .info-contacto, .pie-pagina .enlaces-rapidos').forEach(el => {
          el.style.display = 'none';
        });
      }
    } catch(_) {}

    // Nav: agregar Dashboard / Cerrar sesión cuando está logueado
    try {
      const list = document.querySelector('.lista-navegacion');
      if (list) {
        // Evitar duplicar
        if (logged) {
          if (!list.querySelector('[data-nav="dashboard"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="/dashboard" data-nav="dashboard">Dashboard</a>';
            list.appendChild(li);
          }
          if (!list.querySelector('[data-action="logout"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="#" data-action="logout">Cerrar sesión</a>';
            list.appendChild(li);
          }
          // Ocultar registro/login si existen
          list.querySelectorAll('a[href*="registro"], a[href*="login"]').forEach(a => a.parentElement && (a.parentElement.style.display = 'none'));
        } else {
          // Si no está logueado, eliminar Dashboard/Logout si quedaron
          list.querySelectorAll('[data-nav="dashboard"], [data-action="logout"]').forEach(a => a.parentElement && a.parentElement.remove());
        }
      }
    } catch(_) {}
  }

  function initLoginForm() {
    const form = document.getElementById('formulario-login');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = (form.querySelector('input[type="email"]') || {}).value || '';
      const password = (form.querySelector('input[type="password"]') || {}).value || '';
      // Validación básica
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || !password || password.length < 8) {
        const c = document.getElementById('login-error');
        if (c){ c.textContent = 'Credenciales inválidas. Verifique email y contraseña (mínimo 8 caracteres).'; c.style.display = 'block'; }
        return;
      }
      login(email, password);
    });
  }

  function initRegisterForm() {
    const form = document.getElementById('formulario-registro');
    if (!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const data = {
        name: form.nombre?.value?.trim() || '',
        email: form.contacto?.value?.trim() || '',
        password: form.password?.value || '',
        username: form.username?.value?.trim() || '',
        address: form.direccion?.value?.trim() || ''
      };
      // Validaciones mínimas
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.name || !emailRegex.test(data.email) || !data.password || data.password.length < 8 || !data.username || !data.address) {
        alert('Por favor, completa el formulario correctamente.');
        return;
      }
      if (!form.terminos?.checked) {
        alert('Debes aceptar los términos y condiciones.');
        return;
      }
      const users = Store.get(STORAGE_KEYS.users, []);
      const exists = users.some(u => (u.email||'').toLowerCase() === data.email.toLowerCase());
      if (exists) {
        alert('Ya existe un usuario con ese correo. Inicia sesión.');
        return;
      }
      const user = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        username: data.username,
        address: data.address,
        passwordHash: hash(data.password)
      };
      users.push(user);
      Store.set(STORAGE_KEYS.users, users);
      // Inicio de sesión automático tras registro
      localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ id: user.id, email: user.email, name: user.name, username: user.username }));
      alert('Registro exitoso. Redirigiendo a tu dashboard...');
      window.location.href = '/dashboard';
    });
  }

  function initLogoutLinks() {
    document.addEventListener('click', function(e) {
      const a = e.target.closest('a[data-action="logout"]');
      if (a) {
        e.preventDefault();
        logout();
      }
    });
  }

  function protectDashboard() {
    if (location.pathname.toLowerCase().startsWith('/dashboard') && !isLoggedIn()) {
      location.href = '/login';
    }
  }

  function initAll(){
    applyAuthUI();
    initLoginForm();
    initRegisterForm();
    initLogoutLinks();
    protectDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    // DOM ya listo
    initAll();
  }

  // Exponer utilidades
  if (typeof window !== 'undefined') {
    window.AlaskaAuth = { isLoggedIn, login, logout, applyAuthUI };
  }
})();
