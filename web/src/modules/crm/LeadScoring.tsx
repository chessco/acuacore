import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Trophy, 
  Flame, 
  Thermometer, 
  TrendingUp, 
  User, 
  Mail, 
  Phone,
  ArrowUpRight,
  Target,
  Zap,
  Clock,
  ChevronRight,
  Filter,
  BarChart3,
  DollarSign
} from 'lucide-react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'

export function LeadScoring() {
  const [rankedLeads, setRankedLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedTenant } = useTenant()

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'

  useEffect(() => {
    fetchScoring()
  }, [selectedTenant])

  const fetchScoring = async () => {
    if (!selectedTenant) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiUrl}/api/crm/scoring`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant.id 
        }
      })
      setRankedLeads(response.data)
    } catch (err) {
      console.error('Error fetching lead scoring:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTempColor = (temp: string) => {
    switch (temp) {
      case 'HOT': return 'bg-rose-500 shadow-rose-200 text-white'
      case 'WARM': return 'bg-amber-500 shadow-amber-200 text-white'
      default: return 'bg-slate-400 shadow-slate-100 text-white'
    }
  }

  const getTempIcon = (temp: string) => {
    switch (temp) {
      case 'HOT': return <Flame size={14} />
      case 'WARM': return <TrendingUp size={14} />
      default: return <Clock size={14} />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">IA Analizando Comportamiento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Premium Header */}
      <header className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-blue/20">
            <Target className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-display tracking-tight">Priorización IA (Scoring)</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Enfoque en Leads de Alta Conversión</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HOT: {rankedLeads.filter(l => l.temperature === 'HOT').length}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WARM: {rankedLeads.filter(l => l.temperature === 'WARM').length}</span>
             </div>
          </div>
          <button 
            onClick={fetchScoring}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
          >
            <Zap size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {rankedLeads.slice(0, 3).map((lead, idx) => (
              <motion.div 
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-6 rounded-[32px] bg-white border border-slate-100 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-500 ${idx === 0 ? 'ring-2 ring-brand-blue/20 scale-110 md:z-10' : ''}`}
              >
                {/* Rank Badge */}
                <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${
                  idx === 0 ? 'bg-amber-400 text-white' : 
                  idx === 1 ? 'bg-slate-300 text-white' : 
                  'bg-orange-300 text-white'
                }`}>
                  #{idx + 1}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-md">
                     <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name)}&background=random`} alt="Avatar" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 truncate w-full px-2">{lead.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{lead.company || 'Individuo'}</p>
                  
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(lead.score, 100)}%` }}
                        className={`h-full ${getTempColor(lead.temperature)}`}
                     />
                  </div>

                  <div className="flex items-center gap-4 w-full">
                     <div className="flex-1 p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Score</p>
                        <p className="text-xl font-black text-brand-blue">{lead.score}</p>
                     </div>
                      <div className={`flex-1 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 ${getTempColor(lead.temperature)}`}>
                        {getTempIcon(lead.temperature)}
                        <span className="text-[9px] font-black uppercase">{lead.temperature}</span>
                      </div>
                  </div>

                  {/* AI Insights (Explicability) */}
                  {lead.insights && lead.insights.length > 0 && (
                    <div className="mt-6 w-full text-left space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Análisis de la IA</p>
                      {lead.insights.map((insight: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[10px] text-slate-500 font-medium leading-tight">
                          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full mt-1 shrink-0" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed List */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <Filter size={16} className="text-brand-blue" /> Ranking Completo
                </h3>
                <div className="flex gap-2">
                   <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">Todos</button>
                   <button className="px-3 py-1.5 hover:bg-white rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Recientes</button>
                </div>
             </div>

             <div className="divide-y divide-slate-50">
                {rankedLeads.slice(3).map((lead, idx) => (
                  <motion.div 
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-6 flex-1">
                       <span className="text-sm font-black text-slate-300 w-6">#{idx + 4}</span>
                       <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name)}&background=random`} alt="Avatar" />
                       </div>
                        <div>
                           <h4 className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{lead.name}</h4>
                           <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Mail size={10} /> {lead.email || 'N/A'}</span>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Target size={10} /> {lead._count.leads} Leads</span>
                           </div>
                           {/* List Insights */}
                           {lead.insights && lead.insights.length > 0 && (
                             <p className="text-[10px] text-brand-blue font-bold mt-1.5 italic">
                               💡 {lead.insights[0]}
                             </p>
                           )}
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Interacciones</p>
                          <div className="flex gap-1">
                             {lead._count.orders > 0 && <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center" title="Pedidos"><DollarSign size={10} /></div>}
                             {lead._count.deals > 0 && <div className="w-5 h-5 rounded-md bg-brand-blue-light text-brand-blue flex items-center justify-center" title="Deals"><Trophy size={10} /></div>}
                             {lead._count.activities > 0 && <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center" title="Actividad"><BarChart3 size={10} /></div>}
                          </div>
                       </div>

                       <div className="flex items-center gap-4 w-40">
                          <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm ${getTempColor(lead.temperature)}`}>
                             {getTempIcon(lead.temperature)}
                             <span className="text-[10px] font-black uppercase tracking-tighter">{lead.temperature}</span>
                          </div>
                          <div className="text-right min-w-[40px]">
                             <p className="text-lg font-black text-slate-800">{lead.score}</p>
                          </div>
                       </div>

                       <button className="p-2.5 text-slate-300 hover:text-brand-blue hover:bg-white rounded-xl transition-all">
                          <ChevronRight size={20} />
                       </button>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
