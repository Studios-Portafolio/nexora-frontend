import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, CreditCard, Copy, Check, LogOut, MessageCircle } from 'lucide-react';

const Membership = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'2months' | '1year' | null>(null);
  const [copiedElement, setCopiedElement] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const zinliEmail = "ellocodeguanabano2@gmail.com";
  const binanceId = "751362974";
  const whatsappNumber = "584121599459";

  useEffect(() => {
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userLocal);
  }, []);

  const handleCopy = (text: string, element: string) => {
    navigator.clipboard.writeText(text);
    setCopiedElement(element);
    setTimeout(() => setCopiedElement(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openWhatsApp = () => {
    const email = user?.email || 'mi cuenta';
    const message = `¡Hola Administrador! Acabo de realizar el pago de mi plan en Nexora. El correo de mi cuenta es: ${email}. Adjunto el comprobante.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#1c1917] flex flex-col font-sans select-none pb-12 text-white">
      
      <div className="w-full bg-stone-900/50 backdrop-blur-md px-6 py-4 flex justify-between items-center z-10 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">Nexora</span>
        </div>
        <button onClick={handleLogout} className="text-stone-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 mt-16 text-center">
        
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 mb-12 animate-in fade-in zoom-in">
          <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white">
            Acceso Restringido
          </h1>
          <p className="text-lg text-rose-200 font-medium max-w-2xl mx-auto">
            Hola, {user?.name || 'usuario'}. Tu periodo de prueba gratuito de 60 días ha finalizado o tu cuenta ha sido suspendida por el administrador.
          </p>
          <p className="mt-4 text-stone-400">Para recuperar el acceso inmediato a tu inventario, por favor elige un plan de suscripción.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16 text-left">
          <div 
            onClick={() => setSelectedPlan('2months')}
            className={`relative bg-stone-900 rounded-3xl p-8 border-2 cursor-pointer transition-all duration-300 ${selectedPlan === '2months' ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-105' : 'border-stone-800 shadow-sm hover:border-stone-700'}`}
          >
            {selectedPlan === '2months' && (
              <div className="absolute -top-4 right-8 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> SELECCIONADO
              </div>
            )}
            <h3 className="text-xl font-bold text-stone-400 mb-2">Plan Básico</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-white">$10</span>
              <span className="text-stone-500 font-medium">/ 2 meses</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-stone-300 font-medium"><CheckCircle2 className="w-5 h-5 text-teal-400" /> Acceso total al inventario</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium"><CheckCircle2 className="w-5 h-5 text-teal-400" /> Reactivación instantánea</li>
            </ul>
          </div>

          <div 
            onClick={() => setSelectedPlan('1year')}
            className={`relative bg-stone-900 rounded-3xl p-8 border-2 cursor-pointer transition-all duration-300 overflow-hidden ${selectedPlan === '1year' ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-105' : 'border-stone-800 shadow-sm hover:border-stone-700'}`}
          >
            <div className="absolute -top-4 right-8 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-wide z-10">
              AHORRA $20
            </div>
            {selectedPlan === '1year' && (
              <div className="absolute -top-4 left-8 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1 z-10">
                <CheckCircle2 className="w-3 h-3" /> SELECCIONADO
              </div>
            )}
            <h3 className="text-xl font-bold text-stone-400 mb-2 relative z-10">Plan Anual</h3>
            <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <span className="text-5xl font-black text-white">$40</span>
              <span className="text-stone-500 font-medium">/ 1 año</span>
            </div>
            <ul className="space-y-4 mb-8 relative z-10">
              <li className="flex items-center gap-3 text-stone-300 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Todo lo del plan básico</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Soporte prioritario</li>
            </ul>
          </div>
        </div>

        {selectedPlan && (
          <div className="max-w-2xl mx-auto bg-stone-900 rounded-3xl p-8 shadow-xl border border-stone-800 animate-in fade-in zoom-in-95 duration-500 text-left">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-indigo-400" /> Realiza tu pago
            </h2>
            <p className="text-stone-400 mb-8 font-medium">
              Transfiere <strong className="text-white">${selectedPlan === '2months' ? '10' : '40'}</strong> a cualquiera de estos métodos.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-stone-800/50 rounded-2xl border border-stone-700">
                <div>
                  <h4 className="font-black text-white text-lg">Zinli</h4>
                  <p className="text-stone-400 font-medium mt-1 select-all">{zinliEmail}</p>
                </div>
                <button onClick={() => handleCopy(zinliEmail, 'zinli')} className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-stone-800 border border-stone-600 rounded-xl hover:bg-stone-700 transition-colors font-bold text-stone-300 text-sm">
                  {copiedElement === 'zinli' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  {copiedElement === 'zinli' ? 'Copiado' : 'Copiar Correo'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#FCD535]/5 rounded-2xl border border-[#FCD535]/20">
                <div>
                  <h4 className="font-black text-white text-lg flex items-center gap-2">Binance Pay <span className="bg-[#FCD535] text-stone-900 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">USDT</span></h4>
                  <p className="text-stone-400 font-bold mt-1">ID: <span className="text-stone-200 select-all font-black">{binanceId}</span></p>
                </div>
                <button onClick={() => handleCopy(binanceId, 'binance')} className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-stone-800 border border-stone-600 rounded-xl hover:bg-stone-700 transition-colors font-bold text-stone-300 text-sm">
                  {copiedElement === 'binance' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  {copiedElement === 'binance' ? 'Copiado' : 'Copiar ID'}
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-stone-800">
              <button onClick={openWhatsApp} className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#25D366]/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" /> Enviar comprobante al Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Membership;