import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SystemSettingsPanel: React.FC = () => {
  const { t } = useTranslation();
  const [mailProvider, setMailProvider] = useState<'gmail' | 'resend'>('gmail');
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFromEmail, setResendFromEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || '';

      const [providerRes, apiKeyRes, fromEmailRes] = await Promise.all([
        axios.get(`${apiUrl}/api/system-settings/MAIL_PROVIDER`, { headers }).catch(() => ({ data: null })),
        axios.get(`${apiUrl}/api/system-settings/RESEND_API_KEY`, { headers }).catch(() => ({ data: null })),
        axios.get(`${apiUrl}/api/system-settings/RESEND_FROM_EMAIL`, { headers }).catch(() => ({ data: null }))
      ]);

      if (providerRes.data && providerRes.data.value) {
        setMailProvider(providerRes.data.value);
      }
      if (apiKeyRes.data && apiKeyRes.data.value) {
        setResendApiKey(apiKeyRes.data.value);
      }
      if (fromEmailRes.data && fromEmailRes.data.value) {
        setResendFromEmail(fromEmailRes.data.value);
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || '';

      await Promise.all([
        axios.patch(`${apiUrl}/api/system-settings/MAIL_PROVIDER`, { value: mailProvider }, { headers }),
        axios.patch(`${apiUrl}/api/system-settings/RESEND_API_KEY`, { value: resendApiKey }, { headers }),
        axios.patch(`${apiUrl}/api/system-settings/RESEND_FROM_EMAIL`, { value: resendFromEmail }, { headers })
      ]);
      setMessage({ text: 'Configuración guardada exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error saving system settings:', error);
      setMessage({ text: 'Error al guardar la configuración', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg">
          <Settings className="w-5 h-5 text-slate-700" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Configuración Global del Sistema</h2>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {message && (
              <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Proveedor de Correo (Campañas)
              </h3>
              <p className="text-sm text-slate-500">
                Selecciona el servicio que enviará los correos de las campañas. Asegúrate de que las credenciales en el servidor estén configuradas.
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="mailProvider" 
                    value="gmail" 
                    checked={mailProvider === 'gmail'}
                    onChange={() => setMailProvider('gmail')}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Gmail</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="mailProvider" 
                    value="resend" 
                    checked={mailProvider === 'resend'}
                    onChange={() => setMailProvider('resend')}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Resend</span>
                </label>
              </div>

              {mailProvider === 'resend' && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resend API Key</label>
                    <input 
                      type="password" 
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_..."
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correo Remitente (From)</label>
                    <input 
                      type="email" 
                      value={resendFromEmail}
                      onChange={(e) => setResendFromEmail(e.target.value)}
                      placeholder="ejemplo@tudominio.com"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
