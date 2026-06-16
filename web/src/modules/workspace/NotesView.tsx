import React, { useState } from 'react';
import { Save } from 'lucide-react';

export function NotesView() {
  const [content, setContent] = useState('');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full flex flex-col border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-slate-800">Workspace Notes</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-sm">
          <Save size={18} />
          <span>Guardar</span>
        </button>
      </div>
      <textarea
        className="flex-1 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue outline-none resize-none custom-scrollbar"
        placeholder="Escribe tus notas aquí usando Markdown..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
