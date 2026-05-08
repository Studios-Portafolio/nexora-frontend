import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client'; // 🔥 IMPORTACIÓN DE SOCKETS
import { 
  LayoutDashboard, Package, Tag, Sparkles, LogOut, TrendingUp, Users, 
  Search, Plus, X, Loader2, CheckCircle2, Boxes, Edit, 
  Trash2, Image as ImageIcon, UploadCloud, Link as LinkIcon, Send, 
  Settings, Building, ShoppingCart, Receipt, CreditCard, Minus,
  RefreshCw, History, DollarSign, Bitcoin, Banknote, Euro, FileSpreadsheet, Printer, FileText, FileBadge, Phone, MapPin, AlertCircle,
  Headphones, LifeBuoy
} from 'lucide-react';

const API_URL = 'http://192.168.1.40:3000/api'; 
const SOCKET_URL = 'http://192.168.1.40:3000'; // 🔥 URL DEL SERVIDOR SOCKET

const BannerGraphic = () => (
  <div className="w-full h-full bg-gradient-to-br from-stone-900 via-indigo-950 to-stone-900 relative overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
    <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 border border-white/20 rounded-[24px] md:rounded-[32px] flex items-center justify-center backdrop-blur-md bg-white/10 shadow-2xl">
       <Boxes className="w-10 h-10 md:w-14 md:h-14 text-indigo-400" />
    </div>
  </div>
);

// 🔥 BANNER ACTUALIZADO CON CONTADOR DE 5 MINUTOS 🔥
const TrialBanner = () => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutos = 300 segundos

  useEffect(() => {
    // 1. Calcular días restantes
    const userLocalStr = localStorage.getItem('user');
    if (userLocalStr) {
      try {
        const user = JSON.parse(userLocalStr);
        // Ocultar si es ADMIN o si no tiene fecha de expiración
        if (user.role === 'ADMIN' || !user.subscriptionEnd) {
           setDaysLeft(null);
           return;
        }
        
        const endDate = new Date(user.subscriptionEnd);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays > 0 ? diffDays : 0);
      } catch (e) {
        console.error("Error parseando user local");
      }
    }

    // 2. Contador regresivo segundo a segundo
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0; // Cuando llega a 0, desaparece
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // No mostrar si no hay días o si el contador llegó a 0
  if (daysLeft === null || secondsLeft <= 0) return null;

  // Formatear a MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 md:py-3 flex items-center justify-between gap-2 text-xs md:text-sm font-medium shadow-md z-30 relative shrink-0 w-full animate-in slide-in-from-top-2">
      <div className="flex items-center justify-center w-full">
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0 mr-2" />
        <span className="text-center flex items-center flex-wrap justify-center gap-1">
          <span>Estás en tu periodo de prueba. Te quedan <strong className="bg-white/20 px-2 py-0.5 rounded-full mx-1">{daysLeft} días</strong>.</span>
          <span className="ml-2 font-black text-amber-300 tracking-widest bg-black/20 px-2 py-0.5 rounded-md min-w-[50px] text-center">
            {formattedTime}
          </span>
        </span>
      </div>
      <button onClick={() => setSecondsLeft(0)} className="text-white/80 hover:text-white p-1 ml-2 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const HistorialVentas = ({ companyInfo }: { companyInfo: any }) => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVentas(); }, []);

  const fetchVentas = async () => {
    try {
      const token = localStorage.getItem('nexora_token');
      const response = await axios.get(`${API_URL}/productos/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setVentas(response.data.data);
    } catch (error) { console.error("Error cargando ventas", error); } 
    finally { setLoading(false); }
  };

  const today = new Date().toDateString();
  const ventasHoy = ventas.filter(v => new Date(v.createdAt).toDateString() === today);

  const arqueo = {
    USD: ventasHoy.filter(v => v.currency === 'USD').reduce((acc, v) => acc + v.totalNative, 0),
    BCV: ventasHoy.filter(v => v.currency === 'BCV').reduce((acc, v) => acc + v.totalNative, 0),
    USDT: ventasHoy.filter(v => v.currency === 'USDT').reduce((acc, v) => acc + v.totalNative, 0),
    EUR: ventasHoy.filter(v => v.currency === 'EUR').reduce((acc, v) => acc + v.totalNative, 0),
  };

  const handlePrintTicket = (venta: any) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return alert('Por favor permite las ventanas emergentes.');
    const symbol = venta.currency === 'USD' ? '$' : 'Bs.';
    
    const html = `
      <html>
        <head>
          <title>Ticket #${venta.id.substring(0,8).toUpperCase()}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; color: #000; font-size: 12px; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
            .header p { margin: 2px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${companyInfo.name}</h2>
            ${companyInfo.rif ? `<p>RIF: ${companyInfo.rif}</p>` : ''}
            ${companyInfo.phone ? `<p>Tel: ${companyInfo.phone}</p>` : ''}
            ${companyInfo.address ? `<p>${companyInfo.address}</p>` : ''}
            <div class="divider"></div>
            <p>Recibo #${venta.id.substring(0,8).toUpperCase()}</p>
            <p>Fecha: ${new Date(venta.createdAt).toLocaleString()}</p>
          </div>
          <div class="divider"></div>
          ${venta.items && venta.items.length > 0 ? venta.items.map((i: any) => `<div class="item"><span>${i.quantity}x ${i.name}</span><span>${symbol}${(i.price * venta.exchangeRate * i.quantity).toFixed(2)}</span></div>`).join('') : '<p>Sin detalles</p>'}
          <div class="divider"></div>
          <div class="item"><span>Moneda:</span><span>${venta.currency}</span></div>
          <div class="item"><span>Tasa:</span><span>${venta.exchangeRate.toFixed(2)} Bs.</span></div>
          <div class="divider"></div>
          <div class="total-row"><span>TOTAL</span><span>${symbol}${venta.totalNative.toFixed(2)}</span></div>
          <div class="footer"><p>¡Gracias por su compra!</p><p>Sistema Nexora Enterprise</p></div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintCierreDia = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Por favor permite las ventanas emergentes.');
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const html = `<html><head><title>Cierre de Caja - ${currentDate}</title><style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:40px;color:#333}.container{max-width:800px;margin:0 auto}.header{border-bottom:2px solid #e2e8f0;padding-bottom:20px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:flex-end}.header h1{margin:0;color:#0f172a;font-size:28px}.header p{margin:5px 0 0 0;color:#64748b}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:40px}.summary-box{background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;text-align:center}.summary-box h3{margin:0 0 10px 0;font-size:12px;text-transform:uppercase;color:#64748b}.summary-box p{margin:0;font-size:20px;font-weight:bold;color:#0f172a}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:12px 15px;border-bottom:1px solid #e2e8f0;text-align:left}th{background-color:#f8fafc;font-weight:bold;color:#475569;font-size:13px;text-transform:uppercase}td{font-size:14px}.amount{text-align:right;font-weight:bold}.footer{margin-top:50px;text-align:center;font-size:12px;color:#94a3b8}@media print{body{margin:0;padding:20px}.container{max-width:100%}}@media (max-width: 600px){.summary-grid{grid-template-columns:1fr;}.header{flex-direction:column;align-items:flex-start;}}</style></head><body><div class="container"><div class="header"><div><h1>Reporte Z - Cierre de Caja</h1><p>Empresa: <strong>${companyInfo.name}</strong></p>${companyInfo.rif ? `<p>RIF: ${companyInfo.rif}</p>` : ''}</div><div style="text-align:right"><p>Fecha de Cierre: <strong>${currentDate}</strong></p><p>Hora de Emisión: ${currentTime}</p><p>Tickets Procesados: <strong>${ventasHoy.length}</strong></p></div></div><h2 style="font-size:18px;margin-bottom:15px">Resumen de Ingresos Físicos y Digitales</h2><div class="summary-grid"><div class="summary-box"><h3>Total Efectivo (USD)</h3><p>$${arqueo.USD.toFixed(2)}</p></div><div class="summary-box"><h3>Total Oficial (BCV)</h3><p>Bs.${arqueo.BCV.toFixed(2)}</p></div><div class="summary-box"><h3>Total Binance (USDT)</h3><p>Bs.${arqueo.USDT.toFixed(2)}</p></div><div class="summary-box"><h3>Total Euro (EUR)</h3><p>Bs.${arqueo.EUR.toFixed(2)}</p></div></div><h2 style="font-size:18px;margin-bottom:15px">Detalle de Transacciones del Día</h2><div style="overflow-x:auto"><table><thead><tr><th>Recibo</th><th>Hora</th><th>Moneda</th><th>Tasa</th><th class="amount">Monto Cobrado</th></tr></thead><tbody>${ventasHoy.length===0?'<tr><td colspan="5" style="text-align:center">No hay transacciones hoy.</td></tr>':ventasHoy.map(v=>`<tr><td>#${v.id.substring(0,8).toUpperCase()}</td><td>${new Date(v.createdAt).toLocaleTimeString()}</td><td>${v.currency}</td><td>${v.exchangeRate.toFixed(2)}</td><td class="amount">${v.currency==='USD'?'$':'Bs.'}${v.totalNative.toFixed(2)}</td></tr>`).join('')}</tbody></table></div><div class="footer"><p>Documento de arqueo formal de ingresos.</p><p>Generado automáticamente por Nexora Enterprise.</p></div></div><script>window.onload=()=>{window.print();window.close()}</script></body></html>`;
    printWindow.document.write(html); printWindow.document.close();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">Arqueo e Historial</h1>
          <p className="text-stone-500 mt-1 text-sm md:text-lg">Monitor de ingresos del día.</p>
        </div>
        <button onClick={handlePrintCierreDia} className="bg-stone-900 hover:bg-stone-800 text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-bold flex items-center justify-center shadow-lg active:scale-95 transition-all w-full md:w-auto">
          <FileText className="w-5 h-5 mr-2" /> <span className="hidden md:inline">Guardar / </span>Imprimir Cierre
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-teal-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
           <div className="flex justify-between items-center mb-2 md:mb-3"><span className="text-teal-700 font-bold text-xs md:text-sm">USD (Efectivo)</span><div className="p-1.5 md:p-2 bg-teal-50 rounded-lg md:rounded-xl"><DollarSign className="w-4 h-4 md:w-5 md:h-5 text-teal-600"/></div></div>
           <p className="text-xl md:text-3xl font-black text-stone-900">${arqueo.USD.toFixed(2)}</p>
           <p className="text-[10px] md:text-xs font-semibold text-stone-400 mt-1">Hoy</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-indigo-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
           <div className="flex justify-between items-center mb-2 md:mb-3"><span className="text-indigo-700 font-bold text-xs md:text-sm">BCV (Oficial)</span><div className="p-1.5 md:p-2 bg-indigo-50 rounded-lg md:rounded-xl"><Banknote className="w-4 h-4 md:w-5 md:h-5 text-indigo-600"/></div></div>
           <p className="text-xl md:text-3xl font-black text-stone-900">Bs. {arqueo.BCV.toFixed(2)}</p>
           <p className="text-[10px] md:text-xs font-semibold text-stone-400 mt-1">Hoy</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-amber-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
           <div className="flex justify-between items-center mb-2 md:mb-3"><span className="text-amber-700 font-bold text-xs md:text-sm">USDT (Paralelo)</span><div className="p-1.5 md:p-2 bg-amber-50 rounded-lg md:rounded-xl"><Bitcoin className="w-4 h-4 md:w-5 md:h-5 text-amber-600"/></div></div>
           <p className="text-xl md:text-3xl font-black text-stone-900">Bs. {arqueo.USDT.toFixed(2)}</p>
           <p className="text-[10px] md:text-xs font-semibold text-stone-400 mt-1">Hoy</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-purple-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
           <div className="flex justify-between items-center mb-2 md:mb-3"><span className="text-purple-700 font-bold text-xs md:text-sm">EURO (EUR)</span><div className="p-1.5 md:p-2 bg-purple-50 rounded-lg md:rounded-xl"><Euro className="w-4 h-4 md:w-5 md:h-5 text-purple-600"/></div></div>
           <p className="text-xl md:text-3xl font-black text-stone-900">Bs. {arqueo.EUR.toFixed(2)}</p>
           <p className="text-[10px] md:text-xs font-semibold text-stone-400 mt-1">Hoy</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-stone-100 bg-stone-50/50 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-stone-400" />
          <h2 className="font-bold text-stone-900 text-sm md:text-base">Historial Global de Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs md:text-sm text-stone-500">
                <th className="p-3 md:p-5 font-semibold">Recibo (ID)</th><th className="p-3 md:p-5 font-semibold">Fecha</th><th className="p-3 md:p-5 font-semibold">Moneda</th>
                <th className="p-3 md:p-5 font-semibold hidden md:table-cell">Tasa</th><th className="p-3 md:p-5 font-semibold text-right">Total</th><th className="p-3 md:p-5 font-semibold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              {ventas.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-stone-500">No hay ventas registradas.</td></tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="p-3 md:p-5 font-bold text-stone-900">#{v.id.substring(0,6).toUpperCase()}</td>
                    <td className="p-3 md:p-5 text-stone-600 font-medium">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 md:p-5">
                      <span className={`px-2 py-1 md:px-3 text-[10px] md:text-xs font-bold rounded-lg ${v.currency === 'USD' ? 'bg-teal-50 text-teal-700' : v.currency === 'BCV' ? 'bg-indigo-50 text-indigo-700' : v.currency === 'USDT' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'}`}>
                        {v.currency}
                      </span>
                    </td>
                    <td className="p-3 md:p-5 text-stone-500 font-medium hidden md:table-cell">{v.exchangeRate.toFixed(2)}</td>
                    <td className="p-3 md:p-5 font-black text-stone-900 text-right">{v.currency === 'USD' ? '$' : 'Bs.'}{v.totalNative.toFixed(2)}</td>
                    <td className="p-3 md:p-5 text-center">
                      <button onClick={() => handlePrintTicket(v)} className="p-1.5 md:p-2 text-stone-400 hover:text-indigo-600 bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow transition-all"><Printer className="w-3 h-3 md:w-4 md:h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'caja' | 'resumen' | 'productos' | 'ia' | 'configuracion' | 'historial' | 'soporte'>('caja'); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // 🔥 ESTADOS PARA EL CHAT DE SOPORTE 🔥
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const supportChatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const [activeCategories, setActiveCategories] = useState<string[]>(['Alimentos', 'Limpieza', 'Electrónica']);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  
  const [companyInfo, setCompanyInfo] = useState({ name: 'Mi Empresa', rif: '', phone: '', address: '' });
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [tempCompanyInfo, setTempCompanyInfo] = useState({ ...companyInfo });

  const [totalSales, setTotalSales] = useState(0);
  const [totalClients, setTotalClients] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [cart, setCart] = useState<any[]>([]);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [saleError, setSaleError] = useState('');

  const [loading, setLoading] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageUploadType, setImageUploadType] = useState('url'); 
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '', customImage: '' });
  const [productsList, setProductsList] = useState<any[]>([]);
  
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: `Hola Angel. Soy el motor Llama 3 conectado a Nexora. He analizado tu inventario. ¿En qué te ayudo hoy?` }]);

  const [currency, setCurrency] = useState<'USD' | 'BCV' | 'EUR' | 'USDT'>('BCV');
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  
  const [rates, setRates] = useState({
    USD: 1,
    BCV: parseFloat(localStorage.getItem('nexora_rate_bcv') || '0'), 
    EUR: parseFloat(localStorage.getItem('nexora_rate_eur') || '0'), 
    USDT: parseFloat(localStorage.getItem('nexora_rate_usdt') || '0') 
  });

  const symbols = { USD: '$', BCV: 'Bs.', EUR: 'Bs.', USDT: 'Bs.' };
  const rateLabels = { USD: 'Dólares', BCV: 'Tasa BCV', EUR: 'Tasa Euro', USDT: 'Tasa USDT' };

  // 🔥 LÓGICA DE SOCKETS Y CARGA DE CHAT DE SOPORTE 🔥
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('receive_message', (data: any) => {
      setSupportMessages((prev) => [...prev, data]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentView === 'soporte') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        socketRef.current.emit('join_chat', user.id);
        fetchSupportMessages(user.id);
      }
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'soporte' && supportChatEndRef.current) {
      supportChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, currentView]);

  const fetchSupportMessages = async (userId: string) => {
    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSupportMessages(res.data.data);
      }
    } catch (err) {
      console.error("Error cargando mensajes de soporte", err);
    }
  };

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    setIsSendingSupport(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const messageData = {
      userId: user.id,
      content: supportInput.trim(),
      isAdmin: false
    };

    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.post(`${API_URL}/chat/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        // Emitimos al socket para tiempo real
        socketRef.current.emit('send_message', res.data.data);
        setSupportInput('');
      }
    } catch (err) {
      alert("Error al enviar el mensaje.");
    } finally {
      setIsSendingSupport(false);
    }
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

      const newBCV = bcvData ? parseFloat(bcvData.promedio) : rates.BCV;
      const newUSDT = usdtData ? parseFloat(usdtData.promedio) : rates.USDT;
      const newEUR = euroData ? parseFloat(euroData.promedio) : rates.EUR;

      setRates({ USD: 1, BCV: newBCV, USDT: newUSDT, EUR: newEUR });
      localStorage.setItem('nexora_rate_bcv', newBCV.toString());
      localStorage.setItem('nexora_rate_usdt', newUSDT.toString());
      localStorage.setItem('nexora_rate_eur', newEUR.toString());
    } catch (err) {
      if (isManualClick) alert("Usando tasas en memoria.");
    } finally {
      if (isManualClick) setIsFetchingRates(false);
    }
  };

  const handleEditRate = (currencyKey: keyof typeof rates, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (currencyKey === 'USD') return;
    const currentRateFormatted = rates[currencyKey] > 0 ? rates[currencyKey].toFixed(2) : '0.00';
    const newRate = prompt(`Nueva ${rateLabels[currencyKey]}:`, currentRateFormatted);
    if (newRate && !isNaN(Number(newRate))) {
      const parsedRate = parseFloat(Number(newRate).toFixed(2));
      setRates(prev => ({ ...prev, [currencyKey]: parsedRate }));
      localStorage.setItem(`nexora_rate_${currencyKey.toLowerCase()}`, parsedRate.toString());
    }
  };

  useEffect(() => {
    const savedCategories = localStorage.getItem('nexora_custom_categories');
    const savedCompanyInfo = localStorage.getItem('nexora_company_info');
    const savedSales = localStorage.getItem('nexora_total_sales');
    const savedClients = localStorage.getItem('nexora_total_clients');
    
    if (savedCompanyInfo) {
      try { setCompanyInfo(JSON.parse(savedCompanyInfo)); } catch (e) { const oldName = localStorage.getItem('nexora_company_name'); if(oldName) setCompanyInfo(prev => ({...prev, name: oldName})); }
    } else { const oldName = localStorage.getItem('nexora_company_name'); if(oldName) setCompanyInfo(prev => ({...prev, name: oldName})); }

    if (savedSales) setTotalSales(parseFloat(savedSales));
    if (savedClients) setTotalClients(parseInt(savedClients));
    
    if (savedCategories) {
      try { const parsedCategories = JSON.parse(savedCategories); if (Array.isArray(parsedCategories) && parsedCategories.length > 0) { setActiveCategories(parsedCategories); setFormData(prev => ({ ...prev, category: parsedCategories[0] })); } } catch (e) { }
    }
    
    fetchProducts(); fetchRealTimeRates(); 
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('nexora_token');
      const response = await axios.get(`${API_URL}/productos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const dbProducts = response.data.data.map((p: any) => ({
          id: p.id, name: p.name, category: p.description || 'General', stock: p.stock,
          price: parseFloat(p.price), status: p.stock > 0 ? 'Activo' : 'Agotado', image: p.image || '' 
        }));
        setProductsList(dbProducts);
      }
    } catch (err) { console.error(err); }
  };

  const filteredProducts = productsList.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));

  const addToCart = (product: any) => {
    if (product.stock <= 0) return; 
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) return prevCart; 
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }];
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

  const cartTotalUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotalConverted = cartTotalUSD * rates[currency];

  const processCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingSale(true); setSaleError('');
    try {
      const token = localStorage.getItem('nexora_token');
      
      const itemsLimpio = cart.map(item => ({ 
        id: String(item.id), 
        quantity: Number(item.quantity), 
        name: String(item.name) 
      }));

      const saleData = { 
        items: itemsLimpio, 
        totalUsd: cartTotalUSD, 
        totalNative: cartTotalConverted, 
        currency: currency, 
        exchangeRate: rates[currency] 
      };

      const response = await axios.post(`${API_URL}/productos/sale`, saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const newSales = totalSales + cartTotalUSD; const newClients = totalClients + 1;
        setTotalSales(newSales); setTotalClients(newClients);
        localStorage.setItem('nexora_total_sales', newSales.toString()); localStorage.setItem('nexora_total_clients', newClients.toString());
        setCart([]); fetchProducts(); 
        alert(`✅ Venta procesada con éxito.\nTotal: ${symbols[currency]} ${cartTotalConverted.toFixed(2)}`);
      }
    } catch (err: any) { setSaleError(err.response?.data?.message || 'Error al procesar la venta.'); } 
    finally { setIsProcessingSale(false); }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const excelData = new FormData(); excelData.append('file', file);
    setIsUploadingExcel(true);
    try {
      const token = localStorage.getItem('nexora_token');
      await axios.post(`${API_URL}/productos/import`, excelData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        } 
      });
      alert('📦 Inventario masivo importado con éxito.'); fetchProducts(); 
    } catch (error: any) { 
        console.error(error);
        alert('Error importando el archivo Excel. Verifica el Backend o el token.'); 
    } 
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

  const handleSaveCompanyInfo = () => {
    if(tempCompanyInfo.name.trim() !== '') {
      setCompanyInfo(tempCompanyInfo); localStorage.setItem('nexora_company_info', JSON.stringify(tempCompanyInfo));
    }
    setIsEditingCompany(false);
  };

  const handleLogout = () => { 
    localStorage.removeItem('nexora_token'); 
    localStorage.removeItem('user');
    navigate('/login'); 
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({ ...formData, customImage: reader.result as string }); reader.readAsDataURL(file); }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const token = localStorage.getItem('nexora_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (isEditMode && editingProductId) {
        await axios.put(`${API_URL}/productos/${editingProductId}`, { name: formData.name, price: parseFloat(formData.price), stock: parseInt(formData.stock), categoryName: formData.category, image: formData.customImage || undefined }, config);
      } else {
        await axios.post(`${API_URL}/productos`, { name: formData.name, price: parseFloat(formData.price), stock: parseInt(formData.stock), categoryName: formData.category, image: formData.customImage }, config);
      }
      fetchProducts(); setSuccess(true); setTimeout(() => { setIsModalOpen(false); setSuccess(false); resetForm(); }, 1500);
    } catch (err: any) { 
        console.error(err);
        setError('Error al guardar. Verifica que la imagen no sea muy pesada o que tu sesión esté activa.'); 
    } finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id: string) => { 
    if (window.confirm('¿Eliminar permanentemente?')) { 
      try { 
        const token = localStorage.getItem('nexora_token');
        await axios.delete(`${API_URL}/productos/${id}`, { headers: { Authorization: `Bearer ${token}` }}); 
        fetchProducts(); 
      } catch (error) { alert('Error.'); } 
    } 
  };

  const openEditModal = (product: any) => {
    setFormData({ name: product.name, category: product.category, price: product.price.toString(), stock: product.stock.toString(), customImage: product.image });
    setImageUploadType(product.image ? 'url' : 'upload'); setEditingProductId(product.id); setIsEditMode(true); setIsModalOpen(true);
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };
  const resetForm = () => { setIsEditMode(false); setEditingProductId(null); setFormData({ name: '', category: activeCategories[0] || 'General', price: '', stock: '', customImage: '' }); };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput(''); setIsAiTyping(true);
    try {
      const response = await fetch(`${API_URL}/ia/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pregunta: userMessage, companyInfo: companyInfo }) });
      const data = await response.json();
      if(data.success) { setChatMessages(prev => [...prev, { role: 'ai', text: data.respuesta }]); } 
      else { setChatMessages(prev => [...prev, { role: 'ai', text: data.message || 'Error del motor IA.' }]); }
    } catch (err: any) { setChatMessages(prev => [...prev, { role: 'ai', text: '❌ Error de conexión.' }]); } 
    finally { setIsAiTyping(false); }
  };

  return (
    <div className="h-screen w-full bg-[#f8f9fa] flex flex-col md:flex-row overflow-hidden font-sans text-stone-900 select-none">
      
      {/* SIDEBAR PC */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col flex-shrink-0 z-20 shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-stone-100 flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-indigo-200"><LayoutDashboard className="text-white w-4 h-4" /></div>
          <div>
             <span className="text-xl font-black tracking-tight text-stone-800">Nexora</span>
             <span className="ml-2 bg-indigo-50 text-indigo-600 text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest relative -top-1">v1.1</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setCurrentView('caja')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'caja' ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><ShoppingCart className={`w-5 h-5 mr-3 ${currentView === 'caja' ? 'text-orange-500' : ''}`} /> Punto de Venta</button>
          <button onClick={() => setCurrentView('resumen')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'resumen' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Resumen</button>
          <button onClick={() => setCurrentView('historial')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'historial' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><History className="w-5 h-5 mr-3" /> Historial de Caja</button>
          <button onClick={() => setCurrentView('productos')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'productos' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Package className="w-5 h-5 mr-3" /> Inventario</button>
          <button onClick={() => setCurrentView('ia')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'ia' ? 'bg-violet-50 text-violet-700 shadow-sm shadow-violet-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Sparkles className={`w-5 h-5 mr-3 ${currentView === 'ia' ? 'text-violet-600' : 'text-violet-400'}`} /> Asistente IA</button>
          <div className="my-4 border-t border-stone-100 flex-shrink-0 mx-2"></div>
          
          <button onClick={() => setCurrentView('soporte')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'soporte' ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Headphones className={`w-5 h-5 mr-3 ${currentView === 'soporte' ? 'text-teal-600' : 'text-stone-400'}`} /> Soporte Técnico</button>
          
          <button onClick={() => setCurrentView('configuracion')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'configuracion' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Settings className="w-5 h-5 mr-3" /> Configuración</button>
        </nav>
        <div className="p-4 border-t border-stone-100 flex-shrink-0"><button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"><LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10 pb-16 md:pb-0">
        
        {/* HEADER RESPONSIVE */}
        <header className="h-16 md:h-20 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-sm z-20">
          <div className="flex-1 flex items-center gap-3">
            <div className="md:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0"><Boxes className="text-white w-4 h-4" /></div>
            <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 md:w-5 md:h-5" /><input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner" /></div>
          </div>
          <div className="flex items-center space-x-3 ml-4"><span className="text-sm font-bold text-stone-700 hidden sm:block">{companyInfo.name}</span><div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-xl flex items-center justify-center font-black shadow-md text-xs md:text-sm">{companyInfo.name.substring(0,2).toUpperCase()}</div></div>
        </header>

        <TrialBanner />

        {currentView === 'caja' && (
          <div className="flex-1 p-3 md:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0 bg-[#f8f9fa] overflow-hidden">
            
            <div className="flex-1 flex flex-col h-[50%] lg:h-full min-h-0 overflow-hidden bg-transparent order-2 lg:order-1">
              <div className="mb-3 md:mb-4 flex justify-between items-end flex-shrink-0 px-1 hidden lg:flex"><div><h1 className="text-2xl font-black text-stone-800 tracking-tight">Punto de Venta</h1><p className="text-xs text-stone-500 mt-1 font-medium">{searchTerm ? `Buscando: "${searchTerm}"` : 'Toca un producto para facturar.'}</p></div></div>
              <div className="flex-1 relative min-h-0"><div className="absolute inset-0 overflow-y-auto pb-4 pr-1 md:pr-2 [&::-webkit-scrollbar]:hidden"><div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 md:gap-5 auto-rows-max">
                {filteredProducts.length === 0 ? (<div className="col-span-full p-8 md:p-12 text-center bg-white rounded-2xl md:rounded-3xl border border-stone-200"><Package className="w-8 h-8 md:w-12 md:h-12 text-stone-300 mx-auto mb-3" /><p className="text-stone-500 font-medium text-sm">Inventario vacío.</p></div>) : (
                  filteredProducts.map(product => {
                    const displayPrice = (product.price * rates[currency]).toFixed(2);
                    return (
                      <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className={`flex flex-col bg-white border border-stone-200 rounded-[16px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 text-left h-full ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-1 active:scale-[0.98]'}`}>
                        <div className="flex-shrink-0 h-28 md:h-40 w-full flex items-center justify-center border-b border-stone-100 relative overflow-hidden bg-stone-50">
                          {product.image ? (<img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" draggable="false" />) : (<ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-stone-300" />)}
                          {product.stock <= 0 && <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center backdrop-blur-sm"><span className="bg-rose-500 text-white text-[9px] md:text-[11px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg tracking-widest uppercase">Agotado</span></div>}
                        </div>
                        <div className="p-3 md:p-5 flex-1 flex flex-col justify-between w-full bg-white">
                          <div><p className="font-bold text-stone-800 text-xs md:text-base line-clamp-2 leading-snug mb-1">{product.name}</p><p className="text-[9px] md:text-xs text-stone-400 font-bold uppercase tracking-wider">{product.category}</p></div>
                          <div className="mt-2 md:mt-4 flex justify-between items-end"><span className="font-black text-indigo-600 text-sm md:text-lg tracking-tight">{symbols[currency]}{displayPrice}</span><span className="text-[9px] md:text-[11px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg">Stock: {product.stock}</span></div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div></div></div>
            </div>

            <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-3 md:gap-4 h-[50%] lg:h-full min-h-0 flex-shrink-0 order-1 lg:order-2">
              
              <div className="bg-white border border-stone-200 rounded-[20px] md:rounded-[24px] shadow-sm p-3 md:p-4 relative overflow-hidden flex-shrink-0">
                <div className="flex justify-between items-center mb-2 md:mb-3.5 relative z-10"><h3 className="font-black text-stone-800 text-xs md:text-sm flex items-center"><TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-indigo-500" /> Moneda de Cobro</h3><button onClick={() => fetchRealTimeRates(true)} disabled={isFetchingRates} className="p-1 md:p-1.5 bg-indigo-50 text-indigo-600 rounded-md md:rounded-lg hover:bg-indigo-100"><RefreshCw className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isFetchingRates ? 'animate-spin' : ''}`} /></button></div>
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 relative z-10">
                  <div onClick={() => setCurrency('USD')} className={`p-2 rounded-xl border text-center cursor-pointer transition-colors ${currency === 'USD' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}><p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">USD</p><p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">$ 1.00</p></div>
                  <div onClick={() => setCurrency('BCV')} className={`relative p-2 rounded-xl border text-center cursor-pointer transition-colors group ${currency === 'BCV' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}>
                     <button onClick={(e) => handleEditRate('BCV', e)} className="absolute top-0 right-0 p-1 md:p-1.5 text-stone-400 hover:text-indigo-600 bg-white/80 rounded-bl-lg rounded-tr-lg backdrop-blur-sm z-20"><Edit className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                     <p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">BCV</p>
                     <p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">Bs. {rates.BCV > 0 ? rates.BCV.toFixed(2) : '0'}</p>
                  </div>
                  <div onClick={() => setCurrency('USDT')} className={`relative p-2 rounded-xl border text-center cursor-pointer transition-colors ${currency === 'USDT' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}>
                     <button onClick={(e) => handleEditRate('USDT', e)} className="absolute top-0 right-0 p-1 md:p-1.5 text-stone-400 hover:text-indigo-600 bg-white/80 rounded-bl-lg rounded-tr-lg backdrop-blur-sm z-20"><Edit className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                     <p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">USDT</p>
                     <p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">Bs. {rates.USDT > 0 ? rates.USDT.toFixed(2) : '0'}</p>
                  </div>
                  <div onClick={() => setCurrency('EUR')} className={`relative p-2 rounded-xl border text-center cursor-pointer transition-colors ${currency === 'EUR' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}>
                     <button onClick={(e) => handleEditRate('EUR', e)} className="absolute top-0 right-0 p-1 md:p-1.5 text-stone-400 hover:text-indigo-600 bg-white/80 rounded-bl-lg rounded-tr-lg backdrop-blur-sm z-20"><Edit className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                     <p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">EUR</p>
                     <p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">Bs. {rates.EUR > 0 ? rates.EUR.toFixed(2) : '0'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-[20px] md:rounded-[24px] shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative">
                <div className="p-3 md:p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center flex-shrink-0 z-10"><h2 className="text-sm md:text-lg font-black text-stone-800 flex items-center"><Receipt className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-500" /> Ticket</h2>
                  <div className="sm:hidden flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                     <button onClick={() => setCurrency('USD')} className={`px-2 py-1 text-[10px] font-bold rounded-md ${currency === 'USD' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>$</button>
                     <button onClick={() => setCurrency('BCV')} className={`px-2 py-1 text-[10px] font-bold rounded-md ${currency === 'BCV' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>Bs</button>
                  </div>
                </div>
                <div className="flex-1 relative min-h-0 bg-stone-50/50">
                  <div className="absolute inset-0 overflow-y-auto p-2 md:p-3 space-y-2 [&::-webkit-scrollbar]:hidden">
                    {cart.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2"><ShoppingCart className="w-8 h-8 md:w-12 md:h-12 text-stone-200" /><p className="text-xs md:text-sm font-bold">Carrito Vacío</p></div>) : (
                      cart.map(item => {
                        const itemTotal = (item.price * rates[currency] * item.quantity).toFixed(2);
                        return (
                          <div key={item.id} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-xl md:rounded-2xl border border-stone-100 flex-shrink-0 shadow-sm">
                            <div className="flex-1 min-w-0 pr-2"><p className="font-bold text-stone-800 text-[11px] md:text-sm truncate">{item.name}</p><p className="text-[9px] md:text-xs text-stone-500 font-bold mt-0.5">{symbols[currency]}{(item.price * rates[currency]).toFixed(2)} c/u</p></div>
                            <div className="flex flex-col items-end flex-shrink-0"><span className="text-xs md:text-base font-black text-stone-800 mb-1.5">{symbols[currency]}{itemTotal}</span><div className="flex items-center space-x-1 bg-stone-50 rounded-lg p-0.5 md:p-1 border border-stone-200"><button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-stone-200 rounded text-stone-600"><Minus className="w-3 h-3 md:w-3.5 md:h-3.5" /></button><span className="text-[10px] md:text-xs font-black w-4 md:w-5 text-center">{item.quantity}</span><button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-stone-200 rounded text-stone-600"><Plus className="w-3 h-3 md:w-3.5 md:h-3.5" /></button></div></div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="p-3 md:p-5 bg-white border-t border-stone-100 flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                  {saleError && <div className="mb-2 p-1.5 bg-rose-50 text-rose-600 text-[10px] md:text-xs font-bold rounded-lg text-center">{saleError}</div>}
                  <div className="flex justify-between items-end mb-3"><span className="text-stone-500 font-black text-[10px] md:text-sm uppercase tracking-wider">Total</span><div className="text-right"><span className="text-xl md:text-4xl font-black text-stone-900 tracking-tight">{symbols[currency]}{cartTotalConverted.toFixed(2)}</span></div></div>
                  <button onClick={processCheckout} disabled={cart.length === 0 || isProcessingSale} className="w-full py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-stone-300 disabled:to-stone-300 text-white rounded-xl md:rounded-2xl font-black flex items-center justify-center shadow-lg active:scale-[0.98] text-sm md:text-base">{isProcessingSale ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-4 h-4 md:w-6 md:h-6 mr-2" /> Cobrar</>}</button>
                  {cart.length > 0 && (<button onClick={() => setCart([])} className="w-full py-1.5 md:py-2 mt-1 md:mt-2 text-stone-400 hover:text-rose-500 font-bold text-[10px] md:text-xs">Vaciar Carrito</button>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView !== 'caja' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden">
            
            {currentView === 'resumen' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-6 md:mb-8"><h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight">{companyInfo.name}</h1><p className="text-stone-500 mt-1 text-sm md:text-lg font-medium">Panel Operativo Global</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 text-center">
                   <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-stone-200 shadow-sm"><div className="flex items-center justify-between mb-2 md:mb-3"><span className="text-stone-500 font-bold uppercase tracking-wider text-[10px] md:text-xs">Ventas (USD)</span><span className="p-1.5 md:p-2 bg-orange-50 text-orange-600 rounded-lg md:rounded-xl"><TrendingUp className="w-4 h-4 md:w-5 md:h-5" /></span></div><p className="text-2xl md:text-4xl font-black text-stone-900 text-left">${totalSales.toFixed(2)}</p></div>
                   <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-stone-200 shadow-sm"><div className="flex items-center justify-between mb-2 md:mb-3"><span className="text-stone-500 font-bold uppercase tracking-wider text-[10px] md:text-xs">Productos</span><span className="p-1.5 md:p-2 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl"><Package className="w-4 h-4 md:w-5 md:h-5" /></span></div><p className="text-2xl md:text-4xl font-black text-stone-900 text-left">{productsList.length}</p></div>
                   <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-stone-200 shadow-sm"><div className="flex items-center justify-between mb-2 md:mb-3"><span className="text-stone-500 font-bold uppercase tracking-wider text-[10px] md:text-xs">Clientes</span><span className="p-1.5 md:p-2 bg-teal-50 text-teal-600 rounded-lg md:rounded-xl"><Users className="w-4 h-4 md:w-5 md:h-5" /></span></div><p className="text-2xl md:text-4xl font-black text-stone-900 text-left">{totalClients}</p></div>
                </div>
                 <div className="bg-white rounded-[24px] md:rounded-[40px] border border-stone-200 shadow-lg p-5 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
                  <div className="w-full md:w-64 h-32 md:h-64 mb-4 md:mb-0 flex-shrink-0 md:mr-10 rounded-[20px] md:rounded-[32px] overflow-hidden border-2 md:border-4 border-stone-50"><BannerGraphic /></div>
                  <div className="flex-1 text-center md:text-left z-10 w-full">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 md:mb-4"><Boxes className="w-3 h-3 md:w-3.5 md:h-3.5" /><span>NEXORA CORE</span></div>
                    <h3 className="text-xl md:text-3xl font-black text-stone-900 tracking-tighter">Sincronización en la Nube</h3>
                    <p className="text-stone-600 mt-2 md:mt-4 text-xs md:text-lg font-medium leading-relaxed">Bienvenido al ecosistema de <strong>{companyInfo.name}</strong>. Tus datos están respaldados y analizados en tiempo real.</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'historial' && ( <HistorialVentas companyInfo={companyInfo} /> )}

            {currentView === 'productos' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                  <div><h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Inventario Base</h1><p className="text-stone-500 mt-1 text-xs md:text-sm font-medium">Conectado a PostgreSQL</p></div>
                  <div className="flex space-x-2 md:space-x-3 w-full md:w-auto">
                    <input type="file" accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" id="excel-upload" onChange={handleExcelUpload} />
                    <label htmlFor="excel-upload" className="flex-1 md:flex-none bg-white border border-stone-200 text-stone-700 justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold flex items-center cursor-pointer active:scale-[0.98] shadow-sm text-xs md:text-sm hover:bg-stone-50">
                      {isUploadingExcel ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1.5 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5 mr-1.5 text-teal-600" />} Subir Excel
                    </label>
                    <button onClick={openCreateModal} className="flex-1 md:flex-none bg-indigo-600 text-white justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black flex items-center shadow-lg active:scale-[0.98] text-xs md:text-sm hover:bg-indigo-700"><Plus className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> Nuevo</button>
                  </div>
                </div>
                <div className="bg-white rounded-[20px] md:rounded-[32px] border border-stone-200 shadow-sm overflow-x-auto transition-all">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-black">
                        <th className="p-3 md:p-5 w-16 md:w-20">Img</th><th className="p-3 md:p-5">Producto</th><th className="p-3 md:p-5 hidden sm:table-cell">Cat</th>
                        <th className="p-3 md:p-5">Stock</th><th className="p-3 md:p-5">Precio</th><th className="p-3 md:p-5 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm font-medium">
                      {filteredProducts.length === 0 ? ( <tr><td colSpan={6} className="p-8 text-center text-stone-500">No hay productos.</td></tr> ) : (
                        filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50/80">
                            <td className="p-2 md:p-3"><div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">{product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" /> : <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-stone-300" />}</div></td>
                            <td className="p-3 md:p-5 font-bold text-stone-900">{product.name}</td>
                            <td className="p-3 md:p-5 hidden sm:table-cell"><span className="bg-stone-100 px-2 py-1 rounded text-[9px] md:text-[10px] font-bold uppercase">{product.category}</span></td>
                            <td className="p-3 md:p-5">{product.stock === 0 ? <span className="text-rose-600 font-black">0</span> : <span className="text-stone-700 font-black">{product.stock}</span>}</td>
                            <td className="p-3 md:p-5 font-black text-stone-900">${product.price.toFixed(2)}</td>
                            <td className="p-3 md:p-5 text-center"><div className="flex items-center justify-center space-x-1 md:space-x-2"><button onClick={() => openEditModal(product)} className="p-1.5 md:p-2 text-stone-400 hover:text-indigo-600 bg-stone-50 rounded-lg md:rounded-xl"><Edit className="w-3 h-3 md:w-4 md:h-4" /></button><button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 md:p-2 text-stone-400 hover:text-rose-600 bg-stone-50 rounded-lg md:rounded-xl"><Trash2 className="w-3 h-3 md:w-4 md:h-4" /></button></div></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'ia' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] min-h-[400px]">
                <div className="flex items-center mb-4 md:mb-6 flex-shrink-0"><div className="w-10 h-10 md:w-12 md:h-12 bg-violet-100 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4"><Sparkles className="w-5 h-5 md:w-6 md:h-6 text-violet-600" /></div>
                  <div><h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">Nexora Intelligence</h1><p className="text-[10px] md:text-sm font-bold text-stone-500">Analista de {companyInfo.name}</p></div>
                </div>
                <div className="flex-1 bg-white border border-stone-200 rounded-[24px] md:rounded-[40px] flex flex-col overflow-hidden shadow-sm">
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 [&::-webkit-scrollbar]:hidden">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 md:p-5 rounded-2xl md:rounded-3xl max-w-[90%] md:max-w-[85%] text-xs md:text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-sm whitespace-pre-wrap'}`}>{msg.text}</div>
                      </div>
                    ))}
                    {isAiTyping && <div className="text-indigo-400 font-bold text-xs md:text-sm ml-2 md:ml-4 flex items-center"><Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin mr-2"/> Analizando...</div>}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendChatMessage} className="p-2 md:p-4 bg-stone-50 border-t border-stone-200 relative flex-shrink-0 m-2 md:m-4 rounded-xl md:rounded-[24px]">
                    <input type="text" placeholder="Escribe tu consulta..." className="w-full pl-4 md:pl-6 pr-12 md:pr-16 py-3 md:py-4 bg-white border border-stone-200 rounded-lg md:rounded-2xl outline-none font-medium text-xs md:text-sm focus:border-indigo-400" value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isAiTyping} />
                    <button type="submit" disabled={!chatInput.trim() || isAiTyping} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-violet-600 text-white rounded-lg md:rounded-xl"><Send className="w-3 h-3 md:w-4 md:h-4" /></button>
                  </form>
                </div>
              </div>
            )}

            {/* 🔥 NUEVO CHAT DE SOPORTE EN TIEMPO REAL 🔥 */}
            {currentView === 'soporte' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] min-h-[400px]">
                <div className="flex items-center mb-4 md:mb-6 flex-shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-100 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4"><Headphones className="w-5 h-5 md:w-6 md:h-6 text-teal-600" /></div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">Soporte Técnico</h1>
                    <p className="text-[10px] md:text-sm font-bold text-stone-500 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Conectado con Administración</p>
                  </div>
                </div>
                
                <div className="flex-1 bg-white border border-stone-200 rounded-[24px] md:rounded-[40px] flex flex-col overflow-hidden shadow-sm">
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 [&::-webkit-scrollbar]:hidden bg-stone-50/30">
                    
                    {supportMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400">
                        <LifeBuoy className="w-12 h-12 mb-3 text-teal-200" />
                        <p className="font-bold text-sm text-stone-500 text-center px-4">Escribe tu duda, te responderemos pronto.<br/><span className="text-xs font-normal mt-2 block opacity-70">Planes: $10/mes o $60/año. Consulta métodos de pago por aquí.</span></p>
                      </div>
                    ) : (
                      supportMessages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`flex ${!msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl max-w-[90%] md:max-w-[80%] text-xs md:text-sm font-medium leading-relaxed shadow-sm ${!msg.isAdmin ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm whitespace-pre-wrap'}`}>
                            {msg.content}
                            <div className={`text-[9px] mt-1 text-right ${!msg.isAdmin ? 'text-teal-200' : 'text-stone-400'}`}>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={supportChatEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendSupportMessage} className="p-2 md:p-4 bg-white border-t border-stone-200 relative flex-shrink-0 m-2 md:m-4 rounded-xl md:rounded-[24px] shadow-sm">
                    <input type="text" placeholder="Escribe un mensaje de soporte..." className="w-full pl-4 md:pl-6 pr-12 md:pr-16 py-3 md:py-4 bg-stone-50 border border-stone-200 rounded-lg md:rounded-2xl outline-none font-medium text-xs md:text-sm focus:border-teal-400 focus:bg-white transition-colors" value={supportInput} onChange={(e) => setSupportInput(e.target.value)} disabled={isSendingSupport} />
                    <button type="submit" disabled={!supportInput.trim() || isSendingSupport} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-teal-600 text-white rounded-lg md:rounded-xl shadow-md hover:bg-teal-700 disabled:opacity-50 transition-all active:scale-95"><Send className="w-3 h-3 md:w-4 md:h-4" /></button>
                  </form>
                </div>
              </div>
            )}

            {currentView === 'configuracion' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
                 <div className="mb-6 md:mb-8"><h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Ajustes del Sistema</h1></div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                   <div className="bg-white border border-stone-200 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm">
                     <h2 className="text-lg md:text-xl font-black text-stone-900 mb-4 md:mb-6 flex items-center"><Building className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-indigo-500" /> Perfil Corporativo</h2>
                     {!isEditingCompany ? (
                       <div className="bg-stone-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-stone-100">
                         <div className="flex justify-between items-start mb-3 md:mb-4">
                           <div><h3 className="font-black text-xl md:text-2xl text-stone-900 tracking-tight">{companyInfo.name}</h3>{companyInfo.rif && <p className="text-[10px] md:text-xs font-black text-indigo-600 flex items-center mt-1 md:mt-2 uppercase tracking-widest"><FileBadge className="w-3 h-3 mr-1"/> RIF: {companyInfo.rif}</p>}</div>
                           <button onClick={() => { setIsEditingCompany(true); setTempCompanyInfo(companyInfo); }} className="p-2 md:p-2.5 bg-white shadow-sm border border-stone-200 rounded-lg md:rounded-xl text-indigo-600 hover:bg-indigo-50"><Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                         </div>
                         {(companyInfo.phone || companyInfo.address) && (
                           <div className="pt-3 md:pt-4 border-t border-stone-200 space-y-2 md:space-y-3">
                             {companyInfo.phone && <p className="text-xs md:text-sm font-bold text-stone-600 flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-stone-400"/> {companyInfo.phone}</p>}
                             {companyInfo.address && <p className="text-xs md:text-sm font-bold text-stone-600 flex items-center"><MapPin className="w-3.5 h-3.5 mr-2 text-stone-400"/> {companyInfo.address}</p>}
                           </div>
                         )}
                       </div>
                     ) : (
                       <div className="space-y-4 md:space-y-5 animate-in fade-in">
                         <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1 md:mb-2 uppercase tracking-widest">Nombre</label><input type="text" value={tempCompanyInfo.name} onChange={(e) => setTempCompanyInfo({...tempCompanyInfo, name: e.target.value})} className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500" /></div>
                         <div className="grid grid-cols-2 gap-3 md:gap-4">
                           <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1 md:mb-2 uppercase tracking-widest">RIF</label><input type="text" value={tempCompanyInfo.rif} onChange={(e) => setTempCompanyInfo({...tempCompanyInfo, rif: e.target.value})} className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500" /></div>
                           <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1 md:mb-2 uppercase tracking-widest">Teléfono</label><input type="text" value={tempCompanyInfo.phone} onChange={(e) => setTempCompanyInfo({...tempCompanyInfo, phone: e.target.value})} className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500" /></div>
                         </div>
                         <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1 md:mb-2 uppercase tracking-widest">Sede</label><input type="text" value={tempCompanyInfo.address} onChange={(e) => setTempCompanyInfo({...tempCompanyInfo, address: e.target.value})} className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500" /></div>
                         <div className="flex space-x-2 md:space-x-3 pt-2">
                           <button onClick={handleSaveCompanyInfo} className="flex-1 bg-indigo-600 text-white py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-black active:scale-95">Guardar</button>
                           <button onClick={() => setIsEditingCompany(false)} className="px-4 md:px-6 py-2.5 md:py-3.5 bg-stone-100 text-stone-600 rounded-xl md:rounded-2xl text-xs md:text-sm font-black">Cancelar</button>
                         </div>
                       </div>
                     )}
                   </div>
                   <div className="bg-white border border-stone-200 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm">
                     <h2 className="text-lg md:text-xl font-black text-stone-900 mb-3 md:mb-4 flex items-center"><Tag className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-indigo-500" /> Clasificación Global</h2>
                     <div className="flex space-x-2 md:space-x-3 mb-4 md:mb-6"><input type="text" placeholder="Nueva categoría..." value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} className="flex-1 px-4 md:px-5 py-2.5 md:py-3.5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm" /><button onClick={handleAddCategory} className="bg-stone-900 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm active:scale-95">Crear</button></div>
                     <div className="flex flex-wrap gap-2 md:gap-2.5 max-h-40 md:max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden bg-stone-50 p-3 md:p-4 rounded-[20px] md:rounded-[24px] border border-stone-100">
                       {activeCategories.map((cat, idx) => (
                         <span key={idx} className="flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-white border border-stone-200 rounded-lg md:rounded-xl text-xs md:text-sm font-black text-stone-700 shadow-sm">{cat} <button onClick={() => handleRemoveCategory(cat)} className="ml-2 md:ml-3 text-stone-400 hover:text-rose-500 p-0.5 md:p-1"><X className="w-3 h-3 md:w-4 md:h-4" /></button></span>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>
            )}
          </div>
        )}
      </main>

      {/* BOTTOM TAB BAR EN MÓVIL */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center px-1 py-3 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setCurrentView('caja')} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'caja' ? 'text-orange-500' : 'text-stone-400'}`}><ShoppingCart className={`w-5 h-5 mb-1 ${currentView === 'caja' ? 'fill-orange-100' : ''}`} /><span className="text-[9px] font-bold">Caja</span></button>
        <button onClick={() => setCurrentView('productos')} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'productos' ? 'text-indigo-600' : 'text-stone-400'}`}><Package className={`w-5 h-5 mb-1 ${currentView === 'productos' ? 'fill-indigo-100' : ''}`} /><span className="text-[9px] font-bold">Stock</span></button>
        <button onClick={() => setCurrentView('resumen')} className="relative -top-5 bg-stone-900 text-white p-3 rounded-full shadow-lg shadow-stone-900/30 border-4 border-[#f8f9fa]"><LayoutDashboard className="w-5 h-5" /></button>
        <button onClick={() => setCurrentView('soporte')} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'soporte' ? 'text-teal-600' : 'text-stone-400'}`}><Headphones className={`w-5 h-5 mb-1 ${currentView === 'soporte' ? 'fill-teal-100' : ''}`} /><span className="text-[9px] font-bold">Ayuda</span></button>
        <button onClick={() => setCurrentView('configuracion')} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'configuracion' ? 'text-stone-900' : 'text-stone-400'}`}><Settings className={`w-5 h-5 mb-1 ${currentView === 'configuracion' ? 'fill-stone-100' : ''}`} /><span className="text-[9px] font-bold">Ajustes</span></button>
      </nav>

      {/* MODALES */}
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
                  <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Costo ($)</label><input required type="number" step="0.01" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
                  <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Stock</label><input required type="number" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-stone-800 focus:ring-2 focus:ring-indigo-500" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 md:py-4 mt-2 bg-indigo-600 text-white font-black text-sm md:text-lg rounded-xl md:rounded-2xl active:scale-95 transition-all">{loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin mx-auto" /> : 'Guardar'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;