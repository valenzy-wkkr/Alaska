import React from 'react';
import useSWR from 'swr';
import useAuthStore from '../../store/authStore.js';
const fetcher = (url, token)=> fetch(url, { headers:{ Authorization:'Bearer '+token } }).then(r=>r.json());

export default function Appointments(){
  const { token } = useAuthStore();
  const { data, isLoading } = useSWR(token? ['/admin-api/appointments.php?limit=50', token] : null, ([url,tk])=>fetcher(url,tk));
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Citas</h1>
      <div className="bg-panel/60 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Mascota</th>
              <th className="text-left px-3 py-2">Propietario</th>
              <th className="text-left px-3 py-2">Fecha/Hora</th>
              <th className="text-left px-3 py-2">Motivo</th>
              <th className="text-left px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-xs">Cargando…</td></tr>}
            {data?.items?.map(c => (
              <tr key={c.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                <td className="px-3 py-2 text-xs opacity-70">{c.id}</td>
                <td className="px-3 py-2">{c.petNombre}</td>
                <td className="px-3 py-2 text-xs">{c.ownerCorreo}</td>
                <td className="px-3 py-2 text-xs">{c.fecha} {c.hora}</td>
                <td className="px-3 py-2 text-xs">{c.motivo}</td>
                <td className="px-3 py-2 text-xs">{c.estado}</td>
              </tr>
            ))}
            {!isLoading && data?.items?.length===0 && <tr><td colSpan={6} className="p-6 text-center text-xs opacity-60">Sin citas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
