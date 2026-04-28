import React from 'react';
import { 
  ChevronRight, 
  Check, 
  Edit3, 
  ShieldCheck, 
  Search, 
  Bot, 
  User, 
  Info, 
  History, 
  X, 
  Save, 
  Forward, 
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function HITL() {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[0.1em]">
            <span className="hover:text-primary cursor-pointer">HITL</span>
            <ChevronRight size={12} />
            <span className="hover:text-primary cursor-pointer">Revisión de Respuesta AI</span>
            <ChevronRight size={12} />
            <span className="text-primary">Caso #AC-8824</span>
          </nav>
          <h2 className="text-3xl font-bold text-on-surface font-display">Revisión de Protocolo Biológico</h2>
          <p className="text-base text-on-surface-variant mt-1 font-medium italic">Verificación de recomendaciones para niveles de oxígeno en estanque P-04.</p>
        </div>

        {/* Process Flow */}
        <div className="flex items-center gap-0">
          <ProcessStep icon={<Check size={14} />} label="Biólogo" completed />
          <div className="w-16 h-0.5 bg-primary/20">
            <div className="h-full bg-primary w-full" />
          </div>
          <ProcessStep icon={<Edit3 size={14} />} label="Asesor Técnico" active />
          <div className="w-16 h-0.5 bg-slate-200" />
          <ProcessStep icon={<ShieldCheck size={14} />} label="Director" />
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original AI AI */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-primary" />
              <span className="text-sm font-bold text-slate-800">Respuesta de IA</span>
            </div>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-widest">Original</span>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl text-slate-600 border-l-4 border-slate-300 relative">
              <p className="text-sm leading-relaxed font-medium">
                Basado en los sensores del Estanque P-04, se recomienda <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded-md font-bold">suspender la alimentación inmediatamente</span>. Los niveles de oxígeno disuelto han caído por debajo de 3.5 mg/L. Se sugiere activar los aireadores de emergencia y <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded-md font-bold">esperar 24 horas</span> antes de reevaluar.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
               <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Confidencia del Modelo</span>
                  <span className="text-primary">88.4%</span>
               </div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '88.4%' }} className="bg-primary h-full rounded-full" />
               </div>
            </div>
          </div>
        </div>

        {/* Human Correction */}
        <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden shadow-xl flex flex-col ring-8 ring-primary/5">
          <header className="px-6 py-4 border-b border-primary/10 flex justify-between items-center bg-blue-50/30">
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <span className="text-sm font-bold text-slate-900">Versión Corregida (Editable)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editando</span>
            </div>
          </header>
          <div className="p-6 flex-1 flex flex-col space-y-6">
            <textarea 
              className="flex-1 w-full min-h-[160px] p-4 text-sm leading-relaxed border-none focus:ring-0 bg-transparent resize-none font-medium text-slate-800"
              defaultValue="Basado en los sensores del Estanque P-04, se recomienda reducir la alimentación al 20% en lugar de suspenderla. Los niveles de oxígeno disuelto han caído por debajo de 3.5 mg/L. Se sugiere activar los aireadores de emergencia y reevaluar en 4 horas tras la estabilización de los niveles."
              spellCheck={false}
            />
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <CorrectionTag icon={<Info size={12} />} label="Cambio de volumen: Suspensión -> 20%" color="bg-green-50 text-green-700 border-green-100" />
              <CorrectionTag icon={<History size={12} />} label="Tiempo: 24h -> 4h" color="bg-amber-50 text-amber-700 border-amber-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Context Metadata */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Métricas de Contexto</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:-translate-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Oxígeno Actual</p>
                    <p className="text-2xl font-black text-error">3.2 mg/L</p>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:-translate-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Temperatura</p>
                    <p className="text-2xl font-black text-on-surface">24.5 °C</p>
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas del Revisor</h4>
              <textarea 
                className="w-full text-xs p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary h-[88px] bg-white transition-all font-medium"
                placeholder="Agregar comentarios para el siguiente nivel de validación..."
              />
           </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-lg flex items-center justify-between sticky bottom-4 z-30 transition-all hover:translate-y-[-2px]">
        <button className="flex items-center gap-2 px-6 py-2.5 text-error font-black text-sm hover:bg-error/5 transition-all rounded-xl active:scale-95">
          <X size={18} />
          RECHAZAR
        </button>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all rounded-xl active:scale-95">
            GUARDAR BORRADOR
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white font-bold text-sm hover:brightness-110 transition-all rounded-xl active:scale-95 shadow-md shadow-secondary/10 uppercase tracking-wide">
            <Forward size={18} />
            Siguiente Nivel
          </button>
          <button className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white font-bold text-sm hover:brightness-110 transition-all rounded-xl active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-wide">
            <CheckCircle2 size={18} />
            Aprobar
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center gap-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Sincronizado con Nodo Central
        </div>
        <div className="flex items-center gap-2">
          <Lock size={12} />
          Sesión Encriptada SSL/TLS
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} />
          Último autoguardado: Hace 2 minutos
        </div>
      </div>
    </div>
  );
}

function ProcessStep({ icon, label, completed, active }: any) {
  return (
    <div className="flex flex-col items-center group cursor-pointer relative">
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
        completed ? "bg-primary text-white shadow-lg shadow-primary/20" : 
        active ? "bg-white text-primary border-2 border-primary ring-4 ring-primary/5" :
        "bg-slate-100 text-slate-400 grayscale"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[9px] font-black mt-2 uppercase tracking-tighter transition-colors",
        completed ? "text-primary" : active ? "text-slate-900" : "text-slate-400"
      )}>{label}</span>
    </div>
  );
}

function CorrectionTag({ icon, label, color }: any) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[10px] font-bold shadow-sm transition-transform hover:scale-105",
      color
    )}>
      {icon}
      {label}
    </div>
  );
}
