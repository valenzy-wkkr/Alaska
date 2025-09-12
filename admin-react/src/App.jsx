import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import Users from './components/pages/Users.jsx';
import Pets from './components/pages/Pets.jsx';
import Appointments from './components/pages/Appointments.jsx';
import Blog from './components/pages/Blog.jsx';
import SocialModeration from './components/pages/SocialModeration.jsx';
import Settings from './components/pages/Settings.jsx';
import Login from './components/pages/Login.jsx';
import useAuthStore from './store/authStore.js';

function Protected({ children }) {
  const { token } = useAuthStore();
  const loc = useLocation();
  if(!token) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

export default function App(){
  const { role, token } = useAuthStore();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <Protected>
          <div className="flex h-screen overflow-hidden">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 overflow-y-auto px-6 py-6 bg-slate-950/60">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/pets" element={<Pets />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/social" element={<SocialModeration />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Protected>
      } />
    </Routes>
  );
}
