import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SystemDashboard } from './components/dashboards/SystemDashboard'
import { OperationalDashboard } from './components/dashboards/OperationalDashboard'
import { Login } from './components/dashboards/Login'
import { useTenant } from './contexts/TenantContext'
import { useTranslation } from 'react-i18next'
import { CapsuleLanding } from './modules/capsules/CapsuleLanding'
import { CapsuleCatalog } from './modules/capsules/CapsuleCatalog'
import { CapsuleStudioLayout } from './modules/capsules/Studio/CapsuleStudioLayout'
import { CapsuleList } from './modules/capsules/Studio/CapsuleList'
import { CampaignManager } from './modules/capsules/Studio/CampaignManager'
import { CapsuleEditor } from './modules/capsules/Studio/CapsuleEditor'

function AppContent() {
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
  

  const handleLogin = (email: string) => {
    let userRole: 'system' | 'tenant' | 'operator' = 'tenant';
    if (email.includes('system')) userRole = 'system';
    if (email.includes('operador')) userRole = 'operator';

    setIsAuthenticated(true);
    setRole(userRole);
    localStorage.setItem('acuacore_auth', 'true');
    localStorage.setItem('acuacore_role', userRole);
    localStorage.setItem('acuacore_user_email', email);
  };


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/capsules/:slug" element={<CapsuleLanding />} />
      <Route path="/capsules" element={<CapsuleCatalog />} />
      
      {/* Auth Routes */}
      <Route 
        path="/" 
        element={
          !isAuthenticated ? (
            <Login onLogin={handleLogin} />
          ) : (
            role === 'system' ? <SystemDashboard /> : <OperationalDashboard />
          )
        } 
      />

      {/* Capsule Studio */}
      <Route path="/app/capsules" element={isAuthenticated ? <CapsuleStudioLayout /> : <Navigate to="/" />}>
        <Route index element={<CapsuleList />} />
        <Route path="campaigns" element={<CampaignManager />} />
        <Route path="leads" element={<div className="p-8 text-slate-500 font-medium">Lead Management (Coming Soon)</div>} />
        <Route path="analytics" element={<div className="p-8 text-slate-500 font-medium">Analytics Dashboard (Coming Soon)</div>} />
      </Route>

      <Route path="/app/capsules/edit/:id" element={isAuthenticated ? <CapsuleEditor /> : <Navigate to="/" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

