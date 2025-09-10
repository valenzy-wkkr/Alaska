import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

export default function Login(){
  const { login, token } = useAuthStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [correo,setCorreo]=React.useState('');
  const [password,setPassword]=React.useState('');
  const [loading,setLoading]=React.useState(false);
  const [error,setError]=React.useState(null);
  React.useEffect(()=>{ if(token) nav('/',{replace:true}); },[token]);
  async function onSubmit(e){
    e.preventDefault(); setError(null); setLoading(true);
    try{ await login(correo,password); nav(loc.state?.from || '/', { replace:true }); }
    catch(err){ setError(err.message); }
    finally{ setLoading(false); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
        <h1 className="text-lg font-semibold tracking-wide text-white">Alaska Admin</h1>
        {error && <div className="text-xs text-red-400 bg-red-400/10 border border-red-500/30 px-3 py-2 rounded">{error}</div>}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">Correo</label>
          <input value={correo} onChange={e=>setCorreo(e.target.value)} type="email" required className="bg-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 border border-slate-700" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">Clave</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="bg-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 border border-slate-700" />
        </div>
        <button disabled={loading} className="mt-2 bg-primary hover:bg-primary/90 transition rounded px-4 py-2 text-sm font-medium disabled:opacity-60">{loading? 'Ingresando...' : 'Ingresar'}</button>
        <div className="text-[10px] text-slate-500 text-center">Acceso restringido a personal autorizado.</div>
      </form>
    </div>
  );
}