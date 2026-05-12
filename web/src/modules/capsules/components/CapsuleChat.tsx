import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Star, CheckCircle, User, MessageSquare, Thermometer, Database, Fish, Eye } from 'lucide-react';
import axios from 'axios';
import { io, Socket as SocketIO } from 'socket.io-client';
import { useTenant } from '../../../contexts/TenantContext';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

interface CapsuleChatProps {
  slug: string;
  agentName: string;
  agentPortrait?: string;
  agentGreeting?: string;
  preview?: boolean;
  onPortraitClick?: () => void;
}

export const CapsuleChat: React.FC<CapsuleChatProps> = ({ 
  slug,
  agentName, 
  agentPortrait, 
  agentGreeting,
  preview: propPreview,
  onPortraitClick
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: agentGreeting || `¡Hola! Soy ${agentName} 🦐\nCuéntame sobre tu cultivo y te ayudaré a optimizar la alimentación para mejorar tu FCA.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [capsuleId, setCapsuleId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<SocketIO | null>(null);
  const { selectedTenant, flowApiKey } = useTenant();

  // Detect preview mode from URL or prop
  const isPreview = propPreview || new URLSearchParams(window.location.search).get('preview') === 'true';

  const [userId] = useState(() => {
    const saved = localStorage.getItem('capsule_user_id');
    if (saved) return saved;
    const newId = `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('capsule_user_id', newId);
    return newId;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Setup Socket for Real-time human replies
  useEffect(() => {
    let tid: string | null = null;
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
    if (window.location.hostname === 'localhost') {
      apiUrl = 'http://localhost:3014';
    } else if (!import.meta.env.VITE_API_URL) {
      apiUrl = window.location.origin.replace(':3000', ':3014');
    }

    const socket = io(apiUrl);
    socketRef.current = socket;

    const fetchCapsuleInfo = async () => {
      try {
        const endpoint = isPreview 
          ? `${apiUrl}/api/capsule-studio/capsules/slug/${slug}`
          : `${apiUrl}/api/capsules/${slug}`;

        const role = localStorage.getItem('acuacore_role') || 'tenant';
        const res = await axios.get(endpoint, {
          headers: isPreview ? {
            'x-tenant-id': selectedTenant?.id || '',
            'x-api-key': flowApiKey || '',
            'x-user-role': role.toUpperCase(),
          } : {}
        });
        
        tid = res.data.tenantId || 'DEFAULT_TENANT';
        setCapsuleId(res.data.id);
        if (tid) socket.emit('joinTenant', tid);
        if (conversationId) socket.emit('joinConversation', conversationId);
      } catch (err) {
        console.error("[CapsuleChat] Error fetching capsule info:", err);
      }
    };

    socket.on('connect', () => {
      console.log("[CapsuleChat] Connected to socket:", socket.id);
      fetchCapsuleInfo();
    });

    socket.on('newMessage', (newMsg: any) => {
      console.log("[CapsuleChat] New socket message received:", newMsg);
      if (newMsg.role === 'assistant') {
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id || (m.content === newMsg.content && m.role === 'assistant'))) return prev;
          return [...prev, {
            role: 'assistant',
            content: newMsg.content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [slug, isPreview, selectedTenant, flowApiKey]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || loading) return null;

    const userMsg = text.trim();
    if (!textOverride) setInput('');
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setLoading(true);

    try {
      let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      if (window.location.hostname === 'localhost') {
        apiUrl = 'http://localhost:3014';
      } else if (!import.meta.env.VITE_API_URL) {
        apiUrl = window.location.origin.replace(':3000', ':3014');
      }

      const endpoint = isPreview 
        ? `${apiUrl}/api/capsule-studio/capsules/slug/${slug}/chat`
        : `${apiUrl}/api/capsules/${slug}/chat`;

      const role = localStorage.getItem('acuacore_role') || 'tenant';
      const res = await axios.post(endpoint, {
        message: userMsg,
        userId: userId,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      }, {
        headers: isPreview ? {
          'x-tenant-id': selectedTenant?.id || '',
          'x-api-key': flowApiKey || '',
          'x-user-role': role.toUpperCase(),
        } : {}
      });

      if (res.data.conversationId) {
        setConversationId(res.data.conversationId);
      }
      return res.data;
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Problema de conexión. Reintenta.', time: 'Ahora' }]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const escalateToHuman = async () => {
    if (loading || isEscalating) return;
    setIsEscalating(true);
    try {
      let currentConvId = conversationId;
      if (!currentConvId) {
        const res = await handleSend("Me gustaría hablar con un asesor humano.");
        if (res && res.conversationId) currentConvId = res.conversationId;
      }

      if (currentConvId) {
        let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
        if (window.location.hostname === 'localhost') apiUrl = 'http://localhost:3014';
        await axios.post(`${apiUrl}/api/conversations/${currentConvId}/request-agent`);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'He solicitado la intervención de un asesor humano. En breve se pondrán en contacto contigo aquí mismo.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error("Error escalating:", err);
    } finally {
      setIsEscalating(false);
    }
  };

  useEffect(() => {
    const handler = () => escalateToHuman();
    window.addEventListener('escalate-request', handler);
    return () => window.removeEventListener('escalate-request', handler);
  }, [conversationId, loading, isEscalating]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100">
      {/* Sidebar Bio */}
      <div className="bg-[#001A41] overflow-hidden flex flex-col">
        <div 
          className="flex-1 min-h-[250px] md:min-h-[300px] relative cursor-zoom-in"
          onClick={onPortraitClick}
        >
          <img 
            src={agentPortrait || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"} 
            alt={agentName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 text-white space-y-3">
          <div>
            <h3 className="text-xl font-bold">{agentName}</h3>
            <p className="text-blue-200 text-xs font-medium">Especialista en nutrición y manejo alimenticio</p>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
            <span className="text-white text-xs font-bold ml-1">4.9 (128)</span>
          </div>
          <p className="text-blue-100/70 text-[11px] font-bold leading-tight pt-2 border-t border-white/10">
            +15 años de experiencia en acuicultura
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col h-[650px] bg-white relative">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-lg">Habla con {agentName}</h4>
            <p className="text-xs text-slate-500">Asesor experto en alimentación</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-bold text-green-700">En línea</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div 
                    className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-200 cursor-zoom-in"
                    onClick={onPortraitClick}
                  >
                    {msg.role === 'assistant' ? (
                      <img src={agentPortrait} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={20} /></div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className={`p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none whitespace-pre-wrap'
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] font-bold text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.time} {msg.role === 'user' && <CheckCircle size={10} className="inline ml-1 text-blue-400" />}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="px-8 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-white">
          {[
            { label: 'Ajuste por temperatura', icon: Thermometer },
            { label: 'Cálculo de ración', icon: Database },
            { label: 'Comportamiento de nado', icon: Fish },
            { label: 'Signos de saciedad', icon: Eye }
          ].map(chip => (
            <button 
              key={chip.label}
              onClick={() => handleSend(chip.label)}
              className="whitespace-nowrap px-4 py-2 bg-blue-50/50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition-colors"
            >
              <chip.icon size={14} />
              {chip.label}
            </button>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="relative flex items-center">
            <input
              type="text"
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-700"
              placeholder="Escribe tu pregunta aquí..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="absolute right-3 p-3 bg-[#001A41] text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
