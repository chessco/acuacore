import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  MapPin, 
  Users, 
  Activity, 
  MoreVertical, 
  ChevronRight, 
  ArrowUpRight, 
  Database, 
  Layers, 
  LayoutGrid, 
  BarChart2, 
  Zap,
  Globe,
  Waves
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const tenantsList = [
  { id: 1, name: 'OceanPulse Aquatics', region: 'Vregion, Chile', agents: 5, health: 98, status: 'Active', color: 'bg-blue-600 text-white', icon: Waves },
  { id: 2, name: 'EcoFish Farms', region: 'Antioquia, Colombia', agents: 3, health: 85, status: 'Active', color: 'bg-emerald-600 text-white', icon: Activity },
  { id: 3, name: 'Arctic BioRes', region: 'Troms, Norway', agents: 8, health: 92, status: 'Warning', color: 'bg-indigo-600 text-white', icon: Globe },
  { id: 4, name: 'Global AquaTech', region: 'Veracruz, Mexico', agents: 4, health: 99, status: 'Active', color: 'bg-purple-600 text-white', icon: Building2 },
];

export default function Tenants() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Gestión de Inquilinos</h2>
          <p className="text-base text-slate-500 max-w-2xl mt-2 font-medium italic">Administra el aislamiento de datos y configuración de flujos para cada cliente corporativo.</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-wide">
          <PlusCircle size={20} />
          Registrar Inquilino
        </button>
      </div>

      {/* Grid of Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tenantsList.map((tenant) => (
          <div key={tenant.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col cursor-pointer">
            <div className="p-6 flex-1 space-y-6">
               <div className="flex justify-between items-start">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500", tenant.color)}>
                     <tenant.icon size={24} />
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                     <MoreVertical size={20} />
                  </button>
               </div>
               
               <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display group-hover:text-primary transition-colors leading-tight">{tenant.name}</h3>
                  <p className="text-xs text-slate-500 font-bold tracking-tight flex items-center gap-1 mt-1.5 opacity-80 uppercase tracking-widest">
                    <MapPin size={12} className="text-slate-400" />
                    {tenant.region}
                  </p>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Salud del Nodo</span>
                     <span className={cn(tenant.health > 90 ? "text-emerald-500" : "text-amber-500")}>{tenant.health}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${tenant.health}%` }} className={cn("h-full rounded-full", tenant.health > 90 ? "bg-emerald-500" : "bg-amber-500")} />
                  </div>
               </div>

               <div className="flex items-center gap-6 pt-2">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agentes AI</span>
                     <span className="text-base font-black text-slate-900 font-display">{tenant.agents}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                     <span className={cn("text-xs font-black uppercase tracking-tighter", tenant.status === 'Active' ? "text-emerald-500" : "text-error")}>
                       {tenant.status}
                     </span>
                  </div>
               </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-primary transition-colors transition-duration-300">
               <span className="text-[10px] font-black text-slate-400 group-hover:text-white/60 transition-colors uppercase tracking-widest leading-none">Gestionar Reglas</span>
               <ArrowUpRight size={16} className="text-slate-400 group-hover:text-white group-hover:scale-125 transition-all" />
            </div>
          </div>
        ))}

        {/* Create Card Placeholder */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:border-primary/40 hover:bg-white transition-all cursor-pointer group">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 transition-transform group-hover:scale-110">
            <PlusCircle size={28} className="text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Nuevo Inquilino</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Configuración de multi-tenancy aislada para nuevos contratos.</p>
        </div>
      </div>

      {/* Global Stats Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-950/20">
            <h3 className="text-xl font-bold font-display relative z-10 mb-2">Cuota Global de Almacenamiento</h3>
            <p className="text-blue-300/80 text-sm font-medium relative z-10 italic">Consumo total distribuido entre todos los inquilinos.</p>
            <div className="mt-8 relative z-10">
               <div className="flex justify-between items-end mb-3">
                  <span className="text-4xl font-black font-display tracking-tight">4.2 <span className="text-lg opacity-40 font-black tracking-normal">TB</span></span>
                  <span className="text-xs font-bold text-blue-400">72% de capacidad</span>
               </div>
               <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(31,110,239,0.8)]" />
               </div>
            </div>
            <LayoutGrid className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-0" />
         </div>

         <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-slate-900 font-display">Distribución de Recursos</h3>
               <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Ver reporte completo</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
               <ResourceStat icon={<Database className="text-blue-500" />} label="Bases de Datos" value="12" sub="3.1k peticiones/min" />
               <ResourceStat icon={<Layers className="text-indigo-500" />} label="Nodos de Cálculo" value="5" sub="85% CPU Avg" />
               <ResourceStat icon={<Zap className="text-amber-500" />} label="Tokens IA (Mes)" value="1.2M" sub="+14% vs anterior" />
            </div>
         </div>
      </div>
    </div>
  );
}

function ResourceStat({ icon, label, value, sub }: any) {
  return (
    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:border-primary/10 group cursor-default">
       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <h4 className="text-2xl font-black text-slate-900 font-display mt-1">{value}</h4>
       <p className="text-[10px] text-slate-500 mt-1.5 font-bold italic opacity-80">{sub}</p>
    </div>
  );
}
