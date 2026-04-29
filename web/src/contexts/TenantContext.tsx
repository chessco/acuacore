import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  avatar?: string;
}

interface TenantContextType {
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant) => void;
  tenants: Tenant[];
  flowUrl: string;
  setFlowUrl: (url: string) => void;
  flowTenantSlug: string;
  setFlowTenantSlug: (slug: string) => void;
  flowToken: string | null;
  setFlowToken: (token: string | null) => void;
  flowApiKey: string;
  setFlowApiKey: (key: string) => void;
}

const tenants: Tenant[] = [
  { id: 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718', name: 'Acuaequipos', plan: 'Enterprise' },
  { id: '2', name: 'AquaFresh S.A.', plan: 'Scale' },
  { id: '3', name: 'BlueTuna Tech', plan: 'Starter' },
  { id: '4', name: 'GreenLake Ops', plan: 'Enterprise' },
];

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenant, setSelectedTenantState] = useState<Tenant | null>(() => {
    const saved = localStorage.getItem('selectedTenant');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return tenants[0];
      }
    }
    return tenants[0];
  });

  const [flowUrl, setFlowUrlState] = useState<string>(() => {
    return localStorage.getItem('flowUrl') || 'https://flow.pitayacode.io';
  });

  const [flowTenantSlug, setFlowTenantSlugState] = useState<string>(() => {
    return localStorage.getItem('flowTenantSlug') || 'pitaya';
  });

  const [flowToken, setFlowTokenState] = useState<string | null>(() => {
    return localStorage.getItem('flowToken');
  });

  const [flowApiKey, setFlowApiKeyState] = useState<string>(() => {
    return localStorage.getItem('flowApiKey') || '';
  });

  const setSelectedTenant = (tenant: Tenant) => {
    setSelectedTenantState(tenant);
    localStorage.setItem('selectedTenant', JSON.stringify(tenant));
  };

  const setFlowUrl = (url: string) => {
    setFlowUrlState(url);
    localStorage.setItem('flowUrl', url);
  };

  const setFlowTenantSlug = (slug: string) => {
    setFlowTenantSlugState(slug);
    localStorage.setItem('flowTenantSlug', slug);
  };

  const setFlowToken = (token: string | null) => {
    setFlowTokenState(token);
    if (token) localStorage.setItem('flowToken', token);
    else localStorage.removeItem('flowToken');
  };

  const setFlowApiKey = (key: string) => {
    setFlowApiKeyState(key);
    localStorage.setItem('flowApiKey', key);
  };

  return (
    <TenantContext.Provider value={{ 
      selectedTenant, 
      setSelectedTenant, 
      tenants, 
      flowUrl, 
      setFlowUrl,
      flowTenantSlug,
      setFlowTenantSlug,
      flowToken,
      setFlowToken,
      flowApiKey,
      setFlowApiKey
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
