import { useState, useEffect } from 'react'
import { 
  ChevronRight, 
  Check, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Thermometer, 
  Droplets, 
  Send, 
  CheckCircle, 
  XCircle,
  Clock,
  Lock,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'

export function HITL() {
  const { flowTenantSlug, flowApiKey, selectedTenant } = useTenant()
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [selectedAction, setSelectedAction] = useState<any>(null)
  const [editedContent, setEditedContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPending()
  }, [selectedTenant?.id])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/hitl/pending', {
        headers: { 
          'x-tenant-id': selectedTenant?.id || 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718',
          'x-api-key': flowApiKey
        }
      })
      setPendingActions(response.data)
      if (response.data.length > 0 && !selectedAction) {
        setSelectedAction(response.data[0])
        setEditedContent(response.data[0].message.content)
      }
    } catch (error) {
      console.error('Error fetching HITL pending actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedAction) return;
    try {
      await axios.put(`http://localhost:3014/api/hitl/${selectedAction.id}/approve`, {
        reviewerId: 'admin-user', // Mock admin user
        editedContent: editedContent !== selectedAction.message.content ? editedContent : undefined
      }, {
        headers: { 
          'x-tenant-id': selectedTenant?.id || 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718',
          'x-api-key': flowApiKey
        }
      })
      alert('Respuesta aprobada y sincronizada con la base de conocimiento.')
      fetchPending()
      setSelectedAction(null)
    } catch (error) {
      console.error('Error approving HITL action:', error)
    }
  }
  const handleReject = async () => {
    if (!selectedAction) return;
    try {
      await axios.put(`http://localhost:3014/api/hitl/${selectedAction.id}/reject`, {
        reviewerId: 'admin-user'
      }, {
        headers: { 
          'x-tenant-id': selectedTenant?.id || 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718',
          'x-api-key': flowApiKey
        }
      })
      alert('Caso rechazado y eliminado de la cola.')
      fetchPending()
      setSelectedAction(null)
    } catch (error) {
      console.error('Error rejecting HITL action:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[calc(100vh-80px)]">
         <RefreshCw className="animate-spin text-brand-blue" size={32} />
      </div>
    )
  }

  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>HITL</span>
            <ChevronRight size={10} />
            <span>Revisión de Respuesta AI</span>
            {selectedAction && (
              <>
                <ChevronRight size={10} />
                <span className="text-brand-blue">Caso #{selectedAction.id.substring(0, 8)}</span>
              </>
            )}
          </div>
          <h2 className="text-3xl font-black font-display text-slate-800">Centro de Intervención Humana</h2>
          <p className="text-sm text-slate-500 mt-1">Supervisa y corrige respuestas de la IA para mejorar el entrenamiento continuo.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-white px-4 py-2 rounded-xl border border-border shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
              <p className="text-lg font-black text-rose-500">{pendingActions.length}</p>
           </div>
        </div>
      </div>

      {!selectedAction ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-[32px] border border-border border-dashed p-20">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <CheckCircle size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Todo al día</h3>
           <p className="text-slate-400 text-sm mt-2 max-w-xs">No hay conversaciones pendientes de revisión humana en este momento.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-8 mb-8">
            {/* Sidebar: Pending List */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cola de Trabajo</h4>
               <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {pendingActions.map(action => (
                    <button 
                      key={action.id}
                      onClick={() => {
                        setSelectedAction(action)
                        setEditedContent(action.message.content)
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedAction?.id === action.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-white border-border hover:border-brand-blue/30 text-slate-600'}`}
                    >
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Case #{action.id.substring(0, 6)}</span>
                          <span className="text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded uppercase">{action.level}</span>
                       </div>
                       <p className="text-xs font-bold truncate mb-1">{action.message.content}</p>
                       <div className="flex items-center gap-1.5 opacity-60">
                          <Clock size={10} />
                          <span className="text-[9px] font-medium">{new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </button>
                  ))}
               </div>
            </div>

            {/* Main Editor */}
            <div className="col-span-12 lg:col-span-9 grid grid-cols-2 gap-8">
               {/* AI Original */}
              <div className="dashboard-card bg-white p-6 border-b-4 border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-brand-blue">
                    <ShieldCheck size={18} />
                    <h3 className="font-bold text-sm">Respuesta de IA</h3>
                  </div>
                  <span className="bg-brand-blue/5 text-brand-blue text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Original</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-border min-h-[250px] mb-6">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{selectedAction.message.content}"
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">Nivel Requerido</span>
                  <span className="text-slate-800">{selectedAction.level}</span>
                </div>
              </div>

              {/* Correction */}
              <div className="dashboard-card bg-white p-6 border-b-4 border-brand-blue shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-800">
                    <User size={18} />
                    <h3 className="font-bold text-sm">Corrección Humana</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
                    <span className="text-brand-blue text-[8px] font-black uppercase tracking-widest">Editando</span>
                  </div>
                </div>
                <textarea 
                  className="w-full bg-white p-6 rounded-2xl border border-brand-blue/20 min-h-[250px] mb-6 text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-brand-blue transition-all"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Redacta la respuesta correcta aquí..."
                />
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                   <AlertCircle className="text-amber-500 shrink-0" size={16} />
                   <p className="text-[10px] text-amber-700 font-medium">Esta respuesta será guardada en la base de conocimiento para re-entrenar el modelo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-border mt-auto">
            <button 
              onClick={handleReject}
              className="flex items-center gap-2 px-6 py-3 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-xl transition-all"
            >
              <XCircle size={18} />
              Rechazar Caso
            </button>
            <div className="flex gap-4">
              <button 
                onClick={() => alert('Borrador guardado localmente.')}
                className="px-8 py-3 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                Guardar Borrador
              </button>
              <button 
                onClick={handleApprove}
                className="flex items-center gap-2 px-10 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold shadow-xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <CheckCircle size={18} />
                Aprobar y Sincronizar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Status Bar */}
      <div className="flex items-center gap-8 mt-8 text-[10px] font-bold text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          Sincronizado con Nodo Central
        </div>
        <div className="flex items-center gap-2">
          <Lock size={12} />
          Sesión Encriptada
        </div>
      </div>
    </div>
  )
}

