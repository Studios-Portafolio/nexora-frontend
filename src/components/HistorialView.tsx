import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Loader2, Receipt, Share2, Printer } from 'lucide-react';

const API_URL = 'https://nexora-api-psrx.onrender.com/api';

interface HistorialViewProps {
  companyInfo: any;
}

const HistorialView: React.FC<HistorialViewProps> = ({ companyInfo }) => {
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

export default HistorialView;