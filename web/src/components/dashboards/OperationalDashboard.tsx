import { 
  LayoutDashboard, 
  MessageSquare, 
  ShieldCheck, 
  Database, 
  Settings, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Fish,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  FileText,
  Eye,
  ChevronDown,
  Plus,
  Check,
  Sparkles,
  Users,
  BarChart3,
  Key,
  Lock,
  Loader2,
  Globe,
  Workflow
} from 'lucide-react'
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts'
import { useState, useRef, useEffect } from 'react'
import { Inbox } from './Inbox'
import { KnowledgeBase } from './KnowledgeBase'
import { Analytics } from './Analytics'
import { HITL } from './HITL'
import { SkillsManager } from './SkillsManager'
import { TenantManager } from './TenantManager'
import { useTenant } from '../../contexts/TenantContext'
import { motion, AnimatePresence } from 'motion/react'

const chartData = [
  { name: 'Mon', automation: 65, hitl: 12 },
  { name: 'Tue', automation: 72, hitl: 8 },
  { name: 'Wed', automation: 68, hitl: 15 },
  { name: 'Thu', automation: 85, hitl: 5 },
  { name: 'Fri', automation: 92, hitl: 3 },
]

export function OperationalDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { 
    selectedTenant, 
    setSelectedTenant, 
    tenants, 
    flowUrl, 
    setFlowUrl, 
    flowTenantSlug, 
    setFlowTenantSlug,
    flowApiKey,
    setFlowApiKey
  } = useTenant()

  return (
    <div className="flex h-screen bg-surface text-text-main overflow-hidden font-sans">
      {/* Sidebar - Light Design */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center shadow-lg shadow-brand-blue/30 text-white">
              <Fish size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight font-display text-brand-deep">AcuaCore AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operaciones</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Panel Control" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="Bandeja" 
            active={activeTab === 'conversations'} 
            onClick={() => setActiveTab('conversations')}
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Hub Predictivo" 
            active={activeTab === 'predictive'} 
            onClick={() => setActiveTab('predictive')}
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Arq. Protocolos" 
            active={activeTab === 'protocols'} 
            onClick={() => setActiveTab('protocols')}
          />
          <NavItem 
            icon={<Eye size={20} />} 
            label="Lab Visión" 
            active={activeTab === 'vision'} 
            onClick={() => setActiveTab('vision')}
          />
          <NavItem 
            icon={<ShieldCheck size={20} />} 
            label="HITL" 
            active={activeTab === 'hitl'} 
            onClick={() => setActiveTab('hitl')}
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Habilidades" 
            active={activeTab === 'skills'} 
            onClick={() => setActiveTab('skills')}
          />
          <NavItem 
            icon={<Database size={20} />} 
            label="Conocimiento" 
            active={activeTab === 'kb'} 
            onClick={() => setActiveTab('kb')}
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Analíticas" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Configuración" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          />
          
          <div className="pt-4 mt-8 border-t border-slate-100 pb-8">
            <NavItem 
              icon={<LogOut size={20} />} 
              label="Cerrar Sesión" 
              active={false} 
              className="text-rose-500 hover:bg-rose-50"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            />
            
            <div className="flex items-center gap-3 mt-8 p-3 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                 <img src="https://ui-avatars.com/api/?name=Carlos+Mendez&background=random" alt="Avatar" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-slate-800">Carlos Méndez</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Soporte</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar conversaciones, inquilinos..." 
              className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-brand-blue transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-400">
              <Bell size={20} className="hover:text-brand-blue cursor-pointer transition-all" />
              <HelpCircle size={20} className="hover:text-brand-blue cursor-pointer transition-all" />
              <button 
                onClick={() => setActiveTab('settings')}
                className={`hover:text-brand-blue cursor-pointer transition-all p-1 rounded-lg ${activeTab === 'settings' ? 'bg-brand-blue-light text-brand-blue' : 'hover:bg-slate-50'}`}
              >
                <Settings size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTenant?.name || 'Acuaequipos'}</span>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{selectedTenant?.plan || 'Admin'}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs bg-brand-blue-light text-brand-blue shadow-sm`}>
                {selectedTenant?.name.split(' ').map(n => n[0]).join('') || 'AC'}
              </div>
              
              <button 
                onClick={() => {
                  console.log('Logging out...');
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
                title="Cerrar Sesión"
                className="ml-4 p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm cursor-pointer relative z-50"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="p-8">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black font-display text-slate-800">
                  Panel: <span className="text-brand-blue">{selectedTenant?.name || 'Vista Global'}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <p className="text-xs font-bold text-emerald-600">Estado del sistema: Todos los sistemas operativos</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                <Settings size={14} />
                Últimos 7 días
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <StatsCard 
                title="TASA DE AUTOMATIZACIÓN IA" 
                value="94.2%" 
                trend="+2.4%" 
                icon={<Plus size={16} />}
                color="blue"
              />
              <StatsCard 
                title="CONVERSACIONES ACTIVAS" 
                value="1,284" 
                subtitle="Promedio: 4.2 min / sesión"
                badge="EN VIVO"
                color="amber"
              />
              <StatsCard 
                title="REVISIONES PENDIENTES" 
                value="28" 
                subtitle="Requieren intervención humana"
                badge="HITL"
                color="purple"
              />
              <StatsCard 
                title="USO POR INQUILINO" 
                value="12 / 15" 
                badge="ACTIVOS"
                avatars={true}
                color="slate"
              />
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Alerts and Chart */}
              <div className="col-span-8 space-y-8">
                {/* Alerts Card */}
                <div className="dashboard-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-rose-500">
                      <AlertCircle size={20} />
                      <h3 className="font-bold">Alertas y Conversaciones Marcadas</h3>
                    </div>
                    <button className="text-brand-blue text-xs font-bold hover:underline">Ver todas</button>
                  </div>
                  <div className="space-y-6">
                    <AlertItem 
                      title="Sentimiento Negativo Detectado" 
                      desc="Inquilino: AquaTech Sur • El usuario reportó falla crítica en sensor O2." 
                      time="Hace 2 min"
                      status="urgent"
                    />
                    <AlertItem 
                      title="Baja Confianza de IA (HITL)" 
                      desc="Inquilino: BioMar Global • Pregunta sobre protocolos de bioseguridad fase 4." 
                      time="Hace 15 min"
                      status="warning"
                    />
                    <AlertItem 
                      title="Escalado Manual Solicitado" 
                      desc="Inquilino: Piscicultura Andes • Usuario solicitó hablar con un supervisor." 
                      time="Hace 42 min"
                      status="urgent"
                    />
                  </div>
                </div>

                {/* Volume Chart */}
                <div className="dashboard-card p-6">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-lg">Volumen de Conversaciones</h3>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 bg-brand-blue rounded-full" /> AUTOMATIZADO</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full" /> HITL</span>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="automation" fill="#377DFF" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="hitl" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right Column: Activity Feed */}
              <div className="col-span-4">
                <div className="dashboard-card p-6 h-full flex flex-col">
                  <h3 className="font-bold text-lg mb-8">Actividad Reciente</h3>
                  <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <ActivityItem 
                      icon={<Fish className="text-brand-blue" />}
                      title="IA AcuaCore resolvió consulta técnica"
                      meta="INQUILINO: OCEANPULSE • 14:22"
                      quote="“Los niveles de salinidad recomendados para la etapa 2 son...”"
                      color="blue"
                    />
                    <ActivityItem 
                      icon={<Settings className="text-purple-500" />}
                      title="Admin Carlos intervino en chat"
                      meta="INQUILINO: AQUATECH • 13:58"
                      color="purple"
                    />
                    <ActivityItem 
                      icon={<CheckCircle2 className="text-emerald-500" />}
                      title="Habilidad 'Soporte' actualizada"
                      meta="INQUILINO: SISTEMA • 12:30"
                      color="emerald"
                    />
                    <ActivityItem 
                      icon={<Database className="text-amber-500" />}
                      title="Dra. Elena creó nueva entrada en Base de Conocimiento"
                      meta="INQUILINO: GLOBAL BIO • 11:15"
                      color="amber"
                    />
                  </div>
                  <button className="mt-8 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Cargar Más
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'conversations' ? (
          <Inbox />
        ) : activeTab === 'kb' ? (
          <KnowledgeBase />
        ) : activeTab === 'analytics' ? (
          <Analytics />
        ) : activeTab === 'hitl' ? (
          <HITL />
        ) : activeTab === 'skills' ? (
          <SkillsManager />
        ) : activeTab === 'tenants' ? (
          <TenantManager />
        ) : activeTab === 'settings' ? (
          <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800">Configuración Global</h2>
              <p className="text-sm text-slate-500 mt-1">Personaliza tu experiencia y gestiona el contexto de la aplicación.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tenant Selection */}
              <div className="dashboard-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Inquilino Activo</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cambiar Contexto</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => setSelectedTenant(tenant)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all border-2 ${
                        selectedTenant?.id === tenant.id 
                          ? 'border-brand-blue bg-brand-blue-light/30 text-brand-blue font-bold shadow-sm' 
                          : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          selectedTenant?.id === tenant.id ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {tenant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-tight">{tenant.name}</p>
                          <p className="text-[9px] font-medium opacity-60">{tenant.plan}</p>
                        </div>
                      </div>
                      {selectedTenant?.id === tenant.id && <Check size={14} />}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setActiveTab('tenants')}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-white border border-border text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  <Users size={16} />
                  Administración de Inquilinos
                </button>
              </div>

              {/* Appearance & Other Settings */}
              <div className="space-y-8">
                <div className="dashboard-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                      <Eye size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Apariencia</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tema Visual</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-brand-blue text-white ring-4 ring-brand-blue/10">
                      <div className="w-full h-12 bg-white/20 rounded-lg" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Claro</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-border text-slate-400 grayscale hover:grayscale-0 transition-all">
                      <div className="w-full h-12 bg-slate-800 rounded-lg" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Oscuro</span>
                    </button>
                  </div>
                </div>

                <div className="dashboard-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Conexión Flow</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Entorno de Mensajería</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFlowUrl('http://localhost:3014')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          flowUrl === 'http://localhost:3014' 
                            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                            : 'bg-slate-50 border border-border text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        Local
                      </button>
                      <button 
                        onClick={() => setFlowUrl('https://flow.pitayacode.io')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          flowUrl.includes('pitayacode.io') 
                            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                            : 'bg-slate-50 border border-border text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        Producción
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="text" 
                        value={flowUrl}
                        onChange={(e) => setFlowUrl(e.target.value)}
                        placeholder="URL de API Flow"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-blue transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Users size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Slug del Inquilino (Flow)</p>
                        <input 
                          type="text" 
                          value={flowTenantSlug}
                          onChange={(e) => setFlowTenantSlug(e.target.value)}
                          placeholder="e.g. pitaya"
                          className="w-full px-0 py-1 bg-transparent border-b border-transparent focus:border-brand-blue text-xs font-bold text-slate-700 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Key size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">API Key (Flow)</p>
                        <input 
                          type="password" 
                          value={flowApiKey}
                          onChange={(e) => setFlowApiKey(e.target.value)}
                          placeholder="Paste your Flow API Key here"
                          className="w-full px-0 py-1 bg-transparent border-b border-transparent focus:border-brand-blue text-xs font-bold text-slate-700 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const btn = document.getElementById('save-btn');
                        if (btn) {
                          btn.innerText = '¡Guardado!';
                          btn.classList.add('bg-emerald-500');
                          setTimeout(() => {
                            btn.innerText = 'Guardar Cambios';
                            btn.classList.remove('bg-emerald-500');
                          }, 2000);
                        }
                      }}
                      id="save-btn"
                      className="w-full mt-6 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={14} />
                      Guardar Cambios
                    </button>
                  </div>
                </div>

                <div className="dashboard-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">AI Copilot</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Preferencias</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Configura el nivel de asistencia y las sugerencias automáticas de la IA en tu flujo de trabajo.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{activeTab} Section</h2>
              <p className="text-slate-400 mt-2 italic">Coming soon...</p>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-blue/40 hover:scale-110 transition-all z-20">
          <Plus size={28} />
        </button>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, className }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-brand-blue-light text-brand-blue font-bold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      } ${className || ''}`}
    >
      <div className={`${active ? 'text-brand-blue' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </button>
  )
}

function StatsCard({ title, value, trend, subtitle, badge, avatars, icon, color }: any) {
  const colorMap: any = {
    blue: 'border-b-4 border-brand-blue',
    amber: 'border-b-0',
    purple: 'border-b-0',
    slate: 'border-b-0',
  }

  return (
    <div className={`dashboard-card p-6 relative overflow-hidden ${colorMap[color] || ''}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{title}</p>
        {trend && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5">{icon} {trend}</span>}
        {badge && (
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
            badge === 'EN VIVO' ? 'bg-amber-100 text-amber-600' : 
            badge === 'HITL' ? 'bg-slate-100 text-slate-500' : 'bg-brand-blue-light text-brand-blue'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
          {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        {avatars && (
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-white bg-brand-blue-light text-[8px] font-bold text-brand-blue flex items-center justify-center">+9</div>
          </div>
        )}
      </div>
      {color === 'blue' && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
           <div className="h-full bg-brand-blue" style={{width: '94%'}} />
        </div>
      )}
    </div>
  )
}

function AlertItem({ title, desc, time, status }: any) {
  return (
    <div className="flex gap-4 p-4 border border-slate-50 rounded-xl hover:bg-slate-50 transition-all group">
      <div className={`w-1 h-full rounded-full ${status === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h5 className="font-bold text-sm text-slate-800">{title}</h5>
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">{desc}</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-brand-blue hover:text-brand-blue transition-all">Revisar Log</button>
          <button className="px-3 py-1 bg-brand-blue-light text-brand-blue border border-brand-blue/10 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all">Intervenir</button>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ icon, title, meta, quote, color }: any) {
  const bgMap: any = {
    blue: 'bg-brand-blue-light',
    purple: 'bg-purple-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
  }

  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgMap[color] || 'bg-slate-100'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h6 className="font-bold text-sm text-slate-800 leading-tight mb-1">{title}</h6>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{meta}</p>
        {quote && (
          <div className="bg-slate-50 p-3 rounded-xl border-l-2 border-brand-blue italic text-xs text-slate-500 leading-relaxed">
            {quote}
          </div>
        )}
      </div>
    </div>
  )
}
