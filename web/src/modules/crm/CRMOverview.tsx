import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Award,
  ChevronRight
} from 'lucide-react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export function CRMOverview() {
  const { selectedTenant } = useTenant()
  const [stats, setStats] = useState<any>({
    totalLeads: 0,
    activeDeals: 0,
    conversionRate: 0,
    forecast: 0,
    funnel: [],
    recentActivity: [],
    forecastChart: []
  })
  const [loading, setLoading] = useState(true)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'

  useEffect(() => {
    fetchStats()
  }, [selectedTenant])

  const fetchStats = async () => {
    if (!selectedTenant) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'x-tenant-id': selectedTenant.id };
      
      const [contactsRes, dealsRes, forecastRes] = await Promise.all([
        axios.get(`${apiUrl}/api/crm/contacts`, { headers }),
        axios.get(`${apiUrl}/api/crm/deals`, { headers }),
        axios.get(`${apiUrl}/api/crm/forecast`, { headers })
      ]);

      const contacts = contactsRes.data;
      const deals = dealsRes.data;
      const forecast = forecastRes.data;

      setStats({
        totalLeads: contacts.length,
        activeDeals: deals.filter((d: any) => d.status === 'OPEN').length,
        conversionRate: ((deals.filter((d: any) => d.status === 'WON').length / (contacts.length || 1)) * 100).toFixed(1),
        forecast: forecast.totalForecastNextMonth,
        forecastChart: forecast.forecastData,
        funnel: [
          { name: 'Leads', value: contacts.length },
          { name: 'Negociación', value: deals.filter((d: any) => d.stage === 'NEGOTIATION').length },
          { name: 'Ganados', value: deals.filter((d: any) => d.status === 'WON').length }
        ],
        recentActivity: contacts.slice(0, 5).map((c: any) => ({
          id: c.id,
          user: c.name,
          action: 'Nuevo Lead Capturado',
          time: 'Hace 5 min',
          type: 'LEAD'
        }))
      })
    } catch (err) {
      console.error('Error fetching CRM stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
     return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Calculando ROI...</div>
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-[#001A41] tracking-tight">CRM Intelligence</h1>
             <p className="text-slate-500 font-medium">Panel de control de ingresos y conversión omnicanal.</p>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Últimos 30 días</span>
             </div>
             <button className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                Exportar Reporte
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Leads" 
            value={stats.totalLeads} 
            trend="+12%" 
            isUp={true} 
            icon={<Users className="text-blue-600" size={20} />} 
            color="blue"
          />
          <StatCard 
            title="Deals Activos" 
            value={stats.activeDeals} 
            trend="+5%" 
            isUp={true} 
            icon={<Target className="text-purple-600" size={20} />} 
            color="purple"
          />
          <StatCard 
            title="Conversión" 
            value={`${stats.conversionRate}%`} 
            trend="-2%" 
            isUp={false} 
            icon={<Zap className="text-amber-600" size={20} />} 
            color="amber"
          />
          <StatCard 
            title="Forecast (USD)" 
            value={`$${stats.forecast.toLocaleString()}`} 
            trend="+24%" 
            isUp={true} 
            icon={<DollarSign className="text-emerald-600" size={20} />} 
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-[#001A41]">Rendimiento de Ventas</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Leads</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Deals</span>
                   </div>
                </div>
             </div>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                         <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                      <Area type="monotone" dataKey="deals" stroke="#a855f7" strokeWidth={3} fill="none" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-[#001A41] p-8 rounded-[2.5rem] shadow-2xl text-white overflow-hidden relative">
             <div className="relative z-10">
                <h3 className="text-lg font-black mb-6">Funnel de Conversión</h3>
                <div className="space-y-6">
                   {stats.funnel.map((item: any, idx: number) => (
                      <div key={item.name} className="space-y-2">
                         <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">{item.name}</span>
                            <span className="text-lg font-black">{item.value}</span>
                         </div>
                         <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(item.value / stats.funnel[0].value) * 100}%` }}
                               className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-blue-500 to-indigo-500' : idx === 1 ? 'from-purple-500 to-pink-500' : 'from-emerald-500 to-teal-500'}`}
                            />
                         </div>
                      </div>
                   ))}
                </div>
                <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                         <TrendingUp size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-blue-300 uppercase">Insight de IA</p>
                         <p className="text-sm font-medium">El canal de **WhatsApp** tiene un 25% más de cierre este mes.</p>
                      </div>
                   </div>
                </div>
             </div>
             {/* Decorative element */}
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Recent Activity */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-black text-[#001A41]">Actividad Omnicanal</h3>
                 <button className="text-xs font-black text-blue-600 uppercase">Ver Todo</button>
              </div>
              <div className="space-y-4">
                 {stats.recentActivity.map((act: any) => (
                    <div key={act.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.type === 'LEAD' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {act.type === 'LEAD' ? <UserPlus size={18} /> : <ShoppingBag size={18} />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-[#001A41]">{act.user}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{act.action}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-slate-300">{act.time}</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Top Performers / Goals */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-black text-[#001A41]">Metas de Ventas</h3>
                 <div className="flex items-center gap-2">
                    <Award size={18} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-400">84% completado</span>
                 </div>
              </div>
              <div className="space-y-8">
                 <GoalItem title="Nuevos Clientes" current={84} goal={100} color="blue" />
                 <GoalItem title="Ingresos Mensuales" current={12400} goal={15000} color="emerald" prefix="$" />
                 <GoalItem title="Interacciones IA" current={1450} goal={2000} color="purple" />
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, trend, isUp, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600 shadow-blue-900/5',
    purple: 'bg-purple-50 border-purple-100 text-purple-600 shadow-purple-900/5',
    amber: 'bg-amber-50 border-amber-100 text-amber-600 shadow-amber-900/5',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-900/5',
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} border`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-[#001A41]">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{title}</p>
      </div>
    </motion.div>
  )
}

function GoalItem({ title, current, goal, color, prefix = '' }: any) {
  const percentage = Math.min((current / goal) * 100, 100)
  const colors: any = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="space-y-3">
       <div className="flex justify-between items-end">
          <div>
             <p className="text-sm font-black text-[#001A41]">{title}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Meta: {prefix}{goal.toLocaleString()}</p>
          </div>
          <p className="text-lg font-black text-[#001A41]">{prefix}{current.toLocaleString()}</p>
       </div>
       <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${percentage}%` }}
             className={`h-full ${colors[color]} rounded-full`}
          />
       </div>
    </div>
  )
}
