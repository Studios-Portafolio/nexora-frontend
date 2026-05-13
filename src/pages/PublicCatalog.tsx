import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Store, MapPin, Phone, Search, PackageX, ShoppingCart } from 'lucide-react';

const API_URL = 'https://nexora-api-psrx.onrender.com/api/public';

const PublicCatalog = () => {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [bcvRate, setBcvRate] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [categories, setCategories] = useState<string[]>(['Todas']);

  // 🔥 ESTADOS DEL CARRITO Y WHATSAPP 🔥
  const [cart, setCart] = useState<any[]>([]);
  const [deliveryType, setDeliveryType] = useState<'RETIRO' | 'DELIVERY'>('RETIRO');
  const [address, setAddress] = useState('');
  const [refNumber, setRefNumber] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`${API_URL}/catalogo/${companyId}`);
        if (response.data.success) {
          setCompany(response.data.data.company);
          setProducts(response.data.data.products);
          setBcvRate(response.data.data.rates?.BCV || 1);
          
          const cats = new Set(response.data.data.products.map((p: any) => p.categoryName || p.description || 'General'));
          setCategories(['Todas', ...Array.from(cats) as string[]]);
        }
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchCatalog();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-stone-400 font-bold tracking-widest uppercase text-sm animate-pulse">Cargando vitrina...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white p-6 text-center">
        <Store className="w-16 h-16 text-stone-600 mb-4" />
        <h1 className="text-2xl font-black text-stone-300">Comercio no encontrado</h1>
        <p className="text-stone-500 mt-2">Este catálogo no existe o no está disponible.</p>
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cat = p.categoryName || p.description || 'General';
    const matchesCategory = activeCategory === 'Todas' || cat === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // LÓGICA DEL CARRITO
  const addToCart = (product: any) => {
    if (!company.isOpen) return alert("La tienda está cerrada actualmente.");
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing && existing.quantity >= product.stock) return prev;
      if (!existing && product.stock <= 0) return prev;
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      const activePrice = (product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price) ? product.promoPrice : product.price;
      return [...prev, { ...product, activePrice: activePrice, quantity: 1 }];
    });
  };

  const cartTotalUSD = cart.reduce((sum, item) => sum + (item.activePrice * item.quantity), 0);
  const cartTotalBs = cartTotalUSD * bcvRate;

  // LÓGICA WHATSAPP
  const sendWhatsAppOrder = () => {
    if (!company.isOpen) return alert("La tienda está cerrada.");
    if (company.minOrder > 0 && cartTotalUSD < company.minOrder) {
       return alert(`El pedido mínimo para esta tienda es de $${company.minOrder.toFixed(2)}`);
    }
    
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
    message += `%0A_(Enviando capture del pago por aquí...)_`;

    window.open(`https://wa.me/${company.phone.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    // Agregamos padding extra abajo para que el carrito flotante no tape los productos
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 pb-96">
      
      {/* 🔴 BANNER DE TIENDA CERRADA 🔴 */}
      {!company.isOpen && (
        <div className="bg-rose-600 p-3 text-center font-black text-xs uppercase tracking-widest sticky top-0 z-[60] shadow-lg animate-pulse">
           🚫 TIENDA CERRADA TEMPORALMENTE 🚫
        </div>
      )}

      {/* 📢 BANNER DE ANUNCIO DEL DUEÑO */}
      {company.isOpen && company.catalogMessage && (
        <div className="bg-indigo-600 p-2 text-center font-bold text-[10px] uppercase tracking-widest sticky top-0 z-[60] shadow-lg">
           {company.catalogMessage}
        </div>
      )}

      <header className="bg-[#151515] border-b border-white/5 pt-10 pb-6 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-stone-900 border-2 border-white/10 rounded-[24px] shadow-2xl flex items-center justify-center overflow-hidden mb-4">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <Store className="w-10 h-10 text-stone-500" />
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">{company.name}</h1>
          
          <div className="flex flex-col gap-1 text-sm text-stone-400 font-medium">
            {company.address && <p className="flex items-center justify-center"><MapPin className="w-3.5 h-3.5 mr-1.5" /> {company.address}</p>}
          </div>
        </div>
      </header>

      <div className="sticky top-8 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
            />
          </div>
          
          <div className="flex overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:hidden">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-[#1c1c1e] text-stone-400 hover:text-white border border-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-stone-500 flex flex-col items-center">
            <PackageX className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-bold">No se encontraron productos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {filteredProducts.map(product => {
              const outOfStock = product.stock <= 0;
              const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
              const activePrice = hasPromo ? product.promoPrice : product.price;

              return (
                <div key={product.id} className="bg-[#151515] border border-white/5 rounded-[24px] overflow-hidden flex flex-col relative group">
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <span className="bg-rose-500/90 text-white px-4 py-1.5 rounded-full font-black tracking-widest text-[10px] uppercase shadow-lg border border-rose-400/50 rotate-[-10deg]">Agotado</span>
                    </div>
                  )}

                  <div className="aspect-square bg-[#1c1c1e] p-4 flex items-center justify-center relative">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Store className="w-12 h-12 text-stone-600/50" />
                    )}
                    {hasPromo && !outOfStock && (
                      <div className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">Oferta</div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-[#0a0a0a]/50">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 line-clamp-1">{product.categoryName || product.description || 'General'}</p>
                      <h3 className="font-bold text-sm text-stone-200 line-clamp-2 leading-snug">{product.name}</h3>
                    </div>
                    
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        {hasPromo && (
                          <p className="text-xs text-stone-500 line-through decoration-rose-500/50 font-medium">${parseFloat(product.price).toFixed(2)}</p>
                        )}
                        <p className={`text-lg font-black tracking-tight ${hasPromo ? 'text-rose-400' : 'text-white'}`}>
                          ${parseFloat(activePrice).toFixed(2)}
                        </p>
                        {/* 🔥 MOSTRAMOS LA TASA EN BOLÍVARES DEL DUEÑO 🔥 */}
                        {bcvRate > 0 && (
                          <p className="text-[10px] text-stone-400 font-bold mt-0.5">Bs. {(activePrice * bcvRate).toFixed(2)}</p>
                        )}
                      </div>
                      
                      {/* 🔥 BOTÓN DE CARRITO 🔥 */}
                      {!outOfStock && company.isOpen && (
                        <button onClick={() => addToCart(product)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 🔥 CARRITO FLOTANTE Y PROCESO DE PAGO 🔥 */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#151515]/95 backdrop-blur-2xl border-t border-white/10 z-[60] animate-in slide-in-from-bottom-full">
           <div className="max-w-4xl mx-auto">
              {/* Cabecera del Carrito */}
              <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
                 <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase">Total Pedido</p>
                    <p className="text-3xl font-black text-indigo-400">${cartTotalUSD.toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-stone-400 uppercase">Tasa: Bs. {bcvRate.toFixed(2)}</p>
                    <p className="text-xl font-black text-white">Bs. {cartTotalBs.toFixed(2)}</p>
                 </div>
              </div>

              {/* Lista Rápida */}
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
                 {/* Opciones de Delivery */}
                 <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setDeliveryType('RETIRO')} className={`py-2.5 rounded-xl text-xs font-black transition-all ${deliveryType === 'RETIRO' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-stone-900 text-stone-400 border border-white/10'}`}>🏪 RETIRO</button>
                   <button onClick={() => setDeliveryType('DELIVERY')} className={`py-2.5 rounded-xl text-xs font-black transition-all ${deliveryType === 'DELIVERY' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-stone-900 text-stone-400 border border-white/10'}`}>🛵 DELIVERY</button>
                 </div>
                 
                 {deliveryType === 'DELIVERY' && (
                   <input type="text" placeholder="¿A qué dirección enviamos?" className="w-full bg-[#1c1c1e] border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-indigo-500 text-xs font-medium" value={address} onChange={(e) => setAddress(e.target.value)} />
                 )}

                 {/* Datos Bancarios */}
                 <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                   <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Cuentas para Pagar:</p>
                   <p className="font-medium text-xs text-stone-300 whitespace-pre-wrap">{company.paymentData || 'Pide los datos por WhatsApp'}</p>
                   <input type="text" placeholder="Últimos 4 números de tu transferencia..." className="mt-3 w-full bg-[#1c1c1e] border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-indigo-500 text-white font-medium" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} />
                 </div>
              </div>

              {/* Botón WhatsApp */}
              <button 
                onClick={sendWhatsAppOrder} 
                disabled={!company.isOpen || (deliveryType === 'DELIVERY' && !address)} 
                className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] disabled:bg-stone-800 disabled:text-stone-600 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-white"
              >
                {company.isOpen ? <><Phone className="w-5 h-5"/> ENVIAR PEDIDO POR WHATSAPP</> : 'CERRADO POR HOY'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default PublicCatalog;