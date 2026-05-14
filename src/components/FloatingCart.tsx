import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import TicketReceipt from './TicketReceipt'; // 🔥 IMPORTAMOS EL NUEVO MÓDULO

interface FloatingCartProps {
  cart: any[];
  company: any;
  cartTotalUSD: number;
  cartTotalBs: number;
  bcvRate: number;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({
  cart, company, cartTotalUSD, cartTotalBs, bcvRate, isCartOpen, setIsCartOpen
}) => {
  const [deliveryType, setDeliveryType] = useState<'RETIRO' | 'DELIVERY'>('RETIRO');
  const [address, setAddress] = useState('');
  const [refNumber, setRefNumber] = useState('');
  
  // 🔥 ESTADO PARA MOSTRAR EL RECIBO
  const [showReceipt, setShowReceipt] = useState(false);

  if (!isCartOpen || cart.length === 0) return null;

  // Modificamos esta función para que solo abra el recibo primero
  const handleConfirmOrder = () => {
    if (!company.isOpen) return alert("La tienda está cerrada.");
    if (company.minOrder > 0 && cartTotalUSD < company.minOrder) {
       return alert(`El pedido mínimo para esta tienda es de $${company.minOrder.toFixed(2)}`);
    }
    setShowReceipt(true);
  };

  // Esta función es la original que envía al WhatsApp, la llamaremos desde el recibo
  const executeWhatsAppSend = () => {
    let message = `*NUEVO PEDIDO WEB*%0A`;
    message += `---------------------------%0A`;
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} ($${(item.activePrice * item.quantity).toFixed(2)})%0A`;
    });
    message += `---------------------------%0A`;
    message += `*TOTAL:* $${cartTotalUSD.toFixed(2)} / Bs. ${cartTotalBs.toFixed(2)}%0A%0A`;
    message += `*MODALIDAD:* ${deliveryType === 'DELIVERY' ? '🛵 Delivery' : '🏪 Retiro en Tienda'}%0A`;
    if (deliveryType === 'DELIVERY') {
      message += `📍 *DIRECCIÓN:* ${address}%0A`;
      message += `📝 *NOTA:* ${company.deliveryNote || 'A convenir'}%0A`;
    }
    if (refNumber) message += `🔢 *REFERENCIA DE PAGO:* ${refNumber}%0A`;
    message += `%0A_(Acabo de generar el recibo digital, lo envío a continuación...)_`;

    window.open(`https://wa.me/${company.phone.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#151515]/95 backdrop-blur-2xl border-t border-white/10 z-[60] animate-in slide-in-from-bottom-full shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
         <div className="max-w-4xl mx-auto">
            {/* Cabecera */}
            <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4 relative">
               <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase">Total Pedido</p>
                  <p className="text-3xl font-black text-indigo-400">${cartTotalUSD.toFixed(2)}</p>
               </div>
               <div className="text-right pr-12">
                  <p className="text-[10px] font-black text-stone-400 uppercase">Tasa: Bs. {bcvRate.toFixed(2)}</p>
                  <p className="text-xl font-black text-white">Bs. {cartTotalBs.toFixed(2)}</p>
               </div>
               <button onClick={() => setIsCartOpen(false)} className="absolute top-0 right-0 bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
               </button>
            </div>

            {/* Lista de Productos */}
            <div className="max-h-24 overflow-y-auto mb-4 space-y-2 [&::-webkit-scrollbar]:hidden">
               {cart.map(item => (
                 <div key={item.id} className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2">
                     <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-bold">{item.quantity}x</span>
                     <span className="font-medium text-stone-300 line-clamp-1">{item.name}</span>
                   </div>
                   <span className="font-bold">${(item.activePrice * item.quantity).toFixed(2)}</span>
                 </div>
               ))}
            </div>

            <div className="space-y-3 mb-4">
               {/* Opciones Delivery */}
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setDeliveryType('RETIRO')} className={`py-2.5 rounded-xl text-xs font-black transition-all ${deliveryType === 'RETIRO' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-stone-900 text-stone-400 border border-white/10'}`}>🏪 RETIRO</button>
                 <button onClick={() => setDeliveryType('DELIVERY')} className={`py-2.5 rounded-xl text-xs font-black transition-all ${deliveryType === 'DELIVERY' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-stone-900 text-stone-400 border border-white/10'}`}>🛵 DELIVERY</button>
               </div>
               
               {deliveryType === 'DELIVERY' && (
                 <input type="text" placeholder="¿A qué dirección enviamos?" className="w-full bg-[#1c1c1e] border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-indigo-500 text-xs font-medium" value={address} onChange={(e) => setAddress(e.target.value)} />
               )}

               {/* Datos de Pago */}
               <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                 <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Cuentas para Pagar:</p>
                 <p className="font-medium text-xs text-stone-300 whitespace-pre-wrap">{company.paymentData || 'Pide los datos por WhatsApp'}</p>
                 <input type="text" placeholder="Últimos 4 números de tu transferencia..." className="mt-3 w-full bg-[#1c1c1e] border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-indigo-500 text-white font-medium" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} />
               </div>
            </div>

            <button 
              onClick={handleConfirmOrder} 
              disabled={!company.isOpen || (deliveryType === 'DELIVERY' && !address)} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-stone-800 disabled:text-stone-600 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-2 text-white"
            >
              {company.isOpen ? <><Check className="w-5 h-5"/> CONFIRMAR Y GENERAR RECIBO</> : 'CERRADO POR HOY'}
            </button>
         </div>
      </div>

      {/* RENDERIZADO DEL RECIBO FLOTANTE SI SE CONFIRMA LA ORDEN */}
      {showReceipt && (
        <TicketReceipt 
          cart={cart}
          company={company}
          cartTotalUSD={cartTotalUSD}
          cartTotalBs={cartTotalBs}
          deliveryType={deliveryType}
          address={address}
          refNumber={refNumber}
          onClose={() => setShowReceipt(false)}
          onSendWhatsApp={executeWhatsAppSend}
        />
      )}
    </>
  );
};

export default FloatingCart;