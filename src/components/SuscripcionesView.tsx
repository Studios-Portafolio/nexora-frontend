import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Check, Copy, RefreshCw, MessageCircle, Sparkles } from 'lucide-react';

interface SuscripcionesViewProps {
  rates: { EUR: number; [key: string]: number };
  isFetchingRates: boolean;
  fetchRealTimeRates: (isManualClick?: boolean) => void;
}

const SuscripcionesView: React.FC<SuscripcionesViewProps> = ({ rates, isFetchingRates, fetchRealTimeRates }) => {
  const [selectedSubPlan, setSelectedSubPlan] = useState<'1month' | '6months' | '1year' | null>(null);
  const [copiedElement, setCopiedElement] = useState<string | null>(null);

  // Datos fijos de pago
  const zinliEmail = "ellocodeguanabano2@gmail.com";
  const binanceId = "751362974";
  const pagoMovilData = "Banco: Banco de Venezuela (0102)\nCédula: V-30.112.308\nTeléfono: 0412-1599459"; 
  const whatsappNumber = "584121599459";

  const handleCopyPayment = (text: string, element: string) => {
    navigator.clipboard.writeText(text);
    setCopiedElement(element);
    setTimeout(() => setCopiedElement(null), 2000);
  };

  const openWhatsAppPayment = (planName: string, amount: number) => {
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    const email = userLocal?.email || 'mi cuenta';
    const message = `¡Hola Administrador! Acabo de realizar el pago por el Plan de ${planName} ($${amount}) en Nexora.\n\nEl correo de mi cuenta es: ${email}.\n\nAdjunto el comprobante:`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-[#1c1c1e] rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-xl mb-6 text-white border border-[#2c2c2e]">
      <div className="mb-6 md:mb-8 text-center sm:text-left">
        <h2 className="text-xl md:text-2xl font-black mb-2 flex items-center justify-center sm:justify-start">
          <Sparkles className="w-6 h-6 mr-2 text-violet-400" /> Planes de Suscripción
        </h2>
        <p className="text-stone-400 text-sm font-medium">Elige un plan para recuperar tu inventario y continuar facturando.</p>
      </div>
      
      <div className="flex flex-col gap-4">
         {/* --- PLAN MENSUAL --- */}
         <div onClick={() => setSelectedSubPlan(selectedSubPlan === '1month' ? null : '1month')} className={`rounded-[24px] border-2 transition-all duration-300 overflow-hidden cursor-pointer relative p-6 flex flex-col sm:flex-row sm:items-center justify-between ${selectedSubPlan === '1month' ? 'border-violet-500 bg-[#2c2c2e]' : 'border-[#2c2c2e] bg-[#1c1c1e] hover:border-stone-600'}`}>
            {selectedSubPlan === '1month' && <span className="absolute -top-1 right-6 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-b-lg uppercase tracking-widest shadow-[0_0_15px_rgba(124,58,237,0.5)]">Seleccionado</span>}
            <div>
              <p className="font-bold text-stone-400 text-sm mb-1">Mensual</p>
              <p className="text-4xl font-black flex items-baseline gap-1">$10 <span className="text-sm font-bold text-stone-500">/ 1 mes</span></p>
              <div className="mt-4 space-y-2">
                <p className="flex items-center text-sm font-bold text-stone-300"><CheckCircle2 className="w-4 h-4 mr-2 text-teal-400"/> Acceso total</p>
                <p className="flex items-center text-sm font-bold text-stone-300"><CheckCircle2 className="w-4 h-4 mr-2 text-teal-400"/> Reactivación inmediata</p>
              </div>
            </div>
         </div>
         
         {/* ACORDEÓN INYECTADO: MENSUAL */}
         {selectedSubPlan === '1month' && (
           <div className="p-6 bg-[#151515] border border-[#2c2c2e] rounded-[24px] animate-in slide-in-from-top-4 duration-300 mb-2">
              <h3 className="font-black text-stone-200 mb-4 flex items-center"><CreditCard className="w-4 h-4 mr-2 text-violet-400"/> Realiza tu pago</h3>
              <div className="space-y-3">
                 <div className="p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                   <div><h4 className="font-black text-sm">Zinli</h4><p className="text-stone-400 font-medium mt-0.5 text-xs select-all">{zinliEmail}</p></div>
                   <button onClick={() => handleCopyPayment(zinliEmail, 'zinli')} className="mt-3 sm:mt-0 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-xl text-xs font-bold transition-all flex items-center w-full sm:w-auto justify-center">{copiedElement === 'zinli' ? <Check className="w-4 h-4 text-teal-400 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>} {copiedElement === 'zinli' ? 'Copiado' : 'Copiar Correo'}</button>
                 </div>
                 <div className="p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                   <div><h4 className="font-black text-sm flex items-center gap-2">Binance Pay <span className="bg-[#FCD535] text-stone-900 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">USDT</span></h4><p className="text-stone-400 font-medium mt-0.5 text-xs">ID: <span className="select-all text-white font-bold">{binanceId}</span></p></div>
                   <button onClick={() => handleCopyPayment(binanceId, 'binance')} className="mt-3 sm:mt-0 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-xl text-xs font-bold transition-all flex items-center w-full sm:w-auto justify-center">{copiedElement === 'binance' ? <Check className="w-4 h-4 text-teal-400 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>} {copiedElement === 'binance' ? 'Copiado' : 'Copiar ID'}</button>
                 </div>
                 <div className="p-4 bg-[#101f1c] rounded-[16px] border border-teal-900/50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-sm flex items-center gap-2">Pago Móvil <span className="bg-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase">BCV EURO</span></h4>
                      <button onClick={() => fetchRealTimeRates(true)} className="text-teal-400 hover:text-teal-300 p-1"><RefreshCw className={`w-4 h-4 ${isFetchingRates ? 'animate-spin' : ''}`} /></button>
                    </div>
                    <div className="text-stone-300 font-medium text-xs leading-relaxed whitespace-pre-wrap mb-4">{pagoMovilData}</div>
                    <div className="bg-[#0a1412] rounded-xl p-3 border border-teal-900/30">
                      <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Monto a Transferir</p>
                      <p className="text-xl font-black text-teal-400">Bs. {rates.EUR > 0 ? (10 * rates.EUR).toFixed(2) : '---'}</p>
                      <p className="text-[9px] text-stone-500 mt-1">Tasa: Bs. {rates.EUR.toFixed(2)} / €</p>
                    </div>
                 </div>
              </div>
              <button onClick={() => openWhatsAppPayment('1 Mes', 10)} className="w-full mt-4 py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-stone-900 rounded-[16px] font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all active:scale-95">
                <MessageCircle className="w-5 h-5" /> Informar pago por WhatsApp
              </button>
           </div>
         )}

         {/* --- PLAN SEMESTRAL --- */}
         <div onClick={() => setSelectedSubPlan(selectedSubPlan === '6months' ? null : '6months')} className={`rounded-[24px] border-2 transition-all duration-300 overflow-hidden cursor-pointer relative p-6 flex flex-col sm:flex-row sm:items-center justify-between ${selectedSubPlan === '6months' ? 'border-violet-500 bg-[#2c2c2e]' : 'border-[#2c2c2e] bg-[#1c1c1e] hover:border-stone-600'}`}>
            {selectedSubPlan === '6months' && <span className="absolute -top-1 right-6 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-b-lg uppercase tracking-widest shadow-[0_0_15px_rgba(124,58,237,0.5)]">Seleccionado</span>}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-4 py-1 rounded-b-lg uppercase tracking-widest shadow-sm">Más Popular</span>
            <div className="pt-2">
              <p className="font-bold text-violet-400 text-sm mb-1">Semestral</p>
              <p className="text-4xl font-black flex items-baseline gap-1">$40 <span className="text-sm font-bold text-stone-500">/ 6 meses</span></p>
              <div className="mt-4 space-y-2">
                <p className="flex items-center text-sm font-bold text-stone-300"><CheckCircle2 className="w-4 h-4 mr-2 text-violet-400"/> Ahorras $20</p>
                <p className="flex items-center text-sm font-bold text-stone-300"><CheckCircle2 className="w-4 h-4 mr-2 text-violet-400"/> Soporte IA</p>
              </div>
            </div>
         </div>
         
         {/* ACORDEÓN INYECTADO: SEMESTRAL */}
         {selectedSubPlan === '6months' && (
           <div className="p-6 bg-[#151515] border border-[#2c2c2e] rounded-[24px] animate-in slide-in-from-top-4 duration-300 mb-2">
              <h3 className="font-black text-stone-200 mb-4 flex items-center"><CreditCard className="w-4 h-4 mr-2 text-violet-400"/> Realiza tu pago</h3>
              <div className="space-y-3">
                 <div className="p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                   <div><h4 className="font-black text-sm">Zinli</h4><p className="text-stone-400 font-medium mt-0.5 text-xs select-all">{zinliEmail}</p></div>
                   <button onClick={() => handleCopyPayment(zinliEmail, 'zinli')} className="mt-3 sm:mt-0 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-xl text-xs font-bold transition-all flex items-center w-full sm:w-auto justify-center">{copiedElement === 'zinli' ? <Check className="w-4 h-4 text-teal-400 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>} {copiedElement === 'zinli' ? 'Copiado' : 'Copiar Correo'}</button>
                 </div>
                 <div className="p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                   <div><h4 className="font-black text-sm flex items-center gap-2">Binance Pay <span className="bg-[#FCD535] text-stone-900 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">USDT</span></h4><p className="text-stone-400 font-medium mt-0.5 text-xs">ID: <span className="select-all text-white font-bold">{binanceId}</span></p></div>
                   <button onClick={() => handleCopyPayment(binanceId, 'binance')} className="mt-3 sm:mt-0 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-xl text-xs font-bold transition-all flex items-center w-full sm:w-auto justify-center">{copiedElement === 'binance' ? <Check className="w-4 h-4 text-teal-400 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>} {copiedElement === 'binance' ? 'Copiado' : 'Copiar ID'}</button>
                 </div>
                 <div className="p-4 bg-[#101f1c] rounded-[16px] border border-teal-900/50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-sm flex items-center gap-2">Pago Móvil <span className="bg-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase">BCV EURO</span></h4>
                      <button onClick={() => fetchRealTimeRates(true)} className="text-teal-400 hover:text-teal-300 p-1"><RefreshCw className={`w-4 h-4 ${isFetchingRates ? 'animate-spin' : ''}`} /></button>
                    </div>
                    <div className="text-stone-300 font-medium text-xs leading-relaxed whitespace-pre-wrap mb-4">{pagoMovilData}</div>
                    <div className="bg-[#0a1412] rounded-xl p-3 border border-teal-900/30">
                      <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Monto a Transferir</p>
                      <p className="text-xl font-black text-teal-400">Bs. {rates.EUR > 0 ? (40 * rates.EUR).toFixed(2) : '---'}</p>
                      <p className="text-[9px] text-stone-500 mt-1">Tasa: Bs. {rates.EUR.toFixed(2)} / €</p>
                    </div>
                 </div>
              </div>
              <button onClick={() => openWhatsAppPayment('6 Meses', 40)} className="w-full mt-4 py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-stone-900 rounded-[16px] font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all active:scale-95">
                <MessageCircle className="w-5 h-5" /> Informar pago por WhatsApp
              </button>
           </div>
         )}

         {/* --- PLAN ANUAL --- */}
         <div onClick={() => setSelectedSubPlan(selectedSubPlan === '1year' ? null : '1year')} className={`rounded-[24px] border-2 transition-all duration-300 overflow-hidden cursor-pointer relative p-6 pt-8 flex flex-col sm:flex-row sm:items-center justify-between ${selectedSubPlan === '1year' ? 'border-amber-500 bg-[#2c2c2e]' : 'border-[#2c2c2e] bg-[#1c1c1e] hover:border-stone-600'}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-4 py-1 rounded-b-lg uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.5)]">Ahorra $30</div>
            {selectedSubPlan === '1year' && <span className="absolute -top-1 right-6 bg-amber-500 text-stone-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.5)]">Seleccionado</span>}
            <div>
              <p className="font-bold text-amber-400 text-sm mb-1">Anual</p>
              <p className="text-4xl font-black flex items-baseline gap-1">$90 <span className="text-sm font-bold text-stone-500">/ 1 año</span></p>
              <div className="mt-4 space-y-2">
                <p className="flex items-center text-sm font-bold text-stone-300"><CheckCircle2 className="w-4 h-4 mr-2 text-amber-400"/> 3 meses gratis</p>
                <p className="flex items-center text-sm font-bold text-stone-300"><CheckCircle2 className="w-4 h-4 mr-2 text-amber-400"/> Soporte Prioritario</p>
              </div>
            </div>
         </div>
         
         {/* ACORDEÓN INYECTADO: ANUAL */}
         {selectedSubPlan === '1year' && (
           <div className="p-6 bg-[#151515] border border-[#2c2c2e] rounded-[24px] animate-in slide-in-from-top-4 duration-300">
              <h3 className="font-black text-stone-200 mb-4 flex items-center"><CreditCard className="w-4 h-4 mr-2 text-amber-400"/> Realiza tu pago</h3>
              <div className="space-y-3">
                 <div className="p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                   <div><h4 className="font-black text-sm">Zinli</h4><p className="text-stone-400 font-medium mt-0.5 text-xs select-all">{zinliEmail}</p></div>
                   <button onClick={() => handleCopyPayment(zinliEmail, 'zinli')} className="mt-3 sm:mt-0 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-xl text-xs font-bold transition-all flex items-center w-full sm:w-auto justify-center">{copiedElement === 'zinli' ? <Check className="w-4 h-4 text-teal-400 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>} {copiedElement === 'zinli' ? 'Copiado' : 'Copiar Correo'}</button>
                 </div>
                 <div className="p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                   <div><h4 className="font-black text-sm flex items-center gap-2">Binance Pay <span className="bg-[#FCD535] text-stone-900 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">USDT</span></h4><p className="text-stone-400 font-medium mt-0.5 text-xs">ID: <span className="select-all text-white font-bold">{binanceId}</span></p></div>
                   <button onClick={() => handleCopyPayment(binanceId, 'binance')} className="mt-3 sm:mt-0 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-xl text-xs font-bold transition-all flex items-center w-full sm:w-auto justify-center">{copiedElement === 'binance' ? <Check className="w-4 h-4 text-teal-400 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>} {copiedElement === 'binance' ? 'Copiado' : 'Copiar ID'}</button>
                 </div>
                 <div className="p-4 bg-[#101f1c] rounded-[16px] border border-teal-900/50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-sm flex items-center gap-2">Pago Móvil <span className="bg-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase">BCV EURO</span></h4>
                      <button onClick={() => fetchRealTimeRates(true)} className="text-teal-400 hover:text-teal-300 p-1"><RefreshCw className={`w-4 h-4 ${isFetchingRates ? 'animate-spin' : ''}`} /></button>
                    </div>
                    <div className="text-stone-300 font-medium text-xs leading-relaxed whitespace-pre-wrap mb-4">{pagoMovilData}</div>
                    <div className="bg-[#0a1412] rounded-xl p-3 border border-teal-900/30">
                      <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Monto a Transferir</p>
                      <p className="text-xl font-black text-teal-400">Bs. {rates.EUR > 0 ? (90 * rates.EUR).toFixed(2) : '---'}</p>
                      <p className="text-[9px] text-stone-500 mt-1">Tasa: Bs. {rates.EUR.toFixed(2)} / €</p>
                    </div>
                 </div>
              </div>
              <button onClick={() => openWhatsAppPayment('1 Año', 90)} className="w-full mt-4 py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-stone-900 rounded-[16px] font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all active:scale-95">
                <MessageCircle className="w-5 h-5" /> Informar pago por WhatsApp
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default SuscripcionesView;