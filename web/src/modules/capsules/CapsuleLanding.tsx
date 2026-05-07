import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Menu, X, ArrowRight, Shield, Zap, TrendingUp, Fish, Thermometer, Eye, LayoutGrid, BarChart3, Database, Clock } from 'lucide-react';
import axios from 'axios';
import { CapsuleChat } from './components/CapsuleChat';
import { LeadForm } from './components/LeadForm';
import { DeepExplanationBlock } from './components/DeepExplanationBlock';

export const CapsuleLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [capsule, setCapsule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leadCaptured, setLeadCaptured] = useState(false);

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const res = await axios.get(`http://localhost:3014/api/capsules/${slug}`);
        console.log('Capsule data fetched:', res.data);
        setCapsule(res.data);
      } catch (err) {
        console.error('Error fetching capsule:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchCapsule();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 font-medium">Sincronizando experiencia...</div>;
  if (!capsule) return <div className="h-screen flex items-center justify-center text-red-500 font-bold underline">Cápsula no disponible en este momento.</div>;

  return (
    <div className="min-h-screen bg-white font-['Inter'] selection:bg-blue-100 text-slate-900 scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#001A41]">Acuaequipos</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Inteligencia para Acuicultura</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <a href="/capsules" className="text-sm font-bold text-slate-600 hover:text-[#001A41] transition-colors">Cápsulas</a>
            <a href="#benefits" className="text-sm font-bold text-slate-600 hover:text-[#001A41] transition-colors">Recursos</a>
            <a href="#about" className="text-sm font-bold text-slate-600 hover:text-[#001A41] transition-colors">Acerca de Acuaequipos</a>
            <button 
              onClick={() => {
                document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('escalate-request'));
              }}
              className="bg-white border border-slate-200 text-[#001A41] px-6 py-3 rounded-full text-sm font-black hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <MessageSquare size={16} /> Hablar con asesor
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-12 px-6 bg-gradient-to-b from-blue-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                Cápsula Especializada
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-[#001A41] leading-[1.1] tracking-tighter text-balance">
                {capsule.title}
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
                {capsule.description}
              </p>
              <div className="flex flex-wrap gap-8 items-center">
                <button 
                  onClick={() => {
                    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
                    window.dispatchEvent(new CustomEvent('escalate-request'));
                  }}
                  className="bg-[#001A41] hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-[1.02] shadow-xl shadow-blue-900/10 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageSquare size={18} className="text-white" />
                  </div>
                  Hablar con {capsule.promptConfig?.agentName || capsule.agent?.name || 'Asesor'}
                </button>
                <button className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all group">
                  Ver cómo funciona <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Mini Feature Grid - Styled as a single floating card */}
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-50 grid grid-cols-3 gap-8 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Database size={22} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[13px] font-black text-slate-900 leading-tight">Raciones precisas</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">kg/ha y frecuencia</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-l border-slate-100 pl-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Thermometer size={22} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[13px] font-black text-slate-900 leading-tight">Ajuste por temp.</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">y metabolismo</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-l border-slate-100 pl-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Eye size={22} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[13px] font-black text-slate-900 leading-tight">Monitoreo saciedad</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">y estrés</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="/shrimp_hero.png"
                  alt="Cultivo de camarón de precisión"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -left-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-50 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Mejora tu FCA</span>
                </div>
                <div className="text-5xl font-black text-blue-600 leading-none mb-2">-12%</div>
                <p className="text-[10px] text-slate-500 leading-tight font-medium">Reducción promedio en nuestros clientes</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Deep Explanation Block */}
      {capsule.contentBlocks?.find((b: any) => b.type === 'deep_explanation') && (
        <DeepExplanationBlock data={capsule.contentBlocks.find((b: any) => b.type === 'deep_explanation').data} />
      )}

      {/* Dynamic Technical Section (Species Cards) */}
      {capsule.contentBlocks?.find((b: any) => b.type === 'technical_specs') && (
        <section id="specs" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-[#001A41]">Optimización por Especie</h2>
              <p className="text-slate-500 font-medium">Conoce los beneficios específicos de nuestras microalgas funcionales.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {capsule.contentBlocks.find((b: any) => b.type === 'technical_specs').items.map((item: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-50 space-y-6"
                >
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Fish size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-[#001A41]">{item.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {item.details}
                    </p>
                  </div>
                  <button className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    Saber más <ArrowRight size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chat Section */}
      <section id="chat" className="py-12 px-6 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <CapsuleChat
            slug={capsule.slug}
            agentName={capsule.promptConfig?.agentName || capsule.agent?.name || 'Don Juan Camarón'}
            agentGreeting={capsule.promptConfig?.agentGreeting}
            agentPortrait="/don_juan_final.jpg"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-black text-[#001A41]">¿Qué puedes lograr con esta cápsula?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Reduce costos de alimentación", desc: "Alimenta lo justo, evita sobrealimentación y desperdicio." },
              { icon: TrendingUp, title: "Mejora el crecimiento", desc: "Raciones balanceadas para mayor ganancia de peso." },
              { icon: BarChart3, title: "Optimiza el FCA", desc: "Maximiza la eficiencia y rentabilidad de tu cultivo." },
              { icon: Database, title: "Decisiones basadas en datos", desc: "Recomendaciones técnicas personalizadas para tu cultivo." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <item.icon size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#001A41]">{item.title}</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section id="about" className="py-32 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h2 className="text-5xl font-black text-[#001A41] leading-tight">
                ¿Quieres optimizar tu producción?
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Déjanos tus datos y un asesor se pondrá en contacto contigo para ayudarte a mejorar tus resultados.
              </p>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: Shield, text: "Asesoría personalizada" },
                  { icon: Clock, text: "Respuestas en 24 horas" },
                  { icon: CheckCircle2, text: "Sin compromiso" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <item.icon className="text-blue-600" size={24} />
                    <span className="font-bold text-[#001A41]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 blur-[100px] opacity-20 -z-10" />
              {!leadCaptured ? (
                <LeadForm capsuleId={capsule.id} onSuccess={() => setLeadCaptured(true)} />
              ) : (
                <div className="bg-green-50 p-16 rounded-[3rem] border border-green-100 text-center">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-[#001A41] mb-4">¡Solicitud Enviada!</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Un experto revisará tu caso y te contactará en breve.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3 grayscale opacity-70">
              <Zap size={24} className="text-slate-900" />
              <span className="font-black text-xl tracking-tight">Acuaequipos</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              © 2024 Acuaequipos. Todos los derechos reservados.
            </p>
            <div className="flex gap-10">
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6 fill-currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-red-600 transition-colors">
                <svg className="w-6 h-6 fill-currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-800 transition-colors">
                <svg className="w-6 h-6 fill-currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const MessageSquare = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
