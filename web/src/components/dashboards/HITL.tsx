import { 
  ChevronRight, 
  Check, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Thermometer, 
  Droplets, 
  Save, 
  Send, 
  CheckCircle, 
  XCircle,
  FileText,
  Clock,
  Lock,
  RefreshCw
} from 'lucide-react'

export function HITL() {
  return (
    <div className="p-8 bg-surface min-h-[calc(100vh-80px)] flex flex-col">
      {/* Header & Stepper */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>HITL</span>
            <ChevronRight size={10} />
            <span>Revisión de Respuesta AI</span>
            <ChevronRight size={10} />
            <span className="text-brand-blue">Caso #AC-8824</span>
          </div>
          <h2 className="text-3xl font-black font-display text-slate-800">Revisión de Protocolo Biológico</h2>
          <p className="text-sm text-slate-500 mt-1">Verificación de recomendaciones para niveles de oxígeno en estanque P-04.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1">
          <StepItem label="Biólogo" status="completed" />
          <div className="w-12 h-0.5 bg-brand-blue" />
          <StepItem label="Asesor Técnico" status="active" />
          <div className="w-12 h-0.5 bg-slate-100" />
          <StepItem label="Director" status="pending" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* AI Original Response */}
        <div className="dashboard-card bg-white p-6 border-b-4 border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-brand-blue">
              <ShieldCheck size={18} />
              <h3 className="font-bold text-sm">Respuesta de IA</h3>
            </div>
            <span className="bg-brand-blue/5 text-brand-blue text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Original</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-border min-h-[200px] mb-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              Basado en los sensores del Estanque P-04, se recomienda <span className="bg-rose-100 text-rose-600 px-1 rounded line-through decoration-rose-500">suspender la alimentación inmediatamente</span>. Los niveles de oxígeno disuelto han caído por debajo de 3.5 mg/L. Se sugiere activar los aireadores de emergencia y <span className="bg-rose-100 text-rose-600 px-1 rounded line-through decoration-rose-500">esperar 24 horas</span> antes de reevaluar.
            </p>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-slate-400">Confidencia del Modelo</span>
            <span className="text-slate-800">88.4%</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-brand-blue w-[88.4%]" />
          </div>
        </div>

        {/* Corrected Version */}
        <div className="dashboard-card bg-white p-6 border-b-4 border-brand-blue">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-slate-800">
              <User size={18} />
              <h3 className="font-bold text-sm">Versión Corregida (Editable)</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
              <span className="text-brand-blue text-[8px] font-black uppercase tracking-widest">Editando</span>
            </div>
          </div>
          <textarea 
            className="w-full bg-white p-6 rounded-2xl border border-brand-blue/20 min-h-[200px] mb-6 text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-brand-blue transition-all"
            defaultValue="Basado en los sensores del Estanque P-04, se recomienda reducir la alimentación al 20% en lugar de suspenderla. Los niveles de oxígeno disuelto han caído por debajo de 3.5 mg/L. Se sugiere activar los aireadores de emergencia y reevaluar en 4 horas tras la..."
          />
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <RefreshCw size={12} />
              Cambio de volumen: Suspensión → 20%
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Clock size={12} />
              Tiempo: 24h → 4h
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Notes */}
      <div className="grid grid-cols-12 gap-8 mb-8 flex-1">
        <div className="col-span-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Métricas de Contexto</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Droplets size={14} />
                <span className="text-[10px] font-bold">Oxígeno Actual</span>
              </div>
              <p className="text-2xl font-black text-rose-500">3.2 mg/L</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Thermometer size={14} />
                <span className="text-[10px] font-bold">Temperatura</span>
              </div>
              <p className="text-2xl font-black text-slate-800">24.5 °C</p>
            </div>
          </div>
        </div>
        <div className="col-span-7">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Notas del Revisor</h4>
          <textarea 
            placeholder="Agregar comentarios para el siguiente nivel..."
            className="w-full h-full min-h-[120px] bg-white p-6 rounded-[24px] border border-border shadow-sm text-sm text-slate-600 focus:outline-none focus:border-brand-blue transition-all"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-border mt-auto">
        <button className="flex items-center gap-2 px-6 py-3 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-xl transition-all">
          <XCircle size={18} />
          Rechazar
        </button>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            Guardar Borrador
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-brand-deep text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-deep/20 hover:opacity-90 transition-all">
            <Send size={18} />
            Enviar a Siguiente Nivel
          </button>
          <button className="flex items-center gap-2 px-10 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/30 hover:scale-[1.02] transition-all">
            <CheckCircle size={18} />
            Aprobar
          </button>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center gap-8 mt-8 text-[10px] font-bold text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          Sincronizado con Nodo Central
        </div>
        <div className="flex items-center gap-2">
          <Lock size={12} />
          Sesión Encriptada
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Clock size={12} />
          Último autoguardado: Hace 2 minutos
        </div>
      </div>
    </div>
  )
}

function StepItem({ label, status }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
        status === 'completed' ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/30' :
        status === 'active' ? 'bg-white border-brand-blue text-brand-blue shadow-lg shadow-brand-blue/10' :
        'bg-white border-slate-100 text-slate-200'
      }`}>
        {status === 'completed' ? <Check size={20} /> : <User size={20} />}
      </div>
      <span className={`text-[8px] font-black uppercase mt-2 tracking-widest ${
        status === 'active' || status === 'completed' ? 'text-slate-800' : 'text-slate-200'
      }`}>{label}</span>
    </div>
  )
}
