import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';

export function AIAssistantView() {
  const [query, setQuery] = useState('');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full border border-slate-100 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">AI Assistant</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Intelligence</p>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-50 rounded-2xl p-6 mb-4 overflow-y-auto border border-slate-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white shrink-0 mt-1">
            <Bot size={16} />
          </div>
          <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600">
            Hola, soy tu asistente de Workspace. Puedo buscar información en tus notas, documentos e ideas. ¿En qué te puedo ayudar hoy?
          </div>
        </div>
      </div>

      <div className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pregúntame sobre tus documentos, notas o ideas..."
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-blue/30 hover:scale-105 transition-transform">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
