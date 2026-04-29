import { useState, useEffect } from 'react'
import { SystemDashboard } from './components/dashboards/SystemDashboard'
import { OperationalDashboard } from './components/dashboards/OperationalDashboard'
import { Login } from './components/dashboards/Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('acuacore_auth') === 'true';
  });
  
  const [role, setRole] = useState<'system' | 'tenant'>(() => {
    return (localStorage.getItem('acuacore_role') as 'system' | 'tenant') || 'tenant';
  });

  const handleLogin = (email: string) => {
    const userRole = email.includes('system') ? 'system' : 'tenant';
    setIsAuthenticated(true);
    setRole(userRole);
    localStorage.setItem('acuacore_auth', 'true');
    localStorage.setItem('acuacore_role', userRole);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('acuacore_auth');
    localStorage.removeItem('acuacore_role');
    localStorage.clear();
    window.location.reload();
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      {/* Role Switcher (Temporary for development) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1 p-1 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-xl shadow-slate-200/50">
        <button 
          onClick={() => {
            setRole('tenant');
            localStorage.setItem('acuacore_role', 'tenant');
          }}
          className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${role === 'tenant' ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30' : 'text-slate-400 hover:text-slate-600'}`}
        >
          OPERATIONAL
        </button>
        <button 
          onClick={() => {
            setRole('system');
            localStorage.setItem('acuacore_role', 'system');
          }}
          className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${role === 'system' ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30' : 'text-slate-400 hover:text-slate-600'}`}
        >
          SYSTEM
        </button>
      </div>

      {role === 'system' ? <SystemDashboard /> : <OperationalDashboard />}
    </>
  )
}

export default App
