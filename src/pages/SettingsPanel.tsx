import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Landmark, Save, Loader2, DollarSign, FileText, MapPin, Phone } from 'lucide-react';

const API_URL = 'https://nexora-api-psrx.onrender.com/api/settings';

export default function SettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado de la Empresa
  const [company, setCompany] = useState({
    legalName: '',
    documentId: '',
    address: '',
    phone: '',
    baseCurrency: 'USD'
  });

  // Estado de las Tasas de Cambio
  const [rates, setRates] = useState({
    VES: '',
    EUR: '',
    USDT: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('nexora_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Traer datos de empresa
      const compRes = await axios.get(`${API_URL}/company`, { headers });
      if (compRes.data.success && compRes.data.data) {
        setCompany({
          legalName: compRes.data.data.legalName || '',
          documentId: compRes.data.data.documentId || '',
          address: compRes.data.data.address || '',
          phone: compRes.data.data.phone || '',
          baseCurrency: compRes.data.data.baseCurrency || 'USD'
        });
      }

      // Traer tasas de cambio
      const ratesRes = await axios.get(`${API_URL}/exchange-rates`, { headers });
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

      // Guardar Empresa
      await axios.put(`${API_URL}/company`, company, { headers });

      // Guardar Tasas (Si tienen valor)
      const currencies = ['VES', 'EUR', 'USDT'];
      for (const curr of currencies) {
        const rateValue = parseFloat(rates[curr as keyof typeof rates]);
        if (!isNaN(rateValue) && rateValue > 0) {
          await axios.put(`${API_URL}/exchange-rates`, { currency: curr, rate: rateValue }, { headers });
        }
      }

      alert('✅ ¡Configuración guardada con éxito!');
    } catch (error) {
      console.error("Error guardando:", error);
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Configuración del Negocio</h1>
        <p className="text-stone-500 font-medium mt-1">Administra tus datos legales y tasas de cambio para la facturación.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* TARJETA 1: DATOS DE EMPRESA */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-stone-800">Perfil Legal (Facturación)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2">
                <FileText className="w-4 h-4" /> Razón Social / Nombre
              </label>
              <input 
                type="text" 
                required
                value={company.legalName}
                onChange={e => setCompany({...company, legalName: e.target.value})}
                placeholder="Ej: Inversiones Nexora C.A." 
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2">
                <Landmark className="w-4 h-4" /> RIF / NIT / Documento
              </label>
              <input 
                type="text" 
                required
                value={company.documentId}
                onChange={e => setCompany({...company, documentId: e.target.value})}
                placeholder="Ej: J-12345678-9" 
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2">
                <MapPin className="w-4 h-4" /> Dirección Fiscal
              </label>
              <input 
                type="text" 
                value={company.address}
                onChange={e => setCompany({...company, address: e.target.value})}
                placeholder="Ej: Av. Principal, Local 4..." 
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2">
                <Phone className="w-4 h-4" /> Teléfono de Contacto
              </label>
              <input 
                type="text" 
                value={company.phone}
                onChange={e => setCompany({...company, phone: e.target.value})}
                placeholder="Ej: +58 412 1234567" 
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* TARJETA 2: TASAS DE CAMBIO */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-800">Tasas de Cambio</h2>
              <p className="text-xs text-stone-400 font-bold mt-1">Basado en USD ($) como moneda principal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-black text-stone-500 mb-2">Bolívares (VES)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Bs.</span>
                <input 
                  type="number" step="0.01" min="0"
                  value={rates.VES}
                  onChange={e => setRates({...rates, VES: e.target.value})}
                  placeholder="Ej: 38.50" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold text-stone-800"
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-black text-stone-500 mb-2">Euros (EUR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">€</span>
                <input 
                  type="number" step="0.01" min="0"
                  value={rates.EUR}
                  onChange={e => setRates({...rates, EUR: e.target.value})}
                  placeholder="Ej: 0.92" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold text-stone-800"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-black text-stone-500 mb-2">Tether (USDT)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₮</span>
                <input 
                  type="number" step="0.01" min="0"
                  value={rates.USDT}
                  onChange={e => setRates({...rates, USDT: e.target.value})}
                  placeholder="Ej: 1.00" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold text-stone-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-stone-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

      </form>
    </div>
  );
}