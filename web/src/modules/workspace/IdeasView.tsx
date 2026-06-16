import React, { useState } from 'react';
import { Lightbulb, Plus, Trash2, Calendar, Loader2, X, AlertCircle } from 'lucide-react';
import { useWorkspaceIdeas } from './hooks/useWorkspaceIdeas';

type IdeaStatus = 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'IMPLEMENTED';

export function IdeasView() {
  const { ideas, isLoading, createIdea, updateIdea, deleteIdea } = useWorkspaceIdeas();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IdeaStatus>('DRAFT');
  const [priority, setPriority] = useState('MEDIA');
  const [category, setCategory] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Drag and Drop State
  const [draggedIdeaId, setDraggedIdeaId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedIdeaId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStatus: IdeaStatus) => {
    if (!draggedIdeaId) return;
    try {
      await updateIdea.mutateAsync({ id: draggedIdeaId, status: targetStatus });
    } catch (err) {
      console.error('Error al actualizar estado de la idea:', err);
    }
    setDraggedIdeaId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('El título es requerido');
      return;
    }

    try {
      await createIdea.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        category: category.trim() || undefined,
      });
      
      // Reset Form & Close Modal
      setTitle('');
      setDescription('');
      setStatus('DRAFT');
      setPriority('MEDIA');
      setCategory('');
      setErrorMsg('');
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error al guardar la idea');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta idea?')) {
      try {
        await deleteIdea.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'ALTA':
        return 'bg-rose-500 text-white';
      case 'MEDIA':
        return 'bg-amber-500 text-white';
      case 'BAJA':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const getColumnHeaderColor = (colStatus: IdeaStatus) => {
    switch (colStatus) {
      case 'DRAFT':
        return 'border-t-purple-500 bg-purple-50/50';
      case 'ACTIVE':
        return 'border-t-blue-500 bg-blue-50/50';
      case 'IN_REVIEW':
        return 'border-t-amber-500 bg-amber-50/50';
      case 'IMPLEMENTED':
        return 'border-t-emerald-500 bg-emerald-50/50';
    }
  };

  const getColumnName = (colStatus: IdeaStatus) => {
    switch (colStatus) {
      case 'DRAFT':
        return 'Borrador';
      case 'ACTIVE':
        return 'Activa';
      case 'IN_REVIEW':
        return 'En Revisión';
      case 'IMPLEMENTED':
        return 'Implementada';
    }
  };

  // Group ideas by status
  const groupedIdeas = {
    DRAFT: ideas ? ideas.filter((i: any) => i.status === 'DRAFT') : [],
    ACTIVE: ideas ? ideas.filter((i: any) => i.status === 'ACTIVE') : [],
    IN_REVIEW: ideas ? ideas.filter((i: any) => i.status === 'IN_REVIEW') : [],
    IMPLEMENTED: ideas ? ideas.filter((i: any) => i.status === 'IMPLEMENTED') : [],
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full border border-slate-100 flex flex-col min-h-[600px] relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Lightbulb size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Lluvia de Ideas</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm text-sm"
        >
          <Plus size={16} />
          Nueva Idea
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        {(['DRAFT', 'ACTIVE', 'IN_REVIEW', 'IMPLEMENTED'] as IdeaStatus[]).map((colStatus) => (
          <div
            key={colStatus}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(colStatus)}
            className={`rounded-2xl border-t-4 border border-x-slate-100 border-b-slate-100 p-4 flex flex-col h-[500px] overflow-hidden ${getColumnHeaderColor(
              colStatus
            )}`}
          >
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-extrabold text-slate-700 text-sm">{getColumnName(colStatus)}</h3>
              <span className="text-xs px-2 py-0.5 bg-slate-200/60 text-slate-600 rounded-full font-bold">
                {groupedIdeas[colStatus]?.length || 0}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <Loader2 className="animate-spin text-slate-400" size={20} />
                </div>
              ) : groupedIdeas[colStatus]?.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-slate-200/60 rounded-xl text-center text-slate-400/80 text-xs font-semibold">
                  Arrastra ideas aquí
                </div>
              ) : (
                groupedIdeas[colStatus]?.map((idea: any) => (
                  <div
                    key={idea.id}
                    draggable
                    onDragStart={() => handleDragStart(idea.id)}
                    className="p-4 rounded-xl border border-slate-100 bg-white hover:border-brand-blue/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative flex flex-col"
                  >
                    <button
                      onClick={(e) => handleDelete(idea.id, e)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50"
                      title="Eliminar idea"
                    >
                      <Trash2 size={12} />
                    </button>

                    <h4 className="font-bold text-slate-800 text-xs line-clamp-1 pr-5">{idea.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1 mb-3">
                      {idea.description || 'Sin descripción...'}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {idea.priority && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black tracking-wider ${getPriorityColor(idea.priority)}`}>
                            {idea.priority}
                          </span>
                        )}
                        {idea.category && (
                          <span className="text-[8px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full font-bold truncate">
                            {idea.category}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0 ml-1">
                        {new Date(idea.updatedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - New Idea */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-amber-500" />
              Proponer Nueva Idea
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Título de la Idea</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm text-slate-700"
                  placeholder="Ej. Automatización de alimentación"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm text-slate-700 h-24 resize-none"
                  placeholder="Explica tu idea detalladamente..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Prioridad</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm text-slate-700"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Estado Inicial</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm text-slate-700"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="ACTIVE">Activa</option>
                    <option value="IN_REVIEW">En Revisión</option>
                    <option value="IMPLEMENTED">Implementada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm text-slate-700"
                  placeholder="Ej. Alimento, Sensores, SOP"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={50}
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-500 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createIdea.isPending}
                  className="px-5 py-2 bg-brand-blue text-white rounded-xl hover:bg-blue-600 text-sm font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  {createIdea.isPending && <Loader2 size={14} className="animate-spin" />}
                  <span>Registrar Idea</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
