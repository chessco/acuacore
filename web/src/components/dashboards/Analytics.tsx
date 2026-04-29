import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
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
  TrendingUp,
  Filter
} from 'lucide-react'

const lineData = [
  { name: '01', value: 30 },
  { name: '05', value: 45 },
  { name: '10', value: 35 },
  { name: '15', value: 55 },
  { name: '20', value: 48 },
  { name: '25', value: 65 },
  { name: '30', value: 58 },
  { name: '35', value: 75 },
  { name: '40', value: 68 },
]

const hitlData = [
  { name: 'Lun', automation: 85, hitl: 15 },
  { name: 'Mar', automation: 88, hitl: 12 },
  { name: 'Mie', automation: 82, hitl: 18 },
  { name: 'Jue', automation: 90, hitl: 10 },
  { name: 'Vie', automation: 92, hitl: 8 },
  { name: 'Sab', automation: 85, hitl: 15 },
  { name: 'Dom', automation: 89, hitl: 11 },
]

export function Analytics() {
  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Dashboard</span>
            <span className="text-slate-200">/</span>
            <span className="text-brand-blue">Analíticas</span>
          </div>
          <h2 className="text-3xl font-black font-display text-slate-800">Analíticas de Operación</h2>
          <p className="text-sm text-slate-500 mt-1">Visualización en tiempo real del rendimiento de la IA y atención al cliente.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-3">
            <button className="flex items-center gap-4 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-600 shadow-sm">
              <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                <Filter size={14} />
              </div>
              Todos los Tenants
              <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-4 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-600 shadow-sm">
              <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                <Clock size={14} />
              </div>
              Últimos 30 días
              <ChevronDown size={14} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <AnalyticsCard 
          title="Total Conversaciones"
          value="24,592"
          trend="+12.5%"
          subtitle="v.s. mes anterior"
          icon={<MessageSquare size={20} className="text-brand-blue" />}
          color="blue"
        />
        <AnalyticsCard 
          title="Tasa Automatización IA"
          value="88.4%"
          trend="+4.2%"
          progress={88.4}
          icon={<Zap size={20} className="text-amber-500" />}
          color="amber"
        />
        <AnalyticsCard 
          title="Tiempo de Respuesta"
          value="1.2s"
          trend="-18s"
          trendColor="emerald"
          subtitle="Promedio de latencia"
          icon={<Clock size={20} className="text-purple-500" />}
          color="purple"
        />
        <AnalyticsCard 
          title="Tasa de Error"
          value="0.45%"
          trend="+0.1%"
          trendColor="rose"
          subtitle="Alertas activas"
          icon={<AlertTriangle size={20} className="text-rose-500" />}
          color="rose"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-12 gap-8">
        {/* Automation Trend Chart */}
        <div className="col-span-8 dashboard-card bg-white p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Tasa de Automatización</h3>
              <p className="text-xs text-slate-400">Rendimiento histórico de la IA</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-200 rounded-full" /> Pasado</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-brand-blue rounded-full" /> Actual</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#377DFF" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#fff', stroke: '#377DFF', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#377DFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Errors by Category */}
        <div className="col-span-4 dashboard-card bg-white p-8">
          <h3 className="font-bold text-lg text-slate-800 mb-8">Errores por Categoría</h3>
          <div className="space-y-6">
            <ErrorItem label="Timeout de API" percentage={42} color="bg-rose-500" />
            <ErrorItem label="Falta de Contexto" percentage={28} color="bg-amber-500" />
            <ErrorItem label="Ambigüedad User" percentage={15} color="bg-indigo-500" />
            <ErrorItem label="Límite de Tokens" percentage={10} color="bg-purple-500" />
            <ErrorItem label="Otros" percentage={5} color="bg-slate-300" />
          </div>
        </div>

        {/* HITL vs Automation Chart */}
        <div className="col-span-12 dashboard-card bg-white p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg text-slate-800">HITL vs Automatización</h3>
              <p className="text-xs text-slate-400">Human-In-The-Loop vs Respuestas Automáticas</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="px-3 py-1 bg-white shadow-sm rounded-md text-[10px] font-bold text-slate-800">Semanal</button>
              <button className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all">Mensual</button>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hitlData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="automation" fill="#377DFF" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="hitl" fill="#003B71" radius={[4, 4, 0, 0]} barSize={40} />
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
    blue: 'bg-brand-blue/5',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    rose: 'bg-rose-50',
  }

  return (
    <div className="dashboard-card bg-white p-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgMap[color] || 'bg-slate-50'}`}>
          {icon}
        </div>
        <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${
          trendColor === 'rose' ? 'bg-rose-100 text-rose-500' : 
          trendColor === 'emerald' ? 'bg-emerald-100 text-emerald-500' : 'bg-emerald-50 text-emerald-500'
        }`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{value}</h4>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
        {progress && (
          <div className="mt-4">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${color === 'amber' ? 'bg-amber-400' : 'bg-brand-blue'}`} style={{width: `${progress}%`}} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorItem({ label, percentage, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-800">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{width: `${percentage}%`}} />
      </div>
    </div>
  )
}
