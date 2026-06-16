import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistantView() {
  const { selectedTenant } = useTenant();
  const tenantId = selectedTenant?.id;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
  
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hola, soy tu asistente de Workspace. Puedo buscar información en tus notas, documentos e ideas. ¿En qué te puedo ayudar hoy?',
    },
  ]);
  const [isPending, setIsPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isPending) return;

    const userMessage = query.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsPending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/workspace/ai/ask`,
        { question: userMessage },
        {
          headers: {
            'x-tenant-id': tenantId || '',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reply = response.data?.answer || 'Lo siento, no pude procesar la respuesta en este momento.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Error querying workspace AI:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ocurrió un error al comunicarse con el asistente. Por favor, inténtalo de nuevo.',
        },
      ]);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl h-full border border-slate-100 flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">AI Assistant</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Intelligence</p>
        </div>
      </div>
      
      {/* Conversation Area */}
      <div className="flex-1 bg-slate-50 rounded-2xl p-6 mb-4 overflow-y-auto border border-slate-100 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[75%] shadow-sm ${
                  isUser
                    ? 'bg-brand-blue text-white rounded-tr-none'
                    : 'bg-white text-slate-600 rounded-tl-none border border-slate-100'
                }`}
              >
                {msg.content}
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-1 shadow-sm font-bold text-xs">
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {isPending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white shrink-0 mt-1 shadow-sm animate-pulse">
              <Bot size={16} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-400 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <Loader2 className="animate-spin text-brand-blue" size={16} />
              El asistente está analizando tus notas...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="relative shrink-0">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          placeholder={isPending ? "Analizando..." : "Pregúntame sobre tus documentos, notas o ideas..."}
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all disabled:opacity-70 text-slate-700"
        />
        <button 
          type="submit"
          disabled={isPending || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-blue/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
