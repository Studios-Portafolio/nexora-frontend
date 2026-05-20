import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, Landmark, Save, Loader2, DollarSign, FileText, MapPin, Phone, ArrowLeft, User, Lock, Mail, Calculator } from 'lucide-react';

const API_SETTINGS = 'https://nexora-api-psrx.onrender.com/api/settings';
const API_USER = 'https://nexora-api-psrx.onrender.com/api/user';

export default function SettingsPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userProfile, setUserProfile] = useState({ name: '', email: '', password: '' });
  const [company, setCompany] = useState({ legalName: '', documentId: '', address: '', phone: '', baseCurrency: 'USD' });
  const [rates, setRates] = useState({ VES: '', EUR: '', USDT: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('nexora_token');
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get(`${API_USER}/profile`, { headers });
      if (userRes.data.success && userRes.data.data) {
        setUserProfile({ name: userRes.data.data.name || '', email: userRes.data.data.email || '', password: '' });
      }

      const compRes = await axios.get(`${API_SETTINGS}/company`, { headers });
      if (compRes.data.success && compRes.data.data) {
        setCompany({
          legalName: compRes.data.data.legalName || '', documentId: compRes.data.data.documentId || '',
          address: compRes.data.data.address || '', phone: compRes.data.data.phone || '', baseCurrency: compRes.data.data.baseCurrency || 'USD'
        });
      }

      const ratesRes = await axios.get(`${API_SETTINGS}/exchange-rates`, { headers });
      if (ratesRes.data.success && ratesRes.data.data) {
        const fetchedRates = ratesRes.data.data;
        setRates({
          VES: fetchedRates.find((r: any) => r.currency === 'VES')?.rate || '',
          EUR: fetchedRates.find((r: any) => r.currency === 'EUR')?.rate || '',
          USDT: fetchedRates.find((r: any) => r.currency === 'USDT')?.rate || ''
        });
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('nexora_token');
      const headers = { Authorization: `Bearer ${token}` };

      const userPayload: any = { name: userProfile.name, email: userProfile.email };
      if (userProfile.password.trim() !== '') { userPayload.password = userProfile.password; }
      const updatedUserRes = await axios.put(`${API_USER}/profile`, userPayload, { headers });
      
      if (updatedUserRes.data.success) {
         const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
         localStorage.setItem('user', JSON.stringify({ ...currentUser, name: userProfile.name, email: userProfile.email }));
      }

      await axios.put(`${API_SETTINGS}/company`, company, { headers });

      const currencies = ['VES', 'EUR', 'USDT'];
      for (const curr of currencies) {
        const rateValue = parseFloat(rates[curr as keyof typeof rates]);
        if (!isNaN(rateValue) && rateValue > 0) {
          await axios.put(`${API_SETTINGS}/exchange-rates`, { currency: curr, rate: rateValue }, { headers });
        }
      }

      alert('✅ ¡Configuración guardada con éxito!');
      setUserProfile(prev => ({...prev, password: ''}));
    } catch (error) {
      alert('❌ Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-stone-500 font-bold">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 pb-24">
      <button onClick={() => navigate('/')} className="mb-6 flex items-center text-stone-500 hover:text-indigo-600 font-black transition-colors active:scale-95 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 w-fit">
        <ArrowLeft className="w-5 h-5 mr-2" /> Volver al Sistema
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Configuración del Negocio</h1>
        <p className="text-stone-500 font-medium mt-1">Administra tus datos personales, legales y tasas de cambio.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* PERFIL DE USUARIO */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><User className="w-6 h-6" /></div>
            <h2 className="text-xl font-black text-stone-800">Perfil de Usuario</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><User className="w-4 h-4" /> Nombre de Administrador</label><input type="text" required value={userProfile.name} onChange={e => setUserProfile({...userProfile, name: e.target.value})} placeholder="Ej: Angel Castro" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"/></div>
            <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><Mail className="w-4 h-4" /> Correo Electrónico</label><input type="email" required value={userProfile.email} onChange={e => setUserProfile({...userProfile, email: e.target.value})} placeholder="Ej: tu@correo.com" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"/></div>
            <div className="md:col-span-2"><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><Lock className="w-4 h-4" /> Nueva Contraseña <span className="text-[10px] text-stone-400 font-normal">(Déjalo en blanco si no deseas cambiarla)</span></label><input type="password" value={userProfile.password} onChange={e => setUserProfile({...userProfile, password: e.target.value})} placeholder="*********" className="w-full md:w-1/2 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"/></div>
          </div>
        </div>

        {/* PERFIL LEGAL */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
            <h2 className="text-xl font-black text-stone-800">Perfil Legal (Facturación)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><FileText className="w-4 h-4" /> Razón Social / Nombre</label><input type="text" required value={company.legalName} onChange={e => setCompany({...company, legalName: e.target.value})} placeholder="Ej: Inversiones Nexora C.A." className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"/></div>
            <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><Landmark className="w-4 h-4" /> RIF / NIT / Documento</label><input type="text" required value={company.documentId} onChange={e => setCompany({...company, documentId: e.target.value})} placeholder="Ej: J-12345678-9" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"/></div>
            <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><MapPin className="w-4 h-4" /> Dirección Fiscal</label><input type="text" value={company.address} onChange={e => setCompany({...company, address: e.target.value})} placeholder="Ej: Av. Principal, Local 4..." className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"/></div>
            <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><Phone className="w-4 h-4" /> Teléfono de Contacto</label><input type="text" value={company.phone} onChange={e => setCompany({...company, phone: e.target.value})} placeholder="Ej: +58 412 1234567" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"/></div>
          </div>
        </div>

        {/* TASAS DE CAMBIO REDISEÑADAS EN PANEL */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><Calculator className="w-6 h-6" /></div>
            <div><h2 className="text-xl font-black text-stone-800">Tasa de Cambio en Catálogo</h2><p className="text-xs text-stone-400 font-bold mt-1">Registra la tasa exacta para cobrar</p></div>
          </div>

          <div className="space-y-6">
            <div className="relative max-w-md">
              <label className="block text-[11px] font-black text-teal-600 mb-2 uppercase tracking-widest bg-teal-50 inline-block px-2 py-1 rounded-md">Tasa Manual Aplicada (Bolívares)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-black text-lg">Bs.</span>
                <input type="number" step="0.01" min="0" value={rates.VES} onChange={e => setRates({...rates, VES: e.target.value})} placeholder="Ej: 42.50" className="w-full bg-white border-2 border-stone-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 font-black text-stone-800 text-xl transition-all shadow-sm" />
              </div>
              <p className="text-[10px] text-stone-500 font-medium mt-2 leading-relaxed">Este es el monto exacto en bolívares por el que se multiplicarán los precios en dólares dentro de tu catálogo web y en la caja registradora.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 opacity-70">
               <div className="relative"><label className="block text-sm font-black text-stone-500 mb-2">Euros (EUR) Opcional</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">€</span><input type="number" step="0.01" min="0" value={rates.EUR} onChange={e => setRates({...rates, EUR: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold text-stone-800"/></div></div>
               <div className="relative"><label className="block text-sm font-black text-stone-500 mb-2">Tether (USDT) Opcional</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₮</span><input type="number" step="0.01" min="0" value={rates.USDT} onChange={e => setRates({...rates, USDT: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold text-stone-800"/></div></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-stone-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Guardando...' : 'Guardar Toda la Configuración'}
          </button>
        </div>

      </form>
    </div>
  );
}