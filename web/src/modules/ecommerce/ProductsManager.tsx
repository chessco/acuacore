import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, Package, Tag, DollarSign, Layers, Loader2, Save, X, Eye, Sparkles, History, Globe, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'
import { SECTOR_CONFIGS } from './sectorConfigs'

export function ProductsManager() {
  const { selectedTenant } = useTenant()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(17.5)
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'MXN'>('USD')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [predictions, setPredictions] = useState<any[]>([])
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false)
  const [selectedProductMovements, setSelectedProductMovements] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    currency: 'USD',
    categoryId: '',
    sku: '',
    imageUrl: '',
    isActive: true,
    customFields: {} as any
  })

  const handleAiGeneration = async () => {
    if (!formData.imageUrl) {
      alert('Primero debes añadir una URL de imagen para analizar')
      return
    }

    setIsGenerating(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': selectedTenant?.id || ''
      }

      const res = await axios.post(`${apiUrl}/api/ecommerce/products/generate-description`, {
        imageUrl: formData.imageUrl,
        sector: selectedTenant?.sector || 'retail'
      }, { headers })

      if (res.data) {
        setFormData(prev => ({
          ...prev,
          name: res.data.suggestedName || prev.name,
          description: res.data.description || prev.description,
          // Merge custom fields if any are suggested
          customFields: { ...prev.customFields, ...(res.data.customFields || {}) }
        }))
      }
    } catch (err) {
      console.error('Error generating AI description:', err)
      alert('Error al generar la descripción con IA')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedTenant])

  const fetchData = async () => {
    if (!selectedTenant) return
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': selectedTenant.id 
      }
      const [prodRes, catRes, rateRes, predRes] = await Promise.all([
        axios.get(`${apiUrl}/api/ecommerce/products`, { headers }),
        axios.get(`${apiUrl}/api/ecommerce/categories`, { headers }),
        axios.get(`${apiUrl}/api/ecommerce/exchange-rate`, { headers }),
        axios.get(`${apiUrl}/api/ecommerce/reports/stock-predictions`, { headers })
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
      setExchangeRate(rateRes.data)
      setPredictions(predRes.data)
    } catch (err) {
      console.error('Error fetching ecommerce data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async (productId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': selectedTenant?.id || ''
      }
      const res = await axios.get(`${apiUrl}/api/ecommerce/movements?productId=${productId}`, { headers })
      setSelectedProductMovements(res.data)
      setIsMovementsModalOpen(true)
    } catch (err) {
      console.error('Error fetching movements:', err)
    }
  }

  const handleSave = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': selectedTenant?.id || ''
      }

      if (editingProduct) {
        await axios.patch(`${apiUrl}/api/ecommerce/products/${editingProduct.id}`, formData, { headers })
      } else {
        await axios.post(`${apiUrl}/api/ecommerce/products`, formData, { headers })
      }
      
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      console.error('Error saving product:', err)
      alert('Error al guardar el producto')
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 bg-surface min-h-screen overflow-y-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black font-display text-slate-800">Catálogo de Productos</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona tu inventario y oferta comercial.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setDisplayCurrency('USD')} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${displayCurrency === 'USD' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
            >
              USD
            </button>
            <button 
              onClick={() => setDisplayCurrency('MXN')} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${displayCurrency === 'MXN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
            >
              MXN
            </button>
          </div>
          <button 
            onClick={() => {
              setEditingProduct(null)
              setFormData({ name: '', description: '', price: 0, cost: 0, stock: 0, minStock: 5, currency: 'USD', categoryId: '', sku: '', imageUrl: '', isActive: true, customFields: {} })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all"
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {predictions.some(p => p.status !== 'OK') && (
        <div className="mb-10 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-amber-500" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Inteligencia de Inventario</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictions.filter(p => p.status !== 'OK').slice(0, 4).map(p => (
              <div key={p.id} className={`p-4 rounded-2xl border-2 transition-all ${
                p.status === 'CRITICAL' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${p.status === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                    <AlertCircle size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/50 rounded-md">
                    {p.status === 'CRITICAL' ? 'Crítico' : 'Riesgo'}
                  </span>
                </div>
                <h4 className="font-bold text-sm truncate mb-1">{p.name}</h4>
                <p className="text-[11px] font-medium opacity-80 mb-3">
                  Agotamiento en aprox. <span className="font-black underline">{p.daysLeft} días</span>
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-60">Stock Actual</p>
                    <p className="text-lg font-black">{p.currentStock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase opacity-60">Venta Diaria</p>
                    <p className="text-xs font-black">{p.dailyRate} / día</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-card bg-white p-6">
        <div className="mb-8 relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-400 font-bold text-sm">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <div key={product.id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-xl hover:border-emerald-100 transition-all flex flex-col">
                <div className="relative h-40 bg-slate-50 rounded-xl mb-4 overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Package size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      onClick={() => fetchMovements(product.id)}
                      className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-400 hover:text-blue-500 transition-all"
                      title="Ver Historial"
                    >
                      <History size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingProduct(product)
                        setFormData({
                          name: product.name,
                          description: product.description || '',
                          price: product.price,
                          cost: product.cost || 0,
                          stock: product.stock,
                          minStock: product.minStock || 5,
                          currency: product.currency || 'USD',
                          categoryId: product.categoryId || '',
                          sku: product.sku || '',
                          imageUrl: product.imageUrl || '',
                          isActive: product.isActive,
                          customFields: product.customFields || {}
                        })
                        setIsModalOpen(true)
                      }}
                      className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-400 hover:text-emerald-500 transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md tracking-wider">
                      {product.category?.name || 'General'}
                    </span>
                    <div className="flex items-center gap-1">
                      {product.stock <= (product.minStock || 5) && (
                        <AlertCircle size={12} className="text-rose-500 animate-pulse" />
                      )}
                      <span className={`text-[10px] font-bold ${product.stock <= (product.minStock || 5) ? 'text-rose-500 uppercase' : 'text-slate-400'}`}>
                        {product.stock} {product.stock <= (product.minStock || 5) ? '¡Crítico!' : 'en stock'}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">{product.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-4 h-8">{product.description || 'Sin descripción'}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Precio</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-800">
                        {displayCurrency === 'USD' ? '$' : 'MX$'}
                        {displayCurrency === 'USD' 
                          ? product.price.toFixed(2) 
                          : (product.price * exchangeRate).toFixed(2)
                        }
                      </span>
                      {displayCurrency === 'MXN' && (
                        <span className="text-[8px] font-black text-slate-300 uppercase">Rate: {exchangeRate}</span>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all">
                    Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalles del Ítem</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL de Imagen del Producto</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                      placeholder="https://ejemplo.com/producto.jpg"
                    />
                    <button 
                      onClick={handleAiGeneration}
                      disabled={isGenerating || !formData.imageUrl}
                      className="px-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      <span className="text-xs font-black uppercase">Analizar</span>
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">✨ Vision Lab: Analiza la imagen para generar nombre y descripción automáticamente.</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Producto</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. Kit de Mantenimiento Avanzado"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción Corta</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 h-24"
                    placeholder="Describe los beneficios y características principales..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio (USD)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Costo (USD)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock Inicial</label>
                  <div className="relative">
                    <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertCircle size={12} />
                    Stock Mínimo (Alerta)
                  </label>
                  <div className="relative">
                    <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      value={formData.minStock}
                      onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-rose-500"
                      placeholder="Punto de reorden..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Fields by Sector */}
                {selectedTenant?.sector && SECTOR_CONFIGS[selectedTenant.sector] && (
                  <div className="col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div className="col-span-2">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">
                        Atributos de {SECTOR_CONFIGS[selectedTenant.sector].label}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Personalización por Sector</p>
                    </div>
                    {SECTOR_CONFIGS[selectedTenant.sector].productFields.map((field: any) => {
                      return (
                        <div key={field.name}>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{field.label}</label>
                          {field.type === 'select' ? (
                            <select 
                              value={formData.customFields[field.name] || ''}
                              onChange={(e) => setFormData({
                                ...formData, 
                                customFields: { ...formData.customFields, [field.name]: e.target.value }
                              })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none"
                            >
                              <option value="">Seleccionar...</option>
                              {field.options?.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input 
                              type={field.type} 
                              value={formData.customFields[field.name] || ''}
                              onChange={(e) => setFormData({
                                ...formData, 
                                customFields: { ...formData.customFields, [field.name]: Number(e.target.value) || e.target.value }
                              })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU / Código</label>
                  <input 
                    type="text" 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                    placeholder="PRD-001"
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMovementsModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Historial de Movimientos</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Auditoría de Inventario</p>
              </div>
              <button onClick={() => setIsMovementsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="text-left pb-4">Fecha</th>
                    <th className="text-left pb-4">Tipo</th>
                    <th className="text-left pb-4">Cant.</th>
                    <th className="text-left pb-4">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedProductMovements.map((m: any) => (
                    <tr key={m.id} className="text-sm font-bold text-slate-600">
                      <td className="py-4">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                          m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' :
                          m.type === 'OUT' ? 'bg-rose-50 text-rose-600' :
                          m.type === 'SALE' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="py-4">{m.quantity}</td>
                      <td className="py-4 text-xs text-slate-400">{m.reason}</td>
                    </tr>
                  ))}
                  {selectedProductMovements.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">No hay movimientos registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
