import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Star, CheckCircle, Bot, User, Clock, MessageSquare, Thermometer, Database, Fish, Eye } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

interface CapsuleChatProps {
  slug: string;
  agentName: string;
  agentPortrait?: string;
  agentGreeting?: string;
}

export const CapsuleChat: React.FC<CapsuleChatProps> = ({ slug, agentName, agentPortrait, agentGreeting }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: agentGreeting || `¡Hola! Soy ${agentName} 🦐\nCuéntame sobre tu cultivo y te ayudaré a optimizar la alimentación para mejorar tu FCA.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      role: 'user',
      content: 'Tengo 1,200 kg/ha de biomasa, temperatura de 30°C y el camarón está de 8 gramos. ¿Cuánta ración debo dar?',
      time: '10:31 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chips = ['Ajuste por temperatura', 'Cálculo de ración', 'Comportamiento de nado', 'Signos de saciedad'];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
    if (!textOverride) setInput('');
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setLoading(true);

    try {
      const res = await axios.post(`/api/capsules/${slug}/chat`, {
        message: userMsg,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Problema de conexión. Reintenta.', time: 'Ahora' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[300px_1fr] bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100">
      {/* Sidebar Bio */}
      <div className="bg-[#001A41] overflow-hidden flex flex-col">
        <div className="flex-1 min-h-[300px] relative">
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
            <p className="text-xs text-slate-500">Tu asesor experto en nutrición y alimentación de camarón</p>
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
                  <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-200`}>
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
