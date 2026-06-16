import React, { useState } from 'react';
import { Search, FileText, Files, Lightbulb, Loader2, Calendar, Eye, Tag, X, Clock, ArrowRight } from 'lucide-react';
import { useWorkspaceSearch } from './hooks/useWorkspaceSearch';
import { motion, AnimatePresence } from 'motion/react';

type FilterType = 'all' | 'notes' | 'documents' | 'ideas';

export function SearchView() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<'note' | 'document' | 'idea' | null>(null);

  const { results, isLoading } = useWorkspaceSearch(query);

  const handleClear = () => {
    setQuery('');
    setSelectedItem(null);
    setSelectedType(null);
  };

  const getResultsCount = (type: FilterType) => {
    if (!results) return 0;
    switch (type) {
      case 'notes': return results.notes?.length || 0;
      case 'documents': return results.documents?.length || 0;
      case 'ideas': return results.ideas?.length || 0;
      case 'all':
        return (results.notes?.length || 0) + 
               (results.documents?.length || 0) + 
               (results.ideas?.length || 0);
    }
  };

  const getFilteredList = () => {
    if (!results) return [];
    
    const notesList = (results.notes || []).map((item: any) => ({ ...item, _type: 'note' as const }));
    const docsList = (results.documents || []).map((item: any) => ({ ...item, _type: 'document' as const }));
    const ideasList = (results.ideas || []).map((item: any) => ({ ...item, _type: 'idea' as const }));

    switch (activeFilter) {
      case 'notes': return notesList;
      case 'documents': return docsList;
      case 'ideas': return ideasList;
      case 'all':
        return [...notesList, ...docsList, ...ideasList].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  };

  // Helper function to highlight matches
  const highlightText = (text: string | null | undefined, term: string) => {
    if (!text) return '';
    if (!term.trim()) return text;
    
    const parts = text.split(new RegExp(`(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={index} className="bg-brand-blue/15 text-brand-blue font-extrabold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const filteredItems = getFilteredList();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full border border-slate-100 flex flex-col relative min-h-[500px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-800">Búsqueda Unificada</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encuentra notas, documentos e ideas al instante</p>
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe para buscar en tu espacio de trabajo..."
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-14 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all font-bold text-slate-700 shadow-inner"
        />
        {query && (
          <button 
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tabs and Counts */}
      {query.length > 2 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {([
            { id: 'all', label: 'Todos', color: 'text-brand-blue bg-brand-blue/5' },
            { id: 'notes', label: 'Notas', color: 'text-blue-600 bg-blue-50' },
            { id: 'documents', label: 'Documentos', color: 'text-emerald-600 bg-emerald-50' },
            { id: 'ideas', label: 'Ideas', color: 'text-amber-600 bg-amber-50' },
          ] as const).map((tab) => {
            const count = getResultsCount(tab.id);
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  setSelectedItem(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? `${tab.color} border border-transparent shadow-sm ring-1 ring-black/5` 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/60' : 'bg-slate-200 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Results Container */}
      <div className="flex-1 flex overflow-hidden min-h-0 gap-6">
        {/* Results List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
              <p className="text-xs font-black uppercase tracking-widest">Escaneando tu base de conocimientos...</p>
            </div>
          ) : query.length <= 2 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Search size={48} className="text-slate-200 mb-3" />
              <p className="text-sm font-extrabold text-slate-500">Ingresa al menos 3 caracteres</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 max-w-xs">
                Buscaremos de forma simultánea en tus notas personales, documentos indexados e ideas de negocio.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Search size={48} className="text-slate-200 mb-3" />
              <p className="text-sm font-extrabold text-slate-500">No encontramos coincidencias</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Intenta con otros términos o comprueba que no haya errores de escritura.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item: any) => {
                const isNote = item._type === 'note';
                const isDoc = item._type === 'document';
                const isIdea = item._type === 'idea';

                let icon = <FileText size={18} />;
                let colorClass = 'bg-blue-50 text-blue-500 border-blue-100';
                let typeLabel = 'Nota';
                let description = item.content || 'Sin contenido...';

                if (isDoc) {
                  icon = <Files size={18} />;
                  colorClass = 'bg-emerald-50 text-emerald-500 border-emerald-100';
                  typeLabel = 'Documento';
                  description = item.description || `Ubicación: ${item.filePath}`;
                } else if (isIdea) {
                  icon = <Lightbulb size={18} />;
                  colorClass = 'bg-amber-50 text-amber-500 border-amber-100';
                  typeLabel = 'Idea';
                  description = item.description || `Estado: ${item.status}`;
                }

                const isSelected = selectedItem?.id === item.id;

                return (
                  <motion.div
                    layoutId={`search-item-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setSelectedType(item._type);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                      isSelected 
                        ? 'border-brand-blue bg-blue-50/5 shadow-md ring-1 ring-brand-blue/5' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${colorClass} shrink-0`}>
                          {icon}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-700 text-sm line-clamp-1">
                            {highlightText(item.title, query)}
                          </h4>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {typeLabel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        <Calendar size={10} />
                        {new Date(item.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed pl-10">
                      {highlightText(description, query)}
                    </p>

                    {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pl-10">
                        {item.tags.map((tag: string, index: number) => (
                          <span key={index} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Tag size={8} />
                            {highlightText(tag, query)}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Preview Sidebar */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '380px' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="border-l border-slate-100 pl-6 flex flex-col h-full overflow-hidden shrink-0 hidden md:flex"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Detalles del Elemento
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-6">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 ${
                    selectedType === 'note' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    selectedType === 'document' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {selectedType === 'note' ? <FileText size={11} /> :
                     selectedType === 'document' ? <Files size={11} /> :
                     <Lightbulb size={11} />}
                    {selectedType === 'note' ? 'Nota' :
                     selectedType === 'document' ? 'Documento' :
                     'Idea'}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
                    {selectedItem.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Metadata fields */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Clock size={14} />
                    <span>Última modificación:</span>
                    <span className="text-slate-600">
                      {new Date(selectedItem.updatedAt).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {selectedType === 'document' && (
                    <>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">Tipo de Archivo:</span>
                          <span className="text-slate-600 font-extrabold uppercase">{selectedItem.fileType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">Ruta del Archivo:</span>
                          <span className="text-slate-600 font-mono break-all">{selectedItem.filePath}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedType === 'idea' && (
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl text-xs font-bold">
                        Estado: {selectedItem.status}
                      </span>
                      {selectedItem.priority && (
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold">
                          Prioridad: {selectedItem.priority}
                        </span>
                      )}
                      {selectedItem.category && (
                        <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold">
                          Categoría: {selectedItem.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Contenido / Descripción
                  </span>
                  <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                    {selectedType === 'note' ? selectedItem.content : selectedItem.description || 'Sin descripción.'}
                  </div>
                </div>

                {selectedItem.tags && Array.isArray(selectedItem.tags) && selectedItem.tags.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Etiquetas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.tags.map((tag: string, index: number) => (
                        <span key={index} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-slate-200">
                          <Tag size={10} className="text-slate-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
