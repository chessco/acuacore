import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, Package, Tag, DollarSign, Layers, Loader2, Save, X, Eye } from 'lucide-react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'
import { SECTOR_CONFIGS } from './sectorConfigs'

export function ProductsManager() {
  const { selectedTenant } = useTenant()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    sku: '',
    imageUrl: '',
    isActive: true,
    customFields: {} as any
  })

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
      
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${apiUrl}/api/ecommerce/products`, { headers }),
        axios.get(`${apiUrl}/api/ecommerce/categories`, { headers })
      ])
      
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
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
        <button 
          onClick={() => {
            setEditingProduct(null)
            setFormData({ name: '', description: '', price: 0, stock: 0, categoryId: '', sku: '', imageUrl: '', isActive: true, customFields: {} })
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

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
                      onClick={() => {
                        setEditingProduct(product)
                        setFormData({
                          name: product.name,
                          description: product.description || '',
                          price: product.price,
                          stock: product.stock,
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md tracking-wider">
                      {product.category?.name || 'General'}
                    </span>
                    <span className={`text-[10px] font-bold ${product.stock > 0 ? 'text-slate-400' : 'text-rose-500 uppercase'}`}>
                      {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">{product.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-4 h-8">{product.description || 'Sin descripción'}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Precio</span>
                    <span className="text-lg font-black text-slate-800">${product.price.toFixed(2)}</span>
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
                    {SECTOR_CONFIGS[selectedTenant.sector].productFields.map(field => (
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
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                    ))}
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
    </div>
  )
}
