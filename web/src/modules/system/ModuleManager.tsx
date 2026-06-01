import { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Info, 
  Settings,
  ShieldCheck,
  Zap,
  Layout,
  RefreshCw,
  Save,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { AVAILABLE_MODULES } from '../modules.config';
import { useTenant } from '../../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

export function ModuleManager() {
  const { selectedTenant, tenants, setPermissions } = useTenant();
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sincronizar con los permisos actuales del tenant seleccionado
  useEffect(() => {
    if (selectedTenant) {
      // En una implementación real, esto vendría de la DB del tenant
      // Por ahora, simulamos leyendo del estado global
      const userPermissions = localStorage.getItem('user_permissions');
      if (userPermissions) {
        try {
          const parsed = JSON.parse(userPermissions);
          setActiveModules(parsed.menus || []);
        } catch (e) {
          console.error("Error parsing permissions", e);
        }
      }
    }
  }, [selectedTenant]);

  const handleToggleModule = (moduleId: string) => {
    setActiveModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const getModuleFeatures = (id: string) => {
    const features: Record<string, string[]> = {
      'conversations': ['Chat Multicanal', 'Copiloto de IA', 'Transcripción Automática', 'Gestión de Etiquetas'],
      'agents': ['Personas Personalizadas', 'Ajuste de Temperatura', 'Instrucciones de Sistema', 'Memoria a Largo Plazo'],
      'kb': ['Carga de PDF/Texto', 'Indexación Vectorial', 'Búsqueda Semántica', 'Actualización en Tiempo Real'],
      'analytics': ['Métricas de Conversión', 'Tasa de Automatización', 'Reportes de Ahorro', 'Exportación a PDF/CSV'],
      'predictive': ['Análisis de Sentimiento', 'Predicción de Churn', 'Lead Scoring por IA', 'Detección de Anomalías'],
      'donjuan': ['Chat Interactivo', 'Selector de Agentes', 'Historial por Usuario', 'Consultas Internas'],
      'module_manager': ['Control de Costos', 'Activación por Tenant', 'Gestión de Licencias', 'Auditoría de Uso'],
      'catalog': ['Gestión de SKU', 'Control de Precios', 'Categorización Dinámica', 'Análisis de Inventario'],
      'orders': ['Facturación PDF', 'Seguimiento en Tiempo Real', 'Historial de Ventas', 'Notificaciones Automáticas'],
      'profitability': ['Margen de Utilidad Real', 'Cálculo de Costos', 'ROI por Producto', 'Reportes Ejecutivos']
    };
    return features[id] || ['Panel de Administración', 'Acceso Seguro', 'Integración Nativa'];
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      const token = localStorage.getItem('token');
      
      const newPermissions = { menus: activeModules, actions: [] };
      
      await axios.post(`${apiUrl}/api/tenants/${selectedTenant?.id}/features`, {
        features: activeModules
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPermissions(newPermissions);
      localStorage.setItem('user_permissions', JSON.stringify(newPermissions));
      
      alert('Configuración de módulos actualizada con éxito.');
    } catch (err) {
      console.error('Error saving modules:', err);
      const newPerms = { menus: activeModules, actions: [] };
      setPermissions(newPerms);
      localStorage.setItem('user_permissions', JSON.stringify(newPerms));
      alert('Configuración aplicada localmente (Modo Demo).');
    } finally {
      setSaving(false);
    }
  };

  const filteredModules = AVAILABLE_MODULES.filter(m => 
    m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-surface min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
        <span>Sistema Maestro</span>
        <ChevronRight size={10} />
        <span className="text-brand-blue">Gestor de Módulos</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black font-display text-slate-800 tracking-tight">Marketplace de Módulos</h2>
          <p className="text-sm text-slate-500 mt-2">
            Configura las capacidades operativas para: <span className="font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded-lg">{selectedTenant?.name}</span>
          </p>
        </div>
        <button 
          onClick={handleSaveConfiguration}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white font-black rounded-2xl shadow-xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Publicar Cambios
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Module List */}
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-8 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar módulos, capacidades o herramientas..." 
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[28px] shadow-sm focus:outline-none focus:ring-8 focus:ring-brand-blue/5 focus:border-brand-blue transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {filteredModules.map((module) => {
              const isActive = activeModules.includes(module.id);
              const moduleFeatures = getModuleFeatures(module.id);
              
              return (
                <motion.div 
                  key={module.id}
                  layout
                  whileHover={{ y: -6 }}
                  onClick={() => handleToggleModule(module.id)}
                  className={`p-8 rounded-[40px] border-2 transition-all cursor-pointer relative overflow-hidden group flex flex-col h-full ${
                    isActive 
                      ? 'bg-white border-brand-blue shadow-2xl shadow-brand-blue/10' 
                      : 'bg-slate-50 border-transparent opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className={`p-4 rounded-2xl ${isActive ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-slate-200 text-slate-400'}`}>
                      <module.icon size={28} />
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-300 text-white'}`}>
                      {isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                  </div>

                  <div className="relative z-10 flex-1">
                    <h4 className="font-black text-2xl text-slate-800 mb-2 group-hover:text-brand-blue transition-colors">
                      {module.label}
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                      {module.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incluye:</p>
                      <div className="flex flex-wrap gap-2">
                        {moduleFeatures.map((feat, i) => (
                          <span key={i} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                            <Zap size={10} className={isActive ? 'text-brand-blue' : 'text-slate-400'} />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      module.category === 'operativo' ? 'bg-blue-50 text-blue-500' :
                      module.category === 'gestion' ? 'bg-amber-50 text-amber-500' :
                      'bg-purple-50 text-purple-500'
                    }`}>
                      {module.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-blue transition-colors">
                      {isActive ? 'Módulo Activo' : 'Haz clic para activar'}
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <module.icon size={180} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary & Legend */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="dashboard-card p-8 bg-brand-deep text-white rounded-[32px] shadow-2xl shadow-brand-deep/20">
            <h4 className="text-xl font-black font-display mb-6">Resumen del Plan</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-xs text-slate-400">Inquilino</span>
                <span className="font-bold">{selectedTenant?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-xs text-slate-400">Módulos Activos</span>
                <span className="font-bold text-brand-blue">{activeModules.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Costo Estimado</span>
                <span className="font-bold text-emerald-400">${activeModules.length * 49}/mes</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex gap-3">
                <Info size={16} className="text-brand-blue shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Los cambios se aplicarán instantáneamente para todos los usuarios de este inquilino en su próxima recarga.
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-8 bg-white border border-slate-100 rounded-[32px]">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
              <Settings size={14} className="text-brand-blue" />
              Tipos de Módulos
            </h4>
            <div className="space-y-4">
              <LegendItem color="bg-blue-500" title="Operativo" desc="Flujos críticos de trabajo diario." />
              <LegendItem color="bg-amber-500" title="Gestión" desc="Herramientas de control y métricas." />
              <LegendItem color="bg-purple-500" title="Inteligencia" desc="Funcionalidades avanzadas de IA." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, title, desc }: any) {
  return (
    <div className="flex gap-3">
      <div className={`w-1.5 h-auto rounded-full ${color}`} />
      <div>
        <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{title}</p>
        <p className="text-[10px] text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
