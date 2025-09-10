import React from 'react';
export default function Settings(){
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Ajustes</h1>
      <div className="bg-panel/60 border border-slate-800 rounded-xl p-6 text-sm">
        <p className="text-slate-300">Zona para configuración avanzada (roles, tokens API, límites de rate, integraciones externas, etc.).</p>
      </div>
    </div>
  );
}
