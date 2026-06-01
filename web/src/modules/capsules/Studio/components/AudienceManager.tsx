import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { AudienceEditor } from './AudienceEditor';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';

export const AudienceManager: React.FC = () => {
  const [audiences, setAudiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAudience, setSelectedAudience] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAudienceName, setNewAudienceName] = useState('');
  const [newAudienceDesc, setNewAudienceDesc] = useState('');

  const fetchAudiences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${apiUrl}/api/capsule-studio/audiences`, { headers });
      setAudiences(response.data);
    } catch (err) {
      console.error('Error fetching audiences', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
  }, []);

  const handleCreate = async () => {
    if (!newAudienceName) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${apiUrl}/api/capsule-studio/audiences`, {
        name: newAudienceName,
        description: newAudienceDesc
      }, { headers });
      
      setIsCreating(false);
      setNewAudienceName('');
      setNewAudienceDesc('');
      fetchAudiences();
    } catch (err) {
      console.error('Error creating audience', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta lista? Se eliminarán todos sus contactos.')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiUrl}/api/capsule-studio/audiences/${id}`, { headers });
      fetchAudiences();
    } catch (err) {
      console.error('Error deleting audience', err);
    }
  };

  if (selectedAudience) {
    return (
      <AudienceEditor 
        audience={selectedAudience} 
        onBack={() => {
          setSelectedAudience(null);
          fetchAudiences();
        }} 
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Listas de Correos (Audiencias)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona tus contactos e impórtalos desde Excel o Google Sheets</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Lista
        </button>
      </div>

      {isCreating && (
        <div className="p-6 border-b border-slate-100 bg-blue-50/50">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Nombre de la lista (ej. Clientes VIP)"
              value={newAudienceName}
              onChange={(e) => setNewAudienceName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Descripción (Opcional)"
              value={newAudienceDesc}
              onChange={(e) => setNewAudienceDesc(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreate}
              disabled={!newAudienceName}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Cargando listas...</div>
        ) : audiences.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No tienes listas creadas</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">Crea tu primera lista para organizar tus prospectos e importar contactos fácilmente desde hojas de cálculo.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 transition"
            >
              Crear Primera Lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audiences.map(aud => (
              <div key={aud.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group bg-white relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{aud.name}</h3>
                    <p className="text-slate-500 text-sm h-10 overflow-hidden">{aud.description || 'Sin descripción'}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
                    {aud._count?.members || 0}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleDelete(aud.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar Lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedAudience(aud)}
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition group-hover:translate-x-1"
                  >
                    Gestionar Contactos
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
