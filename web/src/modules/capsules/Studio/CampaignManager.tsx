import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle2, 
  X, 
  Search, 
  ChevronRight, 
  BarChart3, 
  Database, 
  Wand2, 
  Zap, 
  Fish, 
  Palette, 
  Trash2,
  Sparkles,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { useTenant } from '../../../contexts/TenantContext';

import { EmailTemplateEditor } from './components/EmailTemplateEditor';
import type { EmailBlock } from './components/EmailTemplateEditor';
import { AudienceManager } from './components/AudienceManager';

export const CampaignManager: React.FC = () => {
  const { selectedTenant, flowApiKey, role } = useTenant();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'audiences' | 'branding'>('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [audiencesList, setAudiencesList] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const [branding, setBranding] = useState({
    primaryColor: '#001A41',
    accentColor: '#2563eb',
    logoUrl: '/static/assets/logo-white.png',
    heroImage: '/static/assets/hero-acuaequipos.png',
    footerText: '© 2026 Acuaequipos Capsulas Acuicolas. Todos los derechos reservados.'
  });

  const [campaignData, setCampaignData] = useState({
    name: '',
    capsuleId: '',
    subject: '',
    description: '',
    ctaText: 'Explorar Cápsula Interactiva',
    audience: '',
    audienceId: ''
  });
  const [emailBlocks, setEmailBlocks] = useState<EmailBlock[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setHasError(false);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('acuacore_role') || 'ADMIN';

      let apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3014`;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = `http://${window.location.hostname}:3014`;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': selectedTenant?.id || '', 
        'x-user-role': role.toUpperCase(),
        'x-api-key': flowApiKey 
      };

      try {
        const [capsulesRes, campaignsRes, brandingRes, audiencesRes] = await Promise.all([
          axios.get(apiUrl + '/api/capsule-studio/capsules', { headers }),
          axios.get(apiUrl + '/api/capsule-studio/campaigns', { headers }),
          axios.get(apiUrl + '/api/capsule-studio/branding', { headers }),
          axios.get(apiUrl + '/api/capsule-studio/audiences', { headers }).catch(() => ({ data: [] }))
        ]);
        setCapsules(capsulesRes.data);
        const sortedCampaigns = (campaignsRes.data || []).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setCampaigns(sortedCampaigns);
        setAudiencesList(audiencesRes.data || []);
        if (brandingRes.data && Object.keys(brandingRes.data).length > 0) {
          setBranding(prev => ({ ...prev, ...brandingRes.data }));
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

  const handleGenerateAiText = async (tone: string = 'professional') => {
    const selected = capsules.find(c => c.id === campaignData.capsuleId);
    if (!selected) return alert('Por favor, selecciona una cápsula primero');
    
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3014'}/api/ai/generate-campaign-text`, {
        capsule: { title: selected.title, description: selected.description },
        tone: tone
      }, { headers: { 'x-tenant-id': selectedTenant?.id || '', 'x-api-key': flowApiKey, 'x-user-role': (role || 'admin').toUpperCase() } });
      
      setCampaignData(prev => ({ 
        ...prev, 
        subject: res.data.subject,
        description: res.data.content,
        ctaText: res.data.cta 
      }));
    } catch (err) {
      alert('Error generando texto con IA');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiImage = async () => {
    const selected = capsules.find(c => c.id === campaignData.capsuleId);
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3014'}/api/ai/generate-image`, {
        prompt: selected ? `Topic: ${selected.title}. Description: ${selected.description}` : 'High quality professional aquaculture design'
      }, {
        headers: { 'x-tenant-id': selectedTenant?.id || '', 'x-api-key': flowApiKey, 'x-user-role': (role || 'admin').toUpperCase() }
      });
      setBranding(prev => ({ ...prev, heroImage: res.data.url }));
    } catch (err) {
      alert('Error generando imagen con IA');
    } finally {
      setLoading(false);
    }
  };

  const handleCapsuleChange = (id: string) => {
    const selected = capsules.find(c => c.id === id);
    if (selected) {
      setCampaignData(prev => ({
        ...prev,
        capsuleId: id,
        name: `Campaña: ${selected.title}`,
        subject: `Descubre: ${selected.title}`
      }));
      const heroImg = selected.contentBlocks?.find((b: any) => b.type === 'hero')?.data?.image || branding.heroImage;
      const fullHeroImg = heroImg?.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3014'}${heroImg}` : heroImg;

      const keyPoints = selected.contentBlocks
        ?.filter((b: any) => b.type === 'text' || b.type === 'section')
        ?.slice(0, 2)
        ?.map((b: any) => b.data?.title || b.title || '')
        ?.filter(Boolean)
        ?.join(' y ') || '';

      const initialText = `Estimado productor,\n\nQuiero compartir contigo una herramienta clave para tu operación: "${selected.title}".\n\nEn esta cápsula interactiva exploramos a fondo ${keyPoints || 'los puntos críticos para tu producción'}, con el objetivo de mejorar tu eficiencia y resultados.\n\n${selected.description || ''}\n\nTe invito a revisarla haciendo clic en el botón de abajo.`;

      setEmailBlocks([
        { id: 'h1', type: 'header', content: { title: selected.title } },
        { id: 'i1', type: 'image', content: { url: fullHeroImg, alt: selected.title } },
        { id: 't1', type: 'text', content: { text: initialText } },
        { id: 'b1', type: 'button', content: { text: 'Explorar Cápsula Interactiva', url: '#' } },
        { id: 'f1', type: 'footer', content: { text: branding.footerText } }
      ]);
    } else {
      setCampaignData(prev => ({ ...prev, capsuleId: id }));
      setEmailBlocks([]);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const combinedContent = emailBlocks.map(b => {
        if (b.type === 'text') return b.content.text;
        if (b.type === 'header') return `# ${b.content.title}`;
        return '';
      }).filter(t => t).join('\n\n');

      const payload = {
        name: campaignData.name,
        capsuleId: campaignData.capsuleId,
        subject: campaignData.subject,
        content: combinedContent,
        audience: campaignData.audience,
        scheduledAt: new Date(),
        templateConfig: {
          ctaText: campaignData.ctaText,
          blocks: emailBlocks
        }
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      const headers = {
        'x-tenant-id': selectedTenant?.id || '',
        'x-api-key': flowApiKey,
        'x-user-role': (role || 'admin').toUpperCase(),
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

      if ((campaignData as any).id) {
        // Update existing
        const res = await axios.patch(`${apiUrl}/api/capsule-studio/campaigns/${(campaignData as any).id}`, payload, { headers });
        setCampaigns(campaigns.map(c => c.id === res.data.id ? res.data : c));
      } else {
        // Create new
        const res = await axios.post(`${apiUrl}/api/capsule-studio/campaigns`, payload, { headers });
        setCampaigns([res.data, ...campaigns]);
      }

      setShowCreateModal(false);
      resetCampaignForm();
    } catch (err) {
      console.error('Error saving campaign:', err);
      alert('Error al guardar la campaña.');
    } finally {
      setLoading(false);
    }
  };

  const resetCampaignForm = () => {
    setCampaignData({
      name: '',
      capsuleId: '',
      subject: '',
      description: '',
      ctaText: 'Explorar Cápsula Interactiva',
      audience: '',
      audienceId: ''
    });
    setEmailBlocks([]);
  };

  const handleEditClick = (camp: any) => {
    if (camp.sentAt && role?.toLowerCase() !== 'system') {
        setSelectedCampaign(camp); // Just view stats if already sent
        return;
    }

    setCampaignData({
      id: camp.id,
      name: camp.name,
      capsuleId: camp.capsuleId,
      subject: camp.subject,
      description: camp.content,
      ctaText: (camp.templateConfig as any)?.ctaText || 'Explorar Cápsula Interactiva',
      audience: camp.audience || ''
    } as any);

    if ((camp.templateConfig as any)?.blocks) {
      setEmailBlocks((camp.templateConfig as any).blocks);
    } else {
      // Fallback: create basic blocks from content
      setEmailBlocks([
        { id: 'h1', type: 'header', content: { title: camp.name } },
        { id: 't1', type: 'text', content: { text: camp.content } }
      ]);
    }

    setShowCreateModal(true);
  };

  const handleSendCampaign = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas enviar esta campaña ahora?')) return;
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      const headers = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-tenant-id': selectedTenant?.id || '',
        'x-api-key': flowApiKey,
        'x-user-role': (role || 'admin').toUpperCase()
      };

      await axios.post(`${apiUrl}/api/capsule-studio/campaigns/${id}/send`, {}, { headers });
      
      // Update local state
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, sentAt: new Date().toISOString() } : c));
      setSelectedCampaign(null);
      alert('¡Campaña enviada con éxito!');
    } catch (err) {
      console.error('Error sending campaign:', err);
      alert('Error al enviar la campaña. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar esta campaña permanentemente?')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      const headers = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-tenant-id': selectedTenant?.id || '',
        'x-api-key': flowApiKey,
        'x-user-role': (role || 'admin').toUpperCase()
      };

      await axios.delete(`${apiUrl}/api/capsule-studio/campaigns/${id}`, { headers });
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      alert('No se pudo eliminar la campaña.');
    }
  };

  const handleSaveBranding = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      const headers = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-tenant-id': selectedTenant?.id || '',
        'x-api-key': flowApiKey,
        'x-user-role': (role || 'admin').toUpperCase()
      };

      await axios.post(`${apiUrl}/api/capsule-studio/branding`, branding, { headers });
      alert('Diseño global guardado correctamente.');
    } catch (err) {
      alert('Error al guardar el diseño.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      const res = await axios.post(`${apiUrl}/api/capsule-studio/upload`, formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey,
          'x-user-role': (role || 'admin').toUpperCase()
        }
      });
      setBranding(prev => ({ ...prev, [field]: res.data.url }));
    } catch (err) {
      alert('Error al subir la imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-auto premium-scrollbar">
      {/* ... (keeping header) */}
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
              onClick={() => setActiveTab('audiences')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'audiences' ? 'bg-white text-[#001A41] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Listas (Audiencias)
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'branding' ? 'bg-white text-[#001A41] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Diseño Global
            </button>
          </div>
        </div>
        
        {activeTab === 'campaigns' && (
          <button 
            onClick={() => {
                resetCampaignForm();
                setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Nueva Campaña
          </button>
        )}
      </div>

      {activeTab === 'audiences' && <AudienceManager />}
      {activeTab === 'campaigns' && (
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
                  onClick={() => alert('Guía de campañas: 1. Selecciona una cápsula. 2. Usa el editor visual. 3. Envía.')}
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
                  onClick={() => handleEditClick(camp)}
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
                      <div className="text-xl font-black text-[#001A41]">{camp.opensCount || 0}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aperturas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-[#001A41]">{camp.clicksCount || 0}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clics</div>
                    </div>
                    {!camp.sentAt && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendCampaign(camp.id);
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                      >
                        <Send size={14} />
                        Enviar
                      </button>
                    )}
                    {(!camp.sentAt || role?.toLowerCase() === 'system' || role?.toLowerCase() === 'admin') && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCampaign(camp.id);
                        }}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-[#001A41] group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCreateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001A41]/40 backdrop-blur-sm">
              <div className="bg-white w-full max-w-7xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Send size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#001A41]">{(campaignData as any).id ? 'Modificar Campaña' : 'Nueva Campaña Visual'}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Editor de Plantillas AI</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaign} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  <div className="w-full lg:flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto lg:overflow-auto premium-scrollbar border-b lg:border-b-0 lg:border-r border-slate-100 lg:border-slate-50">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre de Campaña</label>
                        <input 
                          type="text" required placeholder="Ej: Lanzamiento Nutrición Q3"
                          value={campaignData.name} onChange={e => setCampaignData({...campaignData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cápsula</label>
                        <select 
                          required value={campaignData.capsuleId} onChange={e => handleCapsuleChange(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        >
                          <option value="">Selecciona...</option>
                          {capsules.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asunto del Email</label>
                      <input 
                        type="text" required placeholder="Ej: Optimiza tu FCA con AcuaCore"
                        value={campaignData.subject} onChange={e => setCampaignData({...campaignData, subject: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audiencia de Destino</label>
                      <select 
                        value={(campaignData as any).audienceId || ''} 
                        onChange={e => setCampaignData({...campaignData, audienceId: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 mb-2"
                      >
                        <option value="">Ingreso Manual (Usar cuadro de texto inferior)</option>
                        {audiencesList.map(a => <option key={a.id} value={a.id}>{a.name} ({a._count?.members || 0} contactos)</option>)}
                      </select>
                      
                      {!(campaignData as any).audienceId && (
                        <textarea 
                          placeholder="ejemplo@correo.com, cliente@empresa.com..."
                          value={campaignData.audience} onChange={e => setCampaignData({...campaignData, audience: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px]"
                        />
                      )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex gap-4">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            {(campaignData as any).id ? 'Actualizar Campaña' : 'Crear y Programar'}
                        </button>
                    </div>
                  </div>

                  <div className="flex-[2.5] flex-1 bg-slate-50 p-4 lg:p-8 overflow-hidden flex flex-col">
                     <EmailTemplateEditor 
                        blocks={emailBlocks} 
                        onChange={setEmailBlocks} 
                        branding={branding}
                        tenantId={selectedTenant?.id}
                        apiKey={flowApiKey}
                        capsuleContext={capsules.find(c => c.id === campaignData.capsuleId)}
                     />
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button 
                    onClick={handleSaveBranding}
                    disabled={loading}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                >
                    <CheckCircle2 size={20} /> Guardar Configuración de Marca
                </button>
            </div>
            
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
                    <div className="flex gap-2">
                    <input type="text" value={branding.logoUrl} onChange={e => setBranding({...branding, logoUrl: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10" placeholder="https://..." />
                    <label className="bg-white border-2 border-dashed border-slate-200 p-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-center">
                        <Plus size={20} className="text-slate-400" />
                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl')} accept="image/*" />
                    </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imagen Hero por Defecto</label>
                    <div className="flex gap-2">
                    <input type="text" value={branding.heroImage} onChange={e => setBranding({...branding, heroImage: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10" placeholder="URL de la imagen de cabecera..." />
                    <label className="bg-white border-2 border-dashed border-slate-200 p-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-center">
                        <Plus size={20} className="text-slate-400" />
                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'heroImage')} accept="image/*" />
                    </label>
                    <button 
                        type="button"
                        onClick={handleGenerateAiImage}
                        title="Generar con Nano Banana"
                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <Zap size={20} fill="currentColor" />
                    </button>
                    </div>
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
                    <img src={branding.logoUrl?.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3014'}${branding.logoUrl}` : branding.logoUrl} alt="Logo" className="h-10 mx-auto object-contain drop-shadow-md" />
                    {branding.heroImage ? (
                        <img src={branding.heroImage.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3014'}${branding.heroImage}` : branding.heroImage} className="w-full h-40 object-cover rounded-[2rem] shadow-lg border-2 border-white/20" alt="Hero" />
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
        </div>
      )}

      {selectedCampaign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001A41]/40 backdrop-blur-sm">
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
                  <p className="text-sm font-black text-[#001A41]">{selectedCampaign.audience ? selectedCampaign.audience.split(/[,|\n]/).filter((e: string) => e.trim()).length : 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aperturas</p>
                  <p className="text-sm font-black text-[#001A41]">{selectedCampaign.opensCount || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clics</p>
                  <p className="text-sm font-black text-[#001A41]">{selectedCampaign.clicksCount || 0}</p>
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
