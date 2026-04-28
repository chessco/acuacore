import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Zap, 
  Clock, 
  Users, 
  MessageSquare, 
  AlertCircle,
  Calendar,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const performanceData = [
  { time: '00:00', value: 45, latency: 420 },
  { time: '04:00', value: 30, latency: 380 },
  { time: '08:00', value: 75, latency: 510 },
  { time: '12:00', value: 95, latency: 680 },
  { time: '16:00', value: 85, latency: 550 },
  { time: '20:00', value: 65, latency: 450 },
  { time: '23:59', value: 50, latency: 410 },
];

const distributionData = [
  { name: 'Automatizado', value: 75, color: '#0055c7' },
  { name: 'HITL Manual', value: 15, color: '#785900' },
  { name: 'Fallido', value: 5, color: '#ba1a1a' },
  { name: 'Pendiente', value: 5, color: '#94a3b8' },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Analíticas de Inteligencia</h2>
          <p className="text-base text-slate-500 mt-1 font-medium">Monitoreo en tiempo real del rendimiento de agentes y satisfacción del inquilino.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
             <button className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg shadow-md transition-all">Hoy</button>
             <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all">Semana</button>
             <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all">Mes</button>
          </div>
          <button className="p-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-white hover:text-primary transition-all">
            <Calendar size={20} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Download size={18} />
            Reporte PDF
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget icon={<Zap size={18} />} title="Peticiones AI" value="2.4M" trend="+12.5%" trendUp />
        <StatWidget icon={<MessageSquare size={18} />} title="Ahorro Estimado" value="$14.2k" trend="+8.2%" trendUp />
        <StatWidget icon={<Clock size={18} />} title="Tiempo de Respuesta" value="1.2s" trend="-0.4s" trendUp />
        <StatWidget icon={<AlertCircle size={18} />} title="Error Rate" value="0.02%" trend="-0.1%" trendUp />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Performance Graph */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-lg font-bold text-slate-900 font-display">Carga de Sistema y Latencia</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Últimas 24 Horas</p>
              </div>
              <div className="flex items-center gap-6">
                 <LegendItem color="bg-primary" label="Peticiones/min" />
                 <LegendItem color="bg-amber-400" label="Latencia (ms)" />
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0055c7" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0055c7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#0055c7" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    <Line type="monotone" dataKey="latency" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center">
           <div className="w-full mb-8 text-center">
              <h3 className="text-lg font-bold text-slate-900 font-display">Distribución de Respuestas</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Nivel Global</p>
           </div>
           <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-black font-display text-slate-900">75%</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Automático</span>
              </div>
           </div>
           <div className="mt-8 space-y-4 w-full">
              {distributionData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-bold">{item.name}</span>
                   </div>
                   <span className="text-slate-900 font-black">{item.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <StatsBreakdownCard title="Mejores Agentes" data={[{l: 'Monitor Térmico', v: '98.5%'}, {l: 'Opt. Dieta', v: '94.2%'}, {l: 'Analista San.', v: '91.0%'}]} />
         <StatsBreakdownCard title="Principales Inquilinos" data={[{l: 'OceanPulse', v: '1.2M req'}, {l: 'EcoFish', v: '540k req'}, {l: 'ArcticBio', v: '420k req'}]} />
         <StatsBreakdownCard title="Temas de Consulta" data={[{l: 'Soporte Técnico', v: '45%'}, {l: 'Ops. Biológicas', v: '32%'}, {l: 'Logística', v: '23%'}]} />
      </div>
    </div>
  );
}

function StatWidget({ icon, title, value, trend, trendUp }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
       <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-slate-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
             {icon}
          </div>
          <span className={cn(
            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm",
            trendUp ? "bg-emerald-100 text-emerald-700" : "bg-error-container text-error"
          )}>
            {trend}
          </span>
       </div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
       <h4 className="text-2xl font-black text-slate-900 font-display mt-2">{value}</h4>
       <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <BarChart3 size={80} className="rotate-[-12deg]" />
       </div>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
       <div className={cn("w-3 h-3 rounded-md shadow-sm", color)} />
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StatsBreakdownCard({ title, data }: any) {
   return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
         <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">{title}</h3>
         <div className="space-y-4">
            {data.map((item: any, i: number) => (
               <div key={i} className="flex justify-between items-center group">
                  <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{item.l}</span>
                  <span className="text-sm font-black text-slate-900 group-hover:scale-110 transition-transform">{item.v}</span>
               </div>
            ))}
         </div>
         <button className="w-full mt-6 py-2.5 bg-slate-50 text-[10px] font-black text-slate-400 hover:text-primary hover:bg-blue-50 transition-all rounded-xl uppercase tracking-widest">Ver Detalles</button>
      </div>
   );
}
