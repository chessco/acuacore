import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Globe,
  Settings2,
  Database
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

export default function ProtocolArchitect() {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [options, setOptions] = useState({
    tone: 'técnicos',
    format: 'estándar ISO',
    complexity: 'avanzado'
  });

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  const generateProtocol = async () => {
    if (!topic) return;
    setGenerating(true);
    try {
      const prompt = `Crea un protocolo de operación estándar (SOP) detallado para acuicultura sobre: "${topic}". 
      Tono: ${options.tone}. Formato: ${options.format}. Nivel: ${options.complexity}.
      Incluye secciones de: Introducción, Equipamiento, Procedimiento Paso a Paso, Medidas de Seguridad y Registro de Datos.
      Responde en Markdown y español profesional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });
      setProtocol(response.text || "No se pudo generar el protocolo.");
    } catch (error) {
      console.error(error);
      setProtocol("Error al conectar con el arquitecto de protocolos.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-6">
      {/* Top Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
            <FileCode size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Arquitecto de Protocolos</h1>
            <p className="text-slate-500 text-sm">Motor de generación procedural para normativas y procedimientos operativos operativos (SOP).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Tema del Protocolo</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Limpieza de Biofiltros, Manejo de Vacunas..."
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all font-sans"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Complejidad</label>
            <select 
              value={options.complexity}
              onChange={(e) => setOptions({...options, complexity: e.target.value})}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="básico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={generateProtocol}
              disabled={generating || !topic}
              className="w-full h-[46px] bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {generating ? <RotateCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Arquitectar
            </button>
          </div>
        </div>
      </div>

      {/* Main Builder Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Sidebar Controls */}
        <div className="space-y-4 overflow-y-auto pr-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Settings2 size={18} className="text-secondary" />
              Parámetros IA
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Tono del Contenido</p>
                <div className="flex flex-wrap gap-2">
                  {['Técnico', 'Formativo', 'Legislativo'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setOptions({...options, tone: t.toLowerCase()})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${options.tone === t.toLowerCase() ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Normativa de Referencia</p>
                <div className="flex flex-col gap-2 font-body text-xs text-slate-500">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" checked={options.format === 'estándar ISO'} onChange={() => setOptions({...options, format: 'estándar ISO'})} className="accent-secondary" /> ISO 9001:2015
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" checked={options.format === 'normativa ASC'} onChange={() => setOptions({...options, format: 'normativa ASC'})} className="accent-secondary" /> Estándar ASC
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" checked={options.format === 'guía FAO'} onChange={() => setOptions({...options, format: 'guía FAO'})} className="accent-secondary" /> Guías FAO
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <Globe className="absolute top-[-10px] right-[-10px] text-white/5" size={120} />
            <h4 className="font-bold mb-2">Base de Conocimiento</h4>
            <p className="text-xs text-white/60 mb-4 font-body">Sincroniza tus protocolos generados con la biblioteca central para entrenamiento de modelos HITL.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
              <Database size={14} /> Abrir Biblioteca
            </button>
          </div>
        </div>

        {/* Protocol Viewer */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Engine v4.1</span>
            </div>
            <div className="flex gap-1">
              <button className="p-2 text-slate-400 hover:text-secondary transition-colors" title="Copiar">
                <Copy size={16} />
              </button>
              <button className="p-2 text-slate-400 hover:text-secondary transition-colors" title="Descargar PDF">
                <Download size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 font-body text-slate-700 bg-slate-50/30">
            <div className="max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="h-8 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                    </div>
                    <div className="h-48 bg-slate-100 rounded-3xl w-full animate-pulse" />
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                    </div>
                  </motion.div>
                ) : protocol ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-slate max-w-none prose-sm"
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {protocol}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                      <FileText size={40} />
                    </div>
                    <h3 className="font-bold text-slate-900">Vista Previa del Protocolo</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-2">Introduce un tema y pulsa "Arquitectar" para generar tu primer procedimiento operativo estándar.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!generating && protocol && (
            <div className="absolute bottom-6 right-6">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-green-600 transition-colors"
                onClick={() => {}}
              >
                <CheckCircle2 size={18} />
                Validar y Guardar
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Status Tip */}
      <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <AlertCircle size={18} className="text-slate-400" />
        <p className="text-xs text-slate-500 font-body italic">
          Tip IA: Para mejores resultados, especifica si el protocolo es para agua dulce o salada y menciona especies específicas si es necesario.
        </p>
      </div>
    </div>
  );
}
