import React, { useState, useEffect } from 'react';
import { Save, Loader2, Check } from 'lucide-react';
import { useWorkspaceNotes } from './hooks/useWorkspaceNotes';

export function NotesView() {
  const [content, setContent] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { notes, createNote, updateNote } = useWorkspaceNotes();

  useEffect(() => {
    if (notes && notes.length > 0 && !currentNoteId) {
      // Load the most recent note by default
      const latestNote = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      setContent(latestNote.content || '');
      setCurrentNoteId(latestNote.id);
    }
  }, [notes, currentNoteId]);

  const handleSave = async () => {
    try {
      if (currentNoteId) {
        await updateNote.mutateAsync({ id: currentNoteId, content });
      } else {
        const newNote = await createNote.mutateAsync({ title: 'General Note', content });
        setCurrentNoteId(newNote?.id);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // React Query v5 uses isPending
  const isSaving = createNote.isPending || updateNote.isPending;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full flex flex-col border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-slate-800">Workspace Notes</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : (showSuccess ? <Check size={18} /> : <Save size={18} />)}
          <span>{isSaving ? 'Guardando...' : (showSuccess ? 'Guardado' : 'Guardar')}</span>
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

