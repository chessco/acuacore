import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Fish, TrendingUp, BarChart3, Database } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export const CapsuleCatalog: React.FC = () => {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3014') + '/api/capsules');
        setCapsules(res.data);
      } catch (err) {
        console.error('Error fetching capsules:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCapsules();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 font-medium">Cargando catálogo...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] selection:bg-blue-100 text-slate-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#001A41]">Acuaequipos</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Catálogo de Cápsulas</span>
            </div>
          </div>
          <Link to="/" className="text-sm font-bold text-slate-600 hover:text-[#001A41]">Volver al inicio</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-[0.2em]">
            Experiencias Interactivas
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#001A41] tracking-tighter">
            Nuestras Cápsulas de Conocimiento
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl font-medium">
            Explora nuestra biblioteca de inteligencia técnica diseñada para optimizar tu producción acuícola.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {capsules.map((capsule) => (
            <motion.div
              key={capsule.id}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col h-full"
            >
              <div className="h-48 bg-slate-100 relative">
                <img 
                  src={capsule.coverImage || "/shrimp_hero.png"} 
                  alt={capsule.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 right-6">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                    <Zap size={20} fill="currentColor" />
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-[#001A41] leading-tight">
                    {capsule.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 font-medium">
                    {capsule.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Eficiencia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Técnico</span>
                  </div>
                </div>

                <Link 
                  to={`/capsules/${capsule.slug}`}
                  className="mt-auto pt-6 w-full flex items-center justify-center gap-3 bg-[#001A41] hover:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                >
                  Abrir Cápsula <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {capsules.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No hay cápsulas públicas disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

