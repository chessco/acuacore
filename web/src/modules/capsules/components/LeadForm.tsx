import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Send } from 'lucide-react';
import axios from 'axios';

interface LeadFormProps {
  capsuleId: string;
  onSuccess: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ capsuleId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => localStorage.getItem('capsule_user_id'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/capsules/leads', {
        ...formData,
        capsuleId,
        userId,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el formulario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-100"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <User size={20} />
          </div>
          <input
            type="text"
            required
            className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-700 font-medium text-lg placeholder:text-slate-300"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Mail size={20} />
          </div>
          <input
            type="email"
            required
            className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-700 font-medium text-lg placeholder:text-slate-300"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Phone size={20} />
          </div>
          <input
            type="tel"
            required
            className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-700 font-medium text-lg placeholder:text-slate-300"
            placeholder="Teléfono / WhatsApp"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#001A41] hover:bg-slate-800 text-white font-black py-5 rounded-2xl text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10"
        >
          {loading ? 'Enviando...' : 'Solicitar asesoría gratuita'}
          {!loading && <Send size={20} />}
        </button>
      </form>
    </motion.div>
  );
};
