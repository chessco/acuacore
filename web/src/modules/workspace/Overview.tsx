import React from 'react';
import { FileText, Files, Lightbulb } from 'lucide-react';

export function Overview() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-brand-blue to-blue-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Bienvenido a tu Workspace</h1>
          <p className="opacity-90 max-w-lg">Tu centro de conocimiento. Todo lo que guardes aquí será analizado por tu asistente IA para ayudarte a tomar mejores decisiones.</p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Notas Recientes', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { title: 'Últimos Documentos', icon: Files, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { title: 'Ideas Activas', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col h-64">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon size={20} />
              </div>
              <h3 className="font-bold text-slate-800">{item.title}</h3>
            </div>
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest italic">
              Sin elementos recientes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
