import { useState, useEffect } from 'react'
import { CreditCard, ShieldCheck, Save, Loader2, Key } from 'lucide-react'
import { useTenant } from '../../../contexts/TenantContext'
import axios from 'axios'

export function PaymentsConfig() {
  const { selectedTenant } = useTenant()
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedTenant?.stripeApiKey) setApiKey(selectedTenant.stripeApiKey)
  }, [selectedTenant])

  const handleSave = async () => {
    setSaving(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      await axios.patch(`${apiUrl}/api/tenants/${selectedTenant?.id}`, { stripeApiKey: apiKey }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Configuración de pagos actualizada')
    } catch (err) {
      console.error('Error saving payments config:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pasarela de Pagos</h2>
        <p className="text-sm text-slate-500 mt-1">Configura cómo recibirás el dinero de tus ventas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="dashboard-card p-8 bg-white border-2 border-blue-100 shadow-xl shadow-blue-500/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Stripe Connect</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procesamiento de Pagos</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stripe API Key (Secret)</label>
              <div className="relative">
                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk_test_..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-2 italic">Tus llaves se guardan de forma encriptada y solo se usan para procesar cobros de tu tienda.</p>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Vincular Cuenta
            </button>
          </div>
        </div>

        <div className="dashboard-card p-8 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-blue-500" />
            <h4 className="font-bold text-slate-800">Seguridad de Grado Bancario</h4>
          </div>
          <ul className="space-y-4">
            {[
              'Cumplimiento con PCI-DSS Nivel 1',
              'Soporte para 3D Secure 2.0',
              'Detección de fraude con Radar IA',
              'Depósitos automáticos cada 24h'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
