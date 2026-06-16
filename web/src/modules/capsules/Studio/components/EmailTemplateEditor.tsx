import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Image as ImageIcon, 
  MousePointer2, 
  Minus, 
  Sparkles,
  Wand2,
  ChevronUp,
  ChevronDown,
  Layout,
  LayoutGrid
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import axios from 'axios';

export type EmailBlock = {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'divider' | 'footer';
  content: any;
};

interface EmailTemplateEditorProps {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
  branding: any;
  tenantId?: string;
  apiKey?: string;
  capsuleContext?: any;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ 
  blocks, 
  onChange, 
  branding,
  tenantId,
  apiKey,
  capsuleContext
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'commercial' | 'technical'>('professional');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content: getDefaultContent(type)
    };
    onChange([...blocks, newBlock]);
  };

  const getDefaultContent = (type: EmailBlock['type']) => {
    switch (type) {
      case 'header': return { title: capsuleContext?.title || 'Tu Título Aquí' };
      case 'text': return { text: capsuleContext?.description || 'Escribe el contenido de tu mensaje aquí. Puedes usar la IA para generar textos técnicos o comerciales.' };
      case 'image': return { url: capsuleContext?.imageUrl || branding.heroImage || '/static/assets/hero-acuaequipos.png', alt: capsuleContext?.title || 'Imagen de campaña' };
      case 'button': return { text: 'Explorar Cápsula', url: '#' };
      case 'divider': return {};
      case 'footer': return { text: branding.footerText || '© 2026 Acuaequipos' };
      default: return {};
    }
  };

  const updateBlock = (id: string, newContent: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const generateAiContent = async (id: string, type: string) => {
    setLoading(id);
    try {
      const res = await axios.post(`${apiUrl}/api/ai/generate-campaign-text`, {
        tone: selectedTone,
        capsule: capsuleContext,
        type: type // 'header' or 'text'
      }, {
        headers: { 'x-tenant-id': tenantId || '', 'x-api-key': apiKey || '' }
      });
      
      if (type === 'text') {
        updateBlock(id, { text: res.data.content });
      } else if (type === 'header') {
        updateBlock(id, { title: res.data.subject || res.data.content });
      }
    } catch (err) {
      console.error('AI Error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-6 h-full min-h-0 lg:min-h-[500px]">
      {/* Toolbox */}
      <div className="space-y-4 shrink-0">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bloques</h4>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          {[
            { type: 'header', icon: Layout, label: 'Encabezado' },
            { type: 'text', icon: Type, label: 'Texto' },
            { type: 'image', icon: ImageIcon, label: 'Imagen' },
            { type: 'button', icon: MousePointer2, label: 'Botón CTA' },
            { type: 'divider', icon: Minus, label: 'Divisor' },
          ].map((tool) => (
            <button
              key={tool.type}
              type="button"
              onClick={() => addBlock(tool.type as any)}
              className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group text-left"
            >
              <div className="w-8 h-8 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-lg flex items-center justify-center transition-colors shrink-0">
                <tool.icon size={18} />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-[#001A41]">{tool.label}</span>
            </button>
          ))}
        </div>
        
        <div className="hidden lg:block pt-4 px-2">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sugerencia AI</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    Selecciona un tono en el bloque y usa el botón de IA para redactar con Nano Banana.
                </p>
            </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-slate-100 rounded-[2.5rem] p-4 lg:p-8 overflow-y-auto premium-scrollbar border-4 border-white shadow-inner">
        <Reorder.Group axis="y" values={blocks} onReorder={onChange} className="space-y-4 max-w-2xl mx-auto">
          {blocks.map((block) => (
            <Reorder.Item 
              key={block.id} 
              value={block}
              className="group relative"
            >
              {/* Block Controls (Top Right Overlay) */}
              <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 bg-white/90 backdrop-blur-sm text-slate-300 rounded-lg shadow-sm cursor-grab active:cursor-grabbing border border-slate-100">
                  <GripVertical size={14} />
                </div>
                <button 
                  type="button"
                  onClick={() => removeBlock(block.id)} 
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-red-50 transition-colors border border-slate-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                {block.type === 'header' && (
                  <div className="p-8 text-center space-y-6" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, #0044CC 100%)` }}>
                    <img src={branding.logoUrl?.startsWith('/') ? `${apiUrl}${branding.logoUrl}` : branding.logoUrl} alt="Logo" className="h-8 mx-auto object-contain" />
                    <input 
                      type="text" 
                      value={block.content.title}
                      onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                      className="w-full bg-transparent text-white text-3xl font-black text-center border-none focus:ring-0 placeholder-white/50"
                      placeholder="Título de la Campaña"
                    />
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <div className="flex gap-1 p-1 bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
                        {[
                          { id: 'professional', label: '👔' },
                          { id: 'commercial', label: '🤝' },
                          { id: 'technical', label: '⚙️' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTone(t.id as any)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                              selectedTone === t.id 
                              ? 'bg-white shadow-lg scale-110' 
                              : 'text-white/60 hover:text-white'
                            }`}
                            title={t.id}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <button 
                        type="button"
                        onClick={() => generateAiContent(block.id, 'header')}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg"
                      >
                        {loading === block.id ? (
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : <><Wand2 size={12} /> Optimizar con IA</>}
                      </button>
                    </div>
                  </div>
                )}

                {block.type === 'text' && (
                  <div className="p-8 space-y-4 relative">
                    <textarea 
                      value={block.content.text}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      className="w-full bg-transparent text-slate-600 text-sm leading-relaxed border-none focus:ring-0 min-h-[120px] resize-none"
                      placeholder="Escribe tu mensaje..."
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                        {[
                          { id: 'professional', label: '👔 Prof.' },
                          { id: 'commercial', label: '🤝 Com.' },
                          { id: 'technical', label: '⚙️ Téc.' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTone(t.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${
                              selectedTone === t.id 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <button 
                        type="button"
                        onClick={() => generateAiContent(block.id, 'text')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        {loading === block.id ? (
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : <><Sparkles size={12} /> Redactar con IA</>}
                      </button>
                    </div>
                  </div>
                )}

                {block.type === 'image' && (
                  <div className="relative group/img">
                    <img src={block.content.url?.startsWith('/') ? `${apiUrl}${block.content.url}` : block.content.url} alt={block.content.alt} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                        <input 
                            type="text" 
                            value={block.content.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                            className="flex-1 px-3 py-2 bg-white/90 rounded-lg text-xs border-none focus:ring-2 focus:ring-blue-500"
                            placeholder="URL de la imagen"
                        />
                    </div>
                  </div>
                )}

                {block.type === 'button' && (
                  <div className="p-8 text-center">
                    <div className="inline-flex flex-col gap-4 items-center">
                        <input 
                            type="text" 
                            value={block.content.text}
                            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                            className="px-8 py-4 rounded-xl text-white font-black uppercase text-xs tracking-widest text-center shadow-xl transition-all hover:scale-105 border-none"
                            style={{ backgroundColor: branding.accentColor, boxShadow: `0 10px 20px ${branding.accentColor}33` }}
                        />
                        <input 
                            type="text" 
                            value={block.content.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                            className="bg-slate-50 px-3 py-1 rounded-md text-[9px] font-mono text-slate-400 border-none focus:ring-0 text-center w-full"
                            placeholder="https://link-de-la-capsula.com"
                        />
                    </div>
                  </div>
                )}

                {block.type === 'divider' && (
                  <div className="py-6 px-12">
                    <div className="h-px bg-slate-100 w-full" />
                  </div>
                )}

                {block.type === 'footer' && (
                  <div className="p-8 bg-slate-50 text-center">
                    <textarea 
                        value={block.content.text}
                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                        className="w-full bg-transparent text-slate-400 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-0 text-center resize-none h-12"
                    />
                  </div>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 py-20">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                <LayoutGrid size={40} />
            </div>
            <p className="font-bold text-sm uppercase tracking-widest text-center">Arrastra bloques para empezar</p>
          </div>
        )}

        {blocks.length > 0 && (
          <div className="max-w-2xl mx-auto mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-center opacity-70 pointer-events-none">
            <div className="w-full py-4 px-2 bg-[#001A41] rounded-xl flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-white text-[10px] mb-4">
              <span>🌐 acuaequipos.mx</span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span>📞 (644) 110 2097</span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-[#4ade80] font-bold">💬 WhatsApp</span>
              <span className="text-slate-500 hidden md:inline">|</span>
              <span>✉️ soportecomercial@acuaequipos.mx</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">Recibiste este correo porque estás registrado en nuestra plataforma...</p>
            <span className="text-[10px] text-slate-400 underline">Cancelar mi suscripción (Unsubscribe)</span>
            <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    (Este pie de página se agrega automáticamente por el servidor al enviar)
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
