import React, { useState, useEffect } from 'react';
import { Save, Loader2, Check, Plus, Trash2, FileText, Calendar } from 'lucide-react';
import { useWorkspaceNotes } from './hooks/useWorkspaceNotes';

export function NotesView() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { notes, createNote, updateNote, deleteNote } = useWorkspaceNotes();

  // Load the most recent note by default if no note is selected
  useEffect(() => {
    if (notes && notes.length > 0 && !currentNoteId) {
      const sortedNotes = [...notes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const latestNote = sortedNotes[0];
      setCurrentNoteId(latestNote.id);
      setTitle(latestNote.title || '');
      setContent(latestNote.content || '');
    }
  }, [notes, currentNoteId]);

  const handleNewNote = () => {
    setCurrentNoteId(null);
    setTitle('');
    setContent('');
  };

  const handleSelectNote = (note: any) => {
    setCurrentNoteId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
  };

  const handleSave = async () => {
    const finalTitle = title.trim() || `Nota - ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
    
    try {
      if (currentNoteId) {
        await updateNote.mutateAsync({
          id: currentNoteId,
          title: finalTitle,
          content,
        });
      } else {
        const newNote = await createNote.mutateAsync({
          title: finalTitle,
          content,
        });
        setCurrentNoteId(newNote?.id);
        setTitle(newNote?.title || finalTitle);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection
    if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      try {
        await deleteNote.mutateAsync(id);
        if (currentNoteId === id) {
          handleNewNote();
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const isSaving = createNote.isPending || updateNote.isPending;
  const sortedNotesList = notes
    ? [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];

  return (
    <div className="bg-white rounded-3xl shadow-xl h-full flex overflow-hidden border border-slate-100 min-h-[500px]">
      {/* Sidebar - Notes List */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <FileText size={18} className="text-brand-blue" />
            Mis Notas
          </h3>
          <button
            onClick={handleNewNote}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus size={14} />
            Nueva
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {sortedNotesList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FileText size={36} className="text-slate-200 mb-2" />
              <p className="text-xs font-semibold">No hay notas creadas aún.</p>
            </div>
          ) : (
            sortedNotesList.map((note) => {
              const isSelected = currentNoteId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative group flex flex-col ${
                    isSelected
                      ? 'bg-white border-brand-blue/30 shadow-md ring-1 ring-brand-blue/5'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-100/50 bg-white/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 pr-6">
                    <span className={`font-bold text-sm line-clamp-1 ${isSelected ? 'text-brand-blue' : 'text-slate-700'}`}>
                      {note.title || 'Nota sin título'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50"
                      title="Eliminar nota"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-2">
                    {note.content || 'Sin contenido...'}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Calendar size={10} />
                    {new Date(note.updatedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {currentNoteId ? 'Editando Nota' : 'Creando Nueva Nota'}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : showSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>{isSaving ? 'Guardando...' : showSuccess ? 'Guardado' : 'Guardar'}</span>
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4">
          <input
            type="text"
            className="w-full text-2xl font-black text-slate-800 border-b border-transparent focus:border-slate-200 outline-none pb-2 transition-all"
            placeholder="Título de la nota..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="flex-1 w-full p-4 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none resize-none custom-scrollbar text-slate-700 leading-relaxed text-sm bg-slate-50/30"
            placeholder="Escribe tus notas aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
