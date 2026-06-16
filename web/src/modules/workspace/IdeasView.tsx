import React from 'react';

export function IdeasView() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Workspace Ideas</h2>
        <button className="px-4 py-2 bg-brand-blue text-white rounded-xl font-bold shadow-md shadow-brand-blue/30 text-sm">
          Nueva Idea
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['DRAFT', 'ACTIVE', 'IN_REVIEW', 'IMPLEMENTED'].map(status => (
          <div key={status} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-[400px]">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-4">{status}</h3>
            {/* Kanban cards will go here */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm font-bold">
              Arrastra ideas aquí
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
