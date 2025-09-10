import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Users, PawPrint, CalendarCheck, Newspaper, MessagesSquare, Settings2, BarChart3 } from 'lucide-react';
import useAuthStore from '../store/authStore.js';

const navClasses = ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'}`;

export default function Sidebar({ role }){
  const { logout } = useAuthStore();
  return (
    <aside className="hidden md:flex md:flex-col w-60 bg-slate-900 border-r border-slate-800 p-4 gap-4">
      <div className="flex items-center gap-2 text-primary font-semibold tracking-wide text-lg">
        <ShieldCheck className="w-5 h-5 text-primary" /> Alaska Admin
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        <NavLink to="/" className={navClasses}><BarChart3 className="w-4 h-4"/>Dashboard</NavLink>
        <NavLink to="/users" className={navClasses}><Users className="w-4 h-4"/>Usuarios</NavLink>
        <NavLink to="/pets" className={navClasses}><PawPrint className="w-4 h-4"/>Mascotas</NavLink>
        <NavLink to="/appointments" className={navClasses}><CalendarCheck className="w-4 h-4"/>Citas</NavLink>
        <NavLink to="/blog" className={navClasses}><Newspaper className="w-4 h-4"/>Blog</NavLink>
        <NavLink to="/social" className={navClasses}><MessagesSquare className="w-4 h-4"/>Red Social</NavLink>
        <NavLink to="/settings" className={navClasses}><Settings2 className="w-4 h-4"/>Ajustes</NavLink>
      </nav>
      <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-200">Cerrar sesión</button>
    </aside>
  );
}
