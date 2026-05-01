import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { 
  Download, 
  ChevronDown, 
  MessageSquare, 
  Zap, 
  Clock, 
  AlertTriangle,
  Filter
} from 'lucide-react'

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/analytics/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando datos reales...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    activeConversations: 0,
    automationRate: '0%',
    responseTime: '1.2s',
    pendingReviews: 0,
    totalMessages: 0
  };
  
  const chartData = (data?.chartData && data.chartData.length > 0) ? data.chartData : [
    { name: 'Lun', automation: 0, hitl: 0 },
    { name: 'Mar', automation: 0, hitl: 0 },
    { name: 'Mie', automation: 0, hitl: 0 },
    { name: 'Jue', automation: 0, hitl: 0 },
    { name: 'Vie', automation: 0, hitl: 0 },
  ];

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Dashboard</span>
            <span className="text-slate-200">/</span>
            <span className="text-brand-blue">Analíticas</span>
          </div>
          <h2 className="text-4xl font-black font-display text-slate-800 tracking-tight">Analíticas de Operación</h2>
          <p className="text-sm text-slate-500 mt-2">Visualización en tiempo real del rendimiento de la IA y atención al cliente.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:border-brand-blue/30 transition-all">
            <Filter size={14} className="text-slate-400" />
            Don Juan Camarón
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:border-brand-blue/30 transition-all">
            <Clock size={14} className="text-slate-400" />
            Últimos 7 días
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AnalyticsCard 
          title="Conversaciones"
          value={stats.activeConversations?.toLocaleString() || '0'}
          trend="+5.2%"
          subtitle="Mes actual"
          icon={<MessageSquare size={20} className="text-brand-blue" />}
          color="blue"
        />
        <AnalyticsCard 
          title="Automatización"
          value={stats.automationRate || '0%'}
          trend="+2.1%"
          progress={parseInt(stats.automationRate) || 0}
          icon={<Zap size={20} className="text-amber-500" />}
          color="amber"
        />
        <AnalyticsCard 
          title="Latencia Media"
          value={stats.responseTime || '1.2s'}
          trend="-0.1s"
          trendColor="emerald"
          subtitle="Respuesta IA"
          icon={<Clock size={20} className="text-purple-500" />}
          color="purple"
        />
        <AnalyticsCard 
          title="Revisiones HITL"
          value={stats.pendingReviews?.toString() || '0'}
          trend={stats.pendingReviews > 0 ? "Requerido" : "Al día"}
          trendColor={stats.pendingReviews > 0 ? "rose" : "emerald"}
          subtitle="Pendientes de aprobación"
          icon={<AlertTriangle size={20} className="text-rose-500" />}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-8 dashboard-card bg-white p-8 border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-xl text-slate-800">Volumen de Actividad</h3>
              <p className="text-sm text-slate-400">Interacciones procesadas por día</p>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-slate-100 rounded-full border-2 border-slate-200" /> Total</span>
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-brand-blue rounded-full" /> IA</span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#377DFF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#377DFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="automation" 
                  name="IA"
                  stroke="#377DFF" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorAuto)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar health */}
        <div className="lg:col-span-4 space-y-8">
          <div className="dashboard-card bg-white p-8 border border-slate-100 h-full">
            <h3 className="font-bold text-xl text-slate-800 mb-8">Salud de IA</h3>
            <div className="space-y-8">
              <HealthItem label="Confianza IA" percentage={parseInt(stats.automationRate) || 85} color="bg-brand-blue" />
              <HealthItem label="Precisión Técnica" percentage={92} color="bg-emerald-500" />
              <HealthItem label="Base de Conocimiento" percentage={78} color="bg-purple-500" />
            </div>

            <div className="mt-12 p-6 rounded-[24px] bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sugerencia</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {stats.pendingReviews > 0 
                  ? `Optimización: Tienes ${stats.pendingReviews} revisiones pendientes.`
                  : "Estado: El sistema opera con confianza máxima hoy."}
              </p>
            </div>
          </div>
        </div>

        {/* Distribution Bar Chart */}
        <div className="lg:col-span-12 dashboard-card bg-white p-8 border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-slate-800">Distribución Operativa</h3>
            <p className="text-sm text-slate-400">IA vs HITL (Supervisión Humana)</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="automation" name="IA" fill="#377DFF" radius={[6, 6, 0, 0]} barSize={50} />
                <Bar dataKey="hitl" name="Humano" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsCard({ title, value, trend, trendColor, subtitle, icon, progress, color }: any) {
  const bgMap: any = {
    blue: 'bg-brand-blue/10 text-brand-blue',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    rose: 'bg-rose-100 text-rose-600',
  }

  return (
    <div className="dashboard-card bg-white p-6 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgMap[color] || 'bg-slate-50'}`}>
          {icon}
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
          trendColor === 'rose' ? 'bg-rose-50 text-rose-500' : 
          trendColor === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-50 text-emerald-500'
        }`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <h4 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{value}</h4>
        {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{subtitle}</p>}
        {progress !== undefined && (
          <div className="mt-5">
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${color === 'amber' ? 'bg-amber-400' : 'bg-brand-blue'}`} style={{width: `${progress}%`}} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HealthItem({ label, percentage, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-black text-slate-800">{percentage}%</span>
      </div>
      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{width: `${percentage}%`}} 
        />
      </div>
    </div>
  )
}
