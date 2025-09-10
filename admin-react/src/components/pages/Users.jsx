import React from 'react';
import useSWR from 'swr';
import { UserPlus, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';
const fetcher = (url, token)=> fetch(url, { headers: { Authorization: 'Bearer '+token } }).then(r=>r.json());

export default function Users(){
  const { token } = useAuthStore();
  const { data, isLoading, mutate } = useSWR(token ? ['/admin-api/users.php?limit=50', token] : null, ([url,tk])=>fetcher(url,tk));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Usuarios</h1>
        <button className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-primary hover:bg-primary/90 font-medium">
          <UserPlus className="w-4 h-4"/> Nuevo
        </button>
      </div>
      <div className="bg-panel/60 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Correo</th>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Rol</th>
              <th className="text-left px-3 py-2">Estado</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center"><Loader2 className="w-4 h-4 animate-spin inline"/></td></tr>}
            {data?.items?.map(u => (
              <tr key={u.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                <td className="px-3 py-2 text-xs opacity-70">{u.id}</td>
                <td className="px-3 py-2">{u.correo}</td>
                <td className="px-3 py-2">{u.nombre || '—'}</td>
                <td className="px-3 py-2"><span className="text-[11px] px-2 py-1 rounded bg-slate-700/60">{u.role}</span></td>
                <td className="px-3 py-2 text-xs">{u.status || 'activo'}</td>
                <td className="px-3 py-2 text-xs flex gap-2">
                  <button className="hover:underline">Editar</button>
                  <button className="text-red-400 hover:text-red-300">Suspender</button>
                </td>
              </tr>
            ))}
            {!isLoading && data?.items?.length===0 && <tr><td colSpan={6} className="p-6 text-center text-xs opacity-60">Sin usuarios</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
