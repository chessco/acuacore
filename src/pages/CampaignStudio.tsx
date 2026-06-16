import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  MessageSquare,
  Plus,
  Send,
  BarChart3,
  Eye,
  Pencil,
  Trash2,
  Users,
  Link,
  MousePointerClick,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Phone,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── API base ────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:3014';
const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const tenantId = localStorage.getItem('tenantId') || sessionStorage.getItem('tenantId') || '';
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    'x-tenant-id': tenantId,
  };
};

const api = {
  get: (path: string) => fetch(`${API}${path}`, { headers: authHeaders() }).then(r => r.json()),
  post: (path: string, body?: any) =>
    fetch(`${API}${path}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  patch: (path: string, body?: any) =>
    fetch(`${API}${path}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path: string) => fetch(`${API}${path}`, { method: 'DELETE', headers: authHeaders() }).then(r => r.json()),
};

// ─── Types ───────────────────────────────────────────────────────────────────
type Channel = 'EMAIL' | 'WHATSAPP';
type CampaignStatus = 'draft' | 'scheduled' | 'sent';

interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  scheduledAt?: string;
  sentAt?: string;
  opensCount: number;
  clicksCount: number;
  whatsappLinksCount?: number;
  capsule?: { title: string; slug: string };
  audienceList?: { name: string; _count?: { members: number } };
  whatsappMessage?: string;
  subject?: string;
}

interface Audience {
  id: string;
  name: string;
  description?: string;
  _count?: { members: number };
}

interface Capsule {
  id: string;
  title: string;
  slug: string;
  description?: string;
  topic?: string;
}

interface WaLink {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  hasPhone: boolean;
  waUrl: string;
  trackingUrl: string;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusBadge = (c: Campaign) => {
  if (c.sentAt) return { label: 'Enviada', color: 'bg-emerald-100 text-emerald-700' };
  if (c.scheduledAt) return { label: 'Programada', color: 'bg-blue-100 text-blue-700' };
  return { label: 'Borrador', color: 'bg-slate-100 text-slate-500' };
};

const formatDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────
function CampaignCard({
  campaign,
  onStats,
  onSend,
  onDelete,
}: {
  campaign: Campaign;
  onStats: () => void;
  onSend: () => void;
  onDelete: () => void;
}) {
  const badge = statusBadge(campaign);
  const isWA = campaign.channel === 'WHATSAPP';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isWA ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {isWA ? <MessageSquare size={18} /> : <Mail size={18} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{campaign.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {campaign.capsule?.title || 'Sin cápsula'} · {campaign.audienceList?.name || 'Sin audiencia'}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Contactos', value: campaign.audienceList?._count?.members ?? 0 },
          { icon: isWA ? Link : Eye, label: isWA ? 'Links' : 'Aperturas', value: isWA ? (campaign.whatsappLinksCount ?? 0) : campaign.opensCount },
          { icon: MousePointerClick, label: 'Clicks', value: campaign.clicksCount },
          { icon: Clock, label: 'Fecha', value: formatDate(campaign.scheduledAt || campaign.sentAt) },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
              <s.icon size={10} /> {s.label}
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-slate-100">
        <button
          onClick={onStats}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <BarChart3 size={14} /> Estadísticas
        </button>
        <button
          onClick={onSend}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all ${
            isWA ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <Send size={14} /> {isWA ? 'Enviar WA' : 'Enviar Email'}
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CampaignStudio() {
  const [activeChannel, setActiveChannel] = useState<Channel>('EMAIL');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showStats, setShowStats] = useState<Campaign | null>(null);
  const [showSend, setShowSend] = useState<Campaign | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wiz, setWiz] = useState({
    name: '',
    audienceId: '',
    capsuleId: '',
    message: '',
    subject: '',
    scheduledAt: '',
  });

  // Send panel state
  const [waLinks, setWaLinks] = useState<WaLink[]>([]);
  const [waLoading, setWaLoading] = useState(false);
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [camp, aud, cap] = await Promise.all([
        api.get('/api/capsule-studio/campaigns'),
        api.get('/api/capsule-studio/audiences'),
        api.get('/api/capsule-studio/capsules'),
      ]);
      setCampaigns(Array.isArray(camp) ? camp : []);
      setAudiences(Array.isArray(aud) ? aud : []);
      setCapsules(Array.isArray(cap) ? cap : []);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = campaigns.filter(c => c.channel === activeChannel);

  // ── Stats aggregation ─────────────────────────────────────────────────────
  const totalContacts = filtered.reduce((s, c) => s + (c.audienceList?._count?.members ?? 0), 0);
  const totalLinks = filtered.reduce((s, c) => s + (c.whatsappLinksCount ?? 0), 0);
  const totalClicks = filtered.reduce((s, c) => s + (c.clicksCount ?? 0), 0);
  const totalOpens = filtered.reduce((s, c) => s + (c.opensCount ?? 0), 0);

  // ── Wizard helpers ────────────────────────────────────────────────────────
  const resetWizard = () => { setWizardStep(1); setWiz({ name: '', audienceId: '', capsuleId: '', message: '', subject: '', scheduledAt: '' }); };
  const openCreate = () => { resetWizard(); setShowCreate(true); };

  const selectedCapsule = capsules.find(c => c.id === wiz.capsuleId);
  const selectedAudience = audiences.find(a => a.id === wiz.audienceId);

  // Auto-generate WhatsApp preview message from capsule data
  const previewWAMessage = () => {
    if (!selectedCapsule) return wiz.message || '(Selecciona una cápsula para ver el mensaje)';
    const topicEmoji: Record<string, string> = {
      ostión: '🦪', camarón: '🦐', tilapia: '🐟', salmón: '🐠',
      microalgas: '🌿', productividad: '📈', bioseguridad: '🛡️',
    };
    const topic = (selectedCapsule.topic || '').toLowerCase();
    const emoji = Object.entries(topicEmoji).find(([k]) => topic.includes(k))?.[1] || '🐚';
    if (wiz.message) return wiz.message;
    return [
      `${emoji} *${selectedCapsule.title}*`,
      '',
      (selectedCapsule.description || '').slice(0, 200),
      '',
      '👉 Ver cápsula:',
      `{{capsuleUrl}}`,
    ].join('\n');
  };

  const handleAutoGenerate = async (campaignId: string) => {
    setGeneratingMsg(true);
    try {
      const msg = await api.post(`/api/capsule-studio/campaigns/${campaignId}/whatsapp-message`);
      setWiz(w => ({ ...w, message: typeof msg === 'string' ? msg : msg?.message || w.message }));
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingMsg(false);
    }
  };

  const handleCreateCampaign = async () => {
    const payload: any = {
      name: wiz.name || `Campaña WA ${new Date().toLocaleDateString('es-MX')}`,
      capsuleId: wiz.capsuleId,
      audienceId: wiz.audienceId || undefined,
      channel: activeChannel,
      subject: wiz.subject || wiz.name || 'Nueva Campaña',
      content: wiz.message || '',
      whatsappMessage: activeChannel === 'WHATSAPP' ? wiz.message : undefined,
      scheduledAt: wiz.scheduledAt || undefined,
    };
    await api.post('/api/capsule-studio/campaigns', payload);
    setShowCreate(false);
    resetWizard();
    loadData();
  };

  // ── WA Send Panel ─────────────────────────────────────────────────────────
  const openSendPanel = async (camp: Campaign) => {
    setShowSend(camp);
    if (camp.channel === 'WHATSAPP') {
      setWaLoading(true);
      try {
        const result = await api.get(`/api/capsule-studio/campaigns/${camp.id}/whatsapp-links`);
        setWaLinks(result?.links || []);
      } catch (e) {
        setWaLinks([]);
      } finally {
        setWaLoading(false);
      }
    }
  };

  const handleSendEmail = async (camp: Campaign) => {
    await api.post(`/api/capsule-studio/campaigns/${camp.id}/send`);
    setShowSend(null);
    loadData();
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 1500);
    });
  };

  const openAll = (links: WaLink[]) => {
    links.slice(0, 10).forEach((l, i) => {
      setTimeout(() => window.open(l.waUrl, `_wa_${l.memberId}`), i * 400);
    });
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <MessageSquare size={22} />
            </div>
            Campañas
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Distribuye cápsulas por Email y WhatsApp</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Nueva Campaña
        </button>
      </div>

      {/* Channel Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {([{ ch: 'EMAIL', icon: Mail, label: 'Campañas Email' }, { ch: 'WHATSAPP', icon: MessageSquare, label: 'Campañas WhatsApp' }] as const).map(({ ch, icon: Icon, label }) => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch as Channel)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeChannel === ch
                ? ch === 'WHATSAPP'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={16} /> {label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeChannel === ch ? (ch === 'WHATSAPP' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700') : 'bg-slate-200 text-slate-500'
            }`}>
              {campaigns.filter(c => c.channel === ch).length}
            </span>
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Contactos Totales" value={totalContacts} color="bg-violet-100 text-violet-600" />
        {activeChannel === 'WHATSAPP' ? (
          <StatCard icon={Link} label="Links Generados" value={totalLinks} color="bg-green-100 text-green-600" />
        ) : (
          <StatCard icon={Eye} label="Aperturas" value={totalOpens} color="bg-blue-100 text-blue-600" />
        )}
        <StatCard icon={MousePointerClick} label="Clicks" value={totalClicks} color="bg-amber-100 text-amber-600" />
        <StatCard
          icon={UserCheck}
          label="Conversión"
          value={totalContacts > 0 ? `${((totalClicks / totalContacts) * 100).toFixed(1)}%` : '0%'}
          color="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          {activeChannel === 'WHATSAPP' ? <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" /> : <Mail size={48} className="mx-auto text-slate-300 mb-4" />}
          <p className="text-slate-500 font-medium">No hay campañas de {activeChannel === 'WHATSAPP' ? 'WhatsApp' : 'Email'} todavía</p>
          <button onClick={openCreate} className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all">
            <Plus size={16} /> Crear primera campaña
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onStats={() => setShowStats(c)}
                onSend={() => openSendPanel(c)}
                onDelete={async () => { await api.delete(`/api/capsule-studio/campaigns/${c.id}`); loadData(); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Create Campaign Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Nueva Campaña {activeChannel === 'WHATSAPP' ? 'WhatsApp' : 'Email'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${s <= wizardStep ? (activeChannel === 'WHATSAPP' ? 'bg-green-500' : 'bg-blue-500') : 'bg-slate-200'}`} />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">Paso {wizardStep} de 4</span>
                  </div>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Step 1: Audiencia + Cápsula */}
                {wizardStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Users size={16} className="text-slate-400" /> Seleccionar Audiencia y Cápsula</h3>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre de la campaña</label>
                      <input
                        type="text"
                        value={wiz.name}
                        onChange={e => setWiz(w => ({ ...w, name: e.target.value }))}
                        placeholder="Ej: Campaña Ostión Junio 2026"
                        className="mt-1.5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400/50 focus:border-green-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audiencia</label>
                      <select
                        value={wiz.audienceId}
                        onChange={e => setWiz(w => ({ ...w, audienceId: e.target.value }))}
                        className="mt-1.5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400/50 outline-none bg-white"
                      >
                        <option value="">Seleccionar audiencia...</option>
                        {audiences.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a._count?.members ?? 0} contactos)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cápsula</label>
                      <select
                        value={wiz.capsuleId}
                        onChange={e => setWiz(w => ({ ...w, capsuleId: e.target.value }))}
                        className="mt-1.5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400/50 outline-none bg-white"
                      >
                        <option value="">Seleccionar cápsula...</option>
                        {capsules.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Preview capsule URL + CTA */}
                {wizardStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Link size={16} className="text-slate-400" /> URL Pública y CTA</h3>
                    {selectedCapsule ? (
                      <>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cápsula seleccionada</p>
                          <p className="font-bold text-slate-900">{selectedCapsule.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{selectedCapsule.description}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">URL Pública Generada</p>
                          <code className="text-xs text-slate-700 break-all">
                            {`${window.location.origin}/capsules/${selectedCapsule.slug}`}
                          </code>
                        </div>
                        {selectedAudience && (
                          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                            <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Audiencia</p>
                            <p className="font-semibold text-slate-900">{selectedAudience.name}</p>
                            <p className="text-xs text-slate-500">{selectedAudience._count?.members ?? 0} contactos suscritos</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-700">
                        <AlertCircle size={18} /> <span className="text-sm">Vuelve al Paso 1 y selecciona una cápsula</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Message editor */}
                {wizardStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <Pencil size={16} className="text-slate-400" />
                      {activeChannel === 'WHATSAPP' ? 'Editor de Mensaje WhatsApp' : 'Asunto y Contenido Email'}
                    </h3>

                    {activeChannel === 'EMAIL' && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asunto del email</label>
                        <input
                          type="text"
                          value={wiz.subject}
                          onChange={e => setWiz(w => ({ ...w, subject: e.target.value }))}
                          placeholder="Ej: Descubre cómo optimizar tu producción..."
                          className="mt-1.5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400/50 outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {activeChannel === 'WHATSAPP' ? 'Mensaje WhatsApp' : 'Contenido del email'}
                        </label>
                        {activeChannel === 'WHATSAPP' && (
                          <span className={`text-xs font-bold ${wiz.message.length > 480 ? 'text-red-500' : 'text-slate-400'}`}>
                            {wiz.message.length}/500
                          </span>
                        )}
                      </div>
                      <textarea
                        value={wiz.message || (activeChannel === 'WHATSAPP' ? previewWAMessage() : '')}
                        onChange={e => setWiz(w => ({ ...w, message: activeChannel === 'WHATSAPP' ? e.target.value.slice(0, 500) : e.target.value }))}
                        rows={activeChannel === 'WHATSAPP' ? 8 : 10}
                        placeholder={activeChannel === 'WHATSAPP' ? '🐚 *Título de la cápsula*\n\nDescripción breve del contenido...\n\n👉 Ver cápsula:\n{{capsuleUrl}}' : 'Escribe el contenido del email...'}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-green-400/50 outline-none resize-none"
                      />
                    </div>

                    {activeChannel === 'WHATSAPP' && (
                      <div className="bg-[#ECE5DD] rounded-xl p-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Preview WhatsApp</p>
                        <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 shadow-sm max-w-xs">
                          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {(wiz.message || previewWAMessage()).replace(/\*([^*]+)\*/g, '$1')}
                          </p>
                          <p className="text-[10px] text-slate-400 text-right mt-2">ahora ✓✓</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Schedule */}
                {wizardStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Clock size={16} className="text-slate-400" /> Programación</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setWiz(w => ({ ...w, scheduledAt: '' }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${!wiz.scheduledAt ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Send size={20} className="text-green-600 mb-2" />
                        <p className="font-bold text-sm text-slate-900">Enviar ahora</p>
                        <p className="text-xs text-slate-500 mt-0.5">Inmediatamente al guardar</p>
                      </button>
                      <button
                        onClick={() => setWiz(w => ({ ...w, scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16) }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${wiz.scheduledAt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Clock size={20} className="text-blue-600 mb-2" />
                        <p className="font-bold text-sm text-slate-900">Programar</p>
                        <p className="text-xs text-slate-500 mt-0.5">Elegir fecha y hora</p>
                      </button>
                    </div>
                    {wiz.scheduledAt && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha y hora de envío</label>
                        <input
                          type="datetime-local"
                          value={wiz.scheduledAt}
                          onChange={e => setWiz(w => ({ ...w, scheduledAt: e.target.value }))}
                          className="mt-1.5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400/50 outline-none"
                        />
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumen</p>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Campaña</span><span className="font-semibold">{wiz.name || 'Sin nombre'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Canal</span><span className="font-semibold">{activeChannel}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Cápsula</span><span className="font-semibold">{selectedCapsule?.title || '—'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Audiencia</span><span className="font-semibold">{selectedAudience?.name || '—'} ({selectedAudience?._count?.members ?? 0} ctcts.)</span></div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => wizardStep === 1 ? setShowCreate(false) : setWizardStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ChevronLeft size={16} /> {wizardStep === 1 ? 'Cancelar' : 'Atrás'}
                </button>
                {wizardStep < 4 ? (
                  <button
                    disabled={wizardStep === 1 && !wiz.capsuleId}
                    onClick={() => setWizardStep(s => s + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Continuar <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleCreateCampaign}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all"
                  >
                    <CheckCircle size={16} /> Guardar Campaña
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStats(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Estadísticas de Campaña</p>
                    <h2 className="text-xl font-bold">{showStats.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">{showStats.channel === 'WHATSAPP' ? '💬 WhatsApp' : '📧 Email'} · {formatDate(showStats.sentAt || showStats.scheduledAt)}</p>
                  </div>
                  <button onClick={() => setShowStats(null)} className="p-1 rounded-lg text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: 'Contactos', value: showStats.audienceList?._count?.members ?? 0, color: 'text-violet-600 bg-violet-100' },
                  { icon: showStats.channel === 'WHATSAPP' ? Link : Eye, label: showStats.channel === 'WHATSAPP' ? 'Links WA' : 'Aperturas', value: showStats.channel === 'WHATSAPP' ? (showStats.whatsappLinksCount ?? 0) : showStats.opensCount, color: 'text-green-600 bg-green-100' },
                  { icon: MousePointerClick, label: 'Clicks', value: showStats.clicksCount, color: 'text-amber-600 bg-amber-100' },
                  {
                    icon: UserCheck, label: 'Conversión', color: 'text-blue-600 bg-blue-100',
                    value: (() => {
                      const base = showStats.audienceList?._count?.members ?? 0;
                      return base > 0 ? `${((showStats.clicksCount / base) * 100).toFixed(1)}%` : '0%';
                    })()
                  },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{s.label}</p>
                      <p className="text-xl font-bold text-slate-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {showStats.whatsappMessage && (
                <div className="px-6 pb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mensaje enviado</p>
                  <div className="bg-[#ECE5DD] rounded-xl p-4">
                    <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{showStats.whatsappMessage.slice(0, 300)}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Send Panel Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showSend.channel === 'WHATSAPP' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {showSend.channel === 'WHATSAPP' ? <MessageSquare size={20} /> : <Mail size={20} />}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{showSend.name}</h2>
                    <p className="text-xs text-slate-500">
                      {showSend.channel === 'WHATSAPP' ? `${waLinks.length} contactos · ${waLinks.filter(l => l.hasPhone).length} con teléfono` : 'Envío por Email'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowSend(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"><X size={20} /></button>
              </div>

              {showSend.channel === 'EMAIL' ? (
                /* Email send confirmation */
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail size={36} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Enviar Campaña Email</h3>
                    <p className="text-slate-500 text-sm">
                      Se enviará el email a todos los contactos suscritos en la audiencia.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendEmail(showSend)}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                  >
                    <Send size={18} /> Confirmar Envío
                  </button>
                </div>
              ) : (
                /* WhatsApp links panel */
                <>
                  {/* Actions bar */}
                  <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => openAll(waLinks.filter(l => l.hasPhone))}
                      disabled={waLinks.filter(l => l.hasPhone).length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-40 transition-all"
                    >
                      <MessageSquare size={16} /> Enviar a Todos (máx. 10)
                    </button>
                    <button
                      onClick={loadData}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all"
                    >
                      <RefreshCw size={14} /> Actualizar
                    </button>
                    <span className="ml-auto text-xs text-slate-400">
                      {waLinks.filter(l => l.hasPhone).length}/{waLinks.length} con teléfono
                    </span>
                  </div>

                  {/* Links list */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {waLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-slate-400" size={28} />
                      </div>
                    ) : waLinks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Users size={40} className="mb-3 text-slate-300" />
                        <p className="font-medium">No hay contactos en la audiencia</p>
                        <p className="text-xs mt-1">Agrega miembros con número de teléfono</p>
                      </div>
                    ) : (
                      waLinks.map(link => (
                        <div key={link.memberId} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(link.name[0] || '?').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{link.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                              <Phone size={10} /> {link.phone}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => copyMessage(link.message, link.memberId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Copiar mensaje"
                            >
                              {copyFeedback === link.memberId ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                            {link.hasPhone ? (
                              <a
                                href={link.waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all"
                              >
                                <MessageSquare size={12} /> Enviar
                              </a>
                            ) : (
                              <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg flex items-center gap-1">
                                <Phone size={12} /> Sin tel.
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
