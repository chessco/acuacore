import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Eye, Settings, Layout, MessageSquare, Zap, ChevronRight, Plus, Trash2, BookOpen, BarChart3, Star, Layers, Wand2 } from 'lucide-react';
import axios from 'axios';
import { useTenant } from '../../../contexts/TenantContext';

const scrollbarStyle = `
  .premium-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .premium-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .premium-scrollbar::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
  }
  .premium-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #CBD5E1;
  }
`;

export const CapsuleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTenant, flowApiKey } = useTenant();
  const [capsule, setCapsule] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'ai' | 'preview'>('content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [availableKBs, setAvailableKBs] = useState<any[]>([]);

  useEffect(() => {
    const fetchKBs = async () => {
      try {
        const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/knowledge-base', {
          headers: {
            'x-tenant-id': selectedTenant?.id || '',
            'x-api-key': flowApiKey,
          }
        });
        setAvailableKBs(res.data);
      } catch (err) {
        console.error('Error fetching KBs:', err);
      }
    };
    if (selectedTenant) fetchKBs();
  }, [selectedTenant, flowApiKey]);

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const res = await axios.get(`http://localhost:3014/api/capsule-studio/capsules/${id}`, {
          headers: {
            'x-tenant-id': selectedTenant?.id || '',
            'x-api-key': flowApiKey,
          }
        });
        const data = res.data;
        if (!data.contentBlocks || !Array.isArray(data.contentBlocks)) {
          data.contentBlocks = [];
        }
        setCapsule(data);
      } catch (err) {
        console.error('Error fetching capsule:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id && selectedTenant) fetchCapsule();
  }, [id, selectedTenant, flowApiKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sanitize data: remove relational fields that Prisma can't handle in update
      const { agent, tenant, _count, id: _id, createdAt, updatedAt, ...updatableData } = capsule;
      
      await axios.patch(`http://localhost:3014/api/capsule-studio/capsules/${id}`, updatableData, {
        headers: {
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey,
        }
      });
      // Force preview refresh
      setPreviewKey(prev => prev + 1);
    } catch (err) {
      console.error('Error saving capsule:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateSpec = (idx: number, field: string, value: string) => {
    const newBlocks = [...capsule.contentBlocks];
    const specBlock = newBlocks.find(b => b.type === 'technical_specs');
    if (specBlock) {
      specBlock.items[idx] = { ...specBlock.items[idx], [field]: value };
      setCapsule({ ...capsule, contentBlocks: newBlocks });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 font-medium">Cargando editor...</div>;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <style>{scrollbarStyle}</style>
      {/* Header */}
      <header className="h-20 border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/app/capsules')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="h-8 w-px bg-slate-100" />
          <div className="space-y-0.5">
            <h1 className="text-lg font-black text-[#001A41]">{capsule.title}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editando Cápsula • {capsule.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'content' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Layout size={14} /> Contenido
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <MessageSquare size={14} /> Configuración IA
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Eye size={14} /> Vista Previa
            </button>
          </div>
          <div className="h-8 w-px bg-slate-100 mx-2" />
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className={`w-[450px] border-r border-slate-100 overflow-y-auto p-8 space-y-10 premium-scrollbar ${activeTab === 'preview' ? 'hidden' : 'block'}`}>
          {activeTab === 'content' ? (
            <>
              <div className="space-y-6">
                <h3 className="text-sm font-black text-[#001A41] uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
                  <Layout size={16} className="text-blue-600" /> Sección Hero
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Título Principal (Headline)</label>
                    <textarea 
                      value={capsule.title} 
                      onChange={(e) => setCapsule({...capsule, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Descripción Corta</label>
                    <textarea 
                      value={capsule.description} 
                      onChange={(e) => setCapsule({...capsule, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                <h3 className="text-sm font-black text-[#001A41] uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><BookOpen size={16} className="text-blue-600" /> Explicación Profunda</span>
                  {!capsule.contentBlocks?.find((b: any) => b.type === 'deep_explanation') && (
                    <button 
                      onClick={() => {
                        const newBlocks = [...(capsule.contentBlocks || [])];
                        newBlocks.push({
                          type: 'deep_explanation',
                          data: {
                            title: "", subtitle: "", description: "",
                            levels: [
                              { title: "Nutrición Funcional", content: "", result: "" },
                              { title: "Fortalecimiento Fisiológico", content: "", result: "" },
                              { title: "Estabilidad del Ecosistema", content: "", result: "" }
                            ],
                            application: "", business_impact: "", differentiation: "",
                            strategic_impacts: [
                              { title: "Optimización del FCA", description: "" },
                              { title: "Aceleración de Ciclos", description: "" },
                              { title: "Mitigación de Riesgos", description: "" },
                              { title: "Previsibilidad Neta", description: "" }
                            ]
                          }
                        });
                        setCapsule({ ...capsule, contentBlocks: newBlocks });
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </h3>
                
                {capsule.contentBlocks?.find((b: any) => b.type === 'deep_explanation') && (
                  <div className="space-y-4">
                    {(() => {
                      const block = capsule.contentBlocks.find((b: any) => b.type === 'deep_explanation');
                      const updateDeepField = (field: string, value: any) => {
                        const newBlocks = [...capsule.contentBlocks];
                        const bIdx = newBlocks.findIndex(b => b.type === 'deep_explanation');
                        if (bIdx === -1) return;
                        
                        newBlocks[bIdx] = { 
                          ...newBlocks[bIdx], 
                          data: { ...newBlocks[bIdx].data, [field]: value } 
                        };
                        setCapsule({ ...capsule, contentBlocks: newBlocks });
                      };

                      return (
                        <div className="space-y-8">
                          {/* Superiority Section Editor */}
                          <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Star size={12} className="text-blue-600" /> Diferenciación Superior
                            </h4>
                            <div className="space-y-3 p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Título de la Sección</label>
                                <input 
                                  value={block.data.superiority_title || "Por qué esta solución es superior"}
                                  onChange={(e) => updateDeepField('superiority_title', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-black text-[#001A41] uppercase tracking-widest focus:outline-none"
                                />
                              </div>
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Subtítulo de la Tarjeta</label>
                                  <input 
                                    value={block.data.superiority_item_title || "Diferenciación Técnica"}
                                    onChange={(e) => updateDeepField('superiority_item_title', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-[#001A41] uppercase tracking-widest focus:outline-none"
                                    placeholder="Ej: Diferenciación Técnica"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Contenido Principal (Cuerpo)</label>
                                  <textarea 
                                    value={block.data.differentiation} 
                                    onChange={(e) => updateDeepField('differentiation', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 focus:outline-none min-h-[80px]"
                                    placeholder="Ej: Detección temprana de estresores..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Value Layers Editor (3 Levels) */}
                          <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Layers size={12} className="text-blue-600" /> Capas de Valor (3 Niveles)
                            </h4>
                            <div className="grid gap-4">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 group">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center text-[10px] font-bold shadow-sm">
                                      {i + 1}
                                    </div>
                                    <input 
                                      value={block.data.levels?.[i]?.title || ''}
                                      onChange={(e) => {
                                        const levels = [...(block.data.levels || [{}, {}, {}])];
                                        levels[i] = { ...levels[i], title: e.target.value };
                                        updateDeepField('levels', levels);
                                      }}
                                      className="w-full bg-transparent border-none text-[11px] font-black text-[#001A41] uppercase tracking-widest focus:ring-0 p-0"
                                      placeholder={`Título Nivel ${i + 1}`}
                                    />
                                  </div>
                                  <input 
                                    value={block.data.levels?.[i]?.subtitle || ''}
                                    onChange={(e) => {
                                      const levels = [...(block.data.levels || [{}, {}, {}])];
                                      levels[i] = { ...levels[i], subtitle: e.target.value };
                                      updateDeepField('levels', levels);
                                    }}
                                    className="w-full bg-transparent border-none text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] focus:ring-0 p-0"
                                    placeholder="Subtítulo (ej: Optimización Dinámica)"
                                  />
                                  <textarea 
                                    value={block.data.levels?.[i]?.content || ''}
                                    onChange={(e) => {
                                      const levels = [...(block.data.levels || [{}, {}, {}])];
                                      levels[i] = { ...levels[i], content: e.target.value };
                                      updateDeepField('levels', levels);
                                    }}
                                    className="w-full bg-transparent border-none text-[11px] font-medium text-slate-500 focus:ring-0 p-0 resize-none min-h-[40px] premium-scrollbar"
                                    placeholder={`Descripción del nivel ${i + 1}...`}
                                  />
                                  <div className="pt-2 border-t border-slate-200/50">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tags (Separados por coma)</label>
                                      <button 
                                        onClick={() => {
                                          const t = (block.data.levels?.[i]?.title || "").toLowerCase();
                                          let suggestions = ["ACUACORE PRO", "OPTIMIZACIÓN"];
                                          if (t.includes('nutrición') || t.includes('funcional')) suggestions = ["INMUNIDAD", "FCR OPTIMO", "BIO-SEGURIDAD"];
                                          else if (t.includes('metabólico') || t.includes('crecimiento')) suggestions = ["CRECIMIENTO", "VITALIDAD", "MAX POTENCIAL"];
                                          else if (t.includes('salud') || t.includes('supervivencia') || t.includes('protección')) suggestions = ["RESILIENCIA", "BIORREMEDIACIÓN", "CALIDAD AGUA"];
                                          
                                          const levels = [...(block.data.levels || [{}, {}, {}])];
                                          levels[i] = { ...levels[i], tags: suggestions };
                                          updateDeepField('levels', levels);
                                        }}
                                        className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-2 py-0.5 rounded-md"
                                      >
                                        <Wand2 size={10} /> Sugerir con IA
                                      </button>
                                    </div>
                                    <input 
                                      value={block.data.levels?.[i]?.tags?.join(', ') || ''}
                                      onChange={(e) => {
                                        const levels = [...(block.data.levels || [{}, {}, {}])];
                                        levels[i] = { ...levels[i], tags: e.target.value.split(',').map(t => t.trim()) };
                                        updateDeepField('levels', levels);
                                      }}
                                      className="w-full bg-transparent border-none text-[9px] font-bold text-blue-600 uppercase tracking-widest focus:ring-0 p-0"
                                      placeholder="Tags (separados por coma)"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Título del Bloque</label>
                            <input 
                              type="text" 
                              value={block.data.title} 
                              onChange={(e) => updateDeepField('title', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                              placeholder="Ej: Cómo funciona la optimización..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Impacto en el Negocio (Cuerpo)</label>
                            <textarea 
                              value={block.data.business_impact} 
                              onChange={(e) => updateDeepField('business_impact', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none min-h-[120px] premium-scrollbar"
                              placeholder="Usa [cols] y [/cols] para columnas..."
                            />
                          </div>

                          {/* Strategic Pillars Editor inside Deep Explanation */}
                          <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <BarChart3 size={12} /> Pilares Estratégicos (Grid)
                            </h4>
                            <div className="grid gap-4">
                              {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                  <input 
                                    value={block.data.strategic_impacts?.[i]?.title || ''}
                                    onChange={(e) => {
                                      const impacts = [...(block.data.strategic_impacts || [{}, {}, {}, {}])];
                                      impacts[i] = { ...impacts[i], title: e.target.value };
                                      updateDeepField('strategic_impacts', impacts);
                                    }}
                                    className="w-full bg-transparent border-none text-[10px] font-black text-[#001A41] uppercase tracking-widest focus:ring-0 p-0"
                                    placeholder={`Título Pilar ${i + 1}`}
                                  />
                                  <textarea 
                                    value={block.data.strategic_impacts?.[i]?.description || ''}
                                    onChange={(e) => {
                                      const impacts = [...(block.data.strategic_impacts || [{}, {}, {}, {}])];
                                      impacts[i] = { ...impacts[i], description: e.target.value };
                                      updateDeepField('strategic_impacts', impacts);
                                    }}
                                    className="w-full bg-transparent border-none text-[10px] font-medium text-slate-500 focus:ring-0 p-0 resize-none"
                                    placeholder={`Descripción ${i + 1}...`}
                                    rows={2}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <button 
                              onClick={() => {
                                const newBlocks = capsule.contentBlocks.filter((b: any) => b.type !== 'deep_explanation');
                                setCapsule({ ...capsule, contentBlocks: newBlocks });
                              }}
                              className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 hover:text-red-600"
                            >
                              <Trash2 size={12} /> Eliminar Bloque
                            </button>
                          </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="space-y-6 pt-6">
                <h3 className="text-sm font-black text-[#001A41] uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Zap size={16} className="text-blue-600" /> Especificaciones Técnicas</span>
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Plus size={16} />
                  </button>
                </h3>
                <div className="space-y-4">
                  {(capsule.contentBlocks?.find((b: any) => b.type === 'technical_specs')?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                      <button className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => updateSpec(idx, 'name', e.target.value)}
                        className="w-full bg-transparent font-black text-sm text-[#001A41] focus:outline-none"
                        placeholder="Nombre de la especie/componente"
                      />
                      <textarea 
                        value={item.details} 
                        onChange={(e) => updateSpec(idx, 'details', e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-500 font-medium focus:outline-none min-h-[60px]"
                        placeholder="Detalles técnicos..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-[#001A41] uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-600" /> Comportamiento de IA
                </h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Settings size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#001A41]">Configuración del Agente Experto</div>
                          <div className="text-[10px] font-bold text-blue-600 uppercase">Personaliza la identidad del IA</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Nombre del Experto</label>
                          <input 
                            type="text" 
                            value={capsule.promptConfig?.agentName || ''} 
                            onChange={(e) => setCapsule({ 
                              ...capsule, 
                              promptConfig: { ...capsule.promptConfig, agentName: e.target.value } 
                            })}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            placeholder="Ej: Don Juan Camarón"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Mensaje de Bienvenida</label>
                          <textarea 
                            value={capsule.promptConfig?.agentGreeting || ''} 
                            onChange={(e) => setCapsule({ 
                              ...capsule, 
                              promptConfig: { ...capsule.promptConfig, agentGreeting: e.target.value } 
                            })}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px]"
                            placeholder="Ej: ¡Hola! Soy Don Juan, experto en cultivo..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-50">
                      <h3 className="text-sm font-black text-[#001A41] uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-600" /> Vinculación de Conocimiento
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Selecciona los documentos que alimentan esta cápsula</p>
                      <div className="space-y-3">
                        {availableKBs.filter(kb => kb.status === 'ACTIVE').map(kb => (
                          <div key={kb.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer" onClick={() => {
                            const currentIds = capsule.knowledgeIds || [];
                            let newIds;
                            if (currentIds.includes(kb.id)) {
                              newIds = currentIds.filter((id: string) => id !== kb.id);
                            } else {
                              newIds = [...currentIds, kb.id];
                            }
                            setCapsule({ ...capsule, knowledgeIds: newIds });
                          }}>
                            <input 
                              type="checkbox"
                              checked={capsule.knowledgeIds?.includes(kb.id)}
                              readOnly
                              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-bold text-slate-700">{kb.title}</div>
                              <div className={`text-[9px] font-black uppercase tracking-widest ${kb.status === 'ACTIVE' ? 'text-green-500' : 'text-slate-400'}`}>
                                {kb.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Instrucciones Adicionales (Prompt Overrides)</label>
                      <textarea 
                        value={capsule.promptConfig?.extraInstructions || ''}
                        onChange={(e) => setCapsule({ 
                          ...capsule, 
                          promptConfig: { ...capsule.promptConfig, extraInstructions: e.target.value } 
                        })}
                        placeholder="Ej: Prioriza hablar sobre la reducción de mortalidad en larvas..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[150px]"
                      />
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-slate-100 relative p-8">
          <div className="absolute inset-0 overflow-auto flex justify-center p-8 premium-scrollbar">
            <div className={`bg-white shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 ${activeTab === 'preview' ? 'w-full max-w-7xl' : 'w-full max-w-4xl opacity-50'}`}>
              <iframe 
                key={previewKey}
                src={`/capsules/${capsule.slug}?preview=true`} 
                className="w-full h-full border-none"
                style={{ height: 'calc(100vh - 100px)' }}
                title="Capsule Preview"
              />
            </div>
          </div>
          
          {activeTab !== 'preview' && (
            <div className="absolute bottom-12 right-12 bg-[#001A41] text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <Eye size={16} /> Vista Previa en Tiempo Real
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

