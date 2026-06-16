import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTenant } from '../../contexts/TenantContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3014';

export function useWorkspaceSearch(query: string) {
  const { selectedTenant } = useTenant();
  const tenantId = selectedTenant?.id;

  const headers = {
    'x-tenant-id': tenantId || '',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['workspace-search', tenantId, query],
    queryFn: async () => {
      if (!tenantId || !query) return { notes: [], documents: [], ideas: [] };
      const res = await axios.get(`${API_URL}/api/workspace/search`, { 
        headers,
        params: { q: query }
      });
      return res.data;
    },
    enabled: !!tenantId && query.length > 2,
  });

  return { results, isLoading };
}
