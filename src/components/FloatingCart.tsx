import React, { useState } from 'react';
import { X, ShoppingBag, Send, MapPin, User, Phone, Trash2, Minus, Plus, CreditCard, Package, FileText, IdCard } from 'lucide-react';

interface FloatingCartProps {
  cart: any[];
  company: any;
  cartTotalUSD: number;
  cartTotalBs: number;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ 
  cart, company, cartTotalUSD, cartTotalBs, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart 
}) => {
  const [customerData, setCustomerData] = useState({ name: '', address: '', phone: '', cedula: '', payment: 'Pago Móvil', notes: '' });

  if (!isCartOpen) return null;

  const isFormValid = customerData.name.trim() !== '' && customerData.phone.trim() !== '' && customerData.cedula.trim() !== '';

  const handleSendWhatsApp = () => {
    if (!isFormValid) return alert("Por favor, ingresa tu Nombre, Teléfono y Cédula.");

    let message = `¡Hola! Me gustaría hacer un pedido en *${company.name}* 🛍️\n\n`;
    message += `*📋 DETALLES DEL PEDIDO:*\n`;
    cart.forEach(item => { message += `▪️ ${item.quantity}x ${item.name} - $${(item.activePrice * item.quantity).toFixed(2)}\n`; });

    message += `\n*💰 TOTAL A PAGAR:* $${cartTotalUSD.toFixed(2)} (Bs. ${cartTotalBs.toFixed(2)})\n\n`;
    message += `*👤 MIS DATOS:*\nNombre: ${customerData.name}\nCédula: ${customerData.cedula}\nTeléfono: ${customerData.phone}\n`;
    if (customerData.address) message += `Dirección / Mesa: ${customerData.address}\n`;
    message += `Método de Pago: ${customerData.payment}\n`;
    if (customerData.notes) message += `Notas Adicionales: ${customerData.notes}\n`;
    message += `\n¡Espero su confirmación! 🚀`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = company.phone ? company.phone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)}></div>
      <div className="w-full md:w-[450px] h-full bg-[#151515] border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] relative z-10 flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-[#1c1c1e]/50">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-indigo-500" /> Mi Pedido</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-stone-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 [&::-webkit-scrollbar]:hidden">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 opacity-50"><ShoppingBag className="w-16 h-16 mb-4" /><p className="font-bold text-sm uppercase tracking-widest">Tu carrito está vacío</p></div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-[#1c1c1e] p-3 rounded-2xl border border-white/5 shadow-sm">
                <div className="w-14 h-14 bg-[#0a0a0a] rounded-xl flex items-center justify-center flex-shrink-0 p-1">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" /> : <Package className="w-6 h-6 text-stone-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-stone-200 truncate">{item.name}</h4><p className="text-indigo-400 font-black text-sm">${(item.activePrice * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button onClick={() => removeFromCart(item.id)} className="text-stone-500 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                  <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-lg p-0.5 border border-white/5">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-stone-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-stone-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-4"><User className="w-4 h-4" /> Datos de Entrega (Obligatorios)</h3>
              <div className="space-y-3">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type="text" placeholder="Tu Nombre" value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative"><IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type="text" placeholder="Cédula" value={customerData.cedula} onChange={e => setCustomerData({...customerData, cedula: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium" /></div>
                  <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type="text" placeholder="Teléfono" value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium" /></div>
                </div>
              </div>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type="text" placeholder="Dirección de envío o N° de Mesa" value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium" /></div>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <select value={customerData.payment} onChange={e => setCustomerData({...customerData, payment: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 text-stone-300 pl-9 pr-3 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium appearance-none">
                  <option>Pago Móvil</option><option>Zelle / Binance</option><option>Efectivo (Dólares)</option><option>Efectivo (Bolívares)</option>
                </select>
              </div>
              <div className="relative"><FileText className="absolute left-3 top-3 w-4 h-4 text-stone-500" /><textarea placeholder="Notas adicionales..." value={customerData.notes} onChange={e => setCustomerData({...customerData, notes: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium h-20 resize-none"></textarea></div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 md:p-6 bg-[#1c1c1e] border-t border-white/5 flex-shrink-0">
            <div className="flex justify-between items-end mb-4"><span className="text-stone-400 font-bold text-xs uppercase tracking-widest">Total a Pagar</span><div className="text-right"><p className="text-2xl font-black text-white leading-none">${cartTotalUSD.toFixed(2)}</p><p className="text-xs text-stone-500 font-bold mt-1">Ref: Bs. {cartTotalBs.toFixed(2)}</p></div></div>
            <button disabled={!isFormValid} onClick={handleSendWhatsApp} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${isFormValid ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95' : 'bg-stone-800 text-stone-500 cursor-not-allowed'}`}>
              <Send className="w-4 h-4" /> {isFormValid ? 'Enviar Pedido por WhatsApp' : 'Faltan Datos'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default FloatingCart;