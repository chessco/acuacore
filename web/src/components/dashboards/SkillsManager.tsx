import { 
  Plus, 
  Thermometer, 
  Settings, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Clock, 
  FileText, 
  ChevronRight,
  Sparkles,
  Droplets,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export function SkillsManager() {
  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black font-display text-slate-800">Gestor de Habilidades</h2>
          <p className="text-sm text-slate-500 mt-1">Configura y supervisa los agentes de IA encargados de la optimización del ecosistema acuícola.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-all">
          <Plus size={20} />
          Crear nueva habilidad
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <SummaryCard 
          title="HABILIDADES ACTIVAS" 
          value="12" 
          trend="+2" 
          trendColor="emerald"
        />
        <SummaryCard 
          title="TASA DE ÉXITO GLOBAL" 
          value="98.4%" 
          trend="Óptimo" 
          trendColor="brand-blue"
        />
        <SummaryCard 
          title="LATENCIA MEDIA" 
          value="320ms" 
          trend="-12ms" 
          trendColor="slate-400"
        />
        <div className="bg-brand-blue p-6 rounded-[24px] text-white shadow-xl shadow-brand-blue/30 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">DESPLIEGUES HOY</p>
            <div className="flex items-end gap-2">
              <h4 className="text-3xl font-black">5</h4>
              <p className="text-[10px] font-bold mb-1.5 opacity-90">Sin errores</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
             <Zap size={60} />
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-3 gap-8">
        <SkillCard 
          icon={<Thermometer size={20} className="text-brand-blue" />}
          name="Monitor Térmico"
          version="v2.4.1"
          status="Activo"
          description="Ajuste automático de sistemas de calefacción basado en predicciones..."
          success="99.2%"
          latency="145ms"
          color="blue"
        />
        <SkillCard 
          icon={<Droplets size={20} className="text-amber-500" />}
          name="Optimizador de Dieta"
          version="v3.1.0"
          status="Activo"
          description="Cálculo de raciones precisas según biomasa y comportamiento de nado."
          success="97.8%"
          latency="410ms"
          color="amber"
        />
        <SkillCard 
          icon={<ShieldCheck size={20} className="text-purple-500" />}
          name="Analista Sanitario"
          version="v1.9.5-rc"
          status="En pruebas"
          description="Detección temprana de patologías mediante análisis de imagen por..."
          success="88.4%"
          latency="890ms"
          color="purple"
        />
        <SkillCard 
          icon={<Activity size={20} className="text-emerald-500" />}
          name="Gestor de Residuos"
          version="v2.0.2"
          status="Activo"
          description="Coordinación de purificadores y sistemas de filtrado por niveles de..."
          success="99.9%"
          latency="98ms"
          color="emerald"
        />
        
        {/* New Skill Placeholder */}
        <div className="dashboard-card bg-slate-50/50 border-dashed border-2 border-slate-200 p-8 flex flex-col items-center justify-center group cursor-pointer hover:bg-white hover:border-brand-blue/30 transition-all min-h-[300px]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-all">
            <Plus size={24} className="text-slate-400 group-hover:text-brand-blue" />
          </div>
          <p className="font-bold text-slate-400 group-hover:text-brand-blue">Nueva Habilidad</p>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, trend, trendColor }: any) {
  const trendColors: any = {
    'emerald': 'text-emerald-500 bg-emerald-50',
    'brand-blue': 'text-brand-blue bg-brand-blue/5',
    'slate-400': 'text-slate-400 bg-slate-100',
  }

  return (
    <div className="dashboard-card bg-white p-6">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${trendColors[trendColor] || 'bg-slate-100 text-slate-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}

function SkillCard({ icon, name, version, status, description, success, latency, color }: any) {
  const bgMap: any = {
    blue: 'bg-brand-blue/5',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    emerald: 'bg-emerald-50',
  }

  return (
    <div className="dashboard-card bg-white flex flex-col overflow-hidden group hover:border-brand-blue/20 transition-all min-h-[300px]">
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgMap[color] || 'bg-slate-50'}`}>
              {icon}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{version}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className={`text-[10px] font-bold ${status === 'Activo' ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</span>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed mb-8">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Éxito</p>
            <p className="text-sm font-black text-slate-700">{success}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Latencia</p>
            <p className="text-sm font-black text-slate-700">{latency}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-border flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-border rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-brand-blue hover:text-brand-blue transition-all">
          <Settings size={14} />
          Editar Prompts
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-blue/5 border border-brand-blue/10 rounded-xl text-[10px] font-black text-brand-blue uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-sm">
          <Zap size={14} />
          Desplegar
        </button>
      </div>
    </div>
  )
}
