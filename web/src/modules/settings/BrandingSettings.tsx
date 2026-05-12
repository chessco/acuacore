import React, { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { Palette, Type, Image as ImageIcon, Save, CheckCircle2, Globe } from 'lucide-react';
import axios from 'axios';

export const BrandingSettings: React.FC = () => {
  const { selectedTenant, setSelectedTenant, refreshTenants } = useTenant();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    brandName: selectedTenant?.brandingConfig?.brandName || '',
    logoUrl: selectedTenant?.brandingConfig?.logoUrl || '',
    primaryColor: selectedTenant?.brandingConfig?.primaryColor || '#377DFF',
    accentColor: selectedTenant?.brandingConfig?.accentColor || '#003B71',
    footerText: selectedTenant?.brandingConfig?.footerText || ''
  });

  const handleSave = async () => {
    if (!selectedTenant) return;
    setIsSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3014';
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(`${apiUrl}/api/tenants/${selectedTenant.id}`, {
        brandingConfig: formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      const updatedTenant = { ...selectedTenant, brandingConfig: formData };
      setSelectedTenant(updatedTenant);
      await refreshTenants();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("[BrandingSettings] Error saving branding:", error);
      alert("Error al guardar la configuración de marca.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Globe size={20} className="text-brand-blue" />
            Identidad de Marca Blanca
          </h3>
          <p className="text-xs text-slate-500 mt-1">Personaliza la interfaz para tus propios clientes.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-bold animate-fade-in">
            <CheckCircle2 size={14} />
            ¡CAMBIOS GUARDADOS!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Type size={12} /> Nombre de la Plataforma
          </label>
          <input 
            type="text" 
            value={formData.brandName}
            onChange={(e) => setFormData({...formData, brandName: e.target.value})}
            placeholder="Ej: RestCore, PitayaCore..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-blue transition-all"
          />
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={12} /> URL del Logo
          </label>
          <input 
            type="text" 
            value={formData.logoUrl}
            onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
            placeholder="https://..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-blue transition-all"
          />
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Palette size={12} /> Color Primario
          </label>
          <div className="flex gap-3">
            <input 
              type="color" 
              value={formData.primaryColor}
              onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
              className="w-12 h-10 rounded-lg cursor-pointer bg-white border border-slate-200 p-1"
            />
            <input 
              type="text" 
              value={formData.primaryColor}
              onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Palette size={12} /> Color de Acento
          </label>
          <div className="flex gap-3">
            <input 
              type="color" 
              value={formData.accentColor}
              onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
              className="w-12 h-10 rounded-lg cursor-pointer bg-white border border-slate-200 p-1"
            />
            <input 
              type="text" 
              value={formData.accentColor}
              onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Vista Previa</p>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: formData.primaryColor }}>
            {formData.logoUrl ? <img src={formData.logoUrl} className="w-6 h-6 object-contain" /> : <Globe size={24} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{formData.brandName || 'Nombre de Marca'}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Plataforma Activa</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 py-4 bg-brand-deep text-white rounded-2xl font-bold shadow-lg shadow-brand-deep/20 hover:opacity-90 transition-all disabled:opacity-50"
      >
        {isSaving ? 'Guardando...' : (
          <>
            <Save size={18} />
            Aplicar Configuración de Marca
          </>
        )}
      </button>
    </div>
  );
};
