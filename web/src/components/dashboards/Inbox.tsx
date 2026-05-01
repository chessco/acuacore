import { 
  MoreVertical, 
  Plus, 
  Smile, 
  Send, 
  Phone, 
  Video, 
  ChevronDown, 
  ShieldAlert,
  Sparkles,
  BarChart3,
  Lightbulb,
  BookOpen,
  Link,
  ArrowRight,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTenant } from '../../contexts/TenantContext'
import { io, Socket } from 'socket.io-client'

export function Inbox({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { selectedTenant, flowUrl, flowTenantSlug, flowToken, flowApiKey } = useTenant()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [messageCache, setMessageCache] = useState<Record<string, any[]>>({})
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(true)
  const [hitlEscalated, setHitlEscalated] = useState(false)
  const [analysis, setAnalysis] = useState<any>({
    sentiment: "Neutral",
    intent: "Soporte",
    summary: "Selecciona una conversación para iniciar el análisis...",
    suggestedResponse: "",
    confidence: 0
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [operators, setOperators] = useState<any[]>([])
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const socketRef = useRef<Socket | null>(null)

  // Reset escalation state when conversation changes
  useEffect(() => {
    setHitlEscalated(false);
  }, [activeConversationId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    // Only smooth scroll if we are already seeing some messages
    const behavior = messages.length > 5 ? 'smooth' : 'auto';
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [messages])

  // Instant scroll on conversation change
  useEffect(() => {
    if (activeConversationId) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      });
    }
  }, [activeConversationId])

  // Fetch Conversations and Setup Socket
  useEffect(() => {
    const tid = selectedTenant?.id || 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718';
    
    // Fetch conversations from AcuaCore API (which has the assignments)
    fetch(`http://localhost:3014/api/conversations`, {
      headers: { 
        'x-tenant-id': tid,
        'x-api-key': flowApiKey
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const role = localStorage.getItem('acuacore_role');
        const userEmail = localStorage.getItem('acuacore_user_email');

        let filtered = data.map((c: any) => ({
          ...c,
          userId: c.userId || 'Usuario',
          updatedAt: c.updatedAt || new Date().toISOString(),
          snippet: c.messages?.[0]?.content || "Nueva conversación"
        }));

        if (role === 'operator' && userEmail) {
          // Only show chats assigned to this specific operator email
          filtered = filtered.filter((c: any) => c.assignedTo?.email === userEmail);
        }

        setConversations(filtered)
        if (filtered.length > 0 && !activeConversationId) {
          setActiveConversationId(filtered[0].id)
        }
      })
      .catch(err => {
        console.error("[Inbox] Error cargando conversaciones:", err);
      })

    // Setup Socket (Connecting to Acuacore Backend)
    const ACUACORE_API_URL = 'http://localhost:3014';
    socketRef.current = io(ACUACORE_API_URL, {
      extraHeaders: {
        'x-api-key': flowApiKey
      }
    })
    
    socketRef.current.on('connect', () => {
      console.log("[Inbox] Connected to Acuacore Socket. Joining room:", tid);
      socketRef.current?.emit('joinTenant', tid)
    })

    socketRef.current.on('newMessage', (newMsg: any) => {
      console.log("[Inbox] New message received:", newMsg);
      
      const mappedMsg = {
        ...newMsg,
        role: (newMsg.senderType === 'STAFF' || newMsg.senderType === 'AGENT' || newMsg.senderType === 'AI') ? 'assistant' : 'user'
      };

      // Update Cache
      setMessageCache(prev => {
        const convMsgs = prev[newMsg.conversationId] || [];
        if (convMsgs.find(m => m.id === newMsg.id)) return prev;
        return {
          ...prev,
          [newMsg.conversationId]: [...convMsgs, mappedMsg]
        };
      });

      // Update Active View
      setActiveConversationId(currentActiveId => {
        if (newMsg.conversationId === currentActiveId) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, mappedMsg];
          });
        }
        return currentActiveId
      })

      // Actualizar snippet en la lista de conversaciones
      setConversations(prev => prev.map(c => {
        if (c.id === newMsg.conversationId) {
          return { ...c, snippet: newMsg.content, updatedAt: new Date().toISOString() };
        }
        return c;
      }));
    })

    socketRef.current.on('conversationUpdate', (updatedConv: any) => {
      setConversations(prev => prev.map(c => c.id === updatedConv.id ? { ...c, ...updatedConv } : c));
    })


    // Fetch Operators
    fetch('http://localhost:3014/api/conversations/operators', {
      headers: {
        'x-tenant-id': selectedTenant?.id || '',
        'x-api-key': flowApiKey
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOperators(data);
        } else {
          // Mock data for demo if no operators found
          setOperators([
            { id: 'op-1', name: 'Soporte Nivel 1' },
            { id: 'op-2', name: 'Biólogo de Turno' }
          ]);
        }
      })
      .catch(err => console.error("[Inbox] Error fetching operators:", err));

    return () => {
      socketRef.current?.disconnect()
    }
  }, [selectedTenant, flowUrl, flowTenantSlug, flowToken, flowApiKey])

  // Fetch Messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    
    // Check cache first to avoid flickering
    if (messageCache[activeConversationId]) {
      setMessages(messageCache[activeConversationId]);
      setIsMessagesLoading(false);
      // Background sync will happen below
    } else {
      // Only show loading if we don't have cached data
      setIsMessagesLoading(true);
      // Optional: don't clear messages immediately to avoid jump
    }

    const flowId = flowTenantSlug || 'pitaya';
    
    fetch(`${flowUrl}/whatsapp/history/${activeConversationId}`, {
      headers: { 
        'x-tenant-id': flowId,
        'Authorization': flowToken ? `Bearer ${flowToken}` : '',
        'x-api-key': flowApiKey
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const mapped = data.map((m: any) => ({
          ...m,
          role: (m.senderType === 'STAFF' || m.senderType === 'AGENT' || m.senderType === 'AI') ? 'assistant' : 'user'
        }))
        
        // Update state and cache
        setMessages(prev => {
          // If we are switching, we just use the new data
          // If we are on the same one, we could merge (but fetch is full history usually)
          return mapped;
        });
        setMessageCache(prev => ({ ...prev, [activeConversationId]: mapped }));
        runAnalysis(mapped);
      })
      .catch(err => {
        console.error("[Inbox] Error cargando historial:", err);
      })
      .finally(() => {
        setIsMessagesLoading(false);
      });
  }, [activeConversationId, flowUrl, flowTenantSlug, flowToken, flowApiKey])

  const runAnalysis = async (msgs: any[]) => {
    if (msgs.length === 0) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3014/api/ai/analyze-conversation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': selectedTenant?.id || 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718',
          'x-api-key': flowApiKey
        },
        body: JSON.stringify({ messages: msgs })
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("[Inbox] Error en análisis de IA:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeConversationId) return;

    const tid = selectedTenant?.id || 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718';
    const activeConv = conversations.find(c => c.id === activeConversationId);
    const to = activeConv?.externalId || activeConv?.userId || '';

    if (!to) {
      console.error('[Inbox] No destination (phone/externalId) found');
      return;
    }

    const messageData = {
      to: to,
      content: inputText,
      conversationId: activeConversationId
    };

    setMessages(prev => [...prev, { ...messageData, id: 'temp-' + Date.now(), role: 'assistant', createdAt: new Date().toISOString() }]);
    setInputText('');

    fetch(`${flowUrl}/whatsapp/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': tid,
        'x-api-key': flowApiKey
      },
      body: JSON.stringify(messageData)
    })
    .catch(err => {
      console.error('[Inbox] Error enviando mensaje:', err);
    });
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId)

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden relative">
      <div className="w-80 border-r border-border flex flex-col bg-slate-50/30">
        <div className="p-6">
          <div className="mb-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full" />
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em]">{selectedTenant?.name || 'Acuaequipos'}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800">Bandeja</h2>
            <span className="bg-brand-blue-light text-brand-blue text-[10px] font-black px-2 py-0.5 rounded-full">{conversations.length} Activ@s</span>
          </div>
          <div className="flex gap-2 mb-6">
            <button className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white border border-border rounded-lg text-[10px] font-bold text-slate-500">
              Estado: Todos <ChevronDown size={12} />
            </button>
            <button className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white border border-border rounded-lg text-[10px] font-bold text-slate-500">
              Riesgo: Todos <ChevronDown size={12} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.map(conv => (
            <ConversationItem 
              key={conv.id}
              name={conv.userId}
              location="General"
              time={new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              snippet={conv.snippet}
              risk={conv.riskLevel || 'BAJO'}
              channel="WhatsApp"
              active={activeConversationId === conv.id}
              onClick={() => setActiveConversationId(conv.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white relative">
        <div className="h-20 border-b border-border flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${activeConversation?.userId || 'User'}&background=random`} alt="User" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{activeConversation?.userId || 'Selecciona un chat'}</h3>
              {activeConversation && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Activo
                  </p>
                  {activeConversation.assignedTo && (
                    <>
                      <span className="text-slate-200 text-xs">•</span>
                      <p className="text-[10px] text-brand-blue font-bold flex items-center gap-1">
                        ASIGNADO A: {activeConversation.assignedTo.name}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button 
              onClick={() => setIsAiAnalysisOpen(!isAiAnalysisOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isAiAnalysisOpen 
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                  : 'bg-brand-blue/5 text-brand-blue border border-brand-blue/10 hover:bg-brand-blue/10'
              }`}
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>
            <div className="h-6 w-px bg-slate-100 mx-1" />
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all"><Video size={20} /></button>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all"><Phone size={20} /></button>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all"><MoreVertical size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/20 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-slate-400 text-sm font-medium">
              Esperando mensajes...
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-border">Historial</span>
              </div>
              {messages.map((msg, idx) => (
                <Message 
                  key={msg.id || idx}
                  text={msg.content} 
                  time={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  isUser={msg.role === 'user'}
                  isAI={msg.role === 'assistant'}
                />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-white">
          <div className="flex items-center gap-3 bg-slate-50 border border-border rounded-2xl p-2 px-4 focus-within:border-brand-blue focus-within:bg-white transition-all">
            <button className="text-slate-400 hover:text-brand-blue"><Plus size={20} /></button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje..." 
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
            />
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-brand-blue"><Smile size={20} /></button>
              <button 
                className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/30 hover:opacity-90 transition-all"
                onClick={handleSendMessage}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAiAnalysisOpen && (
          <motion.div 
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 border-l border-border bg-white flex flex-col overflow-hidden z-30"
          >
            <div className={`p-6 space-y-8 overflow-y-auto custom-scrollbar ${isAnalyzing ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-slate-400">
                  <BarChart3 size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Análisis de IA</h4>
                </div>
                <button 
                  onClick={() => setIsAiAnalysisOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 transition-all"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>

              {isAnalyzing && (
                <div className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase animate-pulse">
                   <RefreshCw size={12} className="animate-spin" /> Analizando conversación...
                </div>
              )}

              <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-slate-500">Puntaje de Confianza</p>
                  <p className="text-xl font-black text-brand-blue">{((analysis.confidence || 0) * 100).toFixed(1)}%</p>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(analysis.confidence || 0) * 100}%` }}
                    className="h-full bg-brand-blue" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sentimiento</p>
                    <div className="flex items-center gap-2">
                       <Smile className={analysis.sentiment === 'Positivo' ? 'text-emerald-500' : 'text-slate-400'} size={14} />
                       <span className="text-xs font-bold text-slate-700">{analysis.sentiment}</span>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Intención</p>
                    <div className="flex items-center gap-2">
                       <BookOpen className="text-brand-blue" size={14} />
                       <span className="text-xs font-bold text-slate-700">{analysis.intent}</span>
                    </div>
                 </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <Lightbulb size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Resumen del Caso</h4>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {analysis.summary}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Respuesta Sugerida</h4>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-brand-blue/20 shadow-sm shadow-brand-blue/5">
                  <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                    “{analysis.suggestedResponse || 'No hay sugerencias disponibles.'}”
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-white border border-border rounded-lg text-[10px] font-black text-brand-blue uppercase tracking-widest hover:bg-slate-50 transition-all">Editar</button>
                    <button 
                      onClick={() => setInputText(analysis.suggestedResponse)}
                      disabled={!analysis.suggestedResponse}
                      className="flex-1 py-2 bg-brand-blue text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-30"
                    >
                      Usar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <Link size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Referencias KB</h4>
                </div>
                <div className="space-y-2">
                   {analysis.references && analysis.references.length > 0 ? (
                     analysis.references.map((ref: any, i: number) => (
                       <div 
                         key={`${ref.id}-${i}`} 
                         onClick={() => {
                           // Logic to open KB entry (could be a modal or redirect)
                           alert(`Abriendo referencia: ${ref.title}`);
                           setActiveTab('kb');
                         }}
                         className="flex items-center justify-between p-3 bg-white border border-border rounded-xl hover:border-brand-blue transition-all cursor-pointer group"
                       >
                          <span className="text-[10px] font-bold text-slate-600">{ref.title}</span>
                          <ArrowRight size={12} className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                       </div>
                     ))
                   ) : (
                     <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No se encontraron referencias específicas</p>
                     </div>
                   )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-rose-500">
                    <ShieldAlert size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Intervención Humana</h4>
                  </div>
                </div>
                <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-tight">Seleccionar Operador:</p>
                  <select 
                    value={selectedOperatorId}
                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 mb-4 outline-none focus:border-brand-blue transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.name}</option>
                    ))}
                  </select>

                  <button 
                    disabled={!selectedOperatorId || !activeConversationId || isAssigning}
                    onClick={() => {
                      setIsAssigning(true);
                      fetch(`http://localhost:3014/api/conversations/${activeConversationId}/assign`, {
                        method: 'PATCH',
                        headers: { 
                          'Content-Type': 'application/json',
                          'x-tenant-id': selectedTenant?.id || '',
                          'x-api-key': flowApiKey
                        },
                        body: JSON.stringify({ 
                          operatorId: selectedOperatorId,
                          userId: activeConversation?.contact?.phone || activeConversation?.lead?.phone || 'unknown'
                        })
                      })
                      .then(() => {
                        setIsAssigning(false);
                      })
                      .catch(err => {
                        console.error("Assignment failed:", err);
                        setIsAssigning(false);
                      });
                    }}
                    className="w-full py-3 bg-white border-2 border-brand-blue text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <RefreshCw size={12} className={isAssigning ? 'animate-spin' : ''} />
                    {isAssigning ? 'Asignando...' : 'Transferir a Humano'}
                  </button>

                  <div className="h-px bg-slate-100 my-4" />
                  
                  <p className="text-[10px] text-rose-500 font-bold mb-3 uppercase tracking-tight">Escalación Crítica:</p>
                  {hitlEscalated ? (
                    <div className="w-full py-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                       <CheckCircle size={14} />
                       Caso Escalado
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        const lastMsg = messages[messages.length - 1];
                        if (!lastMsg) return;
                        
                        fetch('http://localhost:3014/api/hitl/intervene', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json', 
                            'x-tenant-id': selectedTenant?.id || '',
                            'x-api-key': flowApiKey
                          },
                          body: JSON.stringify({ 
                            messageId: lastMsg.id, 
                            comments: 'Escalado manual desde bandeja',
                            content: lastMsg.content
                          }),
                        }).then(() => {
                          setHitlEscalated(true);
                        });
                      }}
                      className="w-full py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                    >
                      Escalar a HITL
                    </button>
                  )}
                </div>
              </div>

              {/* Asset Context - New Section */}
              <div className="mt-8 border-t border-slate-100 pt-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Contexto de Activo</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">Activo:</span>
                    <span className="text-xs text-slate-800 font-black">Tanque 4 - Tilapia</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">Biomasa Est:</span>
                    <span className="text-xs text-slate-800 font-black">1,240 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">Última Alerta:</span>
                    <span className="text-xs text-rose-500 font-black tracking-tight">Hace 15 min</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                     <RefreshCw size={12} className="text-amber-600" />
                     <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Resumen Semanal</span>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                    El usuario ha reportado 3 incidentes similares en los últimos 7 días. Posible fatiga de equipo de aireación.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConversationItem({ name, time, snippet, risk, channel, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border-b border-border cursor-pointer hover:bg-white transition-all ${active ? 'bg-white shadow-sm z-10 relative border-l-4 border-l-brand-blue' : ''}`}
    >
      <div className="flex justify-between items-start mb-1">
        <h5 className="font-bold text-sm text-slate-800">{name}</h5>
        <span className="text-[10px] text-slate-400">{time}</span>
      </div>
      <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{snippet}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={12} className={risk === 'ALTO' ? 'text-rose-500' : risk === 'MEDIO' ? 'text-amber-500' : 'text-emerald-500'} />
          <span className={`text-[9px] font-black tracking-widest uppercase ${risk === 'ALTO' ? 'text-rose-500' : risk === 'MEDIO' ? 'text-amber-500' : 'text-emerald-500'}`}>
            Riesgo {risk}
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{channel}</span>
      </div>
    </div>
  )
}

function Message({ text, time, isUser, isAI }: any) {
  return (
    <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
      <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${
        isUser 
          ? 'bg-white border border-border text-slate-700 rounded-bl-none' 
          : isAI 
            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 rounded-br-none'
            : 'bg-slate-100 text-slate-600 rounded-br-none'
      }`}>
        {text}
        <div className={`flex items-center gap-1 mt-2 ${isUser ? 'justify-end text-slate-300' : 'justify-start text-brand-blue-light'}`}>
          <span className="text-[9px] font-medium">{time}</span>
          {!isUser && <span className="w-3 h-3 border border-current rounded-full flex items-center justify-center text-[7px] font-bold">✓</span>}
        </div>
      </div>
      {isAI && (
        <span className="text-[8px] font-black text-brand-blue uppercase tracking-widest mt-1 mr-1">Respuesta de IA</span>
      )}
    </div>
  )
}
