import React, { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchView() {
  const [query, setQuery] = useState('');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full border border-slate-100 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Búsqueda Unificada</h2>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en notas, documentos e ideas..."
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all font-bold text-slate-700"
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center text-slate-400">
        {query ? (
          <div className="text-center">
            <Search className="mx-auto mb-4 opacity-50" size={48} />
            <p className="text-sm font-bold uppercase tracking-widest">Buscando "{query}"...</p>
          </div>
        ) : (
          <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">Ingresa un término para comenzar</p>
        )}
      </div>
    </div>
  );
}
