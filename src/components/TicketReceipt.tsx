import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Phone, QrCode, Store, X, CheckCircle2 } from 'lucide-react';

interface TicketReceiptProps {
  cart: any[];
  company: any;
  cartTotalUSD: number;
  cartTotalBs: number;
  deliveryType: string;
  address: string;
  refNumber: string;
  onClose: () => void;
  onSendWhatsApp: () => void;
}

const TicketReceipt: React.FC<TicketReceiptProps> = ({
  cart, company, cartTotalUSD, cartTotalBs, deliveryType, address, refNumber, onClose, onSendWhatsApp
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Generamos un número de orden aleatorio para que parezca profesional
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    
    try {
      // Tomamos la captura del elemento
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0a0a0a', // Mismo fondo oscuro
        scale: 2, // Alta resolución
      });
      
      const image = canvas.toDataURL('image/png');
      
      // Magia para descargar la imagen
      const link = document.createElement('a');
      link.href = image;
      link.download = `Recibo_Nexora_${orderNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al guardar el recibo:', error);
      alert('Hubo un error al intentar guardar la imagen.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex flex-col items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-6 right-6 bg-white/10 p-2 rounded-full text-white hover:bg-white/20">
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center w-full max-w-sm animate-in zoom-in-95 duration-300">
        <CheckCircle2 className="w-12 h-12 text-green-400 mb-4 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Pedido Confirmado</h2>

        {/* 🎟️ ESTE ES EL TICKET QUE SE VA A CAPTURAR EN IMAGEN 🎟️ */}
        <div 
          ref={ticketRef} 
          className="bg-[#151515] w-full rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Círculos decorativos del ticket */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-black rounded-full border border-white/10"></div>
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-black rounded-full border border-white/10"></div>
          
          {/* Cabecera de Tienda */}
          <div className="flex flex-col items-center border-b border-dashed border-white/20 pb-4 mb-4 text-center">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="w-12 h-12 rounded-xl mb-2 object-contain bg-stone-900 border border-white/5" />
            ) : (
              <Store className="w-10 h-10 text-stone-500 mb-2" />
            )}
            <h3 className="font-black text-lg text-white tracking-tight">{company.name}</h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Orden #{orderNumber}</p>
            <p className="text-[10px] text-stone-500">{date}</p>
          </div>

          {/* Lista de Compra */}
          <div className="space-y-2 mb-4 pb-4 border-b border-dashed border-white/20">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-start text-xs">
                <span className="text-stone-300"><span className="text-stone-500 mr-1">{item.quantity}x</span> {item.name}</span>
                <span className="font-bold text-white ml-2">${(item.activePrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="mb-4 pb-4 border-b border-dashed border-white/20 flex flex-col items-end">
            <div className="flex justify-between w-full text-xs text-stone-400 mb-1">
              <span>Subtotal:</span>
              <span>${cartTotalUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full text-lg font-black text-white mt-1">
              <span>TOTAL USD:</span>
              <span>${cartTotalUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full text-sm font-black text-indigo-400 mt-1">
              <span>TOTAL BS:</span>
              <span>Bs. {cartTotalBs.toFixed(2)}</span>
            </div>
          </div>

          {/* Datos del Cliente y Envío */}
          <div className="text-[10px] text-stone-400 mb-6 space-y-1">
            <p><strong className="text-stone-300">Tipo:</strong> {deliveryType}</p>
            {deliveryType === 'DELIVERY' && <p><strong className="text-stone-300">Dirección:</strong> {address}</p>}
            {refNumber && <p><strong className="text-stone-300">Ref. Pago:</strong> {refNumber}</p>}
          </div>

          {/* Footer del Ticket (Código QR simulado para profesionalismo) */}
          <div className="flex flex-col items-center text-center">
            <QrCode className="w-16 h-16 text-white mb-2" strokeWidth={1} />
            <p className="text-[8px] uppercase tracking-widest text-stone-500">Tecnología impulsada por Nexora</p>
          </div>
        </div>

        {/* Botones de Acción (No salen en la foto) */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-colors"
          >
            {isDownloading ? 'Generando...' : <><Download className="w-4 h-4"/> Guardar Recibo</>}
          </button>
          
          <button 
            onClick={onSendWhatsApp}
            className="flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-[#25D366]/20"
          >
            <Phone className="w-4 h-4"/> Enviar a WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
};

export default TicketReceipt;