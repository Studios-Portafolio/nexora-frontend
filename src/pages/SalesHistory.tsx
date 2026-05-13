import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Download, X, Receipt, Loader2, Search, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';

const API_URL = 'https://nexora-api-psrx.onrender.com/api/finanzas';

export default function SalesHistory() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/historial`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSales(res.data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNCIÓN MÁGICA: Convierte el HTML en PNG y lo descarga
  const downloadInvoicePNG = async () => {
    const invoiceElement = document.getElementById('invoice-capture');
    if (!invoiceElement || !selectedSale) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(invoiceElement, {
        scale: 2, // Alta calidad
        backgroundColor: '#ffffff',
        useCORS: true // Permite capturar imágenes externas (como el logo)
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Factura_${selectedSale.invoiceRef || 'Nexora'}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Error generando PNG:", error);
      alert("Hubo un error al generar la imagen.");
    } finally {
      setDownloading(false);
    }
  };

  const filteredSales = sales.filter(s => 
    s.invoiceRef?.toLowerCase().includes(search.toLowerCase()) || 
    s.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 pb-24">
      
      {/* 🔥 BOTÓN DE VOLVER 🔥 */}
      <button onClick={() => navigate('/')} className="mb-6 flex items-center text-stone-500 hover:text-indigo-600 font-black transition-colors active:scale-95 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 w-fit">
        <ArrowLeft className="w-5 h-5 mr-2" /> Volver al Sistema
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-indigo-600" /> Libro Mayor de Ventas
          </h1>
          <p className="text-stone-500 font-medium mt-1">Historial detallado y emisión de comprobantes PNG.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar factura o cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm"
          />
        </div>
      </div>

      {/* TABLA DE HISTORIAL */}
      <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest">Factura</th>
                <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest">Fecha</th>
                <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest">Cliente</th>
                <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest text-right">Total (USD)</th>
                <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest text-right">Utilidad</th>
                <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-stone-400 font-bold"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/> Cargando ventas...</td></tr>
              ) : filteredSales.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-stone-400 font-bold">No hay ventas registradas.</td></tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-5 font-black text-stone-800 text-sm">{sale.invoiceRef || 'S/N'}</td>
                    <td className="p-5 text-sm font-medium text-stone-600">
                      {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-5 text-sm font-bold text-stone-700">{sale.clientName || 'Cliente Genérico'}</td>
                    <td className="p-5 text-right font-black text-teal-600">${(sale.totalUsd || 0).toFixed(2)}</td>
                    <td className="p-5 text-right font-black text-indigo-600">${(sale.netProfit || 0).toFixed(2)}</td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 MODAL DEL TICKET / FACTURA 🔥 */}
      {selectedSale && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 py-10 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-md my-auto relative animate-in zoom-in-95 duration-200">
            
            {/* Botón de Cerrar Flotante */}
            <button 
              onClick={() => setSelectedSale(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white text-stone-800 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 📸 ZONA DE CAPTURA (Esto es lo que se vuelve PNG) */}
            <div id="invoice-capture" className="bg-white p-8 rounded-t-2xl shadow-2xl">
              
              {/* Membrete de la Empresa */}
              <div className="text-center border-b border-stone-200 pb-6 mb-6">
                {selectedSale.user?.company?.logo && (
                  <img src={selectedSale.user.company.logo} alt="Logo" className="h-16 mx-auto mb-3 object-contain" />
                )}
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-wide">
                  {selectedSale.user?.company?.legalName || 'NEXORA STORE'}
                </h2>
                <p className="text-xs text-stone-500 font-bold mt-1">RIF: {selectedSale.user?.company?.documentId || 'J-00000000-0'}</p>
                <p className="text-xs text-stone-500">{selectedSale.user?.company?.address || 'San Salvador, El Salvador'}</p>
                <p className="text-xs text-stone-500">{selectedSale.user?.company?.phone}</p>
              </div>

              {/* Datos de la Factura */}
              <div className="flex justify-between text-xs font-bold text-stone-600 mb-6">
                <div>
                  <p>Factura N°: <span className="text-stone-900">{selectedSale.invoiceRef}</span></p>
                  <p>Cliente: <span className="text-stone-900">{selectedSale.clientName}</span></p>
                  <p>CI/RIF: <span className="text-stone-900">{selectedSale.clientDoc}</span></p>
                </div>
                <div className="text-right">
                  <p>{new Date(selectedSale.createdAt).toLocaleDateString()}</p>
                  <p>{new Date(selectedSale.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Productos */}
              <table className="w-full text-xs mb-6">
                <thead className="border-b border-stone-900">
                  <tr>
                    <th className="py-2 text-left text-stone-900 font-black">CANT</th>
                    <th className="py-2 text-left text-stone-900 font-black">DESCRIPCIÓN</th>
                    <th className="py-2 text-right text-stone-900 font-black">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedSale.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3 font-bold text-stone-700">{item.quantity}</td>
                      <td className="py-3 font-bold text-stone-700 pr-2">{item.name} {item.applyIva ? '(G)' : '(E)'}</td>
                      <td className="py-3 font-black text-stone-900 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cálculos Fiscales NIIF */}
              <div className="border-t border-stone-200 pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-stone-500 font-bold">
                  <span>Subtotal:</span>
                  <span>${(selectedSale.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500 font-bold">
                  <span>IVA (16%):</span>
                  <span>${(selectedSale.ivaAmount || 0).toFixed(2)}</span>
                </div>
                {(selectedSale.igtfAmount > 0) && (
                  <div className="flex justify-between text-stone-500 font-bold">
                    <span>IGTF (3%):</span>
                    <span>${selectedSale.igtfAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-stone-900 mt-2 pt-2 border-t border-stone-900">
                  <span>TOTAL A PAGAR:</span>
                  <span>${(selectedSale.totalUsd || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Desglose de Pagos */}
              <div className="mt-6 border-t border-stone-200 pt-4">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 text-center">Métodos de Pago Procesados</p>
                {selectedSale.payments?.map((pay: any) => (
                  <div key={pay.id} className="flex justify-between text-xs font-bold text-stone-600">
                    <span>{pay.paymentMethod.replace('_', ' ')}</span>
                    <span>{pay.amount.toFixed(2)} {pay.currency} (Tasa: {pay.exchangeRate})</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center text-[10px] text-stone-400 font-bold">
                <p>¡Gracias por su compra!</p>
                <p>Generado por Nexora System</p>
              </div>

            </div>

            {/* BOTÓN DE DESCARGA (Fuera de la zona de captura) */}
            <div className="bg-stone-50 p-4 rounded-b-2xl border-t border-stone-200 flex justify-center">
              <button 
                onClick={downloadInvoicePNG}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black shadow-md transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {downloading ? 'Generando Imagen...' : 'Descargar Recibo en PNG'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}