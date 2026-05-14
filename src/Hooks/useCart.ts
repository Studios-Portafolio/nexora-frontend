import { useState, useMemo } from 'react';

export const useCart = (bcvRate: number, isOpen: boolean) => {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: any) => {
    if (!isOpen) return alert("La tienda está cerrada actualmente.");
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing && existing.quantity >= product.stock) return prev;
      if (!existing && product.stock <= 0) return prev;
      
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      const activePrice = (product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price) 
        ? product.promoPrice 
        : product.price;
        
      return [...prev, { ...product, activePrice: activePrice, quantity: 1 }];
    });
    
    // Abre el carrito automáticamente al agregar el primer producto
    setIsCartOpen(true);
  };

  // 🔥 CORRECCIÓN TYPESCRIPT AQUÍ 🔥
  const cartTotalUSD = useMemo(() => cart.reduce((sum: number, item: any) => sum + (item.activePrice * item.quantity), 0), [cart]);
  const cartTotalBs = useMemo(() => cartTotalUSD * bcvRate, [cartTotalUSD, bcvRate]);

  return { cart, setCart, addToCart, cartTotalUSD, cartTotalBs, isCartOpen, setIsCartOpen };
};