import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  ShoppingBag,
  UserPlus,
  Clock,
  FileText,
  CheckSquare,
  Target,
  Sparkles,
  History,
  Zap,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useTenant } from '../../contexts/TenantContext';
import { OmnichannelChatOverlay } from './components/OmnichannelChatOverlay';
import { MeetingScheduler } from './components/MeetingScheduler';

export function ContactsManager() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [isCreating, setIsCreating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', company: '', status: 'LEAD' });
  const [isEditing, setIsEditing] = useState(false);
  const [editContact, setEditContact] = useState({ name: '', email: '', phone: '', company: '', status: 'LEAD' });
  const { selectedTenant, flowApiKey } = useTenant();

  const handleStartEdit = () => {
    if (!selectedContact) return;
    setEditContact({
      name: selectedContact.name || '',
      email: selectedContact.email || '',
      phone: selectedContact.phone || '',
      company: selectedContact.company || '',
      status: selectedContact.status || 'LEAD'
    });
    setIsEditing(true);
  };

  const handleEditContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${apiUrl}/api/crm/contacts/${selectedContact.id}`, editContact, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      setIsEditing(false);
      fetchContactDetail(selectedContact.id);
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';

  useEffect(() => {
    fetchContacts();
    fetchSegments();
  }, [selectedTenant]);

  const fetchSegments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiUrl}/api/crm/segments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      setSegments(res.data);
    } catch (err) {
      console.error('Error fetching segments:', err);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiUrl}/api/crm/contacts`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactDetail = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiUrl}/api/crm/contacts/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      setSelectedContact(res.data);
      setView('detail');
    } catch (err) {
      console.error('Error fetching contact detail:', err);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      
      await axios.patch(`${apiUrl}/api/crm/tasks/${taskId}`, { status: newStatus }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      
      // Refresh current contact data
      if (selectedContact) {
        fetchContactDetail(selectedContact.id);
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };
  
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/crm/contacts`, newContact, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });
      setIsCreating(false);
      setNewContact({ name: '', email: '', phone: '', company: '', status: 'LEAD' });
      fetchContacts();
    } catch (err) {
      console.error('Error creating contact:', err);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSegment) {
      const segment = segments.find(s => s.id === activeSegment);
      return matchesSearch && segment?.contacts.includes(c.id);
    }
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LEAD': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PROSPECT': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CUSTOMER': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'VIP': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="p-8 bg-white border-b border-slate-100 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 text-white">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#001A41]">Gestión de Contactos</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Base de Datos Maestro CRM</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <UserPlus size={18} /> Nuevo Contacto
            </button>
          </div>
        </div>

        {/* Smart Segments Horizontal List */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveSegment(null)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${!activeSegment ? 'bg-[#001A41] text-white border-[#001A41] shadow-lg shadow-blue-900/10' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
          >
            Todos
          </button>
          {segments.map(segment => (
            <button 
              key={segment.id}
              onClick={() => setActiveSegment(segment.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${activeSegment === segment.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/10' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
            >
              {segment.id === 'hot_leads_no_order' && <Sparkles size={12} />}
              {segment.id === 'vip_inactive' && <History size={12} />}
              {segment.id === 'customer_recovery' && <Target size={12} />}
              {segment.id === 'new_leads' && <Zap size={12} />}
              {segment.name}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${activeSegment === segment.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {segment.contacts.length}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o empresa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {activeSegment && (
              <button 
                onClick={() => {
                  const segment = segments.find(s => s.id === activeSegment);
                  alert(`Iniciando campaña omnicanal para el segmento: ${segment?.name}\n\nEnviando mensajes a ${segment?.contacts.length} contactos...`);
                }}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 whitespace-nowrap"
              >
                <Zap size={16} /> Iniciar Campaña
              </button>
            )}
            <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 font-bold text-xs">
              <Filter size={16} /> Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main List */}
        <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar min-h-0 ${view === 'detail' ? 'hidden lg:block' : 'block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredContacts.map((contact) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={contact.id}
                  onClick={() => fetchContactDetail(contact.id)}
                  className={`group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer relative overflow-hidden ${selectedContact?.id === contact.id ? 'ring-2 ring-blue-500 border-transparent shadow-lg shadow-blue-900/10' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 font-black text-lg overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform">
                      {contact.avatarUrl ? (
                        <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        contact.name.charAt(0)
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </div>
                    {contact._count?.tasks > 0 && (
                      <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white flex items-center gap-1 shadow-lg shadow-blue-200 animate-pulse">
                        <Calendar size={10} /> {contact._count.tasks}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="font-black text-[#001A41] truncate">{contact.name}</h3>
                    {contact.company && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-tight">
                        <Building2 size={12} /> {contact.company}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Mail size={14} className="text-slate-300" /> {contact.email || 'Sin email'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Phone size={14} className="text-slate-300" /> {contact.phone || 'Sin teléfono'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-50">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos</p>
                      <p className="text-sm font-black text-[#001A41]">{contact._count?.orders || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="flex-1 flex justify-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContact(contact);
                            setEditContact({
                              name: contact.name || '',
                              email: contact.email || '',
                              phone: contact.phone || '',
                              company: contact.company || '',
                              status: contact.status || 'LEAD'
                            });
                            setIsEditing(true);
                          }}
                          className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 hover:scale-110 transition-all"
                          title="Editar Contacto"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/${contact.phone}`, '_blank');
                          }}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 hover:scale-110 transition-all"
                          title="WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${contact.email}`;
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:scale-110 transition-all"
                          title="Enviar Email"
                        >
                          <Mail size={14} />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {view === 'detail' && selectedContact && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full lg:w-[450px] xl:w-[600px] bg-white border-l border-slate-100 flex flex-col shadow-2xl z-20"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <button onClick={() => setView('list')} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                  <Plus size={20} className="rotate-45" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 font-black">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-black text-[#001A41] leading-tight">{selectedContact.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedContact.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setIsChatOpen(true)}
                     className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                   >
                     <MessageSquare size={18} />
                   </button>
                   <button 
                     onClick={() => setIsSchedulerOpen(true)}
                     className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
                     title="Agendar Cita"
                   >
                     <Calendar size={18} />
                   </button>
                   <button 
                     onClick={handleStartEdit}
                     className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all hover:scale-105"
                     title="Editar Contacto"
                   >
                     <Edit size={18} />
                   </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 min-h-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Ventas</p>
                    <p className="text-xl font-black text-blue-600">${selectedContact.orders?.reduce((acc: number, o: any) => acc + o.total, 0).toFixed(0)}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Pedidos</p>
                    <p className="text-xl font-black text-emerald-600">{selectedContact.orders?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Nivel IA</p>
                    <p className="text-xl font-black text-purple-600">High</p>
                  </div>
                </div>

                {/* Information Sections */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-black text-[#001A41] uppercase tracking-[0.2em]">Actividad Reciente</h3>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                      <Plus size={12} /> Añadir Nota
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedContact.activities?.length > 0 ? (
                      selectedContact.activities.map((activity: any) => (
                        <div key={activity.id} className="flex gap-4 relative">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                             {activity.type === 'WHATSAPP' && <MessageSquare size={14} className="text-emerald-500" />}
                             {activity.type === 'EMAIL' && <Mail size={14} className="text-blue-500" />}
                             {activity.type === 'ORDER' && <ShoppingBag size={14} className="text-purple-500" />}
                             {activity.type === 'NOTE' && <Clock size={14} className="text-slate-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-black text-[#001A41]">{activity.subject}</p>
                              <p className="text-[10px] font-bold text-slate-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{activity.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No hay actividades registradas.</p>
                    )}
                  </div>
                </div>

                {/* Tasks & Appointments Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-black text-[#001A41] uppercase tracking-[0.2em]">Tareas y Citas</h3>
                    <button 
                      onClick={() => setIsSchedulerOpen(true)}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Agendar
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedContact.tasks?.length > 0 ? (
                      selectedContact.tasks.map((task: any) => (
                        <div key={task.id} className={`p-4 rounded-2xl border transition-all ${task.status === 'COMPLETED' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
                          <div className="flex items-start gap-4">
                            <button 
                              onClick={() => handleToggleTask(task.id, task.status)}
                              className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-blue-400'}`}
                            >
                              {task.status === 'COMPLETED' && <CheckSquare size={12} />}
                            </button>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`text-xs font-black ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-[#001A41]'}`}>
                                  {task.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                    task.type === 'MEETING' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                                  }`}>
                                    {task.type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                  <Calendar size={12} />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                  <Clock size={12} />
                                  {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {task.type === 'MEETING' && (
                                  <button 
                                    className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                    onClick={() => alert('Sincronizando con Google Calendar...')}
                                  >
                                    <TrendingUp size={12} className="rotate-45" /> Sincronizar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <Calendar size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin tareas pendientes</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#001A41] uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Pedidos Recientes</h3>
                  <div className="space-y-2">
                    {selectedContact.orders?.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer border border-slate-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                            <ShoppingBag size={14} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[#001A41]">Orden #{order.id.slice(0, 8)}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-black text-emerald-600">${order.total}</p>
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{order.status}</p>
                          </div>
                          <div className="flex gap-1 border-l border-slate-200 pl-3">
                            <button className="p-1.5 hover:bg-white rounded-lg text-slate-400" title="Ver PDF">
                              <FileText size={14} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const msg = encodeURIComponent(`Hola ${selectedContact.name}, te adjunto la factura de tu pedido #${order.id.slice(0,8)}. ¡Gracias por tu compra!`);
                                window.open(`https://wa.me/${selectedContact.phone}?text=${msg}`, '_blank');
                              }}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-500" 
                              title="Enviar por WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#001A41] uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Leads de Cápsulas</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedContact.leads?.map((lead: any) => (
                      <div key={lead.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <TrendingUp size={14} />
                        </div>
                        <div className="flex-1">
                           <p className="text-[11px] font-black text-[#001A41]">{lead.capsule?.title}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Capturado el {new Date(lead.createdAt).toLocaleDateString()}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Contact Modal */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCreating(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <form onSubmit={handleCreateContact} className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-[#001A41]">Nuevo Contacto</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Añadir a la Base Maestro</p>
                    </div>
                    <button type="button" onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                        <input 
                          required
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</label>
                        <input 
                          value={newContact.company}
                          onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Electrónico</label>
                      <input 
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono / WhatsApp</label>
                      <input 
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Inicial</label>
                      <select 
                        value={newContact.status}
                        onChange={(e) => setNewContact({...newContact, status: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none"
                      >
                        <option value="LEAD">Lead</option>
                        <option value="PROSPECT">Prospecto</option>
                        <option value="CUSTOMER">Cliente</option>
                        <option value="VIP">Cliente VIP</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4"
                    >
                      Guardar Contacto
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Omnichannel Chat Overlay */}
        {selectedContact && (
          <OmnichannelChatOverlay 
            contact={selectedContact}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}
        {/* Meeting Scheduler Overlay */}
        {selectedContact && (
          <MeetingScheduler 
            contact={selectedContact}
            isOpen={isSchedulerOpen}
            onClose={() => setIsSchedulerOpen(false)}
            onSuccess={() => fetchContacts()} // Refresh to show new task
          />
        )}

        {/* Edit Contact Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <form onSubmit={handleEditContact} className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-[#001A41]">Editar Contacto</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Actualizar Datos en el CRM Maestro</p>
                    </div>
                    <button type="button" onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                        <input 
                          required
                          value={editContact.name}
                          onChange={(e) => setEditContact({...editContact, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-bold text-[#001A41]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</label>
                        <input 
                          value={editContact.company}
                          onChange={(e) => setEditContact({...editContact, company: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-bold text-[#001A41]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Electrónico</label>
                      <input 
                        type="email"
                        value={editContact.email}
                        onChange={(e) => setEditContact({...editContact, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-bold text-[#001A41]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono / WhatsApp</label>
                      <input 
                        value={editContact.phone}
                        onChange={(e) => setEditContact({...editContact, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-bold text-[#001A41]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
                      <select 
                        value={editContact.status}
                        onChange={(e) => setEditContact({...editContact, status: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 transition-all appearance-none font-bold text-[#001A41]"
                      >
                        <option value="LEAD">Lead</option>
                        <option value="PROSPECT">Prospecto</option>
                        <option value="CUSTOMER">Cliente</option>
                        <option value="VIP">Cliente VIP</option>
                      </select>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/10 hover:bg-amber-600 transition-all"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
