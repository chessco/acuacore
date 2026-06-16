import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTenant } from '../../contexts/TenantContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3014';

export function useWorkspaceDocuments() {
  const queryClient = useQueryClient();
  const { selectedTenant } = useTenant();
  const tenantId = selectedTenant?.id;

  const headers = {
    'x-tenant-id': tenantId || '',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  const { data: documents, isLoading } = useQuery({
    queryKey: ['workspace-documents', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const res = await axios.get(`${API_URL}/api/workspace/documents`, { headers });
      return res.data;
    },
    enabled: !!tenantId,
  });

  const uploadDocument = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(`${API_URL}/api/workspace/documents`, formData, { 
        headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace-documents', tenantId] }),
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/api/workspace/documents/${id}`, { headers });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace-documents', tenantId] }),
  });

  return { documents, isLoading, uploadDocument, deleteDocument };
}
