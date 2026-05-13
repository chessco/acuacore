import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  TrendingUp, 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  User, 
  DollarSign,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  BarChart3
} from 'lucide-react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'

const STAGES = [
  { id: 'NEW', label: 'Nuevo Lead', color: 'bg-blue-500' },
  { id: 'CONTACTED', label: 'Contactado', color: 'bg-amber-500' },
  { id: 'PROPOSAL', label: 'Propuesta', color: 'bg-purple-500' },
  { id: 'NEGOTIATION', label: 'Negociación', color: 'bg-brand-blue' }
]

export function DealsBoard() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [newDeal, setNewDeal] = useState({ title: '', value: '', contactId: '', stage: 'NEW' })
  const { selectedTenant } = useTenant()

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'

  useEffect(() => {
    fetchDeals()
    fetchContacts()
  }, [selectedTenant])

  const fetchDeals = async () => {
    if (!selectedTenant) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiUrl}/api/crm/deals`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant.id 
        }
      })
      setDeals(response.data)
    } catch (err) {
      console.error('Error fetching deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    if (!selectedTenant) return
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiUrl}/api/crm/contacts`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant.id 
        }
      })
      setContacts(response.data)
    } catch (err) {
      console.error('Error fetching contacts:', err)
    }
  }

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${apiUrl}/api/crm/deals`, {
        ...newDeal,
        value: parseFloat(newDeal.value) || 0
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id 
        }
      })
      setDeals(prev => [response.data, ...prev])
      setShowAddDeal(false)
      setNewDeal({ title: '', value: '', contactId: '', stage: 'NEW' })
    } catch (err) {
      console.error('Error creating deal:', err)
    }
  }

  const updateDealStage = async (dealId: string, newStage: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${apiUrl}/api/crm/deals/${dealId}`, { stage: newStage }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id 
        }
      })
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d))
    } catch (err) {
      console.error('Error updating deal stage:', err)
    }
  }

  const getDealsByStage = (stageId: string) => {
    return deals.filter(d => d.stage === stageId && d.status === 'OPEN')
  }

  const getTotalValue = (stageId: string) => {
    return getDealsByStage(stageId).reduce((acc, d) => acc + (d.value || 0), 0)
  }

  // DRAG AND DROP HANDLERS
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId)
    e.dataTransfer.setData('dealId', dealId)
    e.dataTransfer.effectAllowed = 'move'
    
    // Create a ghost image if needed, but native is fine
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(stageId)
  }

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData('dealId')
    setDragOverStage(null)
    setDraggedDealId(null)

    if (dealId) {
      await updateDealStage(dealId, targetStage)
    }
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando Pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
      {/* Header */}
      <header className="p-6 bg-white border-b border-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 font-display">Pipeline de Ventas</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gestión de Oportunidades</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <DollarSign size={16} className="text-emerald-500" />
            <span className="text-sm font-black text-slate-700">
              Total Pipeline: {formatCurrency(deals.reduce((acc, d) => acc + (d.value || 0), 0))}
            </span>
          </div>
          <button 
            onClick={() => setShowAddDeal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/25 hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Nueva Oportunidad
          </button>
        </div>
      </header>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max">
          {STAGES.map(stage => (
            <div 
              key={stage.id} 
              className={`w-80 flex flex-col h-full bg-slate-100/50 rounded-[24px] border transition-all duration-300 ${
                dragOverStage === stage.id ? 'border-brand-blue bg-brand-blue/5 ring-4 ring-brand-blue/5 scale-[1.02]' : 'border-slate-200/50'
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-6 ${stage.color} rounded-full`} />
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{stage.label}</h3>
                    <p className="text-[9px] font-bold text-slate-400">{getDealsByStage(stage.id).length} Tratos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-800">{formatCurrency(getTotalValue(stage.id))}</p>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {getDealsByStage(stage.id).map(deal => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onMove={(targetStage) => updateDealStage(deal.id, targetStage)}
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      isDragging={draggedDealId === deal.id}
                    />
                  ))}
                </AnimatePresence>
                
                {getDealsByStage(stage.id).length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl opacity-50">
                    <Clock size={24} className="text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sin movimientos</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Won / Lost Columns (Compact) */}
          <div className="w-64 flex flex-col h-full gap-4 shrink-0">
            <div className="flex-1 bg-emerald-50/50 rounded-[24px] border border-emerald-100 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-emerald-700 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={14} /> GANADOS
                </h3>
                <span className="text-[10px] font-black text-emerald-600">
                  {deals.filter(d => d.status === 'WON').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {deals.filter(d => d.status === 'WON').map(deal => (
                  <div key={deal.id} className="p-3 bg-white border border-emerald-100 rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{deal.title}</p>
                    <p className="text-[10px] font-black text-emerald-600 mt-1">{formatCurrency(deal.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-rose-50/50 rounded-[24px] border border-rose-100 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-rose-700 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <XCircle size={14} /> PERDIDOS
                </h3>
                <span className="text-[10px] font-black text-rose-600">
                  {deals.filter(d => d.status === 'LOST').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {deals.filter(d => d.status === 'LOST').map(deal => (
                  <div key={deal.id} className="p-3 bg-white border border-rose-100 rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{deal.title}</p>
                    <p className="text-[10px] font-black text-rose-600 mt-1">{formatCurrency(deal.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Deal Modal */}
      <AnimatePresence>
        {showAddDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDeal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleCreateDeal} className="p-8">
                <h3 className="text-2xl font-black text-slate-800 mb-6">Nueva Oportunidad</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Título del Trato</label>
                    <input 
                      required
                      value={newDeal.title}
                      onChange={e => setNewDeal({...newDeal, title: e.target.value})}
                      placeholder="Ej: Implementación Acuaequipos 2024"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-blue transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor Estimado</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="number"
                          value={newDeal.value}
                          onChange={e => setNewDeal({...newDeal, value: e.target.value})}
                          placeholder="0.00"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-blue transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Etapa Inicial</label>
                      <select 
                        value={newDeal.stage}
                        onChange={e => setNewDeal({...newDeal, stage: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-blue transition-all appearance-none"
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contacto Asociado</label>
                    <select 
                      required
                      value={newDeal.contactId}
                      onChange={e => setNewDeal({...newDeal, contactId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-blue transition-all appearance-none"
                    >
                      <option value="">Seleccionar contacto...</option>
                      {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email || 'Sin email'})</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddDeal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-lg shadow-brand-blue/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    Crear Trato
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DealCard({ deal, onMove, onDragStart, isDragging }: { deal: any, onMove: (stage: string) => void, onDragStart: (e: React.DragEvent) => void, isDragging: boolean }) {
  const [showActions, setShowActions] = useState(false)

  const currentStageIndex = STAGES.findIndex(s => s.id === deal.stage)
  const nextStage = STAGES[currentStageIndex + 1]

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: isDragging ? 0.95 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={onDragStart}
      className={`group bg-white p-4 rounded-[20px] border shadow-sm hover:shadow-lg hover:border-brand-blue/30 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden ${
        isDragging ? 'border-brand-blue ring-2 ring-brand-blue/10' : 'border-slate-200'
      }`}
    >
      {/* Decorative accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${STAGES.find(s => s.id === deal.stage)?.color || 'bg-slate-200'}`} />

      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-brand-blue transition-colors">{deal.title}</h4>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <User size={12} className="text-slate-300" />
          <span className="truncate">{deal.contact?.name || 'Contacto sin nombre'}</span>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign size={10} />
            <span className="text-[11px] font-black">{formatCurrency(deal.value)}</span>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {nextStage && (
              <button 
                onClick={() => onMove(nextStage.id)}
                className="p-1.5 bg-brand-blue-light text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                title={`Mover a ${nextStage.label}`}
              >
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <Calendar size={12} />
          {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'Sin fecha'}
        </div>
        
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">
            {deal.contact?.name?.[0] || '?'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
