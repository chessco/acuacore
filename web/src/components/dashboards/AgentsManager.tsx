import { 
  Plus, 
  Users, 
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
  AlertCircle,
  X,
  Save,
  Loader2,
  UserCheck,
  Thermometer
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTenant } from '../../contexts/TenantContext'
import { motion, AnimatePresence } from 'motion/react'

export function AgentsManager() {
  const { selectedTenant, flowApiKey, role } = useTenant()
  const [agents, setAgents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAgent, setEditingAgent] = useState<any>(null)
  const [newPrompt, setNewPrompt] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const [modalTab, setModalTab] = useState<'prompt' | 'history' | 'skills'>('prompt')
  const [allSkills, setAllSkills] = useState<any[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createAgentData, setCreateAgentData] = useState({ name: '', slug: '', prompt: '' })

  useEffect(() => {
    fetchAgents()
  }, [selectedTenant])

  const fetchAgents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3014/api/agents', {
        headers: { 
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        }
      })
      const data = await response.json()
      setAgents(Array.isArray(data) ? data : [])
      
      // Also fetch skills to show in modal
      const skillsRes = await fetch('http://localhost:3014/api/skills', {
        headers: { 
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        }
      })
      const skillsData = await skillsRes.json()
      setAllSkills(Array.isArray(skillsData) ? skillsData : [])
    } catch (error) {
      console.error('Error fetching agents:', error)
      setAgents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    if (!createAgentData.name || !createAgentData.slug || !createAgentData.prompt) return
    setIsSaving(true)
    try {
      const response = await fetch('http://localhost:3014/api/agents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        },
        body: JSON.stringify(createAgentData)
      })
      if (!response.ok) throw new Error('Error creating agent')
      await fetchAgents()
      setIsCreateModalOpen(false)
      setCreateAgentData({ name: '', slug: '', prompt: '' })
    } catch (error) {
      console.error('Error creating agent:', error)
      alert('Error al crear el agente.')
    } finally {
      setIsSaving(false)
    }
  }

  const fetchVersions = async (agentId: string) => {
    try {
      const response = await fetch(`http://localhost:3014/api/agents/${agentId}/versions`, {
        headers: { 
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        }
      })
      const data = await response.json()
      setVersions(data)
    } catch (error) {
      console.error('Error fetching versions:', error)
    }
  }

  const handleUpdateAgent = async () => {
    if (!editingAgent) return
    setIsSaving(true)
    try {
      await fetch(`http://localhost:3014/api/agents/${editingAgent.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        },
        body: JSON.stringify({ 
          prompt: newPrompt 
        })
      })
      await fetchAgents()
      setEditingAgent(null)
    } catch (error) {
      console.error('Error updating agent:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeployAgent = async (agentId: string) => {
    setIsSaving(true)
    try {
      // If we are in the edit modal, save the prompt before deploying
      if (editingAgent && editingAgent.id === agentId) {
        await fetch(`http://localhost:3014/api/agents/${agentId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'x-tenant-id': selectedTenant?.id || '',
            'x-api-key': flowApiKey
          },
          body: JSON.stringify({ prompt: newPrompt })
        })
      }

      await fetch(`http://localhost:3014/api/agents/${agentId}/deploy`, {
        method: 'POST',
        headers: { 
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        }
      })
      fetchAgents()
      setEditingAgent(null)
    } catch (error) {
      console.error('Error deploying agent:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRollback = async (agentId: string, versionId: string) => {
    if (!confirm('¿Estás seguro de que deseas regresar a esta versión? El prompt actual será reemplazado.')) return
    setIsSaving(true)
    try {
      await fetch(`http://localhost:3014/api/agents/${agentId}/rollback/${versionId}`, {
        method: 'POST',
        headers: { 
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        }
      })
      fetchAgents()
      setEditingAgent(null)
    } catch (error) {
      console.error('Error rollback agent:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSkill = async (skillId: string) => {
    if (!editingAgent) return
    setIsSaving(true)
    
    const currentConfig = editingAgent.config || {}
    const assignedSkills = currentConfig.assignedSkills || []
    
    let newAssignedSkills
    if (assignedSkills.includes(skillId)) {
      newAssignedSkills = assignedSkills.filter((id: string) => id !== skillId)
    } else {
      newAssignedSkills = [...assignedSkills, skillId]
    }
    
    const newConfig = { ...currentConfig, assignedSkills: newAssignedSkills }
    
    try {
      const response = await fetch(`http://localhost:3014/api/agents/${editingAgent.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey
        },
        body: JSON.stringify({ config: newConfig })
      })
      
      const updatedAgent = await response.json()
      setEditingAgent(updatedAgent)
      fetchAgents()
    } catch (error) {
      console.error('Error toggling skill:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black font-display text-slate-800">Staff Virtual</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona las personalidades y roles estratégicos de tus agentes.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-deep text-white font-bold rounded-xl shadow-lg shadow-brand-deep/20 hover:opacity-90 transition-all"
        >
          <Plus size={20} />
          Contratar Agente
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold uppercase tracking-widest text-[10px]">Llamando al staff...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map(agent => (
            <AgentCard 
              key={agent.id}
              name={agent.name}
              slug={agent.slug}
              status={agent.status}
              version={agent.version}
              description={agent.description || "Asesor virtual especializado."}
              skills={allSkills
                .filter(s => agent.config?.assignedSkills?.includes(s.id))
                .map(s => s.name)}
              onEdit={() => {
                setEditingAgent(agent)
                setNewPrompt(agent.prompt)
                setModalTab('prompt')
                fetchVersions(agent.id)
              }}
              onDeploy={() => handleDeployAgent(agent.id)}
            />
          ))}
          
          <div 
            onClick={() => setIsCreateModalOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center group cursor-pointer hover:bg-white hover:border-brand-blue/30 transition-all min-h-[300px]"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
              <Plus size={24} className="text-slate-400 group-hover:text-brand-blue" />
            </div>
            <p className="font-bold text-slate-400 group-hover:text-brand-blue uppercase tracking-widest text-[10px]">Nuevo Perfil de Staff</p>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-deep/10 text-brand-deep rounded-xl flex items-center justify-center">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Contratar Nuevo Agente</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define el rol de tu nuevo colaborador virtual</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nombre del Agente</label>
                    <input 
                      type="text"
                      value={createAgentData.name}
                      onChange={(e) => setCreateAgentData({...createAgentData, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                      placeholder="Ej: Don Juan Camarón"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Slug (Identificador)</label>
                    <input 
                      type="text"
                      value={createAgentData.slug}
                      onChange={(e) => setCreateAgentData({...createAgentData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                      placeholder="ej: don-juan"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Personalidad y Misión Inicial</label>
                  <textarea 
                    value={createAgentData.prompt}
                    onChange={(e) => setCreateAgentData({...createAgentData, prompt: e.target.value})}
                    className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-brand-blue focus:bg-white transition-all resize-none"
                    placeholder="Describe cómo debe actuar este agente..."
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateAgent}
                  disabled={isSaving || !createAgentData.name || !createAgentData.slug || !createAgentData.prompt}
                  className="flex-1 py-4 bg-brand-deep text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-deep/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  Crear Agente Staff
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Agent Modal */}
      <AnimatePresence>
        {editingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                    <img src={`https://ui-avatars.com/api/?name=${editingAgent.name}&background=random`} alt="Avatar" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{editingAgent.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingAgent.slug} • v{editingAgent.version}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                        editingAgent.status === 'PRODUCTION' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {editingAgent.status === 'PRODUCTION' ? 'Operativo' : 'En Entrenamiento'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingAgent(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-8 bg-slate-50/50 flex gap-6 border-b border-slate-100">
                <button 
                  onClick={() => setModalTab('prompt')}
                  className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                    modalTab === 'prompt' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400'
                  }`}
                >
                  Personalidad y Contexto
                </button>
                <button 
                  onClick={() => setModalTab('history')}
                  className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                    modalTab === 'history' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400'
                  }`}
                >
                  Evolución de Persona
                </button>
                <button 
                  onClick={() => setModalTab('skills')}
                  className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                    modalTab === 'skills' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400'
                  }`}
                >
                  Capacidades Técnicas
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                {modalTab === 'prompt' ? (
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Instrucciones de Comportamiento (Persona Prompt)</label>
                    <textarea 
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium leading-relaxed focus:outline-none focus:border-brand-blue focus:bg-white transition-all custom-scrollbar resize-none"
                      placeholder="Describe la personalidad, tono y misión de este agente..."
                    />
                  </div>
                ) : modalTab === 'history' ? (
                  <div className="space-y-4">
                    {versions.map((v: any) => (
                      <div key={v.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex justify-between items-center group hover:bg-white hover:border-brand-blue/30 transition-all">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-black text-slate-800">v{v.version}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                              v.status === 'PRODUCTION' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {v.status === 'PRODUCTION' ? 'Desplegada' : 'Archivo'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(v.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleRollback(editingAgent.id, v.id)}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-brand-deep hover:text-white hover:border-brand-deep transition-all opacity-0 group-hover:opacity-100"
                        >
                          Reactivar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matriz de Habilidades Asignables</p>
                      <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[8px] font-black uppercase tracking-widest rounded-full">
                        {allSkills.length} Disponibles
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {allSkills.map((skill: any) => {
                        const isAssigned = editingAgent.config?.assignedSkills?.includes(skill.id);
                        
                        return (
                          <div key={skill.id} className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${
                            isAssigned ? 'bg-white border-brand-blue/20 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'
                          }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                isAssigned ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-200 text-slate-400'
                              }`}>
                                {skill.name.toLowerCase().includes('agua') || skill.name.toLowerCase().includes('residuos') ? <Droplets size={18} /> : 
                                 skill.name.toLowerCase().includes('salud') || skill.name.toLowerCase().includes('sanitario') ? <Activity size={18} /> : 
                                 skill.name.toLowerCase().includes('dieta') ? <Zap size={18} /> :
                                 skill.name.toLowerCase().includes('térmico') ? <Thermometer size={18} /> :
                                 <ShieldCheck size={18} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-800">{skill.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium">v{skill.version} • {skill.description || "Capacidad técnica"}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                isAssigned ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {isAssigned ? 'Asignada' : 'Inactiva'}
                              </span>
                              <div 
                                onClick={() => handleToggleSkill(skill.id)}
                                className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${isAssigned ? 'bg-brand-blue' : 'bg-slate-200'} ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${isAssigned ? 'translate-x-4' : 'translate-x-0'}`} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {modalTab === 'prompt' && (
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => setEditingAgent(null)}
                    className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-100 transition-all"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={handleUpdateAgent}
                    disabled={isSaving}
                    className="flex-1 py-4 bg-white border border-brand-blue/30 text-brand-blue rounded-2xl text-sm font-bold hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Actualizar Persona
                  </button>
                  <button 
                    onClick={() => handleDeployAgent(editingAgent.id)}
                    disabled={isSaving}
                    className="flex-1 py-4 bg-brand-deep text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-deep/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Zap size={20} />
                    Desplegar Persona
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AgentCard({ name, slug, status, version, description, skills, onEdit, onDeploy }: any) {
  const isProd = status === 'PRODUCTION'

  return (
    <div className={`bg-white rounded-[2.5rem] border border-border flex flex-col overflow-hidden group transition-all hover:shadow-2xl hover:shadow-brand-blue/10 hover:border-brand-blue/20`}>
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-slate-50">
               <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} alt={name} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-base">{name}</h4>
              <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest mt-0.5">{slug}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${isProd ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
            {isProd ? 'Operativo' : 'Pre-Prod'}
          </div>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3 italic">
          "{description}"
        </p>

        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Habilidades Asignadas</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, i: number) => {
              const icon = skill.toLowerCase().includes('agua') || skill.toLowerCase().includes('residuos') ? <Droplets size={12} /> : 
                           skill.toLowerCase().includes('biol') || skill.toLowerCase().includes('sanit') ? <Activity size={12} /> : 
                           skill.toLowerCase().includes('térmico') ? <Thermometer size={12} /> :
                           <Zap size={12} />;
              return (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500 hover:bg-brand-blue-light hover:text-brand-blue hover:border-brand-blue/20 transition-all cursor-default">
                  {icon}
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-border flex gap-3">
        <button 
          onClick={onEdit}
          className="flex-1 py-3 bg-white border border-border rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-brand-blue hover:text-brand-blue transition-all"
        >
          Perfil y Persona
        </button>
        {!isProd && (
          <button 
            onClick={onDeploy}
            className="px-4 py-3 bg-brand-deep text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-deep/20"
          >
            Activar
          </button>
        )}
      </div>
    </div>
  )
}

