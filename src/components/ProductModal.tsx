import React, { useState } from 'react';
import { X, ShoppingCart, Minus, Plus, ShieldCheck, Zap, Package } from 'lucide-react';

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  addToCart: (product: any, quantity: number) => void;
  bcvRate: number;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, addToCart, bcvRate }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
  const activePrice = hasPromo ? product.promoPrice : product.price;
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!outOfStock) {
      addToCart(product, quantity);
      onClose();
      // Reseteamos la cantidad para la próxima vez
      setTimeout(() => setQuantity(1), 300);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
      {/* Fondo con blur oscuro */}
      <div 
        className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Tarjeta del Producto */}
      <div className="bg-[#151515] w-full max-w-lg rounded-t-[32px] md:rounded-[32px] border border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] md:shadow-2xl relative z-10 animate-in slide-in-from-bottom-full md:slide-in-from-bottom-10 md:zoom-in-95 duration-400 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white/70 hover:text-white p-2 rounded-full z-20 transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagen Gigante con Gradiente */}
        <div className="relative w-full h-64 md:h-80 bg-gradient-to-b from-[#1c1c1e] to-[#151515] flex items-center justify-center p-6 flex-shrink-0">
          {hasPromo && (
            <div className="absolute top-5 left-5 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-1.5 z-10">
              <Zap className="w-4 h-4" /> Oferta Especial
            </div>
          )}
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-500" />
          ) : (
            <Package className="w-24 h-24 text-stone-700" />
          )}
        </div>

        {/* Detalles del Producto */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <p className="text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-2">{product.categoryName || product.description || 'General'}</p>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4">{product.name}</h2>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
            <div className="flex-1">
              {hasPromo && <p className="text-stone-500 line-through font-bold text-sm mb-1">${parseFloat(product.price).toFixed(2)}</p>}
              <p className={`text-4xl font-black tracking-tighter ${hasPromo ? 'text-rose-400' : 'text-white'}`}>
                ${parseFloat(activePrice).toFixed(2)}
              </p>
              {bcvRate > 0 && <p className="text-stone-400 font-bold mt-1 text-sm">Bs. {(activePrice * bcvRate).toFixed(2)}</p>}
            </div>
            
            <div className="text-right">
              <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-1">Disponibilidad</p>
              {outOfStock ? (
                <span className="bg-rose-500/10 text-rose-500 font-black px-3 py-1.5 rounded-lg text-xs border border-rose-500/20">Agotado</span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 font-black px-3 py-1.5 rounded-lg text-xs border border-emerald-500/20 flex items-center justify-end gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> {product.stock} en Stock
                </span>
              )}
            </div>
          </div>

          {/* Selector de Cantidad */}
          {!outOfStock && (
            <div className="flex items-center justify-between bg-[#1c1c1e] p-2 rounded-2xl border border-white/5 mb-2">
              <span className="text-stone-400 font-bold text-sm ml-4">Cantidad:</span>
              <div className="flex items-center gap-4 bg-[#0a0a0a] rounded-xl p-1 border border-white/5 shadow-inner">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-white font-black text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botón Inferior Fijo */}
        <div className="p-4 md:p-6 bg-[#151515] border-t border-white/5 flex-shrink-0 pb-safe">
          <button 
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${outOfStock ? 'bg-stone-800 text-stone-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-indigo-600/25'}`}
          >
            {outOfStock ? 'No Disponible' : (
              <>
                <ShoppingCart className="w-5 h-5" /> Agregar al Carrito • ${(activePrice * quantity).toFixed(2)}
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ProductModal;