import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, UserPlus, Save, Trash2, CheckCircle, AlertTriangle, FileSpreadsheet, Users } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';

interface AudienceEditorProps {
  audience: any;
  onBack: () => void;
}

export const AudienceEditor: React.FC<AudienceEditorProps> = ({ audience, onBack }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // New manual member state
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${apiUrl}/api/capsule-studio/audiences/${audience.id}/members`, { headers });
      setMembers(response.data);
    } catch (err) {
      console.error('Error fetching members', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleImport = async () => {
    if (!importText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${apiUrl}/api/capsule-studio/audiences/${audience.id}/members/import`, {
        data: importText
      }, { headers });
      
      setImportResult(response.data);
      if (response.data.success) {
        setImportText('');
        fetchMembers();
      }
    } catch (err) {
      console.error('Error importing members', err);
      setImportResult({ success: false, errors: ['Error de conexión'] });
    }
  };

  const handleManualAdd = async () => {
    if (!newEmail) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${apiUrl}/api/capsule-studio/audiences/${audience.id}/members`, {
        email: newEmail,
        firstName: newName,
        phone: newPhone
      }, { headers });
      
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      setShowManualAdd(false);
      fetchMembers();
    } catch (err) {
      console.error('Error adding member', err);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('¿Eliminar este contacto?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiUrl}/api/capsule-studio/audiences/${audience.id}/members/${memberId}`, { headers });
      fetchMembers();
    } catch (err) {
      console.error('Error deleting member', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[800px]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{audience.name}</h2>
            <p className="text-slate-500 text-sm">{members.length} Contactos | {audience.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowImport(false); setShowManualAdd(!showManualAdd); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${showManualAdd ? 'bg-slate-200 text-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
          >
            <UserPlus className="w-4 h-4" />
            Agregar Manual
          </button>
          <button
            onClick={() => { setShowManualAdd(false); setShowImport(!showImport); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${showImport ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'}`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importar desde Excel
          </button>
        </div>
      </div>

      {/* Action Panels */}
      {showManualAdd && (
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <h3 className="font-bold text-slate-700 mb-4">Agregar Nuevo Contacto</h3>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Correo Electrónico *"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Nombre Completo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleManualAdd}
              disabled={!newEmail}
              className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-slate-900 transition"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      )}

      {showImport && (
        <div className="p-6 border-b border-slate-100 bg-blue-50/30 flex-shrink-0">
          <div className="mb-4">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Pegar desde Google Sheets o Excel
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Copia las celdas directamente desde tu hoja de cálculo y pégalas aquí. El sistema intentará detectar automáticamente la columna de Correo (y Nombre si existe). Se ignorarán las filas sin correo.
            </p>
          </div>
          
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Pega aquí tus datos..."
            className="w-full h-40 p-4 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm mb-4 bg-white"
          ></textarea>
          
          <div className="flex justify-between items-center">
            <div>
              {importResult && (
                <div className={`text-sm font-bold flex items-center gap-2 ${importResult.success ? 'text-emerald-600' : 'text-red-500'}`}>
                  {importResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {importResult.success ? `¡${importResult.importedCount} contactos importados/actualizados exitosamente!` : 'Hubo un error en la importación'}
                  
                  {importResult.errors?.length > 0 && (
                    <span className="text-amber-600 font-normal ml-4">
                      ({importResult.errors.length} filas ignoradas)
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-blue-700 transition shadow-sm shadow-blue-200"
            >
              Procesar Importación
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 overflow-auto p-0">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Cargando contactos...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Lista Vacía</h3>
            <p className="text-slate-500">Agrega contactos manualmente o impórtalos desde Excel.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0 font-bold shadow-sm">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Metadatos (Columnas Extra)</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{member.email}</td>
                  <td className="px-6 py-4">{member.firstName || '-'}</td>
                  <td className="px-6 py-4">{member.phone || '-'}</td>
                  <td className="px-6 py-4">
                    {member.metadata ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(member.metadata).map(([k, v]: [string, any]) => (
                          <span key={k} className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                            <span className="font-bold opacity-70">{k}:</span> {v}
                          </span>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
