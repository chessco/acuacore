import { 
  Search, 
  Plus, 
  Download, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Tag,
  History,
  Edit3,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'

export function KnowledgeBase() {
  const { flowApiKey, selectedTenant } = useTenant()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [selectedTenant])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3014/api/knowledge-base', {
        headers: { 
          'x-tenant-id': selectedTenant?.id || 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718',
          'x-api-key': flowApiKey
        }
      })
      setDocuments(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching knowledge base:', err)
      setError('No se pudo cargar la base de conocimientos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)] overflow-y-auto">
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
          <button 
            onClick={fetchDocuments}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sincronizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-all">
            <Plus size={16} />
            Crear Nuevo Documento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content: Table */}
        <div className="col-span-12 lg:col-span-9">
          <div className="dashboard-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
            {/* Filters Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50">
              <div className="flex gap-1">
                <TabButton label="Todos" active={true} />
                <TabButton label="Protocolos" />
                <TabButton label="Guías Técnicas" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="uppercase tracking-widest">Ordenar por:</span>
                <button className="text-slate-800 flex items-center gap-1 uppercase tracking-widest">Más reciente <ChevronRight size={12} className="rotate-90" /></button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-border">
                    <th className="px-6 py-4">Título del Documento</th>
                    <th className="px-6 py-4 text-center">Fragmentos</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Actualizado</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-brand-blue" size={32} />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando documentación...</p>
                        </div>
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No se encontraron documentos en la base de conocimientos.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <KnowledgeItem 
                        key={doc.id}
                        title={doc.title}
                        version={`v${doc.version} - ID: ${doc.id.substring(0, 8)}`}
                        type={doc.title.includes('Protocolo') ? 'Protocolo' : 'Guía Técnica'}
                        chunks={doc._count?.chunks || 0}
                        status="Publicado"
                        updated={new Date(doc.updatedAt).toLocaleDateString()}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="p-4 border-t border-border flex justify-between items-center bg-slate-50/30">
              <span className="text-[10px] font-bold text-slate-400">
                Mostrando {documents.length} documentos encontrados
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* AI Assistant Box */}
          <div className="bg-brand-deep p-8 rounded-[32px] text-white shadow-2xl shadow-brand-deep/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-black text-xl mb-3 font-display flex items-center gap-2">
                <Sparkles className="text-brand-blue" />
                Copilot KB
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                ¿Necesitas ayuda redactando un nuevo protocolo? Mi IA puede generar borradores técnicos basados en normativas ASC y BAP de inmediato.
              </p>
              <button className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/30 hover:scale-[1.02] transition-all">
                Arquitectar Nuevo MD
              </button>
            </div>
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl" />
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card p-6 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[24px]">
            <div className="flex items-center gap-2 mb-6">
              <History size={16} className="text-amber-500" />
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-800">Actividad Reciente</h4>
            </div>
            <div className="space-y-6">
              <ActivityItem 
                icon={<Edit3 size={14} />}
                user="Sistema"
                action="ingestó masivamente .md"
                time="Hace unos instantes"
              />
              <ActivityItem 
                icon={<CheckCircle2 size={14} />}
                user="IA"
                action="validó 6 documentos"
                time="Hace 5 minutos"
                status="success"
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
    <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-brand-blue shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
      {label}
    </button>
  )
}

function KnowledgeItem({ title, version, type, chunks, status, updated }: any) {
  const typeColors: any = {
    'Protocolo': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    'Guía Técnica': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }

  return (
    <tr className="group hover:bg-slate-50/50 transition-all">
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue-light group-hover:text-brand-blue transition-all">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs text-slate-800 leading-tight group-hover:text-brand-blue transition-all cursor-pointer">{title}</span>
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{version}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-center">
        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500">{chunks} Chunks</span>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'Publicado' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{status}</span>
        </div>
      </td>
      <td className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {updated}
      </td>
      <td className="px-6 py-5 text-right">
        <button className="p-2 text-slate-300 hover:text-slate-600 transition-all">
          <ChevronRight size={18} />
        </button>
      </td>
    </tr>
  )
}

function ActivityItem({ icon, user, action, time, status }: any) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold leading-tight text-slate-600">
          <span className="font-black text-slate-800 uppercase tracking-tighter">{user}</span> {action}
        </p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{time}</p>
      </div>
    </div>
  )
}

