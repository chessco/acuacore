import React, { useState } from 'react';
import { 
  Search, 
  Video, 
  Phone, 
  MoreVertical, 
  Smile, 
  SendHorizontal, 
  PlusCircle,
  AlertCircle,
  CheckCheck,
  CheckCircle2,
  TrendingUp,
  Brain,
  Zap,
  Clock,
  History,
  Edit2,
  Play
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const chats = [
  { id: 1, name: 'Juan Pérez', farm: 'Granja Sur', lastMsg: '"El sensor de oxígeno en el tanque 4 está reportando valores por debajo del 4mg/L..."', time: '14:20', risk: 'alto', channel: 'WhatsApp', active: true },
  { id: 2, name: 'María García', farm: 'Inq. Central', lastMsg: '"Confirmado el pedido de alimento balanceado para la próxima semana."', time: '12:05', risk: 'bajo', channel: 'SMS' },
  { id: 3, name: 'Roberto Torres', farm: 'Unidad Delta', lastMsg: '"Solicitud de mantenimiento para el sistema de bombeo de la unidad..."', time: 'Ayer', risk: 'medio', channel: 'WhatsApp', closed: true },
];

export default function Inbox() {
  const [selectedChat, setSelectedChat] = useState(chats[0]);

  return (
    <div className="-m-8 h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Left List */}
      <aside className="w-80 flex flex-col border-r border-slate-200 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 font-display">Conversaciones</h2>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">24 Activ@s</span>
        </div>
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex gap-2">
            <select className="flex-1 text-xs border-slate-200 rounded-lg py-1.5 focus:ring-primary focus:border-primary">
              <option>Estado: Todos</option>
              <option>Abierto</option>
              <option>Cerrado</option>
            </select>
            <select className="flex-1 text-xs border-slate-200 rounded-lg py-1.5 focus:ring-primary focus:border-primary">
              <option>Riesgo: Todos</option>
              <option>Alto</option>
              <option>Medio</option>
              <option>Bajo</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {chats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative",
                chat.active && "bg-blue-50/50 border-l-4 border-primary",
                chat.closed && "opacity-60"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-sm text-slate-800">{chat.name} - {chat.farm}</h3>
                <span className="text-[10px] text-slate-400 font-medium">{chat.time}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-medium leading-relaxed">
                {chat.lastMsg}
              </p>
              <div className="flex items-center justify-between">
                <span className={cn(
                  "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  chat.risk === 'alto' ? "bg-error-container/30 text-error" : 
                  chat.risk === 'medio' ? "bg-secondary-container/20 text-secondary" : 
                  "bg-blue-100 text-blue-600"
                )}>
                  {chat.risk === 'alto' && <AlertCircle size={10} />}
                  RIESGO {chat.risk}
                </span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">{chat.channel}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100">
              <img src={`https://i.pravatar.cc/100?u=${selectedChat.id}`} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-none">{selectedChat.name}</h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">En línea • {selectedChat.farm}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-primary transition-all"><Video size={20} /></button>
            <button className="p-2 text-slate-400 hover:text-primary transition-all"><Phone size={20} /></button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <button className="p-2 text-slate-400 hover:text-primary transition-all"><MoreVertical size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
             <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Hoy</span>
          </div>

          {/* Messages */}
          <div className="flex items-end gap-3 max-w-[80%]">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 ring-1 ring-black/[0.02]">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">Hola equipo, estoy revisando el tanque 4 y el nivel de oxígeno está marcando 3.8 mg/L. ¿Es normal para esta hora o debo encender los aireadores?</p>
                <span className="text-[10px] text-slate-400 mt-2 block text-right font-bold">14:15</span>
             </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-end gap-3 max-w-[80%] flex-row-reverse">
               <div className="bg-primary p-4 rounded-2xl rounded-br-none shadow-lg">
                  <p className="text-sm text-white leading-relaxed font-medium">Hola Juan. He analizado el historial. Un valor de 3.8 mg/L a esta hora está por debajo del umbral óptimo (4.5 mg/L). Te sugiero activar los aireadores de emergencia de inmediato.</p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-[10px] text-blue-100 font-bold">14:16</span>
                    <CheckCheck size={14} className="text-blue-100" />
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-1.5 mr-3 mt-1">
               <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-blue-100">Respuesta de IA</span>
            </div>
          </div>

          <div className="flex items-end gap-3 max-w-[80%]">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 ring-1 ring-black/[0.02]">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">Ok, los estoy encendiendo. ¿Puede ser un fallo del sensor o es real la caída? Ayer los niveles estaban estables.</p>
                <span className="text-[10px] text-slate-400 mt-2 block text-right font-bold">14:20</span>
             </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 pr-4 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <PlusCircle size={20} />
            </button>
            <input 
              type="text" 
              placeholder="Escribe un mensaje..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 font-medium"
            />
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                <Smile size={20} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20">
                <SendHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right AI Sidebar */}
      <aside className="w-80 border-l border-slate-200 bg-white overflow-y-auto p-6 space-y-6 flex flex-col">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Brain size={14} className="text-primary" />
              Análisis de IA
            </h3>
            
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm ring-1 ring-black/[0.01]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">Confianza</span>
                <span className="text-base font-black text-primary">98.4%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '98.4%' }}
                  className="bg-primary h-full rounded-full" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm ring-1 ring-black/[0.02]">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Zap size={10} /> Clasificación
                </p>
                <p className="text-xs font-bold text-on-surface">Técnica / Ops</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm ring-1 ring-black/[0.02]">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Smile size={10} /> Sentimiento
                </p>
                <p className="text-xs font-bold text-secondary">Preocupado</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <Edit2 size={14} /> Respuesta Sugerida
              </h4>
              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 relative ring-1 ring-blue-600/5">
                <div className="absolute -top-2.5 right-4 bg-primary text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">Copilot</div>
                <p className="text-xs text-slate-700 leading-relaxed italic mb-4 font-medium italic">
                  "He revisado la telemetría del sensor y la calibración parece correcta. No hay picos de interferencia eléctrica. Es probable que la caída sea biológica o por recirculación. Recomiendo medir manualmente para confirmar."
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-white border border-blue-200 text-primary text-[10px] font-black py-2 rounded-xl hover:bg-white transition-colors shadow-sm">EDITAR</button>
                  <button className="flex-1 bg-primary text-white text-[10px] font-black py-2 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20">USAR</button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-auto">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Contexto de Activo</h3>
            <div className="space-y-3">
              <ContextItem label="Activo" value="Tanque 4 - Tilapia" />
              <ContextItem label="Biomasa Est." value="1,240 kg" />
              <ContextItem label="Última Alerta" value="Hace 15 min" valueColor="text-error" />
            </div>
            
            <div className="mt-6 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 relative">
               <div className="flex items-center gap-2 mb-2">
                  <History size={14} className="text-slate-500" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">RESUMEN SEMANAL</span>
               </div>
               <p className="text-[11px] text-slate-500 leading-relaxed font-medium">El usuario ha reportado 3 incidentes similares en los últimos 7 días. Posible fatiga de equipo de aireación.</p>
               <button className="w-full mt-3 py-1.5 text-[9px] font-black text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-all uppercase tracking-widest">
                 Ver Historial Completo
               </button>
            </div>
          </div>
      </aside>
    </div>
  );
}

function ContextItem({ label, value, valueColor = "text-on-surface" }: any) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500 font-medium">{label}:</span>
      <span className={cn("font-bold", valueColor)}>{value}</span>
    </div>
  );
}
