import React, { useState, useEffect } from 'react';
import { Mail, Plus, Send, Clock, CheckCircle2, X, Search, ChevronRight, BarChart3, Database, Wand2, Zap, Fish, Palette } from 'lucide-react';
import axios from 'axios';
import { useTenant } from '../../../contexts/TenantContext';

export const CampaignManager: React.FC = () => {
  const { selectedTenant, flowApiKey } = useTenant();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: '',
    capsuleId: '',
    subject: '',
    description: '',
    ctaText: 'Explorar Cápsula Interactiva',
    audience: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setHasError(false);
      try {
        const [capsulesRes, campaignsRes] = await Promise.all([
          axios.get('http://localhost:3014/api/capsule-studio/capsules', {
            headers: { 'x-tenant-id': selectedTenant?.id || '', 'x-api-key': flowApiKey }
          }),
          axios.get('http://localhost:3014/api/capsule-studio/campaigns', {
            headers: { 'x-tenant-id': selectedTenant?.id || '', 'x-api-key': flowApiKey }
          })
        ]);
        setCapsules(capsulesRes.data);
        setCampaigns(campaignsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    if (selectedTenant) fetchData();
  }, [selectedTenant, flowApiKey]);

  const handleCapsuleChange = (id: string) => {
    const selected = capsules.find(c => c.id === id);
    if (selected) {
      setCampaignData({
        ...campaignData,
        capsuleId: id,
        name: `Campaña: ${selected.title}`,
        subject: `[Estrategia] ${selected.title}`,
        description: `Hola,\n\nTe envío esta nueva cápsula interactiva sobre "${selected.title}".\n\n${selected.description}\n\nEspero que te sea de gran utilidad para optimizar tu operación.`,
        ctaText: 'Explorar Cápsula Interactiva'
      });
    } else {
      setCampaignData({ ...campaignData, capsuleId: id });
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: campaignData.name,
        capsuleId: campaignData.capsuleId,
        subject: campaignData.subject,
        content: campaignData.description,
        audience: campaignData.audience,
        scheduledAt: new Date()
      };

      const res = await axios.post('http://localhost:3014/api/capsule-studio/campaigns', payload, {
        headers: {
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey,
        }
      });

      setCampaigns([res.data, ...campaigns]);
      setShowCreateModal(false);
      
      // Reset form
      setCampaignData({
        name: '',
        capsuleId: '',
        subject: '',
        description: '',
        ctaText: 'Explorar Cápsula Interactiva',
        audience: ''
      });
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Error al guardar la campaña en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (id: string) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:3014/api/capsule-studio/campaigns/${id}/send`, {}, {
        headers: {
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey,
        }
      });
      alert('¡Campaña enviada con éxito!');
      // Update local state
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, sentAt: new Date() } : c));
      setSelectedCampaign(null);
    } catch (err) {
      console.error('Error sending campaign:', err);
      alert('Error al enviar la campaña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-auto premium-scrollbar">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#001A41]">Campañas de Email</h1>
          <p className="text-slate-500 font-medium">Automatiza la distribución de tus cápsulas.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Nueva Campaña
        </button>
      </div>

      {hasError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
          <X className="bg-red-100 rounded-lg p-1" size={24} />
          Error al conectar con el servidor. Por favor, verifica tu conexión o los permisos del tenant.
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto">
              <Mail size={40} />
            </div>
            <h3 className="text-xl font-black text-[#001A41]">Aún no tienes campañas</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Crea tu primera campaña para enviar cápsulas interactivas a tus productores y generar leads calificados.
            </p>
            <button 
              onClick={() => alert('Guía de campañas: 1. Selecciona una cápsula. 2. Carga tus contactos. 3. Personaliza el mensaje. 4. Envía.')}
              className="text-blue-600 font-black uppercase text-xs tracking-widest mt-4 hover:text-blue-800 transition-colors"
            >
              Aprender cómo crear una campaña
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map(camp => (
            <div 
              key={camp.id} 
              onClick={() => setSelectedCampaign(camp)}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Send size={24} />
                </div>
                <div>
                  <h4 className="font-black text-[#001A41] text-lg">{camp.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} /> Programada: {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleDateString() : 'Pendiente'}
                    </span>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      {camp.sentAt ? 'Enviada' : 'Borrador Activo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-center">
                  <div className="text-xl font-black text-[#001A41]">
                    {camp.audience ? camp.audience.split(/[,|\n]/).filter((e: string) => e.trim()).length : 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-[#001A41]">{camp.opens}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apertura</div>
                </div>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-[#001A41] group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001A41]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Send size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#001A41]">Nueva Campaña</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuración de envío</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="flex-1 flex overflow-hidden">
              {/* Left Side: Form */}
              <div className="flex-[1.2] p-8 space-y-6 overflow-auto premium-scrollbar border-r border-slate-50">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre de la Campaña</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej: Lanzamiento Nutrición Q3"
                      value={campaignData.name}
                      onChange={e => setCampaignData({...campaignData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Cápsula a Distribuir 
                      {campaignData.capsuleId && <span className="flex items-center gap-1 text-[9px] text-blue-600 animate-pulse"><Wand2 size={10} /> Sugerencias Activas</span>}
                    </label>
                    <select 
                      required
                      value={campaignData.capsuleId}
                      onChange={e => handleCapsuleChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">Selecciona una cápsula...</option>
                      {capsules.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asunto del Email</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej: Optimiza tu FCA con AcuaCore"
                    value={campaignData.subject}
                    onChange={e => setCampaignData({...campaignData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mensaje Personalizado</label>
                  <textarea 
                    placeholder="Escribe una breve introducción para tus clientes..."
                    value={campaignData.description}
                    onChange={e => setCampaignData({...campaignData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[120px]"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    Audiencia (Emails)
                    <span className="text-[10px] text-blue-600 lowercase font-normal italic">Separa por comas o saltos de línea</span>
                  </label>
                  <div className="relative group">
                    <textarea 
                      placeholder="ejemplo@correo.com, cliente@empresa.com..."
                      value={campaignData.audience}
                      onChange={e => setCampaignData({...campaignData, audience: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px] pr-32"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button 
                        type="button"
                        onClick={() => document.getElementById('csv-upload')?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-[#001A41] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <Plus size={14} className="text-blue-600" />
                        Subir Lista
                      </button>
                      <input 
                        id="csv-upload"
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.txt"
                        onChange={() => alert('Función de carga de archivos habilitada. Procesando lista...')}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Database size={16} className="text-blue-600" />
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {campaignData.audience 
                        ? `${campaignData.audience.split(/[,|\n]/).filter(e => e.trim()).length} contactos detectados.` 
                        : "Sincroniza con tus Leads actuales o carga una lista externa."}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Palette size={12} className="text-blue-600" /> Personalizar Plantilla
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Texto del Botón (CTA)</label>
                    <input 
                      type="text"
                      placeholder="Ej: Ver más detalles"
                      value={campaignData.ctaText}
                      onChange={e => setCampaignData({...campaignData, ctaText: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Crear y Programar
                  </button>
                </div>
              </div>

              {/* Right Side: Premium Preview */}
              <div className="flex-1 bg-slate-100 p-8 hidden lg:block overflow-auto premium-scrollbar">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Previa Premium</h4>
                  
                  {/* Email Mockup */}
                  <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-white max-w-md mx-auto">
                    {/* Branded Header */}
                    <div className="bg-[#001A41] p-6 text-center space-y-4">
                      <div className="flex justify-center items-center gap-2">
                        <Zap size={18} className="text-blue-400" fill="currentColor" />
                        <span className="text-sm font-black text-white tracking-tight uppercase">{selectedTenant?.name || 'AcuaCore'}</span>
                      </div>
                      <div className="w-full h-32 bg-blue-900/50 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
                        <Fish size={48} className="text-blue-400/30" />
                      </div>
                    </div>

                    {/* Email Content */}
                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-xl font-black text-[#001A41] leading-tight">
                          {campaignData.subject || 'Tu asunto aparecerá aquí'}
                        </h2>
                        <div className="w-12 h-1 bg-blue-600 rounded-full" />
                      </div>
                      
                      <div className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                        {campaignData.description || 'Redacta tu mensaje para verlo aquí...'}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-4">
                        <div className="w-full py-4 bg-blue-600 rounded-xl text-white text-center font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200">
                          {campaignData.ctaText}
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-50 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                          Impulsado por la IA de AcuaCore
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001A41]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#001A41]">{selectedCampaign.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detalles de la Campaña</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</p>
                  <p className="text-sm font-black text-blue-600">{selectedCampaign.status}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enviados</p>
                  <p className="text-sm font-black text-[#001A41]">{selectedCampaign.sent}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aperturas</p>
                  <p className="text-sm font-black text-[#001A41]">{selectedCampaign.opens}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <p className="text-sm font-medium text-slate-600">Cápsula: <span className="text-[#001A41] font-bold">{selectedCampaign.capsuleTitle}</span></p>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Clock size={16} className="text-blue-500" />
                  <p className="text-sm font-medium text-slate-600">Programada para: <span className="text-[#001A41] font-bold">{selectedCampaign.scheduledDate}</span></p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                {selectedCampaign.sentAt ? (
                  <button 
                    onClick={() => handleSendCampaign(selectedCampaign.id)}
                    disabled={loading}
                    className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
                  >
                    {loading ? 'Re-enviando...' : 'Re-enviar'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSendCampaign(selectedCampaign.id)}
                    disabled={loading}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Ahora'}
                  </button>
                )}
                <button className="flex-1 py-4 bg-[#001A41] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-800 transition-all">
                  Pausar Campaña
                </button>
                <button 
                  onClick={() => setSelectedCampaign(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
