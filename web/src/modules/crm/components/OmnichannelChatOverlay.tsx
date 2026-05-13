import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Phone, 
  Clock, 
  CheckCheck, 
  User,
  Bot,
  Loader2,
  Paperclip,
  Smile
} from 'lucide-react';
import axios from 'axios';
import { useTenant } from '../../../contexts/TenantContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface OmnichannelChatOverlayProps {
  contact: {
    id: string;
    name: string;
    phone: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function OmnichannelChatOverlay({ contact, isOpen, onClose }: OmnichannelChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { selectedTenant } = useTenant();
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';

  useEffect(() => {
    if (isOpen && contact.phone) {
      fetchConversation();
    }
  }, [isOpen, contact.phone]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiUrl}/api/conversations/by-phone/${contact.phone}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      
      if (res.data) {
        setConversationId(res.data.id);
        setMessages(res.data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/conversations/${conversationId}/reply`, {
        content: input
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      
      setInput('');
      fetchConversation(); // Refresh
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-end sm:p-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="w-full sm:w-[450px] h-full sm:h-[600px] bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="p-6 bg-[#001A41] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-tight">{contact.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    WhatsApp Conectado
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4 custom-scrollbar"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] space-y-1`}>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'assistant' 
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/10' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1.5 px-1 ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {msg.role === 'assistant' && <CheckCheck size={12} className="text-blue-400" />}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Sin historial de chat</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Escribe un mensaje para iniciar la conversación por WhatsApp.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" className="p-1 text-slate-300 hover:text-slate-400 transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <button type="button" className="p-1 text-slate-300 hover:text-slate-400 transition-colors">
                    <Smile size={18} />
                  </button>
                </div>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe una respuesta..."
                  className="w-full pl-24 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-100"
                >
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </form>
              <div className="mt-4 flex items-center justify-center gap-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Bot size={12} /> IA en Copiloto
                </p>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone size={12} /> WhatsApp Business
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
