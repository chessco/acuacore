import { useState, useEffect } from 'react'
import { SystemDashboard } from './components/dashboards/SystemDashboard'
import { OperationalDashboard } from './components/dashboards/OperationalDashboard'
import { Login } from './components/dashboards/Login'
import { useTenant } from './contexts/TenantContext'
import { useTranslation } from 'react-i18next'

function App() {
  const { selectedTenant, tenantLanguages } = useTenant();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (selectedTenant && tenantLanguages[selectedTenant.id]) {
      i18n.changeLanguage(tenantLanguages[selectedTenant.id]);
    }
  }, [selectedTenant, tenantLanguages, i18n]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('acuacore_auth') === 'true';
  });
  
  const [role, setRole] = useState<'system' | 'tenant' | 'operator'>(() => {
    return (localStorage.getItem('acuacore_role') as any) || 'tenant';
  });
  
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('acuacore_user_email');
  });

  const handleLogin = (email: string) => {
    let userRole: 'system' | 'tenant' | 'operator' = 'tenant';
    if (email.includes('system')) userRole = 'system';
    if (email.includes('operador')) userRole = 'operator';

    setIsAuthenticated(true);
    setRole(userRole);
    setUserEmail(email);
    localStorage.setItem('acuacore_auth', 'true');
    localStorage.setItem('acuacore_role', userRole);
    localStorage.setItem('acuacore_user_email', email);
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


      {role === 'system' ? <SystemDashboard /> : <OperationalDashboard />}
    </>
  )
}

export default App
