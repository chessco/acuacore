import { 
  LayoutDashboard, 
  Settings, 
  Server,
  Activity,
  Users,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Fish,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Zap,
  MessageSquareQuote,
  Database as DatabaseIcon
} from 'lucide-react'
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts'
import { useState } from 'react'
import { SkillsManager } from './SkillsManager'
import { AgentsManager } from './AgentsManager'
import { Inbox } from './Inbox'
import { KnowledgeBase } from './KnowledgeBase'
import { HITL } from './HITL'
import { TenantManager } from './TenantManager'
import { CorrectionsManager } from './CorrectionsManager'
import { useTenant } from '../../contexts/TenantContext'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useEffect } from 'react'

const chartData = [
  { name: 'Mon', cpu: 45, inference: 32 },
  { name: 'Tue', cpu: 52, inference: 48 },
  { name: 'Wed', cpu: 48, inference: 42 },
  { name: 'Thu', cpu: 65, inference: 55 },
  { name: 'Fri', cpu: 72, inference: 68 },
]

export function SystemDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { selectedTenant, tenants, setSelectedTenant } = useTenant()
  const { t, i18n } = useTranslation()
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')

  useEffect(() => {
    fetchCurrentModel()
  }, [])

  const fetchCurrentModel = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:3014') + '';
    try {
      const res = await axios.post(`${apiUrl}/api/ai/model/current`)
      setSelectedModel(res.data.model)
    } catch (err) {
      console.error('Error fetching current model:', err)
    }
  }

  const handleUpdateModel = async (model: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:3014') + '';
    try {
      await axios.post(`${apiUrl}/api/ai/model`, { model })
      setSelectedModel(model)
      alert(`Motor de IA actualizado a ${model}`)
    } catch (err) {
      alert('Error al actualizar el motor de IA.')
    }
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex h-screen bg-surface text-text-main overflow-hidden font-sans">
      {/* Sidebar - Light Design */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-deep rounded-full flex items-center justify-center shadow-lg shadow-brand-deep/30 text-white">
              <Fish size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight font-display text-brand-deep">AcuaCore AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 mt-4 ml-2">{t('nav.monitor_operativo') || 'Monitor Operativo'}</p>
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label={t('inbox')} 
            active={activeTab === 'conversations'} 
            onClick={() => setActiveTab('conversations')}
          />
          <NavItem 
            icon={<ShieldCheck size={20} />} 
            label={t('hitl')} 
            active={activeTab === 'hitl'} 
            onClick={() => setActiveTab('hitl')}
          />
          <NavItem 
            icon={<Sparkles size={20} />} 
            label={t('agents')} 
            active={activeTab === 'agents'} 
            onClick={() => setActiveTab('agents')} 
          />
          <NavItem 
            icon={<Zap size={20} />} 
            label={t('skills')} 
            active={activeTab === 'skills'} 
            onClick={() => setActiveTab('skills')} 
          />
          <NavItem 
            icon={<DatabaseIcon size={20} />} 
            label={t('knowledge')} 
            active={activeTab === 'kb'} 
            onClick={() => setActiveTab('kb')}
          />
          <NavItem 
            icon={<MessageSquareQuote size={20} />} 
            label="Correcciones" 
            active={activeTab === 'corrections'} 
            onClick={() => setActiveTab('corrections')}
          />

          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 mt-6 ml-2">{t('nav.gestion_sistema') || 'Gestión Sistema'}</p>
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label={t('dashboard')} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label={t('tenants')} 
            active={activeTab === 'tenants'} 
            onClick={() => setActiveTab('tenants')}
          />
          <NavItem 
            icon={<Server size={20} />} 
            label={t('infra')} 
            active={activeTab === 'infra'} 
            onClick={() => setActiveTab('infra')}
          />
          <NavItem 
            icon={<Activity size={20} />} 
            label={t('logs')} 
            active={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')}
          />
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="mb-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Contexto Inquilino</p>
            <div className="px-2">
              <select 
                value={selectedTenant?.id} 
                onChange={(e) => {
                  const t = tenants.find(t => t.id === e.target.value);
                  if (t) setSelectedTenant(t);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-brand-blue"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <NavItem 
              icon={<Settings size={18} />} 
              label="Configuración" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-rose-500 hover:bg-rose-50 font-semibold text-sm transition-all"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Root+Admin&background=003B71&color=fff" alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Root Admin</p>
              <p className="text-xs text-brand-blue font-black uppercase tracking-tighter">Superuser</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar inquilinos, nodos, servicios..." 
              className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-brand-blue transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-400">
              <Bell size={20} className="hover:text-brand-blue cursor-pointer transition-all" />
              <HelpCircle size={20} className="hover:text-brand-blue cursor-pointer transition-all" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-deep text-white font-bold rounded-xl shadow-lg shadow-brand-deep/20 text-sm hover:opacity-90 transition-all">
              Desplegar Actualización
            </button>
          </div>
        </header>

        <div className="p-8 h-full flex flex-col">
          {activeTab === 'dashboard' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black font-display text-slate-800">{t('system_command_center')}</h2>
                <p className="text-sm text-slate-500">{t('system_subtitle')}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <StatsCard title="INQUILINOS ACTIVOS" value="124" trend="+12" color="blue" />
                <StatsCard title="LATENCIA PROMEDIO" value="42ms" trend="-5%" color="emerald" />
                <StatsCard title="EFICIENCIA IA GLOBAL" value="94.2%" trend="+1.2%" color="indigo" />
                <StatsCard title="UPTIME (30D)" value="99.99%" trend="0.0%" color="slate" />
              </div>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8">
                  <div className="dashboard-card p-6 h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="font-bold text-lg">Escalamiento de Recursos</h3>
                      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-brand-blue rounded-full" /> CARGA CPU</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-brand-deep rounded-full" /> INFERENCIAS IA</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#377DFF" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#377DFF" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#003B71" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#003B71" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="cpu" stroke="#377DFF" fillOpacity={1} fill="url(#colorCPU)" strokeWidth={3} />
                        <Area type="monotone" dataKey="inference" stroke="#003B71" fillOpacity={1} fill="url(#colorInf)" strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-span-4">
                  <div className="dashboard-card p-6 h-full">
                    <h3 className="font-bold text-lg mb-6">Eventos de Sistema</h3>
                    <div className="space-y-6">
                      <SystemEvent title="Nodo Auto-escalado: US-EAST-1" type="success" time="1m ago" />
                      <SystemEvent title="Alerta de Seguridad: Rate Limit" type="warning" time="12m ago" />
                      <SystemEvent title="Backup Completado" type="info" time="45m ago" />
                      <SystemEvent title="Nuevo Inquilino Creado" type="success" time="2h ago" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'conversations' && (
            <div className="flex-1 -m-8 overflow-hidden">
               <Inbox setActiveTab={() => {}} />
            </div>
          )}

          {activeTab === 'hitl' && (
            <HITL />
          )}

          {activeTab === 'kb' && (
            <KnowledgeBase />
          )}

          {activeTab === 'corrections' && (
            <CorrectionsManager />
          )}

          {activeTab === 'tenants' && (
            <TenantManager />
          )}

          {activeTab === 'agents' && (
            <AgentsManager />
          )}
          
          {activeTab === 'skills' && (
            <SkillsManager />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-black font-display text-slate-800">{t('global_config')}</h2>
                <p className="text-sm text-slate-500">{t('global_config_subtitle')}</p>
              </div>

              <div className="space-y-8">
                <div className="dashboard-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                      <Search size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{t('language')}</h3>
                      <p className="text-xs text-slate-400">{t('language_desc')}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => changeLanguage('es')}
                      className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${
                        i18n.language === 'es' 
                          ? 'border-brand-blue bg-brand-blue-light/20 text-brand-blue' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      Español
                    </button>
                    <button 
                      onClick={() => changeLanguage('en')}
                      className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${
                        i18n.language === 'en' 
                          ? 'border-brand-blue bg-brand-blue-light/20 text-brand-blue' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="dashboard-card p-8">
                  <h3 className="text-lg font-bold mb-6">Seguridad y API</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold">INTERNAL_API_KEY</p>
                        <p className="text-xs text-slate-400">Llave para comunicación entre microservicios (Flow ↔ Acuacore).</p>
                      </div>
                      <code className="bg-slate-50 px-3 py-1 rounded text-xs border border-slate-200">ACUA_••••••••</code>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                      <div>
                        <p className="text-sm font-bold">Motor de IA Global (Vision & Chat)</p>
                        <p className="text-xs text-slate-400">Selecciona el modelo de Gemini que alimentará a todos los agentes.</p>
                      </div>
                      <select 
                        value={selectedModel}
                        onChange={(e) => handleUpdateModel(e.target.value)}
                        className="bg-brand-deep text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-none shadow-lg shadow-brand-deep/20"
                      >
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                      <div>
                        <p className="text-sm font-bold">Límite de Inferencia por Tenant</p>
                        <p className="text-xs text-slate-400">Cuota máxima de mensajes IA por hora.</p>
                      </div>
                      <input type="number" defaultValue={100} className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="dashboard-card p-8 border-brand-blue/20 bg-brand-blue/[0.02]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-brand-blue mb-1">Cerebros de IA (Prompts)</h3>
                      <p className="text-sm text-slate-500">Configura el comportamiento y conocimiento de agentes como Don Juan.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('skills')}
                      className="px-6 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <Sparkles size={16} />
                      Gestionar Agentes
                    </button>
                  </div>
                </div>

                <div className="dashboard-card p-8 bg-rose-50/30 border-rose-100">
                  <h3 className="text-lg font-bold text-rose-800 mb-6">Zona de Peligro</h3>
                  <button className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 text-sm hover:opacity-90 transition-all">
                    Reiniciar Servicios Globales
                  </button>
                </div>
              </div>
            </div>
          )}

          {['infra', 'logs'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-40 text-slate-300">
              <Activity className="animate-pulse mb-4" size={48} />
              <p className="font-bold uppercase tracking-[0.2em] text-xs">Módulo {activeTab.toUpperCase()} en construcción</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-brand-blue-light text-brand-blue font-bold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <div className={`${active ? 'text-brand-blue' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </button>
  )
}

function StatsCard({ title, value, trend, color }: any) {
  const colors: any = {
    blue: 'text-brand-blue',
    emerald: 'text-emerald-500',
    indigo: 'text-indigo-500',
    slate: 'text-slate-500',
  }

  return (
    <div className="dashboard-card p-6">
      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <h4 className={`text-2xl font-black tracking-tight ${colors[color] || 'text-slate-800'}`}>{value}</h4>
        <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}

function SystemEvent({ title, type, time }: any) {
  const icons: any = {
    success: <CheckCircle2 className="text-emerald-500" size={16} />,
    warning: <AlertCircle className="text-amber-500" size={16} />,
    info: <Activity className="text-brand-blue" size={16} />,
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 leading-tight truncate">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium">{time}</p>
      </div>
    </div>
  )
}

