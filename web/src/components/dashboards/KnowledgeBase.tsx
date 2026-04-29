import { 
  Search, 
  Plus, 
  Download, 
  Filter, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Sparkles,
  Tag,
  History,
  Edit3
} from 'lucide-react'

export function KnowledgeBase() {
  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
        <span>Acuacore AI</span>
        <ChevronRight size={10} />
        <span className="text-brand-blue">Base de Conocimientos</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black font-display text-slate-800">Base de Conocimientos</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona protocolos operativos y respuestas validadas del sistema.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-all">
            <Plus size={16} />
            Crear Nuevo Documento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content: Table */}
        <div className="col-span-9">
          <div className="dashboard-card bg-white overflow-hidden">
            {/* Filters Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50">
              <div className="flex gap-1">
                <TabButton label="Todos" active={true} />
                <TabButton label="Protocolos" />
                <TabButton label="Respuestas Validadas" />
                <TabButton label="Correcciones" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="uppercase tracking-widest">Ordenar por:</span>
                <button className="text-slate-800 flex items-center gap-1">Más reciente <ChevronRight size={12} className="rotate-90" /></button>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-border">
                  <th className="px-6 py-4">Título</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Etiquetas</th>
                  <th className="px-6 py-4">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <KnowledgeItem 
                  title="Protocolo de Oxigenación de Emergencia"
                  version="v2.4 - Manual Operativo"
                  type="Protocolo"
                  status="Publicado"
                  tags={['Oxigeno', 'Bioseguridad']}
                  updated="Hace 2 horas"
                />
                <KnowledgeItem 
                  title="Guía de Alimentación Fase Juvenil"
                  version="v1.0 - Respuesta Validada"
                  type="Validada"
                  status="Borrador"
                  tags={['Alimentación']}
                  updated="Ayer, 14:30"
                />
                <KnowledgeItem 
                  title="Corrección: Sensor pH Piscina B3"
                  version="v1.2 - Ajuste de Sistema"
                  type="Corrección"
                  status="Publicado"
                  tags={['Mantenimiento']}
                  updated="12 Oct 2023"
                />
              </tbody>
            </table>

            {/* Pagination Placeholder */}
            <div className="p-4 border-t border-border flex justify-between items-center bg-slate-50/30">
              <span className="text-[10px] font-bold text-slate-400">Mostrando 1-3 de 48 documentos</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <button key={i} className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${i === 1 ? 'bg-brand-blue text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 space-y-6">
          {/* Popular Categories */}
          <div className="dashboard-card p-6 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <Tag size={16} className="text-brand-blue" />
              <h4 className="font-bold text-sm text-slate-800">Categorías Populares</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <CategoryBadge label="Bioseguridad" count={12} active={true} />
              <CategoryBadge label="Alimentación" count={8} />
              <CategoryBadge label="Oxigeno" count={15} />
              <CategoryBadge label="Sensores" count={5} />
              <CategoryBadge label="Salud Animal" count={9} />
              <CategoryBadge label="Estructuras" count={3} />
            </div>
            <button className="w-full mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-blue transition-all">Ver todas las etiquetas</button>
          </div>

          {/* AI Assistant Box */}
          <div className="bg-brand-blue p-6 rounded-[24px] text-white shadow-xl shadow-brand-blue/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
              <Sparkles size={60} />
            </div>
            <h4 className="font-black text-lg mb-3 font-display">Asistente AI</h4>
            <p className="text-xs text-brand-blue-light leading-relaxed mb-6 opacity-90">
              ¿Necesitas ayuda redactando un nuevo protocolo? Mi IA puede generar borradores basados en datos históricos.
            </p>
            <button className="w-full py-3 bg-white text-brand-blue rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all">
              <Sparkles size={14} />
              Generar Borrador
            </button>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card p-6 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <History size={16} className="text-amber-500" />
              <h4 className="font-bold text-sm text-slate-800">Actividad Reciente</h4>
            </div>
            <div className="space-y-6">
              <ActivityItem 
                icon={<Edit3 size={14} />}
                user="Carlos M."
                action="editó “Protocolo de Oxigenación”"
                time="Hace 15 min"
              />
              <ActivityItem 
                icon={<CheckCircle2 size={14} />}
                user="Documento"
                action="“Sensor pH” ha sido Validado"
                time="Hace 2 horas"
                status="success"
              />
              <ActivityItem 
                icon={<Plus size={14} />}
                user="Elena R."
                action="creó nuevo borrador “Nutrición”"
                time="Ayer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ label, active }: any) {
  return (
    <button className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${active ? 'bg-white text-brand-blue shadow-sm border border-border' : 'text-slate-400 hover:text-slate-600'}`}>
      {label}
    </button>
  )
}

function KnowledgeItem({ title, version, type, status, tags, updated }: any) {
  const typeColors: any = {
    'Protocolo': 'bg-brand-blue/5 text-brand-blue border-brand-blue/10',
    'Validada': 'bg-amber-50 text-amber-600 border-amber-100',
    'Corrección': 'bg-purple-50 text-purple-600 border-purple-100',
  }

  return (
    <tr className="group hover:bg-slate-50/50 transition-all">
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="font-bold text-sm text-slate-800 leading-tight group-hover:text-brand-blue transition-all cursor-pointer">{title}</span>
          <span className="text-[10px] text-slate-400 mt-1">{version}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${typeColors[type] || ''}`}>
          {type}
        </span>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'Publicado' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className="text-[10px] font-bold text-slate-600">{status}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex gap-1.5">
          {tags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">{tag}</span>
          ))}
        </div>
      </td>
      <td className="px-6 py-5 text-[10px] font-medium text-slate-400">
        {updated}
      </td>
    </tr>
  )
}

function CategoryBadge({ label, count, active }: any) {
  return (
    <button className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${active ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20' : 'bg-slate-50 border-border text-slate-500 hover:border-brand-blue hover:text-brand-blue'}`}>
      {label} ({count})
    </button>
  )
}

function ActivityItem({ icon, user, action, time, status }: any) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] leading-tight text-slate-600">
          <span className="font-bold text-slate-800">{user}</span> {action}
        </p>
        <p className="text-[9px] text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  )
}
