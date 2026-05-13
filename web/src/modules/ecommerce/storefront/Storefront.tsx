import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ShoppingBag, ShoppingCart, X, ChevronRight, Package, Tag, Star, ArrowRight, CheckCircle2, Loader2, Search, CreditCard } from 'lucide-react'
import axios from 'axios'

export function Storefront() {
  const { slug, trackingId } = useParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(trackingId || null)
  
  // Attribution
  const capsuleId = new URLSearchParams(window.location.search).get('capsuleId')

  useEffect(() => {
    if (trackingId) {
      setCheckoutStep('success');
      setIsCartOpen(true);
    }
  }, [trackingId]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'

  useEffect(() => {
    fetchStoreData()
  }, [slug])

  useEffect(() => {
    const productId = new URLSearchParams(window.location.search).get('addToCart')
    if (productId && products.length > 0) {
      const product = products.find(p => p.id === productId)
      if (product) {
        addToCart(product)
        setIsCartOpen(true)
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname + window.location.search.replace(`addToCart=${productId}`, ''))
      }
    }
  }, [products])

  const fetchStoreData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${apiUrl}/api/ecommerce/storefront/${slug}/products`),
        axios.get(`${apiUrl}/api/ecommerce/storefront/${slug}/categories`)
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error('Error loading store:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    setIsCartOpen(true)
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const handleCheckout = async () => {
    if (checkoutStep === 'cart') setCheckoutStep('shipping')
    else if (checkoutStep === 'shipping') setCheckoutStep('payment')
    else if (checkoutStep === 'payment') {
      setLoading(true)
      try {
        const res = await axios.post(`${apiUrl}/api/ecommerce/storefront/${slug}/checkout`, {
          customerName: 'Cliente Público', // In real app, from shipping form
          total: cartTotal,
          capsuleId: capsuleId, // Atribución
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
        setOrderId(res.data.id)
        setCheckoutStep('success')
        setCart([])
      } catch (err) {
        alert('Error al procesar la orden')
      } finally {
        setLoading(false)
      }
    }
  }

  const filteredProducts = products.filter(p => 
    (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === null || p.categoryId === selectedCategory)
  )

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShoppingBag size={20} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight uppercase">Tienda <span className="text-emerald-500">{slug}</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-slate-600 hover:text-emerald-500 transition-colors"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 md:p-20 text-white shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 mix-blend-overlay" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 max-w-2xl"
            >
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Bienvenido a la Experiencia Premium</span>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">Descubre el Futuro de <span className="text-emerald-400 italic">Tu Industria.</span></h1>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed">Productos especializados de alta gama, ahora al alcance de un click. Calidad certificada y entrega inteligente.</p>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                  Ver Catálogo <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${selectedCategory === null ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
          >
            Todos los Productos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((p, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                key={p.id} 
                className="group bg-white rounded-[2rem] p-4 border border-slate-100 hover:shadow-2xl hover:border-emerald-100 transition-all flex flex-col"
              >
                <div className="relative aspect-square bg-slate-50 rounded-[1.5rem] overflow-hidden mb-4">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Package size={64} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {p.category?.name || 'General'}
                    </span>
                  </div>
                </div>
                <div className="px-2 flex-1">
                  <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-emerald-500 transition-colors">{p.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-6 h-8">{p.description}</p>
                </div>
                <div className="px-2 pb-2 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-300 uppercase">Desde</span>
                    <span className="text-xl font-black text-slate-800">${p.price.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-500 hover:scale-110 transition-all active:scale-90"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tu Carrito</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{cart.length} Artículos</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {checkoutStep === 'success' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
                      <CheckCircle2 size={48} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-800 mb-2">¡Orden Completada!</h4>
                    <p className="text-sm text-slate-500 mb-8 px-4">Gracias por tu compra. Tu pedido está siendo procesado por nuestro equipo.</p>
                    <div className="bg-slate-50 p-4 rounded-2xl w-full mb-8">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">ID de Seguimiento</span>
                      <span className="font-mono text-emerald-600 font-bold break-all text-xs">{orderId}</span>
                    </div>
                    <button 
                      onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }}
                      className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-all"
                    >
                      Seguir Comprando
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden shrink-0">
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.quantity} x ${item.price.toFixed(2)}</span>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="text-[10px] font-black text-emerald-600 uppercase">Añadir</button>
                            <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-rose-400 uppercase">Eliminar</button>
                          </div>
                        </div>
                        <div className="text-sm font-black text-slate-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <ShoppingBag size={64} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Carrito Vacío</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {cart.length > 0 && checkoutStep !== 'success' && (
                <div className="p-8 bg-slate-50 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Estimado</span>
                    <span className="text-3xl font-black text-slate-800">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  {checkoutStep === 'payment' && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                      <CreditCard className="text-blue-500" />
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase block">Modo Seguro Activo</span>
                        <span className="text-xs font-bold text-blue-700">Pago procesado por Stripe</span>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-5 bg-emerald-500 text-white font-black rounded-[1.5rem] shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span className="uppercase tracking-widest text-sm">
                          {checkoutStep === 'cart' ? 'Continuar al Envío' : checkoutStep === 'shipping' ? 'Ir al Pago' : 'Confirmar y Pagar'}
                        </span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
