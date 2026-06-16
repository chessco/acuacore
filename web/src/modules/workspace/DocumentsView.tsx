import React from 'react';

export function DocumentsView() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full border border-slate-100 flex flex-col items-center justify-center text-slate-400">
      <div className="w-24 h-24 mb-4 rounded-full bg-slate-50 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Repositorio de Documentos</h2>
      <p className="max-w-md text-center">Sube documentos para analizarlos con IA, generar embeddings y extraer conocimiento automáticamente.</p>
      <button className="mt-6 px-6 py-2 bg-brand-blue text-white rounded-full font-bold shadow-lg shadow-brand-blue/30 hover:shadow-brand-blue/50 transition-all">
        Subir Documento
      </button>
    </div>
  );
}
