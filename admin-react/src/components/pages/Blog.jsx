import React from 'react';
import useSWR from 'swr';
import useAuthStore from '../../store/authStore.js';
const fetcher = (url, token)=> fetch(url, { headers:{ Authorization:'Bearer '+token } }).then(r=>r.json());

export default function Blog(){
  const { token } = useAuthStore();
  const { data, isLoading } = useSWR(token? ['/admin-api/blog.php?limit=50', token] : null, ([url,tk])=>fetcher(url,tk));
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Blog</h1>
      <div className="bg-panel/60 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Título</th>
              <th className="text-left px-3 py-2">Categoría</th>
              <th className="text-left px-3 py-2">Tags</th>
              <th className="text-left px-3 py-2">Estado</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-xs">Cargando…</td></tr>}
            {data?.items?.map(p => (
              <tr key={p.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                <td className="px-3 py-2 text-xs opacity-70">{p.id}</td>
                <td className="px-3 py-2">{p.title}</td>
                <td className="px-3 py-2 text-xs">{p.category}</td>
                <td className="px-3 py-2 text-xs max-w-[160px] truncate" title={p.tags}>{p.tags}</td>
                <td className="px-3 py-2 text-xs">{p.status}</td>
                <td className="px-3 py-2 text-xs flex gap-2"><button className="hover:underline">Editar</button><button className="text-red-400 hover:text-red-300">Eliminar</button></td>
              </tr>
            ))}
            {!isLoading && data?.items?.length===0 && <tr><td colSpan={6} className="p-6 text-center text-xs opacity-60">Sin posts</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
