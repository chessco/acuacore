import { 
  Plus, 
  Users, 
  Zap, 
  CheckCircle2, 
  CreditCard, 
  Search, 
  ChevronDown, 
  Filter, 
  RefreshCw, 
  Settings, 
  Edit3
} from 'lucide-react'

export function TenantManager() {
  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black font-display text-slate-800">Panel General de Acceso</h2>
          <p className="text-sm text-slate-500 mt-1">Monitorea y gestiona los accesos de las organizaciones activas.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-all">
          <Plus size={20} />
          Nuevo Inquilino
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <SummaryCard 
          title="TOTAL INQUILINOS" 
          value="124" 
          trend="+12%" 
          icon={<Users size={20} className="text-brand-blue" />}
          color="blue"
        />
        <SummaryCard 
          title="TOKENS MENSUALES" 
          value="842K" 
          limit="/ 1M"
          icon={<Zap size={20} className="text-amber-500" />}
          color="amber"
        />
        <SummaryCard 
          title="TASA DE ÉXITO" 
          value="99.2%" 
          dot={true}
          icon={<CheckCircle2 size={20} className="text-emerald-500" />}
          color="emerald"
        />
        <SummaryCard 
          title="SUSCRIPCIONES ACTIVAS" 
          value="118" 
          trend="95% de retención"
          icon={<CreditCard size={20} className="text-purple-500" />}
          color="purple"
        />
      </div>

      {/* Main Table Section */}
      <div className="dashboard-card bg-white p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, ID o contacto..." 
              className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-blue transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-600 shadow-sm">
              Todos los Planes <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-600 shadow-sm">
              Estado: Todos <ChevronDown size={14} />
            </button>
            <button className="p-2 bg-white border border-border rounded-xl text-slate-400 shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-border">
              <th className="px-4 py-4">Inquilino</th>
              <th className="px-4 py-4">Plan</th>
              <th className="px-4 py-4 text-center">Estado</th>
              <th className="px-4 py-4">Consumo Mensual</th>
              <th className="px-4 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <TenantRow 
              name="Oceanic Corps"
              id="#TN-9402"
              plan="Enterprise"
              status="Activo"
              consumption={82}
              consumptionText="205k / 250k"
              color="blue"
            />
            <TenantRow 
              name="AquaFresh S.A."
              id="#TN-3201"
              plan="Scale"
              status="Pendiente"
              consumption={15}
              consumptionText="15k / 100k"
              color="amber"
            />
            <TenantRow 
              name="BlueTuna Tech"
              id="#TN-1108"
              plan="Starter"
              status="Suspendido"
              consumption={98}
              consumptionText="49k / 50k"
              color="rose"
            />
            <TenantRow 
              name="GreenLake Ops"
              id="#TN-5541"
              plan="Enterprise"
              status="Activo"
              consumption={44}
              consumptionText="110k / 250k"
              color="emerald"
            />
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mostrando 1-4 de 124 inquilinos</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-white border border-border rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all">Anterior</button>
            <div className="flex gap-1">
              <button className="w-8 h-8 bg-brand-blue text-white rounded-lg text-[10px] font-bold">1</button>
              <button className="w-8 h-8 hover:bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold">2</button>
              <button className="w-8 h-8 hover:bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold">3</button>
            </div>
            <button className="px-4 py-1.5 bg-white border border-border rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-800 transition-all">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, limit, trend, icon, color, dot }: any) {
  const bgMap: any = {
    blue: 'bg-brand-blue/5',
    amber: 'bg-amber-50',
    emerald: 'bg-emerald-50',
    purple: 'bg-purple-50',
  }

  return (
    <div className="dashboard-card bg-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgMap[color] || 'bg-slate-50'}`}>
          {icon}
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{title}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
        {limit && <span className="text-xs font-bold text-slate-300">{limit}</span>}
        {dot && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mb-1.5" />}
        {trend && <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{trend}</span>}
      </div>
    </div>
  )
}

function TenantRow({ name, id, plan, status, consumption, consumptionText, color }: any) {
  const statusColors: any = {
    'Activo': 'text-emerald-500 bg-emerald-500',
    'Pendiente': 'text-amber-500 bg-amber-500',
    'Suspendido': 'text-rose-500 bg-rose-500',
  }

  const planColors: any = {
    'Enterprise': 'bg-brand-blue-light text-brand-blue border-brand-blue/10',
    'Scale': 'bg-slate-100 text-slate-500 border-slate-200',
    'Starter': 'bg-slate-100 text-slate-500 border-slate-200',
  }

  const barColors: any = {
    blue: 'bg-brand-blue',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-brand-blue',
  }

  return (
    <tr className="group hover:bg-slate-50/50 transition-all">
      <td className="px-4 py-5">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${plan === 'Enterprise' ? 'bg-brand-blue-light text-brand-blue' : 'bg-slate-100 text-slate-400'}`}>
            {name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-800 leading-tight group-hover:text-brand-blue transition-all cursor-pointer">{name}</h5>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter font-medium">ID: {id}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-5">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${planColors[plan]}`}>
          {plan}
        </span>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
          <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status].split(' ')[1]}`} />
          {status}
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="w-48">
          <div className="flex justify-between items-center mb-1 text-[9px] font-black text-slate-400">
            <span>{consumption}%</span>
            <span className="uppercase">{consumptionText}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${barColors[color] || 'bg-brand-blue'}`} style={{width: `${consumption}%`}} />
          </div>
        </div>
      </td>
      <td className="px-4 py-5 text-right">
        <div className="flex items-center justify-end gap-2 text-slate-400">
          <button className="p-2 hover:bg-white hover:text-brand-blue hover:shadow-sm rounded-lg transition-all"><RefreshCw size={16} /></button>
          <button className="p-2 hover:bg-white hover:text-brand-blue hover:shadow-sm rounded-lg transition-all"><Settings size={16} /></button>
          <button className="p-2 hover:bg-white hover:text-brand-blue hover:shadow-sm rounded-lg transition-all"><Edit3 size={16} /></button>
        </div>
      </td>
    </tr>
  )
}

