import { useState, useMemo } from 'react';

export const useCart = (bcvRate: number, isStoreOpen: boolean) => {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: any, quantity: number = 1) => {
    if (!isStoreOpen) return;
    
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } 
            : item
        );
      }
      const activePrice = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price;
      return [...prevCart, { ...product, activePrice, quantity }];
    });
    
    // 🔥 CLIC SILENCIOSO: Obligamos a que el carrito se quede cerrado 🔥
    setIsCartOpen(false); 
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId) {
        const newQ = item.quantity + delta;
        if (newQ > 0 && newQ <= item.stock) return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotalUSD = useMemo(() => {
    return cart.reduce((total, item) => total + (item.activePrice * item.quantity), 0);
  }, [cart]);

  const cartTotalBs = useMemo(() => {
    return cartTotalUSD * bcvRate;
  }, [cartTotalUSD, bcvRate]);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotalUSD,
    cartTotalBs,
    isCartOpen,
    setIsCartOpen
  };
};