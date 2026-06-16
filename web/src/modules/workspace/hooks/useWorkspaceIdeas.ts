import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTenant } from '../../contexts/TenantContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3014';

export function useWorkspaceIdeas() {
  const queryClient = useQueryClient();
  const { selectedTenant } = useTenant();
  const tenantId = selectedTenant?.id;

  const headers = {
    'x-tenant-id': tenantId || '',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['workspace-ideas', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const res = await axios.get(`${API_URL}/api/workspace/ideas`, { headers });
      return res.data;
    },
    enabled: !!tenantId,
  });

  const createIdea = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post(`${API_URL}/api/workspace/ideas`, data, { headers });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace-ideas', tenantId] }),
  });

  const updateIdea = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await axios.patch(`${API_URL}/api/workspace/ideas/${id}`, data, { headers });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace-ideas', tenantId] }),
  });

  const deleteIdea = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/api/workspace/ideas/${id}`, { headers });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace-ideas', tenantId] }),
  });

  return { ideas, isLoading, createIdea, updateIdea, deleteIdea };
}
