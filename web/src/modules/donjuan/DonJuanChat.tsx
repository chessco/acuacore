import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, Send, User, ChevronDown, Check, Settings, Trash2, Fish } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

export const DonJuanChat: React.FC = () => {
  const { selectedTenant, role } = useTenant();
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAgents, setFetchingAgents] = useState(true);
  const [showAgentList, setShowAgentList] = useState(false);
  
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('donjuan_email') || '';
  });
  const [showSettings, setShowSettings] = useState(!userEmail);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    fetchAgents();
  }, [selectedTenant]);

  useEffect(() => {
    if (userEmail) {
      fetchHistory();
    }
  }, [userEmail, selectedTenant]);

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/agents`, {
        headers: { 'x-tenant-id': selectedTenant?.id || '' }
      });
      setAgents(res.data);
      
      // Default to don-juan-camaron if it exists, otherwise first agent
      const donJuan = res.data.find((a: any) => a.slug === 'don-juan-camaron');
      if (donJuan) {
        setSelectedAgent(donJuan);
      } else if (res.data.length > 0) {
        setSelectedAgent(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setFetchingAgents(false);
    }
  };

  const fetchHistory = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`${apiUrl}/api/conversations/by-phone/${encodeURIComponent(userEmail)}`, {
        headers: { 'x-tenant-id': selectedTenant?.id || '' }
      });
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
      } else {
        setMessages([]); // Reset if no history
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const saveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const email = fd.get('email') as string;
    if (email) {
      localStorage.setItem('donjuan_email', email);
      setUserEmail(email);
      setShowSettings(false);
    }
  };

  const clearEmail = () => {
    localStorage.removeItem('donjuan_email');
    setUserEmail('');
    setMessages([]);
    setShowSettings(true);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || !userEmail) return;

    const userMessage = { role: 'user', content: input, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/api/agents/${selectedAgent.slug}/chat`, 
        { message: userMessage.content },
        {
          headers: { 
            'x-tenant-id': selectedTenant?.id || '',
            'x-operator-email': userEmail 
          }
        }
      );
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.content,
        id: (Date.now() + 1).toString()
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hubo un error de conexión con el agente. Intenta nuevamente.',
        id: (Date.now() + 1).toString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (fetchingAgents) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Fish size={20} />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowAgentList(!showAgentList)}
              className="flex items-center gap-2 hover:bg-slate-200/50 p-1 -ml-1 rounded-lg transition-colors text-left"
            >
              <div>
                <h2 className="font-bold text-slate-800 leading-tight">
                  {selectedAgent?.name || 'Seleccionar Agente'}
                </h2>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                  Asistente Interno AI
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Agent Dropdown */}
            {showAgentList && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAgentList(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {agents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowAgentList(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${selectedAgent?.id === agent.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <span className={`font-medium ${selectedAgent?.id === agent.id ? 'text-blue-700' : 'text-slate-700'}`}>
                          {agent.name}
                        </span>
                        {selectedAgent?.id === agent.id && <Check size={14} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userEmail && (
            <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-full">
              {userEmail}
            </span>
          )}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-blue-50 border-b border-blue-100 p-6 z-10 relative">
          <div className="max-w-md">
            <h3 className="font-bold text-blue-900 mb-2">Configuración de Sesión</h3>
            <p className="text-sm text-blue-700 mb-4">
              Ingresa tu correo institucional. Esto permite guardar y recuperar tu historial de chat con el Asistente Interno.
            </p>
            {userEmail ? (
              <div className="flex items-center gap-4">
                <span className="font-medium text-slate-800 bg-white px-4 py-2 rounded-lg border border-slate-200 flex-1">
                  {userEmail}
                </span>
                <button 
                  onClick={clearEmail}
                  className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={saveEmail} className="flex gap-2">
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="ejemplo@acuaequipos.com"
                  className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Guardar
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAFC]">
        {!userEmail ? (
          <div className="h-full flex items-center justify-center flex-col text-center opacity-50">
            <Bot size={48} className="text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">Configura tu correo arriba para iniciar el chat</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-center opacity-50">
            <Bot size={48} className="text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">No hay mensajes. ¡Inicia la conversación!</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto pb-4">
            {messages.map((msg, i) => (
              <div key={msg.id || i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                    : 'bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'
                } ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}`}>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100 max-w-[85%] flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={userEmail ? "Escribe un mensaje al agente..." : "Configura tu correo para enviar mensajes"}
            disabled={!userEmail || loading}
            className="w-full pl-5 pr-14 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-[60px] max-h-[200px] bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !userEmail || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
          El agente puede cometer errores. Considera verificar la información importante.
        </p>
      </div>

    </div>
  );
};
