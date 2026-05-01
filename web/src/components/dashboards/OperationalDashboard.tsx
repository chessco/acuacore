import { 
  LayoutDashboard, 
  MessageSquare, 
  ShieldCheck, 
  Database, 
  Settings, 
  TrendingUp,
  AlertCircle,
  Fish,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  FileText,
  Eye,
  Plus,
  Check,
  Sparkles,
  Users,
  BarChart3,
  Key,
  Loader2,
  Zap,
  MessageSquareQuote
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
import { SystemStatus } from './SystemStatus'
import { KnowledgeBase } from './KnowledgeBase'
import { Analytics } from './Analytics'
import { HITL } from './HITL'
import { SkillsManager } from './SkillsManager'
import { AgentsManager } from './AgentsManager'
import { TenantManager } from './TenantManager'
import { useTenant } from '../../contexts/TenantContext'
import { PredictiveHub } from './PredictiveHub'
import { ProtocolArchitecture } from './ProtocolArchitecture'
import { VisionLab } from './VisionLab'
import { CorrectionsManager } from './CorrectionsManager'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'

const chartData = [
  { name: 'Mon', automation: 65, hitl: 12 },
  { name: 'Tue', automation: 72, hitl: 8 },
  { name: 'Wed', automation: 68, hitl: 15 },
  { name: 'Thu', automation: 85, hitl: 5 },
  { name: 'Fri', automation: 92, hitl: 3 },
]

import axios from 'axios'

export function OperationalDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    const role = localStorage.getItem('acuacore_role');
    return role === 'operator' ? 'conversations' : 'dashboard';
  })
  const userEmail = localStorage.getItem('acuacore_user_email');
  const { 
    selectedTenant, 
    setSelectedTenant, 
    tenants, 
    flowUrl, 
    setFlowUrl, 
    flowTenantSlug, 
    setFlowTenantSlug,
    flowApiKey,
    setFlowApiKey,
    role,
    tenantLanguages,
    setTenantLanguage
  } = useTenant()
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng: 'es' | 'en') => {
    if (selectedTenant) {
      setTenantLanguage(selectedTenant.id, lng);
    }
    i18n.changeLanguage(lng);
  };

  const [stats, setStats] = useState<any>(null)
  const [dashboardChartData, setDashboardChartData] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats()
    }
  }, [activeTab, selectedTenant])

  const fetchDashboardStats = async () => {
    setLoadingStats(true)
    try {
      const response = await axios.get('http://localhost:3014/api/analytics/dashboard', {
        headers: { 
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey,
          'x-operator-email': userEmail || ''
        }
      })
      setStats(response.data.stats)
      setDashboardChartData(response.data.chartData)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

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
          {role !== 'operator' && (
            <>
              <NavItem 
                icon={<ShieldCheck size={20} />} 
                label="HITL" 
                active={activeTab === 'hitl'} 
                onClick={() => setActiveTab('hitl')}
              />
              <NavItem 
                icon={<MessageSquareQuote size={20} />} 
                label="Correcciones" 
                active={activeTab === 'corrections'} 
                onClick={() => setActiveTab('corrections')}
              />
              <NavItem 
                icon={<Database size={20} />} 
                label="Conocimiento" 
                active={activeTab === 'kb'} 
                onClick={() => setActiveTab('kb')}
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
                icon={<BarChart3 size={20} />} 
                label="Analíticas" 
                active={activeTab === 'analytics'} 
                onClick={() => setActiveTab('analytics')}
              />
            </>
          )}
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
      <main className="flex-1 overflow-hidden relative flex flex-col h-screen">
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

        {/* Tab Content Wrapper */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'dashboard' && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard 
                  title="TASA DE AUTOMATIZACIÓN IA" 
                  value={loadingStats ? '...' : stats?.automationRate || '0%'} 
                  trend="+2.4%" 
                  icon={<Plus size={16} />}
                  color="blue"
                />
                <StatsCard 
                  title="CONVERSACIONES ACTIVAS" 
                  value={loadingStats ? '...' : stats?.activeConversations || '0'} 
                  subtitle="Basado en volumen real"
                  badge="EN VIVO"
                  color="amber"
                />
                <StatsCard 
                  title="REVISIONES PENDIENTES" 
                  value={loadingStats ? '...' : stats?.pendingReviews || '0'} 
                  subtitle="Requieren intervención humana"
                  badge="HITL"
                  color="purple"
                />
                <StatsCard 
                  title="USO POR INQUILINO" 
                  value={loadingStats ? '...' : stats?.tenantUsage || '0 / 15'} 
                  badge="ACTIVOS"
                  avatars={true}
                  color="slate"
                />
              </div>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8">
                  <div className="dashboard-card p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 text-rose-500">
                        <AlertCircle size={20} />
                        <h3 className="font-bold">Alertas y Conversaciones Marcadas</h3>
                      </div>
                      <button className="text-brand-blue text-xs font-bold hover:underline">Ver todas</button>
                    </div>
                    <div className="space-y-6">
                      {loadingStats ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando alertas...</div>
                      ) : stats?.alerts?.length > 0 ? (
                        stats.alerts.map((alert: any) => (
                          <AlertItem 
                            key={alert.id}
                            title={alert.title} 
                            desc={`Inquilino: ${alert.tenant} • ${alert.description}`} 
                            time={alert.time}
                            status={alert.title.includes('Confianza') ? 'warning' : 'urgent'}
                          />
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">Sin alertas críticas</div>
                      )}
                    </div>
                  </div>

                  <div className="dashboard-card p-6">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="font-bold text-lg">Volumen de Conversaciones</h3>
                      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-brand-blue rounded-full" /> AUTOMATIZADO</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full" /> HITL</span>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      {loadingStats ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="animate-spin text-slate-200" size={40} />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dashboardChartData.length > 0 ? dashboardChartData : chartData}>
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
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-4">
                  <div className="dashboard-card p-6 h-full flex flex-col">
                    <h3 className="font-bold text-lg mb-8">Actividad Reciente</h3>
                    <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {loadingStats ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando actividad...</div>
                      ) : stats?.activity?.length > 0 ? (
                        stats.activity.map((item: any) => (
                          <ActivityItem 
                            key={item.id}
                            icon={
                              item.type === 'check' ? <Fish className="text-brand-blue" /> : 
                              item.type === 'user' ? <Users className="text-emerald-500" /> :
                              <Settings className="text-purple-500" />
                            }
                            title={item.title}
                            meta={`INQUILINO: ${item.tenant} • ${item.time}`}
                            quote={item.description}
                            color={
                              item.type === 'check' ? 'blue' : 
                              item.type === 'user' ? 'emerald' : 
                              'purple'
                            }
                          />
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">Sin actividad reciente</div>
                      )}
                    </div>
                    <button className="mt-8 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">
                      Refrescar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="h-full">
              <Inbox setActiveTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'predictive' && <PredictiveHub />}
          {activeTab === 'protocols' && <ProtocolArchitecture />}
          {activeTab === 'vision' && <VisionLab />}
          {activeTab === 'kb' && <KnowledgeBase />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'hitl' && <HITL />}
          {activeTab === 'corrections' && <CorrectionsManager />}
          {activeTab === 'agents' && <AgentsManager />}
          {activeTab === 'skills' && <SkillsManager />}
          {activeTab === 'tenants' && <TenantManager />}
          
          {activeTab === 'settings' && (
            <div className="p-8 max-w-4xl mx-auto w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800">{t('global_config')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('global_config_subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {role === 'system' ? (
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
                              {tenant.name.substring(0,1)}
                            </div>
                            <span className="font-bold">{tenant.name}</span>
                          </div>
                          {selectedTenant?.id === tenant.id && <Check size={16} />}
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
                ) : (
                  <div className="dashboard-card p-8 bg-slate-50 flex flex-col items-center justify-center text-center">
                    <ShieldCheck size={48} className="text-slate-300 mb-4" />
                    <h3 className="font-bold text-slate-800 mb-2">Perfil Administrador</h3>
                    <p className="text-xs text-slate-500 max-w-[200px]">Estás operando en {selectedTenant?.name}. Los cambios de inquilino son gestionados por el Administrador de Sistema.</p>
                  </div>
                )}

                <div className="space-y-8">
                  <SystemStatus flowApiKey={flowApiKey} />
                  
                  <div className="dashboard-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Search size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{t('language')}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('language_desc')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => changeLanguage('es')}
                        className={`py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 ${
                          i18n.language === 'es' 
                            ? 'border-brand-blue bg-brand-blue-light/20 text-brand-blue' 
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        Español
                      </button>
                      <button 
                        onClick={() => changeLanguage('en')}
                        className={`py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 ${
                          i18n.language === 'en' 
                            ? 'border-brand-blue bg-brand-blue-light/20 text-brand-blue' 
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

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
                </div>
              </div>
            </div>
          )}
          {/* Fallback for other tabs */}
          {![
            'dashboard', 'conversations', 'predictive', 'protocols', 'vision', 
            'kb', 'analytics', 'hitl', 'corrections', 'agents', 'skills', 
            'tenants', 'settings'
          ].includes(activeTab) && (
            <div className="p-8 flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{activeTab} Section</h2>
                <p className="text-slate-400 mt-2 italic">Coming soon...</p>
              </div>
            </div>
          )}
        </div>

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
