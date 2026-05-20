import React from 'react';
import { Star, Flame } from 'lucide-react';

interface HomeStoreProps {
  products: any[];
  onProductClick: (p: any) => void;
  bcvRate: number;
}

const HomeStore: React.FC<HomeStoreProps> = ({ products, onProductClick, bcvRate }) => {
  const featured = products.slice(0, 4);
  const promos = products.filter(p => p.promoPrice && p.promoPrice > 0).slice(0, 4);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* 🚀 MÓDULO: BANNER HERO */}
      <div className="relative h-48 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20"></div>
        <div className="relative z-10 p-8 flex flex-col justify-center h-full">
          <h2 className="text-2xl font-black italic tracking-tighter text-white">NEXORA PROMO</h2>
          <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">¡Los mejores precios!</p>
        </div>
      </div>

      {/* 🔥 MÓDULO: CARRUSEL DE OFERTAS */}
      {promos.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="flex items-center font-black text-lg gap-2 text-white"><Flame className="w-5 h-5 text-orange-500"/> OFERTAS RELÁMPAGO</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {promos.map(p => (
              <div key={p.id} onClick={() => onProductClick(p)} className="min-w-[160px] bg-[#151515] p-3 rounded-3xl border border-rose-500/20 active:scale-95 transition-transform cursor-pointer">
                {p.image ? (
                   <img src={p.image} className="w-full h-24 object-contain mb-2" alt={p.name} />
                ) : (
                   <div className="w-full h-24 bg-[#1c1c1e] rounded-xl mb-2 flex items-center justify-center text-stone-600 text-xs font-bold">Sin foto</div>
                )}
                <p className="text-[10px] font-bold text-rose-400">-{Math.round((1 - p.promoPrice/p.price) * 100)}% DCTO</p>
                <p className="font-bold text-sm line-clamp-1 text-stone-200">{p.name}</p>
                <p className="font-black text-white">${p.promoPrice.toFixed(2)}</p>
                {bcvRate > 0 && (
                  <p className="text-[10px] text-stone-400 font-bold">Bs. {(p.promoPrice * bcvRate).toFixed(2)}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ⭐ MÓDULO: DESTACADOS */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="flex items-center font-black text-lg gap-2 text-white"><Star className="w-5 h-5 text-yellow-500"/> LOS MÁS PEDIDOS</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featured.map(p => {
            const activePrice = p.promoPrice && p.promoPrice > 0 ? p.promoPrice : p.price;
            
            return (
              <div key={p.id} onClick={() => onProductClick(p)} className="bg-[#151515] p-4 rounded-[28px] border border-white/5 flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform">
                {p.image ? (
                  <img src={p.image} className="w-20 h-20 object-contain mb-3" alt={p.name} />
                ) : (
                  <div className="w-20 h-20 bg-[#1c1c1e] rounded-xl mb-3 flex items-center justify-center text-stone-600 text-xs font-bold">Sin foto</div>
                )}
                <h4 className="font-bold text-xs text-stone-300 line-clamp-1">{p.name}</h4>
                <p className="font-black text-indigo-400 mt-1">${activePrice.toFixed(2)}</p>
                {bcvRate > 0 && (
                  <p className="text-[10px] text-stone-400 font-bold">Bs. {(activePrice * bcvRate).toFixed(2)}</p>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  );
};

export default HomeStore;