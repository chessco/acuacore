import React, { useState, useRef } from 'react';
import { Files, Upload, Trash2, Calendar, FileText, ExternalLink, Loader2, Check } from 'lucide-react';
import { useWorkspaceDocuments } from './hooks/useWorkspaceDocuments';

export function DocumentsView() {
  const { documents, isLoading, uploadDocument, deleteDocument } = useWorkspaceDocuments();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3014';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg('');
      if (!title) {
        // Pre-fill title with original name minus extension
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Por favor selecciona un archivo primero');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim() || selectedFile.name);
    if (description.trim()) {
      formData.append('description', description.trim());
    }

    try {
      await uploadDocument.mutateAsync(formData);
      setShowSuccess(true);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error al subir el archivo');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      try {
        await deleteDocument.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 font-bold text-xs">PDF</div>;
    }
    if (mimeType.includes('image')) {
      return <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs">IMG</div>;
    }
    if (mimeType.includes('text') || mimeType.includes('markdown')) {
      return <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 font-bold text-xs">TXT</div>;
    }
    return <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><FileText size={20} /></div>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
      {/* Upload Column (1/3) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-brand-blue" />
          Subir Documento
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Drag & Drop File Selector */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              selectedFile 
                ? 'border-brand-blue bg-blue-50/20' 
                : 'border-slate-200 hover:border-brand-blue/50 bg-slate-50/50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <Upload className={`mx-auto mb-2 ${selectedFile ? 'text-brand-blue animate-bounce' : 'text-slate-400'}`} size={28} />
            {selectedFile ? (
              <div>
                <p className="text-xs font-bold text-slate-700 line-clamp-1">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-600">Haz clic para buscar un archivo</p>
                <p className="text-[10px] text-slate-400 mt-1">PDF, TXT o imágenes hasta 10MB</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Título del Documento</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm text-slate-700"
              placeholder="Ej. Reporte Oxígeno Junio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm text-slate-700 h-20 resize-none"
              placeholder="Descripción breve del contenido o utilidad..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-lg border border-red-100">{errorMsg}</p>
          )}

          {showSuccess && (
            <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-1">
              <Check size={14} /> Documento subido y registrado con éxito.
            </p>
          )}

          <button
            type="submit"
            disabled={uploadDocument.isPending}
            className="w-full py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-75"
          >
            {uploadDocument.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Subiendo archivo...</span>
              </>
            ) : (
              <span>Registrar en Workspace</span>
            )}
          </button>
        </form>
      </div>

      {/* List Column (2/3) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 lg:col-span-2 flex flex-col h-[600px]">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Files size={18} className="text-brand-blue" />
          Repositorio de Documentos
        </h3>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="animate-spin text-brand-blue" size={28} />
              <span className="text-sm font-semibold">Cargando repositorio...</span>
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Files size={48} className="text-slate-200 mb-3" />
              <p className="font-bold text-slate-500 text-sm">El repositorio está vacío</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Sube archivos PDF, imágenes o reportes técnicos para centralizar tu conocimiento.</p>
            </div>
          ) : (
            documents.map((doc: any) => (
              <div 
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/80 hover:border-slate-200 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(doc.fileType)}
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm truncate">{doc.title}</h4>
                    <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{doc.description || 'Sin descripción adicional.'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-semibold">
                      <Calendar size={10} />
                      <span>{new Date(doc.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`${API_URL}${doc.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-xl border border-slate-100 hover:border-brand-blue hover:text-brand-blue text-slate-400 shadow-sm transition-all"
                    title="Ver archivo"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-white rounded-xl border border-slate-100 hover:border-red-200 hover:text-red-500 text-slate-400 shadow-sm transition-all"
                    title="Eliminar documento"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
