import React from 'react';
import useAuthStore from '../store/authStore.js';
import { Sun, Moon, Bell } from 'lucide-react';

export default function Topbar(){
  const { user } = useAuthStore();
  const [dark,setDark] = React.useState(true);
  React.useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark);
  },[dark]);
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="text-sm font-semibold tracking-wide">Panel de Control</div>
      <div className="flex items-center gap-4">
        <button onClick={()=>setDark(d=>!d)} className="p-2 rounded hover:bg-slate-700/40" title="Tema">
          {dark? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
        </button>
        <button className="relative p-2 rounded hover:bg-slate-700/40" title="Notificaciones">
          <Bell className="w-4 h-4"/>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full" />
        </button>
        <div className="text-xs text-slate-300 font-medium">{user?.name}</div>
      </div>
    </header>
  );
}
