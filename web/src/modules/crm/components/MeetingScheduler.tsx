import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  X, 
  Video, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Loader2,
  CalendarDays,
  Smartphone,
  Globe
} from 'lucide-react';
import axios from 'axios';
import { useTenant } from '../../../contexts/TenantContext';

interface MeetingSchedulerProps {
  contact: {
    id: string;
    name: string;
    email: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MeetingScheduler({ contact, isOpen, onClose, onSuccess }: MeetingSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: `Reunión de Ventas: ${contact.name}`,
    date: '',
    time: '10:00',
    type: 'MEETING',
    location: 'Google Meet',
    description: ''
  });
  
  const { selectedTenant } = useTenant();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setFormData({
        title: `Reunión de Ventas: ${contact.name}`,
        date: '',
        time: '10:00',
        type: 'MEETING',
        location: 'Google Meet',
        description: ''
      });
    }
  }, [isOpen, contact.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const dueDate = new Date(`${formData.date}T${formData.time}:00`);
      
      await axios.post(`${apiUrl}/api/crm/tasks`, {
        contactId: contact.id,
        title: formData.title,
        description: `${formData.description}\nUbicación: ${formData.location}`,
        dueDate: dueDate.toISOString(),
        type: formData.type,
        status: 'PENDING'
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': selectedTenant?.id || '' 
        }
      });

      setSuccess(true);
      onSuccess(); // Refresh parent data immediately
    } catch (err) {
      console.error('Error scheduling meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {success ? (
              <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#001A41]">¡Cita Agendada!</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2">La reunión se ha sincronizado con el sistema interno.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      alert('Redirigiendo a Google OAuth...');
                      // Simulación de apertura de calendario
                      window.open('https://calendar.google.com/', '_blank');
                    }}
                    className="w-full py-4 bg-white border-2 border-slate-100 text-[#001A41] font-black rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                  >
                    <Globe size={18} className="text-blue-500" /> Sincronizar con Google Calendar
                  </button>
                  <button 
                    onClick={onClose}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cerrar Ventana
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <CalendarDays size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#001A41]">Agendar Reunión</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Contacto: {contact.name}</p>
                    </div>
                  </div>
                  <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                    <X size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título de la Reunión</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación / Plataforma</label>
                    <div className="flex gap-2">
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, location: 'Google Meet'})}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${formData.location === 'Google Meet' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-500'}`}
                       >
                         <Video size={14} /> Meet
                       </button>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, location: 'Oficina Cliente'})}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${formData.location === 'Oficina Cliente' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-500'}`}
                       >
                         <MapPin size={14} /> Presencial
                       </button>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, location: 'Llamada'})}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${formData.location === 'Llamada' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-500'}`}
                       >
                         <Smartphone size={14} /> Llamada
                       </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas Adicionales</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Puntos a tratar en la reunión..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#001A41] text-white font-black rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all mt-4 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                    Agendar y Sincronizar
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
