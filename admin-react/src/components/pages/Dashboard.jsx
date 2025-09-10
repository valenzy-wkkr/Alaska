import React from 'react';
import useSWR from 'swr';
import useAuthStore from '../../store/authStore.js';
import { Activity, Users, PawPrint, CalendarClock, Newspaper, MessagesSquare } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';

const fetcher = (url, token)=> fetch(url, { headers: token? { Authorization: 'Bearer '+token } : {} }).then(r=>r.json());

export default function Dashboard(){
  const { token } = useAuthStore();
  const { data: metrics } = useSWR(token? ['/admin-api/metrics.php', token] : null, ([url,tk])=>fetcher(url,tk), { refreshInterval: 30000 });

  const cards = [
    { icon: <Users className="w-4 h-4"/>, label: 'Usuarios activos', value: metrics?.usersActive ?? '—' },
    { icon: <PawPrint className="w-4 h-4"/>, label: 'Mascotas registradas', value: metrics?.pets ?? '—' },
    { icon: <CalendarClock className="w-4 h-4"/>, label: 'Próx. citas (7d)', value: metrics?.upcomingAppointments ?? '—' },
    { icon: <Newspaper className="w-4 h-4"/>, label: 'Posts blog', value: metrics?.blogPosts ?? '—' },
    { icon: <MessagesSquare className="w-4 h-4"/>, label: 'Posts sociales', value: metrics?.socialPosts ?? '—' },
    { icon: <Activity className="w-4 h-4"/>, label: 'Comentarios sociales', value: metrics?.socialComments ?? '—' }
  ];

  const trendUsers = metrics?.trendUsers || [
    { day:'Lun', value:4 },{ day:'Mar', value:7 },{ day:'Mié', value:6 },{ day:'Jue', value:8 },{ day:'Vie', value:5 },{ day:'Sáb', value:9 },{ day:'Dom', value:3 }
  ];

  const trendPosts = metrics?.trendPosts || [
    { day:'Lun', blog:2, social:5 },{ day:'Mar', blog:1, social:7 },{ day:'Mié', blog:0, social:4 },{ day:'Jue', blog:2, social:6 },{ day:'Vie', blog:1, social:8 },{ day:'Sáb', blog:3, social:7 },{ day:'Dom', blog:1, social:2 }
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold mb-4">Resumen</h1>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          {cards.map(c => (
            <div key={c.label} className="bg-panel/60 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px] tracking-wide text-slate-400 uppercase">{c.icon}{c.label}</div>
              <div className="text-lg font-semibold">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <div className="bg-panel/60 rounded-xl border border-slate-800 p-4 flex flex-col gap-4">
          <h2 className="text-sm font-semibold tracking-wide">Alta de usuarios</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendUsers}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', fontSize:12 }} />
                <Line type="monotone" strokeWidth={2} stroke="#2563eb" dataKey="value" dot={{ r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-panel/60 rounded-xl border border-slate-800 p-4 flex flex-col gap-4">
          <h2 className="text-sm font-semibold tracking-wide">Actividad de publicaciones</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendPosts}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', fontSize:12 }} />
                <Bar dataKey="blog" stackId="a" fill="#2563eb" radius={[4,4,0,0]} />
                <Bar dataKey="social" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
