import React, { useState, useEffect } from 'react';
import { Mail, Plus, Send, Clock, CheckCircle2, X, Search, ChevronRight, BarChart3, Database, Wand2, Zap, Fish, Palette } from 'lucide-react';
import axios from 'axios';
import { useTenant } from '../../../contexts/TenantContext';

export const CampaignManager: React.FC = () => {
  const { selectedTenant, flowApiKey } = useTenant();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'branding'>('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const [branding, setBranding] = useState({
    primaryColor: '#001A41',
    accentColor: '#2563eb',
    logoUrl: 'https://acuacore.io/logo-white.png',
    heroImage: 'https://67a1-2806-263-481-978-a0ac-f952-680f-bfb9.ngrok-free.app/static/assets/hero-acuaequipos.png',
    footerText: '© 2026 AcuaCore Studio. Todos los derechos reservados.'
  });

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
        const [capsulesRes, campaignsRes, brandingRes] = await Promise.all([
          axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/capsule-studio/capsules', {
            headers: { 'x-tenant-id': selectedTenant?.id || '', 'x-api-key': flowApiKey }
          }),
          axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/capsule-studio/campaigns', {
            headers: { 'x-tenant-id': selectedTenant?.id || '', 'x-api-key': flowApiKey }
          }),
          axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/capsule-studio/branding', {
            headers: { 'x-tenant-id': selectedTenant?.id || '', 'x-api-key': flowApiKey }
          })
        ]);
        setCapsules(capsulesRes.data);
        setCampaigns(campaignsRes.data);
        if (brandingRes.data && Object.keys(brandingRes.data).length > 0) {
          setBranding(brandingRes.data);
        }
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
        scheduledAt: new Date(),
        templateConfig: {
          ctaText: campaignData.ctaText
        }
      };

      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/capsule-studio/campaigns', payload, {
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

  const handleSaveBranding = async () => {
    setLoading(true);
    try {
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/capsule-studio/branding', branding, {
        headers: {
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey,
        }
      });
      alert('Configuración de marca guardada con éxito.');
    } catch (err) {
      console.error('Error saving branding:', err);
      alert('Error al guardar la configuración de marca.');
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
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#001A41]">Campañas de Email</h1>
            <p className="text-slate-500 font-medium">Gestiona la distribución y marca de tus comunicaciones.</p>
          </div>
          
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'campaigns' ? 'bg-white text-[#001A41] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Campañas
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'branding' ? 'bg-white text-[#001A41] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Diseño de Plantilla
            </button>
          </div>
        </div>
        
        {activeTab === 'campaigns' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Nueva Campaña
          </button>
        )}

        {activeTab === 'branding' && (
          <button 
            onClick={handleSaveBranding}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
          >
            <CheckCircle2 size={20} /> Guardar Cambios
          </button>
        )}
      </div>

      {activeTab === 'campaigns' ? (
        <>
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
                      <div className="text-xl font-black text-[#001A41]">{camp.opens || 0}%</div>
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

          {/* Simplified Create Campaign Modal */}
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
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaign} className="flex-1 flex overflow-hidden">
                  <div className="flex-[1.2] p-8 space-y-6 overflow-auto premium-scrollbar border-r border-slate-50">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre de la Campaña</label>
                        <input 
                          type="text" required placeholder="Ej: Lanzamiento Nutrición Q3"
                          value={campaignData.name} onChange={e => setCampaignData({...campaignData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cápsula a Distribuir</label>
                        <select 
                          required value={campaignData.capsuleId} onChange={e => handleCapsuleChange(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        >
                          <option value="">Selecciona una cápsula...</option>
                          {capsules.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asunto del Email</label>
                      <input 
                        type="text" required placeholder="Ej: Optimiza tu FCA con AcuaCore"
                        value={campaignData.subject} onChange={e => setCampaignData({...campaignData, subject: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mensaje Personalizado</label>
                      <textarea 
                        placeholder="Escribe una breve introducción..."
                        value={campaignData.description} onChange={e => setCampaignData({...campaignData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Texto del Botón (CTA)</label>
                      <input 
                        type="text" value={campaignData.ctaText} onChange={e => setCampaignData({...campaignData, ctaText: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audiencia (Emails)</label>
                      <textarea 
                        placeholder="ejemplo@correo.com, cliente@empresa.com..."
                        value={campaignData.audience} onChange={e => setCampaignData({...campaignData, audience: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px]"
                      />
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                      <button type="submit" className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                        <Send size={16} /> Crear y Programar
                      </button>
                    </div>
                  </div>

                  {/* Preview using Global Branding */}
                  <div className="flex-1 bg-slate-100 p-8 hidden lg:block overflow-auto premium-scrollbar">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Previa con Marca Global</h4>
                      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-white max-w-md mx-auto scale-90 origin-top">
                        <div className="p-8 text-center space-y-4" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, #0044CC 100%)` }}>
                          <img src={branding.logoUrl} alt="Logo" className="h-6 mx-auto object-contain" />
                          {branding.heroImage && <img src={branding.heroImage} className="w-full h-24 object-cover rounded-xl mt-4" alt="Hero" />}
                        </div>
                        <div className="p-6 space-y-4">
                          <h2 className="text-lg font-black text-[#001A41]">{campaignData.subject || 'Asunto del Email'}</h2>
                          <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap">{campaignData.description || 'Contenido del mensaje...'}</p>
                          <div className="w-full py-3 rounded-lg text-white text-center font-black uppercase text-[10px] tracking-widest" style={{ backgroundColor: branding.accentColor }}>
                            {campaignData.ctaText}
                          </div>
                          <div className="pt-4 border-t border-slate-50 text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{branding.footerText}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Branding Tab */
        <div className="flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex-[1.2] bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-black text-[#001A41] flex items-center gap-2">
                <Palette className="text-blue-600" size={20} /> Identidad Visual
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color Primario</label>
                  <div className="flex gap-3">
                    <input type="color" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="w-12 h-12 rounded-xl border-0 p-0 overflow-hidden cursor-pointer shadow-sm" />
                    <input type="text" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/10 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color de Acento</label>
                  <div className="flex gap-3">
                    <input type="color" value={branding.accentColor} onChange={e => setBranding({...branding, accentColor: e.target.value})} className="w-12 h-12 rounded-xl border-0 p-0 overflow-hidden cursor-pointer shadow-sm" />
                    <input type="text" value={branding.accentColor} onChange={e => setBranding({...branding, accentColor: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/10 outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL del Logo (Blanco/Transparente preferido)</label>
                <input type="text" value={branding.logoUrl} onChange={e => setBranding({...branding, logoUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10" placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imagen Hero por Defecto</label>
                <input type="text" value={branding.heroImage} onChange={e => setBranding({...branding, heroImage: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10" placeholder="URL de la imagen de cabecera..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pie de Página (Copyright/Legales)</label>
                <textarea value={branding.footerText} onChange={e => setBranding({...branding, footerText: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[80px]" />
              </div>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Wand2 className="text-blue-600" size={20} />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Esta configuración se aplicará automáticamente a todas tus campañas. Puedes sobrescribir el texto del botón y el mensaje en cada envío individual.
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Previa Global</h4>
             <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100 sticky top-8">
                <div className="p-12 text-center space-y-6" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, #054CC1 100%)` }}>
                  <img src={branding.logoUrl} alt="Logo" className="h-10 mx-auto object-contain drop-shadow-md" />
                  {branding.heroImage ? (
                    <img src={branding.heroImage} className="w-full h-40 object-cover rounded-[2rem] shadow-lg border-2 border-white/20" alt="Hero" />
                  ) : (
                    <div className="w-full h-40 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10">
                      <Fish size={48} className="text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-10 space-y-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-50 rounded-full w-full" />
                      <div className="h-3 bg-slate-50 rounded-full w-full" />
                      <div className="h-3 bg-slate-50 rounded-full w-5/6" />
                    </div>
                  </div>
                  <div className="w-full py-5 rounded-2xl text-white text-center font-black uppercase text-xs tracking-[0.2em] shadow-xl" style={{ backgroundColor: branding.accentColor, boxShadow: `0 10px 20px ${branding.accentColor}33` }}>
                    Botón de Acción
                  </div>
                  <div className="pt-10 border-t border-slate-50 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      {branding.footerText}
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal (unchanged) */}
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
              <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors shadow-sm">
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
                  <p className="text-sm font-black text-[#001A41]">{selectedCampaign.sent || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aperturas</p>
                  <p className="text-sm font-black text-[#001A41]">{selectedCampaign.opens || 0}%</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => handleSendCampaign(selectedCampaign.id)}
                  disabled={loading}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : (selectedCampaign.sentAt ? 'Re-enviar Ahora' : 'Enviar Campaña')}
                </button>
                <button onClick={() => setSelectedCampaign(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all">
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

