import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ChefHat, Clock, CheckCircle2, ArrowRight, Flame, Package, Timer, RefreshCw, Trash2, Loader2, Trash } from 'lucide-react';

const API_URL = 'https://nexora-api-psrx.onrender.com/api';
const SOCKET_URL = 'https://nexora-api-psrx.onrender.com';

interface OrderItem { id: string; name: string; quantity: number; notes?: string; }
interface Order { id: string; ref: string; client: string; time: string; timestamp: number; status: 'PENDING' | 'PREPARING' | 'READY' | 'ARCHIVED'; items: OrderItem[]; }

const KdsView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);

  const fetchRealOrders = async () => {
    setIsRefreshing(true);
    try {
      const token = sessionStorage.getItem('nexora_token');
      
      // 🔥 OBTENEMOS TODOS LOS PRODUCTOS PARA SABER QUÉ ES COMIDA 🔥
      const prodRes = await axios.get(`${API_URL}/productos`, { headers: { Authorization: `Bearer ${token}` } });
      const kitchenIds = new Set<string>();
      if (prodRes.data.success) {
        prodRes.data.data.forEach((p: any) => {
          const cat = (p.categoryName || p.description || '').toLowerCase();
          if (cat.includes('cocina') || cat.includes('plato') || cat.includes('comida') || cat.includes('hamburguesa') || cat.includes('pizza')) {
            kitchenIds.add(p.id.toString());
          }
        });
      }

      const response = await axios.get(`${API_URL}/finanzas/historial`, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        const savedStatuses = JSON.parse(localStorage.getItem('nexora_kds_statuses') || '{}');
        const today = new Date(); today.setHours(0,0,0,0);
        const activeOrders: Order[] = [];

        response.data.data
          .filter((sale: any) => new Date(sale.createdAt) >= today)
          .forEach((sale: any) => {
            // 🔥 FILTRO: Solo dejamos ítems que sean de cocina 🔥
            const kitchenItems = sale.items
              .filter((item: any) => kitchenIds.has(item.id.toString()) || kitchenIds.has(item.productId?.toString()))
              .map((item: any) => ({ id: item.id, name: item.name, quantity: item.quantity, notes: item.applyIva ? '' : 'Exento' }));

            if (kitchenItems.length === 0) return; // Si compró solo harina, ignoramos

            activeOrders.push({
              id: sale.id, ref: sale.invoiceRef || '#' + sale.id.substring(0, 6).toUpperCase(),
              client: sale.clientName || 'Cliente de Caja',
              time: new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date(sale.createdAt).getTime(),
              status: savedStatuses[sale.id] || 'PENDING',
              items: kitchenItems
            });
          });

        const filtered = activeOrders.filter(o => o.status !== 'ARCHIVED').sort((a, b) => a.timestamp - b.timestamp);
        setOrders(filtered);
      }
    } catch (error) { console.error("Error cargando KDS:", error); } finally { setIsRefreshing(false); setLoading(false); }
  };

  useEffect(() => {
    fetchRealOrders();
    const interval = setInterval(fetchRealOrders, 10000);
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    return () => { clearInterval(interval); socket.disconnect(); };
  }, []);

  const moveOrder = (orderId: string, newStatus: 'PENDING' | 'PREPARING' | 'READY' | 'ARCHIVED') => {
    if (newStatus === 'READY') { socketRef.current?.emit('notify_order_ready', { orderId }); }
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      if (newStatus === 'ARCHIVED') return updated.filter(o => o.id !== orderId);
      return updated;
    });
    const savedStatuses = JSON.parse(localStorage.getItem('nexora_kds_statuses') || '{}');
    savedStatuses[orderId] = newStatus;
    localStorage.setItem('nexora_kds_statuses', JSON.stringify(savedStatuses));
  };

  const clearBoard = () => {
    if (window.confirm('¿Archivar todos los pedidos visibles?')) {
       const savedStatuses = JSON.parse(localStorage.getItem('nexora_kds_statuses') || '{}');
       orders.forEach(o => { savedStatuses[o.id] = 'ARCHIVED'; });
       localStorage.setItem('nexora_kds_statuses', JSON.stringify(savedStatuses));
       setOrders([]);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  const OrderCard = ({ order, nextStatus, nextLabel, icon: Icon, colorClass, bgClass }: { order: Order, nextStatus?: 'PREPARING' | 'READY', nextLabel?: string, icon: any, colorClass: string, bgClass: string }) => (
    <div className={`bg-white rounded-2xl border flex-shrink-0 h-auto ${bgClass} shadow-sm p-4 flex flex-col animate-in fade-in duration-300`}>
      <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3">
        <div><span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg mb-1.5 ${colorClass}`}><Icon className="w-3 h-3" /> {order.ref}</span><h4 className="font-black text-stone-800 text-sm line-clamp-1">{order.client}</h4></div>
        <div className="flex items-center text-stone-500 text-xs font-bold bg-stone-100 px-2 py-1 rounded-lg"><Clock className="w-3 h-3 mr-1" /> {order.time}</div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {order.items.map(item => (
          <div key={item.id} className="flex gap-2 items-start border-b border-stone-50 pb-1.5 last:border-0">
            <span className="bg-stone-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0">{item.quantity}x</span>
            <div><p className="text-sm font-bold text-stone-700 leading-tight">{item.name}</p></div>
          </div>
        ))}
      </div>
      <div className="pt-2 mt-auto">
        {nextStatus ? (
          <button onClick={() => moveOrder(order.id, nextStatus)} className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 text-white shadow-md`} style={{ backgroundColor: nextStatus === 'PREPARING' ? '#f97316' : '#10b981' }}>{nextLabel} <ArrowRight className="w-4 h-4" /></button>
        ) : (
          <button onClick={() => moveOrder(order.id, 'ARCHIVED')} className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-stone-100 text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"><Trash2 className="w-4 h-4" /> Archivar Pedido</button>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 bg-[#f8f9fa]"><Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" /><p className="font-bold tracking-widest uppercase text-sm">Cargando comandas...</p></div>;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#f8f9fa] p-4 md:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div><h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3"><ChefHat className="w-8 h-8 text-indigo-600" /> KDS Monitor</h1><p className="text-sm text-stone-500 font-medium mt-1">Gestión de comandas y pedidos reales.</p></div>
        <div className="flex items-center gap-2">
          <button onClick={clearBoard} className="bg-rose-50 text-rose-600 px-3 md:px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-rose-100 active:scale-95 transition-all"><Trash className="w-4 h-4" /> <span className="hidden md:inline">Vaciar Tablero</span></button>
          <button onClick={fetchRealOrders} disabled={isRefreshing} className="bg-white border border-stone-200 text-stone-600 px-3 md:px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-stone-50 active:scale-95 transition-all disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} /> <span className="hidden md:inline">Actualizar</span></button>
        </div>
      </div>
      <div className="flex-1 flex flex-row gap-4 md:gap-6 min-h-0 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
        {/* PENDIENTES */}
        <div className="w-[85vw] md:flex-1 md:w-auto flex-shrink-0 snap-center min-w-[300px] max-w-md flex flex-col bg-stone-100/50 rounded-[32px] p-4 border border-stone-200/50 min-h-0">
          <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0"><h2 className="font-black text-stone-800 flex items-center gap-2 text-lg"><Timer className="w-5 h-5 text-rose-500" /> Nuevos</h2><span className="bg-rose-100 text-rose-600 font-black text-xs px-2.5 py-1 rounded-lg">{pendingOrders.length}</span></div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 pb-4 [&::-webkit-scrollbar]:hidden">{pendingOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50 my-auto"><Package className="w-8 h-8 mb-2"/><p className="text-xs font-bold">Sin pedidos nuevos</p></div> : pendingOrders.map(order => <OrderCard key={order.id} order={order} nextStatus="PREPARING" nextLabel="Preparar" icon={Timer} colorClass="bg-rose-100 text-rose-600" bgClass="border-rose-200" />)}</div>
        </div>
        {/* PREPARANDO */}
        <div className="w-[85vw] md:flex-1 md:w-auto flex-shrink-0 snap-center min-w-[300px] max-w-md flex flex-col bg-stone-100/50 rounded-[32px] p-4 border border-stone-200/50 min-h-0">
          <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0"><h2 className="font-black text-stone-800 flex items-center gap-2 text-lg"><Flame className="w-5 h-5 text-orange-500 animate-pulse" /> En Cocina</h2><span className="bg-orange-100 text-orange-600 font-black text-xs px-2.5 py-1 rounded-lg">{preparingOrders.length}</span></div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 pb-4 [&::-webkit-scrollbar]:hidden">{preparingOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50 my-auto"><ChefHat className="w-8 h-8 mb-2"/><p className="text-xs font-bold">Cocina despejada</p></div> : preparingOrders.map(order => <OrderCard key={order.id} order={order} nextStatus="READY" nextLabel="Marcar Listo" icon={Flame} colorClass="bg-orange-100 text-orange-600" bgClass="border-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.1)]" />)}</div>
        </div>
        {/* LISTOS */}
        <div className="w-[85vw] md:flex-1 md:w-auto flex-shrink-0 snap-center min-w-[300px] max-w-md flex flex-col bg-stone-100/50 rounded-[32px] p-4 border border-stone-200/50 min-h-0">
          <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0"><h2 className="font-black text-stone-800 flex items-center gap-2 text-lg"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Para Entregar</h2><span className="bg-emerald-100 text-emerald-600 font-black text-xs px-2.5 py-1 rounded-lg">{readyOrders.length}</span></div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 pb-4 [&::-webkit-scrollbar]:hidden">{readyOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50 my-auto"><CheckCircle2 className="w-8 h-8 mb-2"/><p className="text-xs font-bold">Ningún pedido listo</p></div> : readyOrders.map(order => <OrderCard key={order.id} order={order} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" bgClass="border-emerald-300 bg-emerald-50/50" />)}</div>
        </div>
      </div>
    </div>
  );
};
export default KdsView;