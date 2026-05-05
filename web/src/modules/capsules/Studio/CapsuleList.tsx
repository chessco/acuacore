import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, LayoutGrid, List as ListIcon, ExternalLink, BarChart3, Mail, Users, Settings } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTenant } from '../../../contexts/TenantContext';

export const CapsuleList: React.FC = () => {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedTenant, flowApiKey } = useTenant();

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const res = await axios.get('http://localhost:3014/api/capsule-studio/capsules', {
          headers: {
            'x-tenant-id': selectedTenant?.id || '',
            'x-api-key': flowApiKey,
          }
        });
        setCapsules(res.data);
      } catch (err) {
        console.error('Error fetching capsules:', err);
      } finally {
        setLoading(false);
      }
    };
    if (selectedTenant) fetchCapsules();
  }, [selectedTenant, flowApiKey]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#001A41]">Capsule Studio</h1>
          <p className="text-slate-500 font-medium">Gestiona tus motores de conversión y campañas de IA.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus size={20} /> Crear Nueva Cápsula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <LayoutGrid size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#001A41]">{capsules.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cápsulas Activas</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#001A41]">124</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leads Generados</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#001A41]">8.4%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa de Conversión</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cápsulas..." 
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button className="p-2.5 text-slate-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
              <Filter size={20} />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white text-blue-600 rounded-xl border border-slate-200 shadow-sm">
              <LayoutGrid size={20} />
            </button>
            <button className="p-2.5 text-slate-400 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
              <ListIcon size={20} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-20 text-center text-slate-400 font-medium">Cargando estudio...</div>
          ) : capsules.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <LayoutGrid size={40} />
              </div>
              <p className="text-slate-500 font-medium">No tienes cápsulas creadas aún.</p>
            </div>
          ) : (
            capsules.map((capsule) => (
              <div key={capsule.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                    {capsule.title.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-[#001A41] flex items-center gap-2">
                      {capsule.title}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter ${capsule.status === 'PUBLISHED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {capsule.status}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><LayoutGrid size={12} /> {capsule.topic}</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> {capsule._count?.leads || 0} leads</span>
                      <span className="flex items-center gap-1.5"><Mail size={12} /> 2 campañas</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    to={`/app/capsules/edit/${capsule.id}`} 
                    className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                  >
                    <Settings size={20} />
                  </Link>
                  <Link 
                    to={`/capsules/${capsule.slug}`} 
                    target="_blank"
                    className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                  >
                    <ExternalLink size={20} />
                  </Link>
                  <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
