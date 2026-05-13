import React from 'react';
import { 
  Package, 
  Image as ImageIcon, 
  Percent, 
  TrendingUp, 
  RefreshCw, 
  Receipt, 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

interface CajaViewProps {
  searchTerm: string;
  filteredProducts: any[];
  addToCart: (product: any) => void;
  cart: any[];
  rates: { [key: string]: number };
  currency: 'USD' | 'BCV' | 'EUR' | 'USDT';
  setCurrency: (currency: 'USD' | 'BCV' | 'EUR' | 'USDT') => void;
  symbols: { [key: string]: string };
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  cartSubtotalUSD: number;
  cartIvaUSD: number;
  cartIgtfUSD: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  cartTotalConverted: number;
  isProcessingSale: boolean;
  processCheckout: () => void;
  setCart: (cart: any[]) => void;
  saleError: string;
  completedCheckoutDetails: any;
  setCompletedCheckoutDetails: (details: any) => void;
  fetchRealTimeRates: (isManualClick?: boolean) => void;
  isFetchingRates: boolean;
  companyInfo?: any; // 🔥 AÑADIMOS LA INFO DE LA EMPRESA
}

const CajaView: React.FC<CajaViewProps> = ({
  searchTerm,
  filteredProducts,
  addToCart,
  cart,
  rates,
  currency,
  setCurrency,
  symbols,
  updateCartQuantity,
  removeFromCart,
  cartSubtotalUSD,
  cartIvaUSD,
  cartIgtfUSD,
  paymentMethod,
  setPaymentMethod,
  cartTotalConverted,
  isProcessingSale,
  processCheckout,
  setCart,
  saleError,
  completedCheckoutDetails,
  setCompletedCheckoutDetails,
  fetchRealTimeRates,
  isFetchingRates,
  companyInfo
}) => {

  return (
    <div className="flex-1 p-3 md:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 bg-[#f8f9fa] overflow-y-auto lg:overflow-hidden pb-24 lg:pb-6 relative">
      
      {/* 🔥 MODAL DE POS DIGITAL: PANTALLA DE ÉXITO CON TICKET DETALLADO 🔥 */}
      {completedCheckoutDetails && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-sm flex flex-col items-center bg-white rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
            
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 shadow-inner relative flex-shrink-0">
              <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-20"></div>
              <CheckCircle2 className="w-8 h-8 text-teal-600 relative z-10" />
            </div>
            
            <h2 className="text-2xl font-black text-stone-900 mb-1 tracking-tight">¡Venta Exitosa!</h2>
            <p className="text-stone-500 font-bold mb-6 text-xs bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">
              Recibo: <span className="text-stone-800">{completedCheckoutDetails.invoiceRef}</span>
            </p>

            {/* 🔥 TICKET DIGITAL DETALLADO 🔥 */}
            <div className="w-full bg-stone-50 border border-stone-200 rounded-[20px] p-5 mb-6 shadow-sm text-left">
              
              {/* Info de la Empresa */}
              <div className="text-center border-b border-stone-200 pb-4 mb-4">
                {companyInfo?.logo && <img src={companyInfo.logo} alt="Logo" className="h-10 mx-auto mb-2 object-contain" />}
                <h3 className="font-black text-stone-900 uppercase tracking-wide text-sm">{companyInfo?.name || 'Mi Empresa'}</h3>
                <p className="text-[9px] text-stone-500 font-bold mt-0.5">RIF: {companyInfo?.rif || 'J-00000000-0'}</p>
                {companyInfo?.phone && <p className="text-[9px] text-stone-500">{companyInfo.phone}</p>}
              </div>

              {/* Lista de Productos Comprados */}
              <div className="max-h-32 overflow-y-auto mb-4 text-xs font-medium text-stone-700 space-y-2 pr-2 [&::-webkit-scrollbar]:hidden">
                 {completedCheckoutDetails.items?.map((item: any, idx: number) => {
                    const priceInCurrency = (item.activePrice || item.price) * completedCheckoutDetails.exchangeRate;
                    return (
                      <div key={idx} className="flex justify-between border-b border-stone-100 pb-1.5">
                         <span className="flex-1 pr-2 truncate">{item.quantity}x {item.name}</span>
                         <span className="font-bold">{symbols[completedCheckoutDetails.currency] || '$'}{(priceInCurrency * item.quantity).toFixed(2)}</span>
                      </div>
                    )
                 })}
              </div>

              {/* Desglose de Totales */}
              <div className="border-t border-stone-200 pt-3 space-y-1.5 text-[10px] text-stone-500 font-bold">
                 <div className="flex justify-between"><span>Subtotal:</span><span>{symbols[completedCheckoutDetails.currency]}{(completedCheckoutDetails.subtotalUSD * completedCheckoutDetails.exchangeRate).toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>IVA (16%):</span><span>{symbols[completedCheckoutDetails.currency]}{(completedCheckoutDetails.ivaUSD * completedCheckoutDetails.exchangeRate).toFixed(2)}</span></div>
                 {completedCheckoutDetails.igtfUSD > 0 && <div className="flex justify-between text-rose-500"><span>IGTF (3%):</span><span>{symbols[completedCheckoutDetails.currency]}{(completedCheckoutDetails.igtfUSD * completedCheckoutDetails.exchangeRate).toFixed(2)}</span></div>}
              </div>

              {/* Total Cobrado Grande */}
              <div className="mt-4 pt-4 border-t border-stone-900 text-center">
                 <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Cobrado</p>
                 <p className="text-3xl font-black text-teal-600 tracking-tighter">
                    {symbols[completedCheckoutDetails.currency] || '$'} {completedCheckoutDetails.total.toFixed(2)}
                 </p>
                 <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] font-bold text-stone-600 bg-white border border-stone-200 py-1.5 px-3 rounded-lg w-max mx-auto shadow-sm">
                    <CreditCard className="w-3 h-3 text-teal-500" /> {completedCheckoutDetails.paymentMethod.replace('_', ' ')}
                 </div>
              </div>

            </div>

            <button 
              onClick={() => setCompletedCheckoutDetails(null)} 
              className="w-full py-3.5 bg-stone-900 text-white rounded-[16px] font-black text-sm hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      )}

      {/* --- PANEL IZQUIERDO: PRODUCTOS --- */}
      <div className="flex-1 flex flex-col min-h-[400px] lg:h-full lg:min-h-0 bg-transparent order-1">
        <div className="mb-3 md:mb-4 hidden lg:flex justify-between items-end flex-shrink-0 px-1">
          <div>
            <h1 className="text-2xl font-black text-stone-800 tracking-tight">Punto de Venta</h1>
            <p className="text-xs text-stone-500 mt-1 font-medium">{searchTerm ? `Buscando: "${searchTerm}"` : 'Toca un producto para facturar.'}</p>
          </div>
        </div>
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 overflow-y-auto pb-4 pr-1 md:pr-2 [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 md:gap-5 auto-rows-max">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full p-8 md:p-12 text-center bg-white rounded-2xl md:rounded-3xl border border-stone-200">
                  <Package className="w-8 h-8 md:w-12 md:h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 font-medium text-sm">Inventario vacío.</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
                  const activePrice = hasPromo ? product.promoPrice : product.price;
                  const displayPrice = (activePrice * (rates[currency] || 1)).toFixed(2);
                  const originalPrice = (product.price * (rates[currency] || 1)).toFixed(2);
                  
                  // LÓGICA DE STOCK EN TIEMPO REAL
                  const cartItem = cart.find(c => c.id === product.id);
                  const stockDisponible = product.stock - (cartItem ? cartItem.quantity : 0);

                  return (
                    <button key={product.id} onClick={() => addToCart(product)} disabled={stockDisponible <= 0} className={`flex flex-col bg-white border border-stone-200 rounded-[16px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 text-left h-full ${stockDisponible <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-1 active:scale-[0.98]'}`}>
                      <div className="flex-shrink-0 h-28 md:h-40 w-full flex items-center justify-center border-b border-stone-100 relative overflow-hidden bg-stone-50">
                        {hasPromo && <span className="absolute top-2 right-2 z-10 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-md flex items-center"><Percent className="w-2.5 h-2.5 mr-0.5"/> Oferta</span>}
                        {product.image ? (<img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" draggable="false" />) : (<ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-stone-300" />)}
                        {stockDisponible <= 0 && <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center backdrop-blur-sm"><span className="bg-rose-500 text-white text-[9px] md:text-[11px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg tracking-widest uppercase">Agotado</span></div>}
                      </div>
                      <div className="p-3 md:p-5 flex-1 flex flex-col justify-between w-full bg-white">
                        <div>
                          <p className="font-bold text-stone-800 text-xs md:text-base line-clamp-2 leading-snug mb-1">{product.name} {product.applyIva && <span className="text-[8px] bg-stone-100 px-1 py-0.5 rounded text-stone-500">IVA</span>}</p>
                          <p className="text-[9px] md:text-xs text-stone-400 font-bold uppercase tracking-wider">{product.category}</p>
                        </div>
                        <div className="mt-2 md:mt-4 flex justify-between items-end">
                           <div className="flex flex-col items-start">
                              {hasPromo && <span className="text-[9px] md:text-[10px] text-stone-400 line-through font-bold mb-0.5">{symbols[currency]}{originalPrice}</span>}
                              <span className={`font-black text-sm md:text-lg tracking-tight ${hasPromo ? 'text-rose-500' : 'text-indigo-600'}`}>{symbols[currency]}{displayPrice}</span>
                           </div>
                           <span className="text-[9px] md:text-[11px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg">Stock: {stockDisponible}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- PANEL DERECHO: CARRITO Y COBRO --- */}
      <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-3 md:gap-4 flex-shrink-0 order-2 h-auto lg:h-full relative">
        <div className="bg-white border border-stone-200 rounded-[20px] md:rounded-[24px] shadow-sm p-3 md:p-4 relative overflow-hidden flex-shrink-0">
          <div className="flex justify-between items-center mb-2 md:mb-3.5 relative z-10">
            <h3 className="font-black text-stone-800 text-xs md:text-sm flex items-center"><TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-indigo-500" /> Moneda de Cobro</h3>
            <button onClick={() => fetchRealTimeRates(true)} disabled={isFetchingRates} className="p-1 md:p-1.5 bg-indigo-50 text-indigo-600 rounded-md md:rounded-lg hover:bg-indigo-100"><RefreshCw className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isFetchingRates ? 'animate-spin' : ''}`} /></button>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 relative z-10">
            <div onClick={() => setCurrency('USD')} className={`p-2 rounded-xl border text-center cursor-pointer transition-colors ${currency === 'USD' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}>
               <p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">USD</p>
               <p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">$ 1.00</p>
            </div>
            <div onClick={() => setCurrency('BCV')} className={`relative p-2 rounded-xl border text-center cursor-pointer transition-colors group ${currency === 'BCV' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}>
               <p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">BCV</p>
               <p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">Bs. {rates.BCV > 0 ? rates.BCV.toFixed(2) : '0'}</p>
            </div>
            <div onClick={() => setCurrency('USDT')} className={`relative p-2 rounded-xl border text-center cursor-pointer transition-colors ${currency === 'USDT' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}>
               <p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">USDT</p>
               <p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">₮ {rates.USDT > 0 ? rates.USDT.toFixed(2) : '0'}</p>
            </div>
            <div onClick={() => setCurrency('EUR')} className={`relative p-2 rounded-xl border text-center cursor-pointer transition-colors ${currency === 'EUR' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'bg-stone-50 border-stone-200'}`}>
               <p className="text-[8px] md:text-[10px] font-bold text-stone-500 mb-0.5 uppercase mt-1 md:mt-0">EUR</p>
               <p className="font-black text-stone-800 text-xs md:text-sm mt-1 md:mt-0">€ {rates.EUR > 0 ? rates.EUR.toFixed(2) : '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-[20px] md:rounded-[24px] shadow-sm flex flex-col flex-1 min-h-[400px] lg:min-h-0 overflow-hidden relative">
          <div className="p-3 md:p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center flex-shrink-0 z-10">
            <h2 className="text-sm md:text-lg font-black text-stone-800 flex items-center"><Receipt className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-500" /> Ticket</h2>
            <div className="sm:hidden flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
               <button onClick={() => setCurrency('USD')} className={`px-2 py-1 text-[10px] font-bold rounded-md ${currency === 'USD' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>$</button>
               <button onClick={() => setCurrency('BCV')} className={`px-2 py-1 text-[10px] font-bold rounded-md ${currency === 'BCV' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>Bs</button>
            </div>
          </div>
          
          <div className="flex-1 relative min-h-[200px] lg:min-h-0 bg-stone-50/50">
            <div className="absolute inset-0 overflow-y-auto p-2 md:p-3 space-y-2 [&::-webkit-scrollbar]:hidden">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 md:w-12 md:h-12 text-stone-200" />
                  <p className="text-xs md:text-sm font-bold">Carrito Vacío</p>
                </div>
              ) : (
                cart.map(item => {
                  const itemTotal = ((item.activePrice || item.price) * (rates[currency]||1) * item.quantity).toFixed(2);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-xl md:rounded-2xl border border-stone-100 flex-shrink-0 shadow-sm">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-stone-800 text-[11px] md:text-sm truncate">{item.name}</p>
                        <p className="text-[9px] md:text-xs text-stone-500 font-bold mt-0.5">{symbols[currency]}{((item.activePrice || item.price) * (rates[currency]||1)).toFixed(2)} c/u</p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <div className="flex items-center mb-1.5 gap-2">
                          <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg p-1 transition-colors"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                          <span className="text-xs md:text-base font-black text-stone-800">{symbols[currency]}{itemTotal}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-stone-50 rounded-lg p-0.5 md:p-1 border border-stone-200">
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-stone-200 rounded text-stone-600"><Minus className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                          <span className="text-[10px] md:text-xs font-black w-4 md:w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-stone-200 rounded text-stone-600"><Plus className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="p-3 md:p-5 bg-white border-t border-stone-100 flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            {saleError && <div className="mb-2 p-1.5 bg-rose-50 text-rose-600 text-[10px] md:text-xs font-bold rounded-lg text-center">{saleError}</div>}
            
            <div className="mb-3 border-b border-stone-100 pb-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-stone-500"><span>Subtotal:</span><span>{symbols[currency]} {(cartSubtotalUSD * (rates[currency]||1)).toFixed(2)}</span></div>
              <div className="flex justify-between text-[10px] font-bold text-stone-500"><span>IVA (16%):</span><span>{symbols[currency]} {(cartIvaUSD * (rates[currency]||1)).toFixed(2)}</span></div>
              {cartIgtfUSD > 0 && <div className="flex justify-between text-[10px] font-bold text-rose-500"><span>IGTF (3%):</span><span>{symbols[currency]} {(cartIgtfUSD * (rates[currency]||1)).toFixed(2)}</span></div>}
            </div>

            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full mb-3 p-2.5 bg-stone-50 border border-stone-200 rounded-lg md:rounded-xl text-xs md:text-sm font-bold text-stone-600 outline-none focus:ring-2 focus:ring-indigo-500">
               <option value="BS_PAGOMOVIL">Pago Móvil (0% IGTF)</option>
               <option value="BS_PUNTO">Punto de Venta (0% IGTF)</option>
               <option value="USD_EFECTIVO">Dólares Efectivo (3% IGTF)</option>
               <option value="BINANCE">Binance Pay (3% IGTF)</option>
               <option value="ZINLI">Zinli (3% IGTF)</option>
            </select>

            <div className="flex justify-between items-end mb-3"><span className="text-stone-500 font-black text-[10px] md:text-sm uppercase tracking-wider">Total Final</span><div className="text-right"><span className="text-xl md:text-4xl font-black text-stone-900 tracking-tight">{symbols[currency]}{cartTotalConverted.toFixed(2)}</span></div></div>
            
            <div className="flex gap-2">
              <button onClick={() => setCart([])} disabled={cart.length === 0 || isProcessingSale} className="px-4 py-3 md:py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 rounded-xl md:rounded-2xl font-black flex items-center justify-center transition-all active:scale-95"><Trash2 className="w-5 h-5 md:w-6 md:h-6" /></button>
              <button onClick={processCheckout} disabled={cart.length === 0 || isProcessingSale} className="flex-1 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-stone-300 disabled:to-stone-300 text-white rounded-xl md:rounded-2xl font-black flex items-center justify-center shadow-lg active:scale-[0.98] text-sm md:text-base">{isProcessingSale ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-4 h-4 md:w-6 md:h-6 mr-2" /> Emitir Factura</>}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CajaView;