import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, CheckCircle2, CreditCard, Copy, Check, LogOut, MessageCircle, RefreshCw } from 'lucide-react';

const Membership = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '6months' | '1year' | null>(null);
  const [copiedElement, setCopiedElement] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [euroRate, setEuroRate] = useState<number>(0);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  // 🔥 DATOS ACTUALIZADOS DE PAGO MÓVIL Y BINANCE 🔥
  const zinliEmail = "ellocodeguanabano2@gmail.com";
  const binanceId = "751362974";
  const pagoMovilData = "Banco: Banco de Venezuela (0102)\nCédula: V-30.112.308\nTeléfono: 0412-1599459"; 
  const whatsappNumber = "584121599459";

  useEffect(() => {
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userLocal);
    fetchEuroRate();
  }, []);

  const fetchEuroRate = async () => {
    setIsFetchingRate(true);
    try {
      const res = await axios.get('https://ve.dolarapi.com/v1/euros');
      const oficial = res.data.find((d: any) => d.fuente === 'oficial' || d.nombre.toLowerCase().includes('oficial'));
      if (oficial) {
        setEuroRate(parseFloat(oficial.promedio));
      }
    } catch (error) {
      console.error("Error buscando tasa del Euro:", error);
    } finally {
      setIsFetchingRate(false);
    }
  };

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

  const getPlanPrice = () => {
    if (selectedPlan === '1month') return 10;
    if (selectedPlan === '6months') return 40;
    if (selectedPlan === '1year') return 90;
    return 0;
  };

  const getBsAmount = () => {
    const usdPrice = getPlanPrice();
    return (usdPrice * euroRate).toFixed(2);
  };

  const openWhatsApp = () => {
    const email = user?.email || 'mi cuenta';
    const planName = selectedPlan === '1month' ? '1 Mes' : selectedPlan === '6months' ? '6 Meses' : '1 Año';
    const amount = getPlanPrice();
    const message = `¡Hola Administrador! Acabo de realizar el pago por el Plan de ${planName} ($${amount}) en Nexora.\n\nEl correo de mi cuenta es: ${email}.\n\nAdjunto el comprobante:`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#1c1917] flex flex-col font-sans select-none pb-12 text-white overflow-x-hidden">
      
      <div className="w-full bg-stone-900/50 backdrop-blur-md px-4 md:px-6 py-4 flex justify-between items-center z-10 border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">Nexora</span>
        </div>
        <button onClick={handleLogout} className="text-stone-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-stone-800/50 px-3 py-1.5 rounded-lg border border-white/5 active:scale-95">
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 mt-8 md:mt-12 text-center">
        
        <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/20 rounded-[32px] p-6 md:p-10 mb-8 md:mb-12 animate-in fade-in zoom-in">
          <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-rose-500/30">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-white">
            Acceso Restringido
          </h1>
          <p className="text-base md:text-lg text-rose-200/80 font-medium max-w-2xl mx-auto leading-relaxed">
            Hola, <strong className="text-white">{user?.name || 'usuario'}</strong>. Tu periodo de prueba gratuito ha finalizado o tu cuenta se encuentra suspendida.
          </p>
          <div className="mt-6 inline-flex items-center justify-center bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
             <p className="text-stone-300 text-sm font-bold">Elige un plan de suscripción para recuperar tu inventario.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-12 text-left">
          
          {/* 1 Mes */}
          <div 
            onClick={() => setSelectedPlan('1month')}
            className={`relative bg-stone-900 rounded-[28px] p-6 md:p-8 border-2 cursor-pointer transition-all duration-300 ${selectedPlan === '1month' ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 md:scale-105 bg-gradient-to-b from-stone-900 to-indigo-900/10' : 'border-stone-800 shadow-sm hover:border-stone-700'}`}
          >
            {selectedPlan === '1month' && (
              <div className="absolute -top-3.5 right-6 md:right-8 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest flex items-center gap-1 shadow-lg shadow-indigo-500/30">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> SELECCIONADO
              </div>
            )}
            <h3 className="text-lg md:text-xl font-bold text-stone-400 mb-2">Mensual</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl md:text-5xl font-black text-white">$10</span>
              <span className="text-stone-500 font-bold text-sm">/ 1 mes</span>
            </div>
            <ul className="space-y-3.5 mb-2">
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" /> Acceso total</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" /> Reactivación inmediata</li>
            </ul>
          </div>

          {/* 6 Meses */}
          <div 
            onClick={() => setSelectedPlan('6months')}
            className={`relative bg-stone-900 rounded-[28px] p-6 md:p-8 border-2 cursor-pointer transition-all duration-300 overflow-hidden ${selectedPlan === '6months' ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 md:scale-105 bg-gradient-to-b from-stone-900 to-indigo-900/10' : 'border-indigo-500/30 shadow-sm hover:border-indigo-500/50'}`}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest z-10 shadow-lg shadow-indigo-500/30 whitespace-nowrap">
              MÁS POPULAR
            </div>
            {selectedPlan === '6months' && (
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full z-0 pointer-events-none"></div>
            )}
            <h3 className="text-lg md:text-xl font-bold text-indigo-400 mb-2 relative z-10">Semestral</h3>
            <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <span className="text-4xl md:text-5xl font-black text-white">$40</span>
              <span className="text-stone-500 font-bold text-sm">/ 6 meses</span>
            </div>
            <ul className="space-y-3.5 mb-2 relative z-10">
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Ahorras $20</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Soporte IA</li>
            </ul>
          </div>

          {/* 1 Año */}
          <div 
            onClick={() => setSelectedPlan('1year')}
            className={`relative bg-stone-900 rounded-[28px] p-6 md:p-8 border-2 cursor-pointer transition-all duration-300 ${selectedPlan === '1year' ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 md:scale-105 bg-gradient-to-b from-stone-900 to-indigo-900/10' : 'border-amber-500/30 shadow-sm hover:border-amber-500/50'}`}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest z-10 shadow-lg shadow-amber-500/30 whitespace-nowrap">
              AHORRA $30
            </div>
            <h3 className="text-lg md:text-xl font-bold text-amber-400 mb-2 relative z-10">Anual</h3>
            <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <span className="text-4xl md:text-5xl font-black text-white">$90</span>
              <span className="text-stone-500 font-bold text-sm">/ 1 año</span>
            </div>
            <ul className="space-y-3.5 mb-2 relative z-10">
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /> 3 meses gratis</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /> Soporte Prioritario</li>
            </ul>
          </div>
        </div>

        {selectedPlan && (
          <div className="max-w-3xl mx-auto bg-stone-900 rounded-[32px] p-6 md:p-10 shadow-2xl border border-stone-800 animate-in fade-in zoom-in-95 duration-500 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-6">
               <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                 <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" /> Realiza tu pago
               </h2>
               <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl inline-flex items-center gap-2">
                 <span className="text-indigo-200 text-sm font-medium">Total a pagar:</span>
                 <span className="text-2xl font-black text-white">${getPlanPrice()}</span>
               </div>
            </div>

            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-stone-800/50 rounded-2xl border border-stone-700">
                <div>
                  <h4 className="font-black text-white text-base md:text-lg flex items-center gap-2">Zinli</h4>
                  <p className="text-stone-400 font-medium mt-1 select-all text-sm md:text-base">{zinliEmail}</p>
                </div>
                <button onClick={() => handleCopy(zinliEmail, 'zinli')} className="mt-4 sm:mt-0 flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 bg-stone-800 border border-stone-600 rounded-xl hover:bg-stone-700 transition-colors font-bold text-stone-300 text-sm active:scale-95">
                  {copiedElement === 'zinli' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  {copiedElement === 'zinli' ? 'Copiado' : 'Copiar Correo'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#FCD535]/5 rounded-2xl border border-[#FCD535]/20">
                <div>
                  <h4 className="font-black text-white text-base md:text-lg flex items-center gap-2">Binance Pay <span className="bg-[#FCD535] text-stone-900 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">USDT</span></h4>
                  <p className="text-stone-400 font-bold mt-1 text-sm md:text-base">ID: <span className="text-stone-200 select-all font-black tracking-wider">{binanceId}</span></p>
                </div>
                <button onClick={() => handleCopy(binanceId, 'binance')} className="mt-4 sm:mt-0 flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 bg-stone-800 border border-stone-600 rounded-xl hover:bg-stone-700 transition-colors font-bold text-stone-300 text-sm active:scale-95">
                  {copiedElement === 'binance' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  {copiedElement === 'binance' ? 'Copiado' : 'Copiar ID'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-teal-500/5 rounded-2xl border border-teal-500/20 relative overflow-hidden">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-black text-white text-base md:text-lg flex items-center gap-2">Pago Móvil <span className="bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">BCV EURO</span></h4>
                     <button onClick={fetchEuroRate} className="text-teal-400 hover:text-teal-300 bg-teal-500/10 p-1.5 rounded-lg transition-colors">
                        <RefreshCw className={`w-4 h-4 ${isFetchingRate ? 'animate-spin' : ''}`} />
                     </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-stone-300 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                      {pagoMovilData}
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 border border-teal-500/10 flex flex-col justify-center">
                       <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Monto a Transferir</p>
                       <p className="text-2xl font-black text-teal-400">Bs. {euroRate > 0 ? getBsAmount() : '---'}</p>
                       <p className="text-[10px] text-stone-500 mt-1 font-medium">Tasa BCV: Bs. {euroRate.toFixed(2)} / €</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-sm font-medium text-stone-400 mb-4">Una vez realizado el pago a cualquiera de las plataformas, envía el comprobante.</p>
              <button onClick={openWhatsApp} className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-2xl font-black text-base md:text-lg shadow-xl shadow-[#25D366]/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10">
                <MessageCircle className="w-6 h-6" /> Notificar Pago al Administrador
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Membership;