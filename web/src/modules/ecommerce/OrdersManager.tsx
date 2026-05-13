import { useState, useEffect } from 'react'
import { Search, ShoppingBag, Clock, CheckCircle2, XCircle, Truck, Eye, Loader2, Filter, ChevronDown, User, Phone, Mail, DollarSign, FileDown, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { useTenant } from '../../contexts/TenantContext'

export function OrdersManager() {
  const { selectedTenant } = useTenant()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    fetchOrders()
  }, [selectedTenant])

  const fetchOrders = async () => {
    if (!selectedTenant) return
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': selectedTenant.id
      }
      
      const res = await axios.get(`${apiUrl}/api/ecommerce/orders`, { headers })
      setOrders(res.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async (orderId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
      const token = localStorage.getItem('token')
      const headers = { 
        'Authorization': `Bearer ${token}`
      }
      
      const res = await axios.get(`${apiUrl}/api/ecommerce/orders/${orderId}/invoice`, { 
        headers,
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `factura-${orderId.slice(0, 8)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error downloading invoice:', err)
      alert('Error al descargar la factura')
    }
  }

  const sendWhatsApp = (order: any) => {
    if (!order.phone) {
      alert('El cliente no proporcionó un número de teléfono.')
      return
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014'
    const invoiceUrl = `${apiUrl}/api/ecommerce/orders/${order.id}/invoice`
    const message = encodeURIComponent(`Hola ${order.customerName}, ¡gracias por tu compra! 🌟 
Adjuntamos el link a tu factura/remisión: ${invoiceUrl}

¡Que tengas un excelente día!`)
    
    // Clean phone number (keep only digits)
    const cleanPhone = order.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Pendiente', color: 'bg-amber-100 text-amber-600', icon: <Clock size={12} /> }
      case 'PROCESSING': return { label: 'Procesando', color: 'bg-blue-100 text-blue-600', icon: <Truck size={12} /> }
      case 'SHIPPED': return { label: 'Enviado', color: 'bg-indigo-100 text-indigo-600', icon: <Truck size={12} /> }
      case 'DELIVERED': return { label: 'Entregado', color: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle2 size={12} /> }
      case 'CANCELLED': return { label: 'Cancelado', color: 'bg-rose-100 text-rose-600', icon: <XCircle size={12} /> }
      default: return { label: status, color: 'bg-slate-100 text-slate-600', icon: <Clock size={12} /> }
    }
  }

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 bg-surface min-h-screen overflow-y-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black font-display text-slate-800">Gestión de Pedidos</h2>
          <p className="text-sm text-slate-500 mt-1">Monitorea y procesa las ventas de tu organización.</p>
        </div>
      </div>

      <div className="dashboard-card bg-white p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o folio..." 
              className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-blue transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">
              <Filter size={16} />
              Filtrar
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-brand-blue mb-4" />
            <p className="text-slate-400 font-bold text-sm">Cargando pedidos...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-border">
                <th className="px-4 py-4">Orden / Folio</th>
                <th className="px-4 py-4">Cliente</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4 text-center">Estado</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order: any) => {
                  const statusInfo = getStatusInfo(order.status)
                  return (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <ShoppingBag size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 leading-none">#{order.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{order.items.length} productos</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{order.email || 'Sin correo'}</p>
                      </td>
                      <td className="px-4 py-5 font-black text-slate-800">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => sendWhatsApp(order)}
                            className="p-2 hover:bg-white hover:text-emerald-500 hover:shadow-sm rounded-lg transition-all text-slate-400"
                            title="Enviar por WhatsApp"
                          >
                            <MessageCircle size={18} />
                          </button>
                          <button 
                            onClick={() => downloadInvoice(order.id)}
                            className="p-2 hover:bg-white hover:text-emerald-500 hover:shadow-sm rounded-lg transition-all text-slate-400"
                            title="Descargar Factura"
                          >
                            <FileDown size={18} />
                          </button>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-white hover:text-brand-blue hover:shadow-sm rounded-lg transition-all text-slate-400"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-bold">
                    No se encontraron pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Detalle del Pedido</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Folio: #{selectedOrder.id.slice(0, 8)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-7">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Productos en la Orden</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.quantity} x ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-black text-slate-800">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-6">
                  <div className="p-6 bg-slate-900 rounded-3xl text-white">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total de la Venta</p>
                    <h4 className="text-3xl font-black">${selectedOrder.total.toFixed(2)} <span className="text-sm font-bold text-white/30">USD</span></h4>
                    <div className="mt-6 flex items-center gap-2">
                       <span className={`flex-1 flex justify-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusInfo(selectedOrder.status).color}`}>
                        {selectedOrder.status}
                       </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información del Cliente</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <User size={16} className="text-slate-300" />
                        <span className="text-sm font-bold">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Mail size={16} className="text-slate-300" />
                        <span className="text-sm font-bold">{selectedOrder.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Phone size={16} className="text-slate-300" />
                        <span className="text-sm font-bold">{selectedOrder.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex gap-3">
                    <button 
                      onClick={() => sendWhatsApp(selectedOrder)}
                      className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Enviar WhatsApp
                    </button>
                    <button 
                      onClick={() => downloadInvoice(selectedOrder.id)}
                      className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl text-sm shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <FileDown size={18} />
                      Descargar PDF
                    </button>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all"
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
