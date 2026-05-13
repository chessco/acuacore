import { useState, useEffect } from 'react'
import { Layout, Globe, Copy, ExternalLink, Save, Loader2, Sparkles } from 'lucide-react'
import { useTenant } from '../../../contexts/TenantContext'
import axios from 'axios'

export function StorefrontConfig() {
  const { selectedTenant } = useTenant()
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedTenant?.slug) setSlug(selectedTenant.slug)
  }, [selectedTenant])

  const handleSave = async () => {
    setSaving(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      await axios.patch(`${apiUrl}/api/tenants/${selectedTenant?.id}`, { slug }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Configuración de tienda guardada')
    } catch (err) {
      console.error('Error saving storefront config:', err)
    } finally {
      setSaving(false)
    }
  }

  const storeUrl = `${window.location.origin}/store/${slug || 'mi-tienda'}`

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Configuración de Tienda</h2>
        <p className="text-sm text-slate-500 mt-1">Personaliza tu URL pública y presencia comercial.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="dashboard-card p-8 bg-white border-2 border-emerald-100 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">URL Personalizada</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identidad Digital</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Slug de la Tienda</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">/store/</span>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="ej-mi-tienda"
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Tu tienda estará en:</p>
              <div className="flex items-center justify-between gap-4">
                <code className="text-xs font-mono opacity-80 truncate">{storeUrl}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(storeUrl)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Guardar Cambios
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-card p-8 bg-gradient-to-br from-white to-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-emerald-500" />
              <h4 className="font-bold text-slate-800">Vista Previa Live</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Cada cambio que hagas en tu catálogo se reflejará instantáneamente en tu URL pública sin necesidad de desplegar código.
            </p>
            <a 
              href={storeUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-white border border-emerald-200 rounded-2xl text-emerald-600 font-bold text-sm hover:shadow-md transition-all"
            >
              Visitar Tienda
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
