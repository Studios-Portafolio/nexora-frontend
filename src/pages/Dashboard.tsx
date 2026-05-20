import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react'; // 🔥 NUEVO: Importación para el QR oculto

// 🔥 IMPORTACIÓN CORREGIDA: Se agregó Headphones aquí 🔥
import { Sparkles, Rocket, RefreshCw, Headphones } from 'lucide-react'; 

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import MobileMenu from '../components/MobileMenu';

import TrialBanner from '../components/TrialBanner';
import HistorialView from '../components/HistorialView';
import CajaView from '../components/CajaView';
import InventarioView from '../components/InventarioView';
import ResumenView from '../components/ResumenView';
import ChatView from '../components/ChatView';
import KdsView from '../components/KdsView';
import ConfiguracionView from '../components/ConfiguracionView';
import ProductFormModal from '../components/ProductFormModal';

const API_URL = 'https://nexora-api-psrx.onrender.com/api'; 
const SOCKET_URL = 'https://nexora-api-psrx.onrender.com';
const FRONTEND_URL = 'https://sistema-nexora.onrender.com'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'caja' | 'resumen' | 'productos' | 'ia' | 'configuracion' | 'historial' | 'soporte' | 'kds'>('caja'); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supportChatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);
  const currentViewRef = useRef(currentView);

  const [completedCheckoutDetails, setCompletedCheckoutDetails] = useState<any>(null);
  const [updateData, setUpdateData] = useState<{message: string, timestamp: number} | null>(null);

  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const [activeCategories, setActiveCategories] = useState<string[]>(['Alimentos', 'Limpieza', 'Electrónica']);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [companyInfo, setCompanyInfo] = useState({ 
    name: 'Mi Empresa', rif: '', phone: '', address: '', logo: '',
    isOpen: true, catalogMessage: '¡Bienvenidos!', minOrder: 0, paymentData: '', deliveryNote: ''
  });
  
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

  const getUserId = () => {
    try { const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}'); return user.id || ''; } catch { return ''; }
  };
  const catalogUrl = `${FRONTEND_URL}/catalogo/${getUserId()}`;

  const handleLogout = () => { sessionStorage.removeItem('nexora_token'); sessionStorage.removeItem('user'); navigate('/login'); };

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
    if (data.timestamp > currentVersion) { setUpdateData({ message: data.message, timestamp: data.timestamp }); }
  };

  const applyUpdateAndReload = () => {
    if (updateData) { localStorage.setItem('nexora_version', updateData.timestamp.toString()); }
    window.location.href = FRONTEND_URL;
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () => { console.log('🟢 [DASHBOARD] Socket conectado.'); });
    socketRef.current.on('check_version', evaluateUpdate);
    socketRef.current.on('force_update', evaluateUpdate);
    socketRef.current.on('receive_message', (data: any) => { setSupportMessages((prev) => [...prev, data]); if (currentViewRef.current !== 'soporte') setHasUnreadSupport(true); });
    socketRef.current.on('user_banned', (data: any) => {
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (userStr) { const user = JSON.parse(userStr); if (user.id === data.userId || user.email === data.email) { alert('Tu cuenta ha sido suspendida.'); handleLogout(); } }
    });
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  useEffect(() => {
    if (currentView === 'soporte') {
      const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      if (user.id) { socketRef.current.emit('join_chat', user.id); fetchSupportMessages(user.id); }
    }
    if (currentView === 'resumen') fetchErpDashboard();
    if (currentView === 'caja' || currentView === 'configuracion') fetchCompanyConfigFromBackend();
    currentViewRef.current = currentView;
    if (currentView === 'soporte') setHasUnreadSupport(false);
  }, [currentView]);

  const fetchErpDashboard = async () => {
    try { const token = sessionStorage.getItem('nexora_token'); const res = await axios.get(`${API_URL}/finanzas`, { headers: { Authorization: `Bearer ${token}` } }); if (res.data.success) setErpData(res.data.data); } catch (err) {}
  };

  const fetchSupportMessages = async (userId: string) => {
    try { const token = sessionStorage.getItem('nexora_token'); const res = await axios.get(`${API_URL}/chat/messages/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); if (res.data.success) setSupportMessages(res.data.data); } catch (err) {}
  };

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!supportInput.trim()) return; setIsSendingSupport(true);
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
  }, []);

  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem('nexora_token');
      const response = await axios.get(`${API_URL}/productos`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        const dbProducts = response.data.data.map((p: any) => ({
          id: p.id, name: p.name, category: p.description || 'General', stock: p.stock, price: parseFloat(p.price), promoPrice: p.promoPrice ? parseFloat(p.promoPrice) : null, cost: parseFloat(p.cost || '0'), applyIva: p.applyIva ?? true, status: p.stock > 0 ? 'Activo' : 'Agotado', image: p.image || '' 
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
        setCompanyInfo({ name: res.data.data.legalName || 'Mi Empresa', rif: res.data.data.documentId || '', phone: res.data.data.phone || '', address: res.data.data.address || '', logo: res.data.data.logo || '', isOpen: res.data.data.isOpen ?? true, catalogMessage: res.data.data.catalogMessage || '', minOrder: res.data.data.minOrder || 0, paymentData: res.data.data.paymentData || '', deliveryNote: res.data.data.deliveryNote || '' });
      }
      const ratesRes = await axios.get(`${API_URL}/settings/exchange-rates`, { headers: { Authorization: `Bearer ${token}` } });
      if(ratesRes.data.success && ratesRes.data.data) {
         setRates(prev => {
           let updated = { ...prev };
           ratesRes.data.data.forEach((r:any) => { if(r.currency === 'VES' && r.rate > 0) updated.BCV = r.rate; if(r.currency === 'EUR' && r.rate > 0) updated.EUR = r.rate; if(r.currency === 'USDT' && r.rate > 0) updated.USDT = r.rate; });
           return updated;
         });
      }
    } catch(e) {}
  };

  const handleSaveCompanyOnly = async (e?: React.FormEvent) => {
    if(e) e.preventDefault(); setSavingConfig(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      await axios.put(`${API_URL}/settings/company`, { legalName: companyInfo.name, documentId: companyInfo.rif, address: companyInfo.address, phone: companyInfo.phone, logo: companyInfo.logo, isOpen: companyInfo.isOpen, catalogMessage: companyInfo.catalogMessage, minOrder: companyInfo.minOrder, paymentData: companyInfo.paymentData, deliveryNote: companyInfo.deliveryNote }, { headers: { Authorization: `Bearer ${token}` } });
      alert('✅ ¡Datos de Configuración Guardados!');
    } catch (error) { alert('❌ Error al guardar perfil.'); } finally { setSavingConfig(false); }
  };

  const handleSaveRatesOnly = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingConfig(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      for (const curr of ['VES', 'EUR', 'USDT']) {
        const rateValue = curr === 'VES' ? rates.BCV : curr === 'EUR' ? rates.EUR : rates.USDT;
        if (!isNaN(rateValue) && rateValue > 0) { await axios.put(`${API_URL}/settings/exchange-rates`, { currency: curr, rate: rateValue }, { headers: { Authorization: `Bearer ${token}` } }); }
      }
      alert('✅ ¡Tasas de Cambio guardadas con éxito!');
    } catch (error) { alert('❌ Error al guardar tasas.'); } finally { setSavingConfig(false); }
  };

  const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setCompanyInfo({ ...companyInfo, logo: reader.result as string }); reader.readAsDataURL(file); }
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
    setCart(prevCart => prevCart.map(item => { if (item.id === productId) { const newQuantity = item.quantity + delta; if (newQuantity <= 0) return null; if (newQuantity > item.stock) return item; return { ...item, quantity: newQuantity }; } return item; }).filter(Boolean) as any[]);
  };

  const removeFromCart = (productId: string) => { setCart(prevCart => prevCart.filter(item => item.id !== productId)); };

  const cartSubtotalUSD = cart.reduce((sum, item) => sum + ((item.activePrice || item.price) * item.quantity), 0);
  const cartIvaUSD = cart.reduce((sum, item) => item.applyIva ? sum + (((item.activePrice || item.price) * item.quantity) * 0.16) : sum, 0);
  let cartIgtfUSD = 0; if(['USD_EFECTIVO', 'ZINLI', 'BINANCE', 'EUR_EFECTIVO'].includes(paymentMethod)) cartIgtfUSD = (cartSubtotalUSD + cartIvaUSD) * 0.03;
  const cartTotalFinalUSD = cartSubtotalUSD + cartIvaUSD + cartIgtfUSD;
  const cartTotalConverted = cartTotalFinalUSD * (rates[currency] || 1);

  const processCheckout = async () => {
    if (cart.length === 0) return; setIsProcessingSale(true); setSaleError('');
    try {
      const token = sessionStorage.getItem('nexora_token');
      const itemsLimpio = cart.map(item => ({ productId: String(item.id), quantity: Number(item.quantity) }));
      const resolvedCurrency = currency === 'BCV' ? 'VES' : currency;
      const paymentsObj = [{ paymentMethod: paymentMethod, currency: resolvedCurrency, amount: cartTotalConverted, exchangeRate: rates[currency] || 1 }];
      const saleData = { items: itemsLimpio, payments: paymentsObj, clientName: "Cliente de Caja", clientDoc: "V-00000000" };
      const response = await axios.post(`${API_URL}/finanzas/ventas`, saleData, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setCompletedCheckoutDetails({ invoiceRef: response.data.sale?.invoiceRef || 'S/N', total: cartTotalConverted, currency: resolvedCurrency, paymentMethod: paymentMethod, items: [...cart], subtotalUSD: cartSubtotalUSD, ivaUSD: cartIvaUSD, igtfUSD: cartIgtfUSD, exchangeRate: rates[currency] || 1 });
        setCart([]); fetchProducts(); 
      }
    } catch (err: any) { setSaleError(err.response?.data?.message || 'Error al procesar la venta.'); } finally { setIsProcessingSale(false); }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; const excelData = new FormData(); excelData.append('file', file); setIsUploadingExcel(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      await axios.post(`${API_URL}/productos/import`, excelData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
      alert('📦 Inventario masivo importado con éxito.'); fetchProducts(); 
    } catch (error: any) { alert('Error importando el archivo Excel.'); } finally { setIsUploadingExcel(false); if (e.target) e.target.value = ''; }
  };

  const handleAddCategory = () => { const trimmed = newCategoryInput.trim(); if (trimmed && !activeCategories.includes(trimmed)) { const updated = [...activeCategories, trimmed]; setActiveCategories(updated); localStorage.setItem('nexora_custom_categories', JSON.stringify(updated)); setNewCategoryInput(''); } };
  const handleRemoveCategory = (catToRemove: string) => { if (activeCategories.length <= 1) return alert("Debe haber al menos una categoría."); const updated = activeCategories.filter(c => c !== catToRemove); setActiveCategories(updated); localStorage.setItem('nexora_custom_categories', JSON.stringify(updated)); };
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({ ...formData, customImage: reader.result as string }); reader.readAsDataURL(file); } };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const token = sessionStorage.getItem('nexora_token');
      const payload = { name: formData.name, price: parseFloat(formData.price), promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null, cost: parseFloat(formData.cost), stock: parseInt(formData.stock), applyIva: formData.applyIva, categoryName: formData.category, image: formData.customImage || undefined };
      if (isEditMode && editingProductId) { await axios.put(`${API_URL}/productos/${editingProductId}`, payload, { headers: { Authorization: `Bearer ${token}` } }); } else { await axios.post(`${API_URL}/productos`, payload, { headers: { Authorization: `Bearer ${token}` } }); }
      fetchProducts(); setSuccess(true); setTimeout(() => { setIsModalOpen(false); setSuccess(false); resetForm(); }, 1500);
    } catch (err: any) { setError('Error al guardar producto.'); } finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id: string) => { if (window.confirm('¿Eliminar permanentemente?')) { try { const token = sessionStorage.getItem('nexora_token'); await axios.delete(`${API_URL}/productos/${id}`, { headers: { Authorization: `Bearer ${token}` }}); fetchProducts(); } catch (error) { alert('Error.'); } } };
  const openEditModal = (product: any) => { setFormData({ name: product.name, category: product.category, price: product.price.toString(), promoPrice: product.promoPrice ? product.promoPrice.toString() : '', cost: product.cost.toString(), stock: product.stock.toString(), customImage: product.image, applyIva: product.applyIva }); setImageUploadType(product.image ? 'url' : 'upload'); setEditingProductId(product.id); setIsEditMode(true); setIsModalOpen(true); };
  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };
  const resetForm = () => { setIsEditMode(false); setEditingProductId(null); setFormData({ name: '', category: activeCategories[0] || 'General', price: '', promoPrice: '', cost: '', stock: '', customImage: '', applyIva: true }); };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!chatInput.trim()) return; const userMessage = chatInput.trim(); setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]); setChatInput(''); setIsAiTyping(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      const response = await fetch(`${API_URL}/ia/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ pregunta: userMessage, companyInfo: companyInfo }) });
      const data = await response.json();
      if(data.success) { setChatMessages(prev => [...prev, { role: 'ai', text: data.respuesta }]); } else { setChatMessages(prev => [...prev, { role: 'ai', text: data.message || 'Error del motor IA.' }]); }
    } catch (err: any) { setChatMessages(prev => [...prev, { role: 'ai', text: '❌ Error de conexión.' }]); } finally { setIsAiTyping(false); }
  };

  // 🔥 LÓGICA OPTIMIZADA PARA CELULARES Y QR OCULTO 🔥
  const downloadQR = () => {
    // Buscamos el QR oculto que ahora SIEMPRE está en la pantalla (al final del código)
    const svg = document.getElementById("catalog-qr-hidden"); 
    if (!svg) {
      alert("No se encontró el QR. Asegúrate de estar en el Dashboard.");
      return;
    }
    
    const svgData = new XMLSerializer().serializeToString(svg); 
    const svgUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    
    const canvas = document.createElement("canvas"); 
    const ctx = canvas.getContext("2d"); 
    const img = new Image();
    
    img.onload = () => { 
      canvas.width = 400; 
      canvas.height = 550; 
      
      if(ctx) { 
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#1c1c1e";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(companyInfo.name || 'Nexora Store', canvas.width / 2, 70);
        
        const qrSize = 300;
        const xPos = (canvas.width - qrSize) / 2;
        ctx.drawImage(img, xPos, 100, qrSize, qrSize); 
        
        ctx.fillStyle = "#6b7280";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("ESCANEA PARA VER EL CATÁLOGO", canvas.width / 2, 450);
        ctx.fillText("¡Haz tu pedido por WhatsApp!", canvas.width / 2, 480);
      } 
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `Tarjeta_QR_${companyInfo.name || 'Nexora'}.png`;
        const file = new File([blob], fileName, { type: "image/png" });
        
        // Intento nativo de celular
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Mi Tienda QR',
              text: 'Escanea este QR para ver nuestro catálogo'
            });
            return; 
          } catch (err) {
            console.log("Compartir cancelado");
          }
        }

        // Descarga normal para PC o si el celular lo permite
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.style.display = "none";
        downloadLink.href = url;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(url);
        }, 100);

      }, 'image/png');
    };
    img.src = svgUrl;
  };

  return (
    <div className="h-screen w-full bg-[#f8f9fa] flex flex-col md:flex-row overflow-hidden font-sans text-stone-900 select-none relative">
      
      {updateData && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative border border-stone-100">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30 transform rotate-12"><Rocket className="w-8 h-8 text-white -rotate-12" /></div>
            <h2 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">¡Nueva Versión!</h2>
            <p className="text-sm font-medium text-stone-500 mb-6 leading-relaxed">{updateData.message}</p>
            <div className="space-y-3 relative z-10">
              <button onClick={applyUpdateAndReload} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-[16px] font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Actualizar Ahora</button>
              <button onClick={() => setUpdateData(null)} className="w-full py-3.5 bg-stone-50 hover:bg-stone-100 text-stone-500 border border-stone-200 rounded-[16px] font-bold text-sm transition-all active:scale-95">Continuar sin actualizar</button>
            </div>
          </div>
        </div>
      )}

      {/* Componentes Estructurales Extraídos */}
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} catalogUrl={catalogUrl} downloadQR={downloadQR} setCurrentView={setCurrentView} hasUnreadSupport={hasUnreadSupport} handleLogout={handleLogout} />
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} hasUnreadSupport={hasUnreadSupport} handleLogout={handleLogout} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10 pb-16 md:pb-0">
        
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setCurrentView={setCurrentView} companyInfo={companyInfo} />
        <TrialBanner onNavigateToPlans={() => navigate('/membresia')} />

        {currentView === 'caja' && (
          <CajaView searchTerm={searchTerm} filteredProducts={filteredProducts} addToCart={addToCart} cart={cart} rates={rates} currency={currency} setCurrency={setCurrency} symbols={symbols} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} cartSubtotalUSD={cartSubtotalUSD} cartIvaUSD={cartIvaUSD} cartIgtfUSD={cartIgtfUSD} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} cartTotalConverted={cartTotalConverted} isProcessingSale={isProcessingSale} processCheckout={processCheckout} setCart={setCart} saleError={saleError} completedCheckoutDetails={completedCheckoutDetails} setCompletedCheckoutDetails={setCompletedCheckoutDetails} fetchRealTimeRates={fetchRealTimeRates} isFetchingRates={isFetchingRates} companyInfo={companyInfo} />
        )}

        {currentView === 'kds' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full relative"><KdsView /></div>
        )}

        {currentView !== 'caja' && currentView !== 'kds' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden pb-24 md:pb-8">
            {currentView === 'resumen' && <ResumenView erpData={erpData} fetchErpDashboard={fetchErpDashboard} companyInfo={companyInfo} productsList={productsList} />}
            {currentView === 'historial' && <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4"><HistorialView companyInfo={companyInfo} /></div>}
            {currentView === 'productos' && <InventarioView filteredProducts={filteredProducts} isUploadingExcel={isUploadingExcel} handleExcelUpload={handleExcelUpload} openCreateModal={openCreateModal} openEditModal={openEditModal} handleDeleteProduct={handleDeleteProduct} />}
            {currentView === 'ia' && <ChatView title="Nexora Intelligence" subtitle={`Analista de ${companyInfo.name}`} icon={<Sparkles className="w-5 h-5 md:w-6 md:h-6 text-violet-600" />} placeholder="Escribe tu consulta..." messages={chatMessages} input={chatInput} setInput={setChatInput} onSend={handleSendChatMessage} isTyping={isAiTyping} chatEndRef={chatEndRef} />}
            {currentView === 'soporte' && <ChatView title="Soporte Técnico" subtitle="Conectado con Administración" icon={<Headphones className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />} placeholder="Escribe un mensaje de soporte..." messages={supportMessages} input={supportInput} setInput={setSupportInput} onSend={handleSendSupportMessage} isTyping={isSendingSupport} chatEndRef={supportChatEndRef} />}
            {currentView === 'configuracion' && (
               <ConfiguracionView companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} rates={rates} setRates={setRates} activeCategories={activeCategories} newCategoryInput={newCategoryInput} setNewCategoryInput={setNewCategoryInput} catalogUrl={catalogUrl} downloadQR={downloadQR} handleSaveCompanyOnly={handleSaveCompanyOnly} handleSaveRatesOnly={handleSaveRatesOnly} handleCompanyLogoUpload={handleCompanyLogoUpload} handleAddCategory={handleAddCategory} handleRemoveCategory={handleRemoveCategory} savingConfig={savingConfig} fetchRealTimeRates={fetchRealTimeRates} isFetchingRates={isFetchingRates} />
            )}
          </div>
        )}
      </main>

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} setHasUnreadSupport={setHasUnreadSupport} />

      <button onClick={() => setCurrentView('ia')} className="md:hidden fixed bottom-24 right-4 bg-violet-600 text-white p-3.5 rounded-full shadow-lg shadow-violet-600/40 z-40 active:scale-95 transition-all flex items-center justify-center">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      <ProductFormModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} isEditMode={isEditMode} formData={formData} setFormData={setFormData} handleSubmitProduct={handleSubmitProduct} error={error} success={success} imageUploadType={imageUploadType} setImageUploadType={setImageUploadType} handleLocalImageUpload={handleLocalImageUpload} loading={loading} />

      {/* 🔥 QR OCULTO PERMANENTE 🔥 */}
      <div className="hidden">
        <QRCodeSVG id="catalog-qr-hidden" value={catalogUrl} size={300} bgColor={"#ffffff"} fgColor={"#1c1c1e"} level={"H"} includeMargin={false} imageSettings={{ src: companyInfo.logo || '', height: 60, width: 60, excavate: true }} />
      </div>

    </div>
  );
};

export default Dashboard;