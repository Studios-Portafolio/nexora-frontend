import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Loader2, Store, MapPin, Search, PackageX, ShoppingCart, CheckCircle2, ChefHat } from 'lucide-react';
import { useCart } from '../Hooks/useCart';
import FloatingCart from '../components/FloatingCart';
import HomeStore from '../components/HomeStore'; 

const API_URL = 'https://nexora-api-psrx.onrender.com/api/public';
const SOCKET_URL = 'https://nexora-api-psrx.onrender.com';

const PublicCatalog = () => {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [bcvRate, setBcvRate] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [categories, setCategories] = useState<string[]>(['Todas']);
  
  const [view, setView] = useState<'inicio' | 'productos' | 'cocina'>('inicio');
  const [orderReadyAlert, setOrderReadyAlert] = useState(false);

  const { cart, addToCart, updateQuantity, removeFromCart, cartTotalUSD, cartTotalBs, isCartOpen, setIsCartOpen } = useCart(bcvRate, company?.isOpen || false);

  // 🔥 INTERCEPTOR SILENCIOSO: Agrega al carrito y FUERZA a que NO se abra 🔥
  const handleProductClick = (product: any) => {
    addToCart(product);
    setIsCartOpen(false); 
  };

  useEffect(() => {
    if (isCartOpen) {
      window.history.pushState({ modal: true }, '', window.location.pathname);
    }
    const handlePopState = () => {
      if (isCartOpen) setIsCartOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isCartOpen, setIsCartOpen]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`${API_URL}/catalogo/${companyId}`);
        if (response.data.success) {
          setCompany((prev: any) => JSON.stringify(prev) !== JSON.stringify(response.data.data.company) ? response.data.data.company : prev);
          setProducts(response.data.data.products);
          setBcvRate(response.data.data.rates?.BCV || 1);
          
          const cats = new Set(response.data.data.products.map((p: any) => p.categoryName || p.description || 'General'));
          setCategories(['Todas', ...Array.from(cats) as string[]]);
        }
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      } finally {
        if (loading) setLoading(false);
      }
    };

    if (companyId) {
      fetchCatalog();
      const interval = setInterval(fetchCatalog, 5000); 
      return () => clearInterval(interval);
    }
  }, [companyId]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('notify_order_ready', () => {
      setOrderReadyAlert(true);
      setTimeout(() => { setOrderReadyAlert(false); }, 6000);
    });
    return () => { socket.disconnect(); };
  }, []);

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

  // 🔥 LÓGICA DE COCINA: Solo alimentos 🔥
  const kitchenProducts = products.filter(p => {
    const cat = (p.categoryName || p.description || '').toLowerCase();
    return cat.includes('cocina') || cat.includes('plato') || cat.includes('comida') || cat.includes('hamburguesa') || cat.includes('pizza');
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 pb-32 relative">
      
      {orderReadyAlert && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-500 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-500">
          <CheckCircle2 className="w-6 h-6 animate-pulse" />
          <span className="font-black tracking-wide text-sm whitespace-nowrap">¡Tu pedido está listo para retirar!</span>
        </div>
      )}

      {!company.isOpen && (
        <div className="bg-rose-600 p-3 text-center font-black text-xs uppercase tracking-widest sticky top-0 z-[60] shadow-lg animate-pulse">
           🚫 TIENDA CERRADA TEMPORALMENTE 🚫
        </div>
      )}

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

      {view === 'productos' && (
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
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
      )}

      {/* HEADER DE LA SECCIÓN COCINA */}
      {view === 'cocina' && (
         <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-rose-500/20 px-4 py-5 flex items-center justify-center">
            <h2 className="text-xl font-black italic tracking-tight flex items-center gap-2 text-rose-500">
               <ChefHat className="w-6 h-6" /> NUESTRA COCINA
            </h2>
         </div>
      )}

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {view === 'inicio' && <HomeStore products={products} onProductClick={(product) => handleProductClick(product)} bcvRate={bcvRate} />}
        
        {view === 'productos' && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-stone-500 flex flex-col items-center">
                <PackageX className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-bold">No se encontraron productos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 animate-in fade-in duration-500">
                {filteredProducts.map(product => {
                  const outOfStock = product.stock <= 0;
                  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
                  const activePrice = hasPromo ? product.promoPrice : product.price;

                  return (
                    <div 
                      key={product.id} 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!outOfStock) handleProductClick(product); // SILENCIOSO
                      }} 
                      className={`bg-[#151515] border border-white/5 rounded-[24px] overflow-hidden flex flex-col relative group transition-transform ${outOfStock ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                    >
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
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
                            {hasPromo && <p className="text-xs text-stone-500 line-through decoration-rose-500/50 font-medium">${parseFloat(product.price).toFixed(2)}</p>}
                            <p className={`text-lg font-black tracking-tight ${hasPromo ? 'text-rose-400' : 'text-white'}`}>${parseFloat(activePrice).toFixed(2)}</p>
                            {bcvRate > 0 && <p className="text-[10px] text-stone-400 font-bold mt-0.5">Bs. {(activePrice * bcvRate).toFixed(2)}</p>}
                          </div>
                          {!outOfStock && company.isOpen && (
                            <div className="bg-white/10 text-white p-2.5 rounded-xl transition-all shadow-lg group-hover:bg-indigo-600">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === 'cocina' && (
          <>
            {kitchenProducts.length === 0 ? (
              <div className="text-center py-20 text-stone-500 flex flex-col items-center">
                <ChefHat className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-bold">No hay platos disponibles por el momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {kitchenProducts.map(product => {
                  const outOfStock = product.stock <= 0;
                  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
                  const activePrice = hasPromo ? product.promoPrice : product.price;

                  return (
                    <div 
                      key={product.id} 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!outOfStock) handleProductClick(product); // SILENCIOSO
                      }} 
                      className={`bg-[#151515] border border-rose-500/10 rounded-[28px] overflow-hidden flex relative group transition-transform ${outOfStock ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                    >
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
                          <span className="bg-rose-500/90 text-white px-4 py-1.5 rounded-full font-black tracking-widest text-[10px] uppercase shadow-lg border border-rose-400/50 rotate-[-10deg]">Agotado</span>
                        </div>
                      )}
                      <div className="w-32 bg-[#1c1c1e] p-2 flex items-center justify-center relative flex-shrink-0 border-r border-white/5">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-[16px] drop-shadow-xl" />
                        ) : (
                          <ChefHat className="w-10 h-10 text-stone-600/50" />
                        )}
                        {hasPromo && !outOfStock && (
                          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase shadow-lg">PROMO</div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 line-clamp-1">{product.categoryName || 'Especialidad'}</p>
                          <h3 className="font-bold text-sm text-stone-200 line-clamp-2 leading-snug">{product.name}</h3>
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className={`text-xl font-black tracking-tight ${hasPromo ? 'text-rose-400' : 'text-white'}`}>${parseFloat(activePrice).toFixed(2)}</p>
                          </div>
                          {!outOfStock && company.isOpen && (
                            <div className="bg-rose-500/20 text-rose-400 p-2.5 rounded-xl transition-all shadow-lg group-hover:bg-rose-600 group-hover:text-white">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <FloatingCart 
        cart={cart} 
        company={company} 
        cartTotalUSD={cartTotalUSD} 
        cartTotalBs={cartTotalBs} 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      {/* 🔥 BOTÓN FLOTANTE: Siempre presente si el carrito no está vacío 🔥 */}
      {!isCartOpen && cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-[0_10px_25px_rgba(79,70,229,0.5)] z-50 flex items-center justify-center animate-bounce"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0a0a]">
            {cart.reduce((sum: number, item: any) => sum + item.quantity, 0)}
          </span>
        </button>
      )}

      {/* NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#151515]/95 backdrop-blur-2xl border-t border-white/5 py-4 px-8 flex justify-between items-center z-[55] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <button onClick={() => setView('inicio')} className={`flex flex-col items-center gap-1.5 transition-all w-16 ${view === 'inicio' ? 'text-indigo-500 scale-110' : 'text-stone-500 hover:text-stone-300'}`}>
          <Store className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-widest">Inicio</span>
        </button>
        <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1.5 transition-all w-16 ${view === 'cocina' ? 'text-rose-500 scale-110' : 'text-stone-500 hover:text-stone-300'}`}>
          <ChefHat className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-widest">Cocina</span>
        </button>
        <button onClick={() => setView('productos')} className={`flex flex-col items-center gap-1.5 transition-all w-16 ${view === 'productos' ? 'text-indigo-500 scale-110' : 'text-stone-500 hover:text-stone-300'}`}>
          <Search className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-widest">Menú</span>
        </button>
      </nav>
    </div>
  );
};

export default PublicCatalog;