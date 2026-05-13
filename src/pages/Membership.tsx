import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ShieldAlert, CheckCircle2, CreditCard, Copy, Check, LogOut, MessageCircle, RefreshCw, Headphones, X, Send, AlertOctagon, Clock, Rocket } from 'lucide-react';

const API_URL = 'https://nexora-api-psrx.onrender.com/api';
const SOCKET_URL = 'https://nexora-api-psrx.onrender.com';

const Membership = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '6months' | '1year' | null>(null);
  const [copiedElement, setCopiedElement] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [euroRate, setEuroRate] = useState<number>(0);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  // ⚡ ESTADO DE ACTUALIZACIÓN FORZADA ⚡
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const zinliEmail = "ellocodeguanabano2@gmail.com";
  const binanceId = "751362974";
  const pagoMovilData = "Banco: Banco de Venezuela (0102)\nCédula: V-30.112.308\nTeléfono: 0412-1599459"; 
  const whatsappNumber = "584121599459";

  useEffect(() => {
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userLocal);
    fetchEuroRate();

    if (userLocal?.id) {
      const socket = io(SOCKET_URL);
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('🟢 [CLIENTE] Socket conectado al servidor. Entrando a sala de usuario...');
        socket.emit('join_chat', userLocal.id);
      });
      
      socket.on('receive_message', (data: any) => {
        setChatMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      });

      // ⚡ ESCUCHAR LA ORDEN DE ACTUALIZACIÓN DEL DIOS ADMIN ⚡
      socket.on('force_update', (data: any) => {
        console.log("🚀 ORDEN DE ACTUALIZACIÓN RECIBIDA");
        // Muestra el banner bonito en vez de recargar automáticamente
        setUpdateMessage(data.message);
      });

      fetchChatHistory(userLocal.id);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const fetchChatHistory = async (userId: string) => {
    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/chat/messages/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setChatMessages(res.data.data);
    } catch (err) { console.error("Error cargando historial de chat"); }
  };

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user?.id) return;
    
    setIsSending(true);
    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.post(`${API_URL}/chat/messages`, 
        { userId: user.id, content: chatInput.trim(), isAdmin: false }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        socketRef.current.emit('send_message', res.data.data);
        setChatInput('');
      }
    } catch (err) {
      alert("Error al enviar mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  const fetchEuroRate = async () => {
    setIsFetchingRate(true);
    try {
      const res = await axios.get('https://ve.dolarapi.com/v1/euros');
      const oficial = res.data.find((d: any) => d.fuente === 'oficial' || d.nombre.toLowerCase().includes('oficial'));
      if (oficial) setEuroRate(parseFloat(oficial.promedio));
    } catch (error) { console.error("Error buscando tasa"); } 
    finally { setIsFetchingRate(false); }
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

  const openWhatsApp = (planName: string, amount: number) => {
    const email = user?.email || 'mi cuenta';
    const message = `¡Hola Administrador! Acabo de realizar el pago por el Plan de ${planName} ($${amount}) en Nexora.\n\nEl correo de mi cuenta es: ${email}.\n\nAdjunto el comprobante:`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const isBanned = user?.status === 'BLOCKED';

  const renderPaymentMethods = (planName: string, amountUSD: number, accentColor: string) => {
    const amountBs = (amountUSD * euroRate).toFixed(2);
    
    return (
      <div className={`p-5 md:p-8 bg-[#151515] border border-${accentColor}-900/30 rounded-b-[28px] animate-in slide-in-from-top-8 duration-300 -mt-8 pt-12 mb-6 relative z-0 shadow-inner`}>
        <h3 className="font-black text-stone-200 mb-5 flex items-center text-sm md:text-base">
          <CreditCard className={`w-5 h-5 mr-2 text-${accentColor}-400`} /> Realiza tu pago (${amountUSD})
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e]">
            <div><h4 className="font-black text-white text-sm">Zinli</h4><p className="text-stone-400 font-medium mt-1 select-all text-xs">{zinliEmail}</p></div>
            <button onClick={() => handleCopy(zinliEmail, 'zinli')} className="mt-4 sm:mt-0 flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 bg-[#2c2c2e] border border-stone-700 rounded-xl hover:bg-stone-700 transition-colors font-bold text-white text-xs active:scale-95">
              {copiedElement === 'zinli' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />} {copiedElement === 'zinli' ? 'Copiado' : 'Copiar Correo'}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#1c1c1e] rounded-[16px] border border-[#2c2c2e]">
            <div><h4 className="font-black text-white text-sm flex items-center gap-2">Binance Pay <span className="bg-[#FCD535] text-stone-900 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">USDT</span></h4><p className="text-stone-400 font-medium mt-1 text-xs">ID: <span className="text-white select-all font-bold">{binanceId}</span></p></div>
            <button onClick={() => handleCopy(binanceId, 'binance')} className="mt-4 sm:mt-0 flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 bg-[#2c2c2e] border border-stone-700 rounded-xl hover:bg-stone-700 transition-colors font-bold text-white text-xs active:scale-95">
              {copiedElement === 'binance' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />} {copiedElement === 'binance' ? 'Copiado' : 'Copiar ID'}
            </button>
          </div>
          <div className="p-4 bg-[#101f1c] rounded-[16px] border border-teal-900/50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">Pago Móvil <span className="bg-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">BCV EURO</span></h4>
              <button onClick={() => fetchEuroRate()} className="text-teal-400 hover:text-teal-300 p-1 bg-teal-900/30 rounded-lg"><RefreshCw className={`w-3.5 h-3.5 ${isFetchingRate ? 'animate-spin' : ''}`} /></button>
            </div>
            <div className="text-stone-300 font-medium text-xs leading-relaxed whitespace-pre-wrap mb-4">{pagoMovilData}</div>
            <div className="bg-black/30 rounded-xl p-3 border border-teal-500/20">
              <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Monto a Transferir</p>
              <p className="text-xl font-black text-teal-400">Bs. {euroRate > 0 ? amountBs : '---'}</p>
              <p className="text-[10px] text-stone-500 mt-1 font-medium">Tasa BCV: Bs. {euroRate.toFixed(2)} / €</p>
            </div>
          </div>
        </div>
        <button onClick={() => openWhatsApp(planName, amountUSD)} className="w-full mt-6 py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-stone-900 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.2)] transition-all active:scale-95">
          <MessageCircle className="w-5 h-5" /> Enviar comprobante por WhatsApp
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans select-none pb-12 text-white overflow-x-hidden relative">
      
      {/* ⚡ NUEVO MODAL DE ACTUALIZACIÓN EN MODO OSCURO ⚡ */}
      {updateMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
          <div className="bg-[#1c1c1e] border border-[#2c2c2e] w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30 transform rotate-12">
              <Rocket className="w-8 h-8 text-white -rotate-12" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">¡Nueva Versión!</h2>
            <p className="text-sm font-medium text-stone-400 mb-6 leading-relaxed">
              {updateMessage}
            </p>

            <div className="space-y-3 relative z-10">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-[16px] font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Actualizar Ahora
              </button>
              <button 
                onClick={() => setUpdateMessage(null)} 
                className="w-full py-3.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-stone-300 border border-[#3c3c3e] rounded-[16px] font-bold text-sm transition-all active:scale-95"
              >
                Continuar sin actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <div className="w-full bg-[#1c1c1e]/80 backdrop-blur-md px-4 md:px-6 py-4 flex justify-between items-center z-40 border-b border-[#2c2c2e] sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20"><ShieldAlert className="text-white w-5 h-5" /></div>
          <span className="font-black text-xl tracking-tight">Nexora</span>
        </div>
        <button onClick={handleLogout} className="text-stone-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#2c2c2e] px-4 py-2 rounded-xl border border-white/5 active:scale-95">
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 mt-8 md:mt-12 text-center">
        
        {/* HEADER DE BIENVENIDA Y EXPLICACIÓN DE BANEO */}
        <div className="w-full max-w-xl mx-auto text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-2xl md:text-3xl font-medium text-stone-200 mb-6 leading-relaxed">
            Hola, <span className="font-black text-white">{user?.name?.split(' ')[0] || 'Usuario'}</span>. 
          </h1>

          {isBanned ? (
            <div className="bg-rose-500/10 border border-rose-500/30 p-5 md:p-6 rounded-[24px] text-left">
               <h2 className="text-rose-400 font-black flex items-center text-lg mb-2"><AlertOctagon className="w-6 h-6 mr-2"/> Tu cuenta ha sido suspendida</h2>
               <p className="text-rose-200/80 text-sm leading-relaxed">El equipo de administración ha bloqueado temporalmente tu acceso a la plataforma por motivos de seguridad, falta de pago o incumplimiento de normativas.</p>
               <div className="mt-4 pt-4 border-t border-rose-500/20">
                  <p className="text-xs text-rose-300/60 font-bold mb-3">Si crees que esto es un error o deseas regularizar tu situación:</p>
                  <button onClick={() => setIsChatOpen(true)} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center border border-rose-500/20">
                     <Headphones className="w-4 h-4 mr-2" /> Contactar a Soporte
                  </button>
               </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 p-5 md:p-6 rounded-[24px] text-left">
               <h2 className="text-amber-400 font-black flex items-center text-lg mb-2"><Clock className="w-6 h-6 mr-2"/> Periodo finalizado</h2>
               <p className="text-amber-200/80 text-sm leading-relaxed">Tu membresía activa o periodo de prueba ha llegado a su fin. Tu inventario, finanzas y configuración están a salvo y asegurados en la nube.</p>
               <div className="mt-4 pt-4 border-t border-amber-500/20">
                  <p className="text-xs text-amber-300/80 font-bold">Elige un plan de suscripción a continuación para recuperar el acceso de inmediato.</p>
               </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 max-w-2xl mx-auto text-left gap-0">
          
          <div onClick={() => setSelectedPlan(selectedPlan === '1month' ? null : '1month')} className={`relative bg-[#1c1c1e] rounded-[28px] p-6 md:p-8 border-2 cursor-pointer transition-all duration-300 z-10 ${selectedPlan === '1month' ? 'border-violet-500 shadow-2xl shadow-violet-500/20 md:scale-105 bg-gradient-to-b from-[#1c1c1e] to-violet-900/10' : 'border-[#2c2c2e] shadow-sm hover:border-stone-600 mb-4'}`}>
            {selectedPlan === '1month' && <div className="absolute -top-3.5 right-6 md:right-8 bg-violet-600 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest flex items-center gap-1 shadow-lg shadow-violet-500/30"><CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> SELECCIONADO</div>}
            <h3 className="text-lg md:text-xl font-bold text-stone-400 mb-2">Mensual</h3>
            <div className="flex items-baseline gap-2 mb-6"><span className="text-4xl md:text-5xl font-black text-white">$10</span><span className="text-stone-500 font-bold text-sm">/ 1 mes</span></div>
            <ul className="space-y-3 mb-2">
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" /> Acceso total al sistema</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" /> Reactivación inmediata de inventario</li>
            </ul>
          </div>
          {selectedPlan === '1month' && renderPaymentMethods('1 Mes', 10, 'violet')}

          <div onClick={() => setSelectedPlan(selectedPlan === '6months' ? null : '6months')} className={`relative bg-[#1c1c1e] rounded-[28px] p-6 md:p-8 border-2 cursor-pointer transition-all duration-300 z-10 ${selectedPlan === '6months' ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 md:scale-105 bg-gradient-to-b from-[#1c1c1e] to-indigo-900/10' : 'border-[#2c2c2e] shadow-sm hover:border-stone-600 mb-4'}`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest z-10 shadow-lg shadow-indigo-500/30 whitespace-nowrap">MÁS POPULAR</div>
            {selectedPlan === '6months' && <div className="absolute -top-3.5 right-auto left-8 md:left-8 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest flex items-center gap-1 shadow-lg shadow-indigo-500/30"><CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> SELECCIONADO</div>}
            <h3 className="text-lg md:text-xl font-bold text-indigo-400 mb-2 pt-2 md:pt-0">Semestral</h3>
            <div className="flex items-baseline gap-2 mb-6"><span className="text-4xl md:text-5xl font-black text-white">$40</span><span className="text-stone-500 font-bold text-sm">/ 6 meses</span></div>
            <ul className="space-y-3 mb-2">
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Ahorras $20 dólares</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Acceso prioritario a Soporte IA</li>
            </ul>
          </div>
          {selectedPlan === '6months' && renderPaymentMethods('6 Meses', 40, 'indigo')}

          <div onClick={() => setSelectedPlan(selectedPlan === '1year' ? null : '1year')} className={`relative bg-[#1c1c1e] rounded-[28px] p-6 md:p-8 border-2 cursor-pointer transition-all duration-300 z-10 ${selectedPlan === '1year' ? 'border-amber-500 shadow-2xl shadow-amber-500/20 md:scale-105 bg-gradient-to-b from-[#1c1c1e] to-amber-900/10' : 'border-[#2c2c2e] shadow-sm hover:border-stone-600 mb-4'}`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 bg-amber-500 text-stone-900 px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest z-10 shadow-lg shadow-amber-500/30 whitespace-nowrap">AHORRA $30</div>
            {selectedPlan === '1year' && <div className="absolute -top-3.5 right-auto left-8 md:left-8 bg-amber-600 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/30"><CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> SELECCIONADO</div>}
            <h3 className="text-lg md:text-xl font-bold text-amber-500 mb-2 pt-2 md:pt-0">Anual</h3>
            <div className="flex items-baseline gap-2 mb-6"><span className="text-4xl md:text-5xl font-black text-white">$90</span><span className="text-stone-500 font-bold text-sm">/ 1 año</span></div>
            <ul className="space-y-3 mb-2">
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Te regalamos 3 meses gratis</li>
              <li className="flex items-center gap-3 text-stone-300 font-medium text-sm"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Atención directa de administración</li>
            </ul>
          </div>
          {selectedPlan === '1year' && renderPaymentMethods('1 Año', 90, 'amber')}

        </div>
      </div>

      <button 
        onClick={() => setIsChatOpen(true)} 
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-teal-600 text-white p-4 rounded-full shadow-lg shadow-teal-600/40 z-40 active:scale-95 transition-all hover:bg-teal-500 ${isChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Headphones className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-10 md:right-10 w-full md:w-96 h-[85vh] md:h-[500px] bg-[#1c1c1e] md:rounded-[32px] border-t md:border border-[#2c2c2e] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
          
          <div className="bg-[#2c2c2e] p-4 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center"><Headphones className="w-5 h-5 text-teal-400" /></div>
              <div>
                <h3 className="text-white font-black text-sm">Soporte Técnico</h3>
                <p className="text-teal-400 text-[10px] font-bold flex items-center"><span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-1.5 animate-pulse"></span> En línea</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-stone-400 hover:text-white p-2 bg-stone-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212] [&::-webkit-scrollbar]:hidden">
            <div className="bg-[#1c1c1e] p-3 rounded-2xl rounded-tl-sm border border-[#2c2c2e] max-w-[85%]">
              <p className="text-stone-300 text-xs leading-relaxed">Hola {user?.name?.split(' ')[0]}. Soy tu asesor de soporte. ¿En qué te puedo ayudar hoy con respecto a tu suscripción?</p>
            </div>
            
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' || !msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed shadow-sm ${msg.role === 'user' || (!msg.isAdmin && msg.content) ? `bg-teal-600 text-white rounded-tr-sm` : 'bg-[#1c1c1e] border border-[#2c2c2e] text-stone-300 rounded-tl-sm'}`}>
                  {msg.text || msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendSupportMessage} className="p-3 bg-[#1c1c1e] border-t border-[#2c2c2e]">
            <div className="relative flex items-center">
              <input type="text" placeholder="Escribe tu mensaje..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isSending} className="w-full bg-[#121212] text-stone-200 border border-[#2c2c2e] rounded-full pl-4 pr-12 py-3 text-xs outline-none focus:border-teal-500 transition-colors" />
              <button type="submit" disabled={!chatInput.trim() || isSending} className="absolute right-1.5 bg-teal-600 text-white p-2 rounded-full disabled:opacity-50 hover:bg-teal-500 transition-all">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Membership;