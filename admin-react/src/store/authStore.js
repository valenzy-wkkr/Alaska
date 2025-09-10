import { create } from 'zustand';

// Persistencia simple en localStorage
const LS_KEY = 'alaska_admin_session_v1';
function load(){ try { return JSON.parse(localStorage.getItem(LS_KEY)||'null'); } catch(_){ return null; } }
function save(state){ try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch(_){ } }

const initial = load() || { token:null, role:null, user:null };

const useAuthStore = create((set) => ({
  ...initial,
  login: async (correo, password) => {
    const r = await fetch('/admin-api/auth.php', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: new URLSearchParams({correo,password}).toString() });
    const j = await r.json();
    if(!j.ok) throw new Error(j.error||'login_failed');
    const newState = { token:j.token, role:j.role, user:{ id:j.user.id, name:j.user.nombre, correo:j.user.correo } };
    save(newState); set(newState);
  },
  logout: ()=> { const cleared = { token:null, role:null, user:null }; save(cleared); set(cleared); },
}));

export default useAuthStore;
