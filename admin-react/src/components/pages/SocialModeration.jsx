import React from 'react';
import useSWR from 'swr';
import useAuthStore from '../../store/authStore.js';
const fetcher = (url, token)=> fetch(url, { headers:{ Authorization:'Bearer '+token } }).then(r=>r.json());

export default function SocialModeration(){
  const { token } = useAuthStore();
  const { data: posts } = useSWR(token? ['/admin-api/social.php?type=posts', token] : null, ([url,tk])=>fetcher(url,tk));
  const { data: reports } = useSWR(token? ['/admin-api/social.php?type=reports', token] : null, ([url,tk])=>fetcher(url,tk));
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-lg font-semibold">Moderación Social</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-panel/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-wide">Últimos posts</h2>
            <div className="space-y-4 overflow-y-auto max-h-80 pr-2">
              {posts?.items?.map(p => (
                <div key={p.id} className="border border-slate-800 rounded-lg p-3 text-xs flex flex-col gap-2">
                  <div className="font-medium text-slate-200">#{p.id} {p.author}</div>
                  <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px]">{p.content.slice(0,200)}</div>
                  <div className="flex gap-3 text-[10px] text-slate-400">
                    <span>{p.likes} ❤</span><span>{p.comments} comentarios</span><span>{p.tags?.map(t=>'#'+t).join(' ')}</span>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <button className="px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-600">Ocultar</button>
                    <button className="px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-600">Eliminar</button>
                  </div>
                </div>
              ))}
              {(!posts?.items || posts.items.length===0) && <div className="text-[11px] opacity-60">Sin posts</div>}
            </div>
          </div>
          <div className="bg-panel/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-wide">Reportes</h2>
            <div className="space-y-4 overflow-y-auto max-h-80 pr-2">
              {reports?.items?.map(r => (
                <div key={r.id} className="border border-slate-800 rounded-lg p-3 text-xs flex flex-col gap-2">
                  <div className="font-medium text-slate-200">#{r.id} {r.target_type} #{r.target_id}</div>
                  <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px]">{r.reason || 'Sin razón'}</div>
                  <div className="flex gap-2 text-[10px]">
                    <button className="px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-600">Revisado</button>
                    <button className="px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-600">Acción</button>
                  </div>
                </div>
              ))}
              {(!reports?.items || reports.items.length===0) && <div className="text-[11px] opacity-60">Sin reportes</div>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
