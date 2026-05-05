import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Mail, Users, BarChart3, Settings, Zap, ArrowLeft } from 'lucide-react';

export const CapsuleStudioLayout: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutGrid, label: 'Cápsulas', path: '/app/capsules' },
    { icon: Mail, label: 'Campañas', path: '/app/capsules/campaigns' },
    { icon: Users, label: 'Leads', path: '/app/capsules/leads' },
    { icon: BarChart3, label: 'Analytics', path: '/app/capsules/analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-8 flex items-center gap-3 border-b border-slate-50">
          <div className="w-10 h-10 bg-[#001A41] rounded-xl flex items-center justify-center text-white">
            <Zap size={22} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-[#001A41]">Studio</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Motor de Crecimiento</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <Link to="/app" className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
            <ArrowLeft size={20} />
            Volver a Acuacore
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
