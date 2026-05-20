import React from 'react';
import axios from 'axios';
import { CheckCircle2, X, QrCode, Link as LinkIcon, Download, Landmark, DollarSign, Loader2, Save, Building2, Camera, Image as ImageIcon, FileText, MapPin, Phone, Tag, Calculator } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SuscripcionesView from './SuscripcionesView';

const API_URL = 'https://nexora-api-psrx.onrender.com/api';

interface ConfiguracionViewProps {
  companyInfo: any;
  setCompanyInfo: any;
  rates: any;
  setRates: any;
  activeCategories: string[];
  newCategoryInput: string;
  setNewCategoryInput: any;
  catalogUrl: string;
  downloadQR: () => void;
  handleSaveCompanyOnly: (e?: React.FormEvent) => void;
  handleSaveRatesOnly: (e: React.FormEvent) => void;
  handleCompanyLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddCategory: () => void;
  handleRemoveCategory: (cat: string) => void;
  savingConfig: boolean;
  fetchRealTimeRates: (isManualClick?: boolean) => void; 
  isFetchingRates: boolean;
}

const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  companyInfo, setCompanyInfo, rates, setRates, activeCategories, newCategoryInput, setNewCategoryInput,
  catalogUrl, downloadQR, handleSaveCompanyOnly, handleSaveRatesOnly, handleCompanyLogoUpload,
  handleAddCategory, handleRemoveCategory, savingConfig, fetchRealTimeRates, isFetchingRates
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Ajustes de Nexora</h1>
        <button 
          type="button"
          onClick={async () => {
            const newState = !companyInfo.isOpen;
            setCompanyInfo({...companyInfo, isOpen: newState});
            try {
              const token = sessionStorage.getItem('nexora_token');
              await axios.put(`${API_URL}/settings/company`, { isOpen: newState }, { headers: { Authorization: `Bearer ${token}` } });
            } catch(e) {}
          }}
          className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${companyInfo.isOpen ? 'bg-teal-500 text-white shadow-teal-500/20 hover:bg-teal-600' : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'}`}
        >
          {companyInfo.isOpen ? <><CheckCircle2 className="w-5 h-5"/> TIENDA ONLINE ABIERTA</> : <><X className="w-5 h-5"/> TIENDA ONLINE CERRADA</>}
        </button>
      </div>
      
      {/* TARJETA QR PROFESIONAL */}
      <div className="mb-6 bg-gradient-to-br from-indigo-900 to-violet-900 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
            <QrCode className="w-6 h-6 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Mi E-Commerce Digital</h2>
          <p className="text-indigo-200 text-sm mb-6 leading-relaxed max-w-md">
            Tus clientes pueden escanear este código QR o usar el link para ver tu inventario en tiempo real y hacer pedidos directos al WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button 
              onClick={() => { navigator.clipboard.writeText(catalogUrl); alert("¡Link copiado al portapapeles!"); }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" /> Copiar Link
            </button>
            <button 
              onClick={downloadQR}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Descargar QR Profesional
            </button>
          </div>
        </div>
        
        {/* Contenedor visual del QR */}
        <div className="bg-white p-6 rounded-3xl shadow-2xl z-10 flex-shrink-0 flex flex-col items-center border-4 border-indigo-500/20">
          <h3 className="text-stone-900 font-black tracking-tight mb-3 text-lg">{companyInfo.name || 'Nexora Store'}</h3>
          <QRCodeSVG id="catalog-qr" value={catalogUrl} size={160} bgColor={"#ffffff"} fgColor={"#1c1c1e"} level={"H"} includeMargin={false} imageSettings={{ src: companyInfo.logo || '', height: 35, width: 35, excavate: true }} />
          <p className="text-stone-500 font-bold text-[10px] uppercase tracking-widest mt-4 text-center w-full">Escanea para comprar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Landmark className="w-6 h-6" /></div>
              <h2 className="text-xl font-black text-stone-800">Cuentas y Envíos</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-500 mb-2 uppercase tracking-widest">Datos de Pago Móvil / Zelle / Efectivo</label>
                <textarea className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-medium text-sm h-24 outline-none focus:ring-2 focus:ring-orange-500" value={companyInfo.paymentData || ''} onChange={(e) => setCompanyInfo({...companyInfo, paymentData: e.target.value})} placeholder="Ej: Pago Móvil: 0412-1234567 / V-1234567 / Banesco. Zelle: pagos@miempresa.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-stone-500 mb-2 uppercase tracking-widest">Compra Mínima ($)</label><input type="number" step="0.5" className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-black text-stone-800 outline-none focus:ring-2 focus:ring-orange-500" value={companyInfo.minOrder} onChange={(e) => setCompanyInfo({...companyInfo, minOrder: parseFloat(e.target.value) || 0})} /></div>
                <div><label className="block text-[10px] font-black text-stone-500 mb-2 uppercase tracking-widest">Nota de Delivery</label><input type="text" className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-orange-500" value={companyInfo.deliveryNote || ''} onChange={(e) => setCompanyInfo({...companyInfo, deliveryNote: e.target.value})} placeholder="Ej: Delivery gratis en la zona" /></div>
              </div>
              <div><label className="block text-[10px] font-black text-stone-500 mb-2 uppercase tracking-widest">Banner Promocional</label><input type="text" className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-orange-500" value={companyInfo.catalogMessage || ''} onChange={(e) => setCompanyInfo({...companyInfo, catalogMessage: e.target.value})} placeholder="Ej: ¡Descuento pagando en divisas!" /></div>
            </div>
          </div>
          <button onClick={handleSaveCompanyOnly} disabled={savingConfig} className="mt-6 w-full py-3 bg-stone-900 text-white rounded-xl font-black text-sm active:scale-95 transition-all flex justify-center items-center gap-2">
            {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Ajustes</>}
          </button>
        </div>

        {/* TASAS DE CAMBIO REDISEÑADAS */}
        <form onSubmit={handleSaveRatesOnly} className="bg-white rounded-[24px] md:rounded-[32px] p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><Calculator className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-black text-stone-800">Tasa de Cambio en Catálogo</h2><p className="text-xs text-stone-400 font-bold mt-1">Registra la tasa exacta para cobrar</p></div>
            </div>
            
            {/* Referencias visuales (Solo lectura) */}
            <div className="flex gap-2 mb-5 bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <div className="flex-1 text-center border-r border-stone-200">
                <p className="text-[10px] font-black text-stone-400 uppercase">Referencia BCV</p>
                <p className="font-bold text-stone-700 text-sm">{rates.BCV ? `Bs. ${rates.BCV}` : '---'}</p>
              </div>
              <div className="flex-1 text-center border-r border-stone-200">
                <p className="text-[10px] font-black text-stone-400 uppercase">Ref. USDT</p>
                <p className="font-bold text-stone-700 text-sm">{rates.USDT ? `₮ ${rates.USDT}` : '---'}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[10px] font-black text-stone-400 uppercase">Ref. EUR</p>
                <p className="font-bold text-stone-700 text-sm">{rates.EUR ? `€ ${rates.EUR}` : '---'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[11px] font-black text-teal-600 mb-2 uppercase tracking-widest bg-teal-50 inline-block px-2 py-1 rounded-md">Tasa Manual Aplicada (Bolívares)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-black text-lg">Bs.</span>
                  {/* Se usa rates.BCV como el valor principal para cobrar */}
                  <input type="number" step="0.01" min="0" value={rates.BCV || ''} onChange={e => setRates({...rates, BCV: parseFloat(e.target.value) || 0})} className="w-full bg-white border-2 border-stone-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 font-black text-stone-800 text-xl transition-all shadow-sm" placeholder="Ej: 42.50"/>
                </div>
                <p className="text-[10px] text-stone-500 font-medium mt-2 leading-relaxed">Este es el monto exacto en bolívares por el que se multiplicarán los precios en dólares dentro del catálogo web.</p>
              </div>
            </div>
          </div>
          <button type="submit" disabled={savingConfig} className="mt-6 w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3.5 rounded-xl font-black shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all disabled:opacity-50 text-sm">
            {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Registrar Tasa en Catálogo</>}
          </button>
        </form>
      </div>

      {/* El resto del código (Perfil Legal y Categorías) se mantiene igual */}
      <form onSubmit={handleSaveCompanyOnly} className="mb-6 bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm border border-stone-200">
        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
          <h2 className="text-xl font-black text-stone-800">Perfil Legal (Facturación)</h2>
        </div>
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-3"><Camera className="w-4 h-4" /> Logo de la Empresa (PNG/JPG)</label>
          <div className="flex items-center gap-4">
             <div className="w-20 h-20 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                {companyInfo.logo ? <img src={companyInfo.logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <ImageIcon className="w-8 h-8 text-stone-300" />}
             </div>
             <label className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-xl font-bold cursor-pointer active:scale-95 transition-all text-xs md:text-sm hover:bg-stone-50 shadow-sm">
                Seleccionar Imagen
                <input type="file" accept="image/*" className="hidden" onChange={handleCompanyLogoUpload} />
             </label>
             {companyInfo.logo && <button type="button" onClick={() => setCompanyInfo({...companyInfo, logo: ''})} className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl">Quitar</button>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><FileText className="w-4 h-4" /> Razón Social / Nombre</label><input type="text" required value={companyInfo.name} onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})} placeholder="Ej: Inversiones Nexora C.A." className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"/></div>
          <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><Landmark className="w-4 h-4" /> RIF / NIT / Documento</label><input type="text" required value={companyInfo.rif} onChange={e => setCompanyInfo({...companyInfo, rif: e.target.value})} placeholder="Ej: J-12345678-9" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"/></div>
          <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><MapPin className="w-4 h-4" /> Dirección Fiscal</label><input type="text" value={companyInfo.address} onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})} placeholder="Ej: Av. Principal..." className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"/></div>
          <div><label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-2"><Phone className="w-4 h-4" /> Teléfono de Contacto</label><input type="text" value={companyInfo.phone} onChange={e => setCompanyInfo({...companyInfo, phone: e.target.value})} placeholder="Ej: +58 412 1234567" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"/></div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={savingConfig} className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-stone-800 transition-all disabled:opacity-50">
            {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Perfil Legal
          </button>
        </div>
      </form>

      <div className="bg-white border border-stone-200 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm mb-6">
        <h2 className="text-lg md:text-xl font-black text-stone-900 mb-3 md:mb-4 flex items-center"><Tag className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-indigo-500" /> Clasificación Global de Inventario</h2>
        <div className="flex space-x-2 md:space-x-3 mb-4 md:mb-6"><input type="text" placeholder="Nueva categoría..." value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} className="flex-1 px-4 md:px-5 py-2.5 md:py-3.5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm" /><button onClick={handleAddCategory} className="bg-stone-900 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm active:scale-95">Crear</button></div>
        <div className="flex flex-wrap gap-2 md:gap-2.5 max-h-40 md:max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden bg-stone-50 p-3 md:p-4 rounded-[20px] md:rounded-[24px] border border-stone-100">
          {activeCategories.map((cat, idx) => (<span key={idx} className="flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-white border border-stone-200 rounded-lg md:rounded-xl text-xs md:text-sm font-black text-stone-700 shadow-sm">{cat} <button onClick={() => handleRemoveCategory(cat)} className="ml-2 md:ml-3 text-stone-400 hover:text-rose-500 p-0.5 md:p-1"><X className="w-3 h-3 md:w-4 md:h-4" /></button></span>))}
        </div>
      </div>

      <SuscripcionesView rates={rates} isFetchingRates={isFetchingRates} fetchRealTimeRates={fetchRealTimeRates} />
    </div>
  );
};

export default ConfiguracionView;