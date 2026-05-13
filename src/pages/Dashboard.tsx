import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react'; // 🔥 LIBRERÍA DE QR

// 🔥 ÍCONOS PURIFICADOS 🔥
import { 
  LayoutDashboard, Package, Tag, Sparkles, LogOut, Search, X, 
  Loader2, CheckCircle2, Boxes, History, Printer, 
  Phone, MapPin, AlertCircle, Headphones, PieChart, ShoppingCart, 
  Settings, Image as ImageIcon, UploadCloud, Link as LinkIcon, Share2, 
  Percent, Building2, Landmark, DollarSign, FileText, Save, Camera,
  Receipt, ArrowRight, RefreshCw, Rocket, QrCode, Download 
} from 'lucide-react';

// 🔥 IMPORTAMOS LAS VISTAS MODULARES 🔥
import CajaView from '../components/CajaView';
import InventarioView from '../components/InventarioView';
import SuscripcionesView from '../components/SuscripcionesView';
import ResumenView from '../components/ResumenView';
import ChatView from '../components/ChatView';

// 🔥 DIRECCIONES FIJAS A LA NUBE 🔥
const API_URL = 'https://nexora-api-psrx.onrender.com/api'; 
const SOCKET_URL = 'https://nexora-api-psrx.onrender.com';
const FRONTEND_URL = 'https://sistema-nexora.onrender.com'; // 🔥 FIJADO PARA EL QR CON TU URL OFICIAL

const TrialBanner = ({ onNavigateToPlans }: { onNavigateToPlans: () => void }) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(300);

  useEffect(() => {
    // SEGURIDAD BANCARIA: Leemos de la sesión temporal primero
    const userLocalStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userLocalStr) {
      try {
        const user = JSON.parse(userLocalStr);
        if (user.role === 'ADMIN' || !user.subscriptionEnd) {
           setDaysLeft(null); return;
        }
        const endDate = new Date(user.subscriptionEnd);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays > 0 ? diffDays : 0);
      } catch (e) { console.error("Error parseando user local"); }
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (daysLeft === null || secondsLeft <= 0) return null;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 md:py-3 flex items-center justify-between gap-2 text-xs md:text-sm font-medium shadow-md z-30 relative shrink-0 w-full animate-in slide-in-from-top-2">
      <div className="flex items-center justify-center w-full">
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0 mr-2" />
        <span className="text-center flex items-center flex-wrap justify-center gap-1">
          <span>Estás en tu periodo de prueba. Te quedan <strong className="bg-white/20 px-2 py-0.5 rounded-full mx-1">{daysLeft} días</strong>.</span>
          <span className="ml-2 font-black text-amber-300 tracking-widest bg-black/20 px-2 py-0.5 rounded-md min-w-[50px] text-center">{formattedTime}</span>
        </span>
      </div>
      <div className="flex items-center space-x-2 shrink-0 ml-2">
         <button onClick={onNavigateToPlans} className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-black text-[10px] md:text-xs shadow-sm hover:bg-stone-50 transition-all active:scale-95 whitespace-nowrap">Ver Planes</button>
         <button onClick={() => setSecondsLeft(0)} className="text-white/80 hover:text-white p-1"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

const HistorialVentas = ({ companyInfo }: { companyInfo: any }) => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [downloadingPng, setDownloadingPng] = useState(false);

  useEffect(() => { fetchVentas(); }, []);

  const fetchVentas = async () => {
    try {
      const token = sessionStorage.getItem('nexora_token');
      const response = await axios.get(`${API_URL}/finanzas/historial`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) setVentas(response.data.data);
    } catch (error) { console.error("Error cargando ventas", error); } 
    finally { setLoading(false); }
  };

  const handleShareTicket = async (venta: any) => {
    setSelectedSale(venta); 
    setTimeout(async () => {
      const invoiceElement = document.getElementById('invoice-capture-mobile');
      if (!invoiceElement) { alert("Error cargando el ticket visual."); return; }
      setDownloadingPng(true);
      try {
        const canvas = await html2canvas(invoiceElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `Factura_${venta.invoiceRef}.png`, { type: 'image/png' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
             try {
               await navigator.share({ files: [file], title: `Factura ${venta.invoiceRef}`, text: `¡Gracias por tu compra en ${companyInfo.name}! Aquí tienes tu recibo detallado.`, });
             } catch(err) { console.log("Usuario canceló o falló share", err); }
          } else {
             const image = canvas.toDataURL('image/png', 1.0);
             const link = document.createElement('a'); link.download = `Factura_${venta.invoiceRef || 'Nexora'}.png`; link.href = image; link.click();
             const text = `¡Hola! Aquí tienes los detalles de tu compra en ${companyInfo.name}.\nRecibo: ${venta.invoiceRef}\nTotal: $${venta.totalUsd.toFixed(2)}\n\n(Tu recibo detallado se ha descargado en tu dispositivo para que lo envíes adjunto).`;
             const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(text)}`; window.open(urlWhatsApp, '_blank');
          }
        }, 'image/png');
      } catch (error) { alert("Hubo un error al generar la imagen del recibo."); } 
      finally { setDownloadingPng(false); setSelectedSale(null); }
    }, 500); 
  };

  const handlePrintTicket = (venta: any) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return alert('Por favor permite las ventanas emergentes.');
    const pay = venta.payments?.[0] || { currency: 'USD', exchangeRate: 1, paymentMethod: 'Efectivo', amount: venta.totalUsd };
    const symbol = pay.currency === 'USD' ? '$' : 'Bs.';
    const html = `<html><head><title>Ticket ${venta.invoiceRef}</title><style>body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; color: #000; font-size: 12px; } .header { text-align: center; margin-bottom: 15px; } .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; } .header p { margin: 2px 0; } .divider { border-bottom: 1px dashed #000; margin: 10px 0; } .item { display: flex; justify-content: space-between; margin: 5px 0; } .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px; } .footer { text-align: center; margin-top: 30px; font-size: 10px; }</style></head><body><div class="header"><h2>${companyInfo.name}</h2>${companyInfo.rif ? `<p>RIF: ${companyInfo.rif}</p>` : ''}${companyInfo.phone ? `<p>Tel: ${companyInfo.phone}</p>` : ''}${companyInfo.address ? `<p>${companyInfo.address}</p>` : ''}<div class="divider"></div><p>Recibo ${venta.invoiceRef || '#' + venta.id.substring(0,8).toUpperCase()}</p><p>Fecha: ${new Date(venta.createdAt).toLocaleString()}</p></div><div class="divider"></div>${venta.items && venta.items.length > 0 ? venta.items.map((i: any) => `<div class="item"><span>${i.quantity}x ${i.name}</span><span>$${(i.price * i.quantity).toFixed(2)}</span></div>`).join('') : '<p>Sin detalles</p>'}<div class="divider"></div><div class="item"><span>Subtotal:</span><span>$${(venta.subtotal || 0).toFixed(2)}</span></div><div class="item"><span>IVA (16%):</span><span>$${(venta.ivaAmount || 0).toFixed(2)}</span></div><div class="item"><span>Método:</span><span>${pay.paymentMethod.replace('_', ' ')}</span></div><div class="item"><span>Moneda:</span><span>${pay.currency}</span></div><div class="item"><span>Tasa:</span><span>${pay.exchangeRate.toFixed(2)}</span></div><div class="divider"></div><div class="total-row"><span>TOTAL</span><span>${symbol}${pay.amount.toFixed(2)}</span></div><div class="footer"><p>¡Gracias por su compra!</p><p>Sistema Nexora Enterprise</p></div><script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script></body></html>`;
    printWindow.document.write(html); printWindow.document.close();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div><h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">Arqueo e Historial</h1><p className="text-stone-500 mt-1 text-sm md:text-lg">Monitor de ingresos del día.</p></div>
      </div>
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-stone-200 shadow-sm overflow-hidden mt-6">
        <div className="p-4 md:p-6 border-b border-stone-100 bg-stone-50/50 flex items-center"><Receipt className="w-5 h-5 mr-2 text-stone-400" /><h2 className="font-bold text-stone-900 text-sm md:text-base">Historial Global de Tickets</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs md:text-sm text-stone-500">
                <th className="p-3 md:p-5 font-semibold">Factura</th><th className="p-3 md:p-5 font-semibold">Fecha</th><th className="p-3 md:p-5 font-semibold">Moneda</th>
                <th className="p-3 md:p-5 font-semibold hidden md:table-cell">Tasa</th><th className="p-3 md:p-5 font-semibold text-right">Total Cobrado</th><th className="p-3 md:p-5 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              {ventas.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-stone-500">No hay ventas registradas.</td></tr>
              ) : (
                ventas.map((v) => {
                  const pay = v.payments?.[0] || { currency: 'USD', exchangeRate: 1, amount: v.totalUsd };
                  return (
                    <tr key={v.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 md:p-5 font-bold text-stone-900">{v.invoiceRef || '#' + v.id.substring(0,6).toUpperCase()}</td>
                      <td className="p-3 md:p-5 text-stone-600 font-medium">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 md:p-5"><span className="px-2 py-1 bg-stone-100 text-stone-700 font-bold rounded-lg text-[10px]">{pay.currency}</span></td>
                      <td className="p-3 md:p-5 text-stone-500 font-medium hidden md:table-cell">{pay.exchangeRate.toFixed(2)}</td>
                      <td className="p-3 md:p-5 font-black text-stone-900 text-right">{pay.currency === 'USD' ? '$' : 'Bs.'}{pay.amount.toFixed(2)}</td>
                      <td className="p-3 md:p-5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleShareTicket(v)} disabled={downloadingPng} className="p-1.5 md:p-2 text-stone-400 hover:text-green-600 bg-white border border-stone-200 rounded-lg active:scale-95 transition-all disabled:opacity-50">
                             {downloadingPng && selectedSale?.id === v.id ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin"/> : <Share2 className="w-3 h-3 md:w-4 md:h-4" />}
                          </button>
                          <button onClick={() => handlePrintTicket(v)} className="p-1.5 md:p-2 text-stone-400 hover:text-indigo-600 bg-white border border-stone-200 rounded-lg active:scale-95 transition-all"><Printer className="w-3 h-3 md:w-4 md:h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TICKET INVISIBLE PARA CAPTURA PNG */}
      {selectedSale && (
         <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
            <div id="invoice-capture-mobile" className="bg-white p-8 w-[400px]">
              <div className="text-center border-b border-stone-200 pb-6 mb-6">
                {companyInfo.logo && <img src={companyInfo.logo} alt="Logo" className="h-16 mx-auto mb-3 object-contain" />}
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-wide">{companyInfo.name}</h2>
                <p className="text-xs text-stone-500 font-bold mt-1">RIF: {companyInfo.rif || 'J-00000000-0'}</p>
                <p className="text-xs text-stone-500">{companyInfo.address}</p>
                <p className="text-xs text-stone-500">{companyInfo.phone}</p>
              </div>
              <div className="flex justify-between text-xs font-bold text-stone-600 mb-6">
                <div><p>Factura N°: <span className="text-stone-900">{selectedSale.invoiceRef}</span></p><p>Cliente: <span className="text-stone-900">{selectedSale.clientName}</span></p></div>
                <div className="text-right"><p>{new Date(selectedSale.createdAt).toLocaleDateString()}</p></div>
              </div>
              <table className="w-full text-xs mb-6">
                <thead className="border-b border-stone-900"><tr><th className="py-2 text-left text-stone-900 font-black">CANT</th><th className="py-2 text-left text-stone-900 font-black">DESCRIPCIÓN</th><th className="py-2 text-right text-stone-900 font-black">TOTAL</th></tr></thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedSale.items?.map((item: any) => (<tr key={item.id}><td className="py-3 font-bold text-stone-700">{item.quantity}</td><td className="py-3 font-bold text-stone-700 pr-2">{item.name} {item.applyIva ? '(G)' : '(E)'}</td><td className="py-3 font-black text-stone-900 text-right">${(item.price * item.quantity).toFixed(2)}</td></tr>))}
                </tbody>
              </table>
              <div className="border-t border-stone-200 pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-stone-500 font-bold"><span>Subtotal:</span><span>${(selectedSale.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-stone-500 font-bold"><span>IVA (16%):</span><span>${(selectedSale.ivaAmount || 0).toFixed(2)}</span></div>
                {(selectedSale.igtfAmount > 0) && <div className="flex justify-between text-stone-500 font-bold"><span>IGTF (3%):</span><span>${selectedSale.igtfAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-lg font-black text-stone-900 mt-2 pt-2 border-t border-stone-900"><span>TOTAL A PAGAR:</span><span>${(selectedSale.totalUsd || 0).toFixed(2)}</span></div>
              </div>
              <div className="mt-8 text-center text-[10px] text-stone-400 font-bold"><p>¡Gracias por su compra!</p><p>Generado por Nexora System</p></div>
            </div>
         </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'caja' | 'resumen' | 'productos' | 'ia' | 'configuracion' | 'historial' | 'soporte'>('caja'); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supportChatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);
  const currentViewRef = useRef(currentView);

  const [completedCheckoutDetails, setCompletedCheckoutDetails] = useState<any>(null);

  // ⚡ ESTADO DE ACTUALIZACIÓN FORZADA EN MEMORIA ⚡
  const [updateData, setUpdateData] = useState<{message: string, timestamp: number} | null>(null);

  useEffect(() => {
    currentViewRef.current = currentView;
    if (currentView === 'soporte') setHasUnreadSupport(false); 
  }, [currentView]);
  
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const [activeCategories, setActiveCategories] = useState<string[]>(['Alimentos', 'Limpieza', 'Electrónica']);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [companyInfo, setCompanyInfo] = useState({ name: 'Mi Empresa', rif: '', phone: '', address: '', logo: '' });
  const [savingConfig, setSavingConfig] = useState(false);
  const [erpData, setErpData] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', promoPrice: '', cost: '', stock: '', customImage: '', applyIva: true });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageUploadType, setImageUploadType] = useState('url'); 
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);

  const [cart, setCart] = useState<any[]>([]);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [saleError, setSaleError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BS_PAGOMOVIL');
  const [searchTerm, setSearchTerm] = useState('');
  const [productsList, setProductsList] = useState<any[]>([]);
  
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: `Hola Angel. Soy el motor Llama 3 conectado a Nexora. He analizado tu inventario. ¿En qué te ayudo hoy?` }]);

  const [currency, setCurrency] = useState<'USD' | 'BCV' | 'EUR' | 'USDT'>('BCV');
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [rates, setRates] = useState({
    USD: 1, BCV: parseFloat(localStorage.getItem('nexora_rate_bcv') || '0'), 
    EUR: parseFloat(localStorage.getItem('nexora_rate_eur') || '0'), 
    USDT: parseFloat(localStorage.getItem('nexora_rate_usdt') || '0') 
  });

  const symbols: { [key: string]: string } = { USD: '$', BCV: 'Bs.', EUR: '€', USDT: '₮', VES: 'Bs.' };

  // 🔥 NUEVO: OBTENER ID DEL USUARIO PARA EL QR 🔥
  const getUserId = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      return user.id || '';
    } catch {
      return '';
    }
  };
  // 🔥 FIJAMOS LA URL REAL PARA EL QR 🔥
  const catalogUrl = `${FRONTEND_URL}/catalogo/${getUserId()}`;

  const handleLogout = () => { 
    sessionStorage.removeItem('nexora_token'); 
    sessionStorage.removeItem('user'); 
    navigate('/login'); 
  };

  const fetchRealTimeRates = async (isManualClick = false) => {
    if (isManualClick) setIsFetchingRates(true);
    try {
      const resDolares = await axios.get('https://ve.dolarapi.com/v1/dolares');
      const resEuros = await axios.get('https://ve.dolarapi.com/v1/euros');
      const bcvData = resDolares.data.find((d: any) => d.fuente === 'oficial' || d.nombre.toLowerCase().includes('oficial'));
      let usdtData = resDolares.data.find((d: any) => d.fuente?.toLowerCase() === 'binance' || d.nombre?.toLowerCase().includes('binance'));
      if (!usdtData) usdtData = resDolares.data.find((d: any) => d.fuente?.toLowerCase() === 'paralelo' || d.nombre?.toLowerCase().includes('paralelo'));
      const euroData = resEuros.data.find((d: any) => d.fuente === 'oficial' || d.nombre.toLowerCase().includes('oficial'));
      
      const newBCV = (bcvData && parseFloat(bcvData.promedio) > 0) ? parseFloat(bcvData.promedio) : rates.BCV;
      const newUSDT = (usdtData && parseFloat(usdtData.promedio) > 0) ? parseFloat(usdtData.promedio) : rates.USDT;
      const newEUR = (euroData && parseFloat(euroData.promedio) > 0) ? parseFloat(euroData.promedio) : rates.EUR;
      
      setRates({ USD: 1, BCV: newBCV, USDT: newUSDT, EUR: newEUR });
      localStorage.setItem('nexora_rate_bcv', newBCV.toString());
      localStorage.setItem('nexora_rate_usdt', newUSDT.toString());
      localStorage.setItem('nexora_rate_eur', newEUR.toString());
    } catch (err) { if (isManualClick) alert("Usando tasas en memoria."); } finally { if (isManualClick) setIsFetchingRates(false); }
  };

  const evaluateUpdate = (data: any) => {
    const currentVersion = Number(localStorage.getItem('nexora_version') || 0);
    if (data.timestamp > currentVersion) {
      setUpdateData({ message: data.message, timestamp: data.timestamp });
    }
  };

  const applyUpdateAndReload = () => {
    if (updateData) {
      localStorage.setItem('nexora_version', updateData.timestamp.toString());
    }
    window.location.href = FRONTEND_URL;
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      console.log('🟢 [DASHBOARD] Socket conectado al servidor.');
    });

    socketRef.current.on('check_version', (data: any) => {
      evaluateUpdate(data);
    });

    socketRef.current.on('force_update', (data: any) => {
      evaluateUpdate(data);
    });

    socketRef.current.on('receive_message', (data: any) => { 
      setSupportMessages((prev) => [...prev, data]); 
      if (currentViewRef.current !== 'soporte') setHasUnreadSupport(true);
    });

    socketRef.current.on('user_banned', (data: any) => {
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (userStr) {
         const user = JSON.parse(userStr);
         if (user.id === data.userId || user.email === data.email) {
            alert('Tu cuenta ha sido suspendida por un administrador.');
            handleLogout();
         }
      }
    });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentView === 'soporte') {
      const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      if (user.id) { socketRef.current.emit('join_chat', user.id); fetchSupportMessages(user.id); }
    }
    if (currentView === 'resumen') fetchErpDashboard();
    if (currentView === 'caja' || currentView === 'configuracion') fetchCompanyConfigFromBackend();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  const fetchErpDashboard = async () => {
    try {
      const token = sessionStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/finanzas`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setErpData(res.data.data);
    } catch (err) { console.log("Contabilidad no disponible o ruta no creada."); }
  };

  const fetchSupportMessages = async (userId: string) => {
    try {
      const token = sessionStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/chat/messages/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setSupportMessages(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!supportInput.trim()) return;
    setIsSendingSupport(true);
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    try {
      const token = sessionStorage.getItem('nexora_token');
      const res = await axios.post(`${API_URL}/chat/messages`, { userId: user.id, content: supportInput.trim(), isAdmin: false }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { socketRef.current.emit('send_message', res.data.data); setSupportInput(''); }
    } catch (err) { alert("Error al enviar el mensaje."); } finally { setIsSendingSupport(false); }
  };

  useEffect(() => {
    const savedCategories = localStorage.getItem('nexora_custom_categories');
    if (savedCategories) { try { const parsedCategories = JSON.parse(savedCategories); if (Array.isArray(parsedCategories) && parsedCategories.length > 0) { setActiveCategories(parsedCategories); setFormData(prev => ({ ...prev, category: parsedCategories[0] })); } } catch (e) { } }
    fetchProducts(); fetchRealTimeRates(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem('nexora_token');
      const response = await axios.get(`${API_URL}/productos`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        const dbProducts = response.data.data.map((p: any) => ({
          id: p.id, name: p.name, category: p.description || 'General', stock: p.stock,
          price: parseFloat(p.price), promoPrice: p.promoPrice ? parseFloat(p.promoPrice) : null,
          cost: parseFloat(p.cost || '0'), applyIva: p.applyIva ?? true, status: p.stock > 0 ? 'Activo' : 'Agotado', image: p.image || '' 
        }));
        setProductsList(dbProducts);
      }
    } catch (err) { console.error(err); }
  };

  const fetchCompanyConfigFromBackend = async () => {
    try {
      const token = sessionStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/settings/company`, { headers: { Authorization: `Bearer ${token}` } });
      if(res.data.success && res.data.data) {
        setCompanyInfo({ name: res.data.data.legalName || 'Mi Empresa', rif: res.data.data.documentId || '', phone: res.data.data.phone || '', address: res.data.data.address || '', logo: res.data.data.logo || '' });
      }
      
      const ratesRes = await axios.get(`${API_URL}/settings/exchange-rates`, { headers: { Authorization: `Bearer ${token}` } });
      if(ratesRes.data.success && ratesRes.data.data) {
         setRates(prev => {
           let updated = { ...prev };
           ratesRes.data.data.forEach((r:any) => {
              if(r.currency === 'VES' && r.rate > 0) updated.BCV = r.rate;
              if(r.currency === 'EUR' && r.rate > 0) updated.EUR = r.rate;
              if(r.currency === 'USDT' && r.rate > 0) updated.USDT = r.rate;
           });
           return updated;
         });
      }
    } catch(e) {}
  };

  const handleSaveCompanyOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/settings/company`, { legalName: companyInfo.name, documentId: companyInfo.rif, address: companyInfo.address, phone: companyInfo.phone, logo: companyInfo.logo }, { headers });
      alert('✅ ¡Perfil Legal guardado con éxito!');
    } catch (error) { alert('❌ Error al guardar perfil.'); } 
    finally { setSavingConfig(false); }
  };

  const handleSaveRatesOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      const headers = { Authorization: `Bearer ${token}` };
      const currencies = ['VES', 'EUR', 'USDT'];
      for (const curr of currencies) {
        const rateValue = curr === 'VES' ? rates.BCV : curr === 'EUR' ? rates.EUR : rates.USDT;
        if (!isNaN(rateValue) && rateValue > 0) {
          await axios.put(`${API_URL}/settings/exchange-rates`, { currency: curr, rate: rateValue }, { headers });
        }
      }
      alert('✅ ¡Tasas de Cambio guardadas con éxito!');
    } catch (error) { alert('❌ Error al guardar tasas.'); } 
    finally { setSavingConfig(false); }
  };

  const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompanyInfo({ ...companyInfo, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = productsList.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      if (currentQuantity >= product.stock) return prevCart; 
      if (existingItem) return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      if (product.stock <= 0) return prevCart;
      
      const activePrice = (product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price) ? product.promoPrice : product.price;
      return [...prevCart, { ...product, activePrice: activePrice, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null; 
          if (newQuantity > item.stock) return item; 
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as any[];
    });
  };

  const removeFromCart = (productId: string) => { setCart(prevCart => prevCart.filter(item => item.id !== productId)); };

  const cartSubtotalUSD = cart.reduce((sum, item) => sum + ((item.activePrice || item.price) * item.quantity), 0);
  const cartIvaUSD = cart.reduce((sum, item) => item.applyIva ? sum + (((item.activePrice || item.price) * item.quantity) * 0.16) : sum, 0);
  
  let cartIgtfUSD = 0;
  const foreignMethods = ['USD_EFECTIVO', 'ZINLI', 'BINANCE', 'EUR_EFECTIVO'];
  if(foreignMethods.includes(paymentMethod)) cartIgtfUSD = (cartSubtotalUSD + cartIvaUSD) * 0.03;

  const cartTotalFinalUSD = cartSubtotalUSD + cartIvaUSD + cartIgtfUSD;
  const cartTotalConverted = cartTotalFinalUSD * (rates[currency] || 1);

  const processCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingSale(true); setSaleError('');
    try {
      const token = sessionStorage.getItem('nexora_token');
      const itemsLimpio = cart.map(item => ({ productId: String(item.id), quantity: Number(item.quantity) }));
      const resolvedCurrency = currency === 'BCV' ? 'VES' : currency;
      const paymentsObj = [{ paymentMethod: paymentMethod, currency: resolvedCurrency, amount: cartTotalConverted, exchangeRate: rates[currency] || 1 }];
      const saleData = { items: itemsLimpio, payments: paymentsObj, clientName: "Cliente de Caja", clientDoc: "V-00000000" };
      const response = await axios.post(`${API_URL}/finanzas/ventas`, saleData, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        setCompletedCheckoutDetails({
           invoiceRef: response.data.sale?.invoiceRef || 'S/N',
           total: cartTotalConverted,
           currency: resolvedCurrency,
           paymentMethod: paymentMethod,
           items: [...cart], 
           subtotalUSD: cartSubtotalUSD,
           ivaUSD: cartIvaUSD,
           igtfUSD: cartIgtfUSD,
           exchangeRate: rates[currency] || 1
        });
        setCart([]); fetchProducts(); 
      }
    } catch (err: any) { setSaleError(err.response?.data?.message || 'Error al procesar la venta.'); } 
    finally { setIsProcessingSale(false); }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const excelData = new FormData(); excelData.append('file', file);
    setIsUploadingExcel(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      await axios.post(`${API_URL}/productos/import`, excelData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
      alert('📦 Inventario masivo importado con éxito.'); fetchProducts(); 
    } catch (error: any) { alert('Error importando el archivo Excel.'); } 
    finally { setIsUploadingExcel(false); if (e.target) e.target.value = ''; }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !activeCategories.includes(trimmed)) {
      const updated = [...activeCategories, trimmed];
      setActiveCategories(updated); localStorage.setItem('nexora_custom_categories', JSON.stringify(updated)); setNewCategoryInput('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (activeCategories.length <= 1) return alert("Debe haber al menos una categoría.");
    const updated = activeCategories.filter(c => c !== catToRemove);
    setActiveCategories(updated); localStorage.setItem('nexora_custom_categories', JSON.stringify(updated));
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({ ...formData, customImage: reader.result as string }); reader.readAsDataURL(file); }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const token = sessionStorage.getItem('nexora_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { 
        name: formData.name, 
        price: parseFloat(formData.price), 
        promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock), 
        applyIva: formData.applyIva,     
        categoryName: formData.category, 
        image: formData.customImage || undefined 
      };

      if (isEditMode && editingProductId) {
        await axios.put(`${API_URL}/productos/${editingProductId}`, payload, config);
      } else {
        await axios.post(`${API_URL}/productos`, payload, config);
      }
      fetchProducts(); setSuccess(true); setTimeout(() => { setIsModalOpen(false); setSuccess(false); resetForm(); }, 1500);
    } catch (err: any) { setError('Error al guardar producto.'); } finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id: string) => { 
    if (window.confirm('¿Eliminar permanentemente?')) { 
      try { 
        const token = sessionStorage.getItem('nexora_token');
        await axios.delete(`${API_URL}/productos/${id}`, { headers: { Authorization: `Bearer ${token}` }}); 
        fetchProducts(); 
      } catch (error) { alert('Error.'); } 
    } 
  };

  const openEditModal = (product: any) => {
    setFormData({ name: product.name, category: product.category, price: product.price.toString(), promoPrice: product.promoPrice ? product.promoPrice.toString() : '', cost: product.cost.toString(), stock: product.stock.toString(), customImage: product.image, applyIva: product.applyIva });
    setImageUploadType(product.image ? 'url' : 'upload'); setEditingProductId(product.id); setIsEditMode(true); setIsModalOpen(true);
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };
  const resetForm = () => { setIsEditMode(false); setEditingProductId(null); setFormData({ name: '', category: activeCategories[0] || 'General', price: '', promoPrice: '', cost: '', stock: '', customImage: '', applyIva: true }); };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim(); 
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput(''); 
    setIsAiTyping(true);
    
    try {
      const token = sessionStorage.getItem('nexora_token');
      const response = await fetch(`${API_URL}/ia/chat`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify({ pregunta: userMessage, companyInfo: companyInfo }) 
      });
      const data = await response.json();
      if(data.success) { setChatMessages(prev => [...prev, { role: 'ai', text: data.respuesta }]); 
      } else { setChatMessages(prev => [...prev, { role: 'ai', text: data.message || 'Error del motor IA.' }]); }
    } catch (err: any) { setChatMessages(prev => [...prev, { role: 'ai', text: '❌ Error de conexión.' }]); } 
    finally { setIsAiTyping(false); }
  };

  // 🔥 DESCARGAR EL QR COMO IMAGEN 🔥
  const downloadQR = () => {
    const svg = document.getElementById("catalog-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if(ctx) {
        ctx.fillStyle = "white"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_Catalogo_${companyInfo.name || 'Nexora'}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="h-screen w-full bg-[#f8f9fa] flex flex-col md:flex-row overflow-hidden font-sans text-stone-900 select-none relative">
      
      {/* ⚡ MODAL DE ACTUALIZACIÓN ⚡ */}
      {updateData && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative border border-stone-100">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30 transform rotate-12">
              <Rocket className="w-8 h-8 text-white -rotate-12" />
            </div>

            <h2 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">¡Nueva Versión!</h2>
            <p className="text-sm font-medium text-stone-500 mb-6 leading-relaxed">
              {updateData.message}
            </p>

            <div className="space-y-3 relative z-10">
              <button 
                onClick={applyUpdateAndReload} 
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-[16px] font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Actualizar Ahora
              </button>
              <button 
                onClick={() => setUpdateData(null)} 
                className="w-full py-3.5 bg-stone-50 hover:bg-stone-100 text-stone-500 border border-stone-200 rounded-[16px] font-bold text-sm transition-all active:scale-95"
              >
                Continuar sin actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setCurrentView('ia')} className="md:hidden fixed bottom-24 right-4 bg-violet-600 text-white p-3.5 rounded-full shadow-lg shadow-violet-600/40 z-40 active:scale-95 transition-all flex items-center justify-center">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* MENÚ LATERAL ESCRITORIO */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col flex-shrink-0 z-20 shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-stone-100 flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-indigo-200"><LayoutDashboard className="text-white w-4 h-4" /></div>
          <div><span className="text-xl font-black tracking-tight text-stone-800">Nexora</span><span className="ml-2 bg-indigo-50 text-indigo-600 text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest relative -top-1">v1.1</span></div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setCurrentView('caja')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'caja' ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><ShoppingCart className={`w-5 h-5 mr-3 ${currentView === 'caja' ? 'text-orange-500' : ''}`} /> Punto de Venta</button>
          <button onClick={() => setCurrentView('resumen')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'resumen' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><PieChart className="w-5 h-5 mr-3" /> ERP y Finanzas</button>
          <button onClick={() => setCurrentView('historial')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'historial' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><History className="w-5 h-5 mr-3" /> Historial de Caja</button>
          <button onClick={() => setCurrentView('productos')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'productos' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Package className="w-5 h-5 mr-3" /> Inventario</button>
          <button onClick={() => setCurrentView('ia')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'ia' ? 'bg-violet-50 text-violet-700 shadow-sm shadow-violet-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Sparkles className={`w-5 h-5 mr-3 ${currentView === 'ia' ? 'text-violet-600' : 'text-violet-400'}`} /> Asistente IA</button>
          <div className="my-4 border-t border-stone-100 flex-shrink-0 mx-2"></div>
          
          <button onClick={() => setCurrentView('soporte')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'soporte' ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}>
            <div className="relative mr-3">
              <Headphones className={`w-5 h-5 ${currentView === 'soporte' ? 'text-teal-600' : 'text-stone-400'}`} />
              {hasUnreadSupport && (<span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span></span>)}
            </div> Soporte Técnico
          </button>
          <button onClick={() => setCurrentView('configuracion')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'configuracion' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Settings className="w-5 h-5 mr-3" /> Configuración NIIF</button>
        </nav>
        <div className="p-4 border-t border-stone-100 flex-shrink-0"><button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"><LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión</button></div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10 pb-16 md:pb-0">
        
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-sm z-20">
          <div className="flex-1 flex items-center gap-3">
            <div className="md:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0"><Boxes className="text-white w-4 h-4" /></div>
            <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 md:w-5 md:h-5" /><input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner" /></div>
          </div>
          <div className="flex items-center space-x-3 ml-4">
             <button onClick={() => setCurrentView('historial')} className="md:hidden p-2 text-stone-500 hover:text-indigo-600 bg-stone-50 rounded-lg active:scale-95 transition-all shadow-sm border border-stone-200"><History className="w-5 h-5" /></button>
             <span className="text-sm font-bold text-stone-700 hidden sm:block">{companyInfo.name}</span>
             <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-xl flex items-center justify-center overflow-hidden font-black shadow-md text-xs md:text-sm">
               {companyInfo.logo ? <img src={companyInfo.logo} alt="Logo" className="w-full h-full object-cover" /> : companyInfo.name.substring(0,2).toUpperCase()}
             </div>
          </div>
        </header>

        <TrialBanner onNavigateToPlans={() => setCurrentView('configuracion')} />

        {/* 🔥 RENDERIZADO MODULAR DE VISTAS 🔥 */}
        
        {currentView === 'caja' && (
          <CajaView 
            searchTerm={searchTerm} filteredProducts={filteredProducts} addToCart={addToCart} cart={cart}
            rates={rates} currency={currency} setCurrency={setCurrency} symbols={symbols} updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart} cartSubtotalUSD={cartSubtotalUSD} cartIvaUSD={cartIvaUSD} cartIgtfUSD={cartIgtfUSD}
            paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} cartTotalConverted={cartTotalConverted}
            isProcessingSale={isProcessingSale} processCheckout={processCheckout} setCart={setCart} saleError={saleError}
            completedCheckoutDetails={completedCheckoutDetails} setCompletedCheckoutDetails={setCompletedCheckoutDetails}
            fetchRealTimeRates={fetchRealTimeRates} isFetchingRates={isFetchingRates}
            companyInfo={companyInfo} 
          />
        )}

        {currentView !== 'caja' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden pb-24 md:pb-8">
            
            {currentView === 'resumen' && (
              <ResumenView erpData={erpData} fetchErpDashboard={fetchErpDashboard} companyInfo={companyInfo} productsList={productsList} />
            )}

            {currentView === 'historial' && ( 
              <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <HistorialVentas companyInfo={companyInfo} /> 
              </div>
            )}

            {currentView === 'productos' && (
              <InventarioView 
                filteredProducts={filteredProducts} isUploadingExcel={isUploadingExcel} handleExcelUpload={handleExcelUpload}
                openCreateModal={openCreateModal} openEditModal={openEditModal} handleDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentView === 'ia' && (
              <ChatView 
                title="Nexora Intelligence" subtitle={`Analista de ${companyInfo.name}`} icon={<Sparkles className="w-5 h-5 md:w-6 md:h-6 text-violet-600" />}
                placeholder="Escribe tu consulta..." messages={chatMessages} input={chatInput} setInput={setChatInput}
                onSend={handleSendChatMessage} isTyping={isAiTyping} chatEndRef={chatEndRef}
              />
            )}

            {currentView === 'soporte' && (
              <ChatView 
                title="Soporte Técnico" subtitle="Conectado con Administración" icon={<Headphones className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />}
                placeholder="Escribe un mensaje de soporte..." messages={supportMessages} input={supportInput} setInput={setSupportInput}
                onSend={handleSendSupportMessage} isTyping={isSendingSupport} chatEndRef={supportChatEndRef}
              />
            )}
            
            {currentView === 'configuracion' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full">
                 <div className="mb-6 md:mb-8"><h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Ajustes del Sistema</h1></div>
                 
                 <div className="md:hidden flex flex-col gap-3 mb-6">
                   <button onClick={() => setCurrentView('soporte')} className="w-full bg-teal-600 text-white p-4 rounded-[20px] shadow-md flex items-center justify-between active:scale-95 transition-all">
                     <div className="flex items-center">
                       <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
                         <Headphones className="w-5 h-5 text-white" />
                         {hasUnreadSupport && (<span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>)}
                       </div>
                       <div className="text-left"><h3 className="font-black text-white text-sm">Soporte Técnico</h3><p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Hablar con Admin</p></div>
                     </div>
                     <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"><ArrowRight className="w-4 h-4 text-white" /></div>
                   </button>
                 </div>

                 {/* 🔥 SECCIÓN DEL CATÁLOGO QR 🔥 */}
                 <div className="mb-6 bg-gradient-to-br from-indigo-900 to-violet-900 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <div className="flex-1 text-center md:text-left z-10">
                      <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
                        <QrCode className="w-6 h-6 text-indigo-300" />
                      </div>
                      <h2 className="text-2xl font-black text-white mb-2">Mi Catálogo Digital</h2>
                      <p className="text-indigo-200 text-sm mb-6 leading-relaxed max-w-md">
                        Tus clientes pueden escanear este código QR para ver tu inventario disponible en tiempo real desde sus teléfonos.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(catalogUrl);
                            alert("¡Link copiado al portapapeles!");
                          }}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <LinkIcon className="w-4 h-4" /> Copiar Link
                        </button>
                        <button 
                          onClick={downloadQR}
                          className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Descargar QR
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl shadow-2xl z-10 flex-shrink-0">
                      <QRCodeSVG 
                        id="catalog-qr"
                        value={catalogUrl} 
                        size={160}
                        bgColor={"#ffffff"}
                        fgColor={"#1c1c1e"}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                          src: companyInfo.logo || '',
                          x: undefined,
                          y: undefined,
                          height: 35,
                          width: 35,
                          excavate: true,
                        }}
                      />
                    </div>
                 </div>

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

                 <form onSubmit={handleSaveRatesOnly} className="mb-6 bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                      <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                      <div>
                        <h2 className="text-xl font-black text-stone-800">Tasas de Cambio</h2>
                        <p className="text-xs text-stone-400 font-bold mt-1">Basado en USD ($) como moneda principal</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative"><label className="block text-sm font-black text-stone-500 mb-2">Bolívares (VES)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Bs.</span><input type="number" step="0.01" min="0" value={rates.BCV || ''} onChange={e => setRates({...rates, BCV: parseFloat(e.target.value) || 0})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-stone-800"/></div></div>
                      <div className="relative"><label className="block text-sm font-black text-stone-500 mb-2">Euros (EUR)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">€</span><input type="number" step="0.01" min="0" value={rates.EUR || ''} onChange={e => setRates({...rates, EUR: parseFloat(e.target.value) || 0})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-stone-800"/></div></div>
                      <div className="relative"><label className="block text-sm font-black text-stone-500 mb-2">Tether (USDT)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₮</span><input type="number" step="0.01" min="0" value={rates.USDT || ''} onChange={e => setRates({...rates, USDT: parseFloat(e.target.value) || 0})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-stone-800"/></div></div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button type="submit" disabled={savingConfig} className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-teal-800 transition-all disabled:opacity-50">
                        {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Tasas
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

                 <div className="md:hidden mt-4 mb-8">
                   <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-[20px] font-black active:scale-95 transition-all shadow-sm">
                     <LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión
                   </button>
                 </div>

               </div>
            )}
          </div>
        )}
      </main>

      {/* MENÚ INFERIOR MÓVIL */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center px-1 py-3 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => { setCurrentView('historial'); setHasUnreadSupport(false); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'historial' ? 'text-indigo-600' : 'text-stone-400'}`}><History className={`w-5 h-5 mb-1 ${currentView === 'historial' ? 'fill-indigo-100' : ''}`} /><span className="text-[9px] font-bold">Historial</span></button>
        <button onClick={() => { setCurrentView('caja'); setHasUnreadSupport(false); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'caja' ? 'text-orange-500' : 'text-stone-400'}`}><ShoppingCart className={`w-5 h-5 mb-1 ${currentView === 'caja' ? 'fill-orange-100' : ''}`} /><span className="text-[9px] font-bold">Caja</span></button>
        <button onClick={() => { setCurrentView('resumen'); setHasUnreadSupport(false); }} className="relative -top-5 bg-stone-900 text-white p-3 rounded-full shadow-lg shadow-stone-900/30 border-4 border-[#f8f9fa]"><PieChart className="w-5 h-5" /></button>
        <button onClick={() => { setCurrentView('productos'); setHasUnreadSupport(false); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'productos' ? 'text-indigo-600' : 'text-stone-400'}`}><Package className={`w-5 h-5 mb-1 ${currentView === 'productos' ? 'fill-indigo-100' : ''}`} /><span className="text-[9px] font-bold">Stock</span></button>
        <button onClick={() => { setCurrentView('configuracion'); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'configuracion' ? 'text-stone-900' : 'text-stone-400'}`}><Settings className={`w-5 h-5 mb-1 ${currentView === 'configuracion' ? 'fill-stone-100' : ''}`} /><span className="text-[9px] font-bold">Ajustes</span></button>
      </nav>

      {/* 🔥 MODAL DE CREAR / EDITAR PRODUCTO 🔥 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-100 flex-shrink-0"><h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">{isEditMode ? 'Editar' : 'Nuevo Producto'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full"><X className="w-5 h-5 md:w-6 md:h-6 text-stone-500" /></button></div>
            <div className="overflow-y-auto flex-1 p-6 md:p-8 bg-stone-50/50">
              <form onSubmit={handleSubmitProduct} className="space-y-5 md:space-y-6">
                {error && <div className="p-3 md:p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl">{error}</div>}
                {success && <div className="p-3 md:p-4 bg-teal-50 border border-teal-100 text-teal-700 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl flex items-center"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Guardado!</div>}
                <div>
                  <div className="flex p-1 md:p-1.5 bg-stone-200/50 rounded-xl md:rounded-2xl mb-3 md:mb-4">
                    <button type="button" onClick={() => setImageUploadType('url')} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-black rounded-lg md:rounded-xl transition-all ${imageUploadType === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-500'}`}>URL</button>
                    <button type="button" onClick={() => setImageUploadType('upload')} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-black rounded-lg md:rounded-xl transition-all ${imageUploadType === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-500'}`}>Subir</button>
                  </div>
                  {imageUploadType === 'url' ? (
                    <div className="relative"><LinkIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-stone-400" /><input type="url" placeholder="https://..." className="w-full pl-9 md:pl-12 pr-4 py-3 md:py-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500" value={formData.customImage} onChange={(e) => setFormData({...formData, customImage: e.target.value})} /></div>
                  ) : (
                    <label className="relative border-2 border-dashed border-stone-300 rounded-[20px] md:rounded-[24px] bg-white cursor-pointer py-6 md:py-8 flex flex-col items-center justify-center overflow-hidden">
                      <input type="file" accept="image/*" className="hidden" onChange={handleLocalImageUpload} />
                      {formData.customImage && formData.customImage.startsWith('data:image') ? (<img src={formData.customImage} alt="Preview" className="absolute inset-0 w-full h-full object-contain bg-white p-2" />) : (<><UploadCloud className="w-8 h-8 md:w-10 md:h-10 text-indigo-400 mb-2 md:mb-3" /><span className="text-xs md:text-sm font-bold text-stone-500">Toca para buscar</span></>)}
                    </label>
                  )}
                </div>
                <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Nombre</label><input required className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-5">
                  <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Costo Inversión ($)</label><input required type="number" step="0.01" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-rose-600 focus:ring-2 focus:ring-indigo-500" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} placeholder="Ej: 5.00"/></div>
                  <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Precio Venta Base ($)</label><input required type="number" step="0.01" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Ej: 10.00" /></div>
                </div>

                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl md:rounded-2xl">
                   <label className="flex items-center gap-2 text-[10px] md:text-xs font-black text-rose-700 mb-1.5 md:mb-2 uppercase tracking-widest"><Percent className="w-3 h-3 md:w-4 md:h-4"/> Precio en Promoción ($) - Opcional</label>
                   <input type="number" step="0.01" className="w-full p-3 md:p-4 bg-white border border-rose-200 rounded-lg md:rounded-xl outline-none font-black text-rose-600 focus:ring-2 focus:ring-rose-500" value={formData.promoPrice} onChange={(e) => setFormData({...formData, promoPrice: e.target.value})} placeholder="Déjalo vacío si no hay oferta" />
                </div>

                <div className="flex items-center justify-between bg-white border border-stone-200 p-4 rounded-xl md:rounded-2xl">
                  <div>
                    <label className="block text-[10px] md:text-xs font-black text-stone-900 uppercase tracking-widest">Aplica IVA (16%)</label>
                    <p className="text-[10px] text-stone-500 font-medium">Desmarca si el producto está exento.</p>
                  </div>
                  <input type="checkbox" checked={formData.applyIva} onChange={(e) => setFormData({...formData, applyIva: e.target.checked})} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                </div>

                <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Stock Disponible</label><input required type="number" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-stone-800 focus:ring-2 focus:ring-indigo-500" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></div>
                <button type="submit" disabled={loading} className="w-full py-3.5 md:py-4 mt-2 bg-indigo-600 text-white font-black text-sm md:text-lg rounded-xl md:rounded-2xl active:scale-95 transition-all">{loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin mx-auto" /> : 'Guardar Producto'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;