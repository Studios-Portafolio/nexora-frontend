import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Store, MapPin, Phone, Search, PackageX } from 'lucide-react';

// Fíjate que apunta a tu API real
const API_URL = 'https://nexora-api-psrx.onrender.com/api/public';

const PublicCatalog = () => {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [categories, setCategories] = useState<string[]>(['Todas']);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`${API_URL}/catalogo/${companyId}`);
        if (response.data.success) {
          setCompany(response.data.data.company);
          const prods = response.data.data.products;
          setProducts(prods);
          
          const cats = new Set(prods.map((p: any) => p.categoryName || p.description || 'General'));
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      
      <header className="bg-[#151515] border-b border-white/5 pt-12 pb-6 px-6 relative overflow-hidden">
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
            {company.phone && <p className="flex items-center justify-center"><Phone className="w-3.5 h-3.5 mr-1.5" /> {company.phone}</p>}
          </div>
        </div>
      </header>

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

      <main className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-[#0a0a0a] border-t border-white/5 py-4 text-center z-50">
        <p className="text-[10px] font-bold text-stone-600 flex items-center justify-center uppercase tracking-widest">
          Catálogo digital potenciado por <span className="text-indigo-500 ml-1">Nexora</span>
        </p>
      </footer>
    </div>
  );
};

export default PublicCatalog;