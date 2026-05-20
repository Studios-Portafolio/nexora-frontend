import React from 'react';
import { History, ShoppingCart, ChefHat, PieChart, Package } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  setHasUnreadSupport: (val: boolean) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, setHasUnreadSupport }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center px-1 py-3 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <button onClick={() => { setCurrentView('historial'); setHasUnreadSupport(false); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'historial' ? 'text-indigo-600' : 'text-stone-400'}`}><History className={`w-5 h-5 mb-1 ${currentView === 'historial' ? 'fill-indigo-100' : ''}`} /><span className="text-[9px] font-bold">Historial</span></button>
      <button onClick={() => { setCurrentView('caja'); setHasUnreadSupport(false); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'caja' ? 'text-orange-500' : 'text-stone-400'}`}><ShoppingCart className={`w-5 h-5 mb-1 ${currentView === 'caja' ? 'fill-orange-100' : ''}`} /><span className="text-[9px] font-bold">Caja</span></button>
      
      <button onClick={() => { setCurrentView('resumen'); setHasUnreadSupport(false); }} className="relative -top-5 bg-stone-900 text-white p-3 rounded-full shadow-lg shadow-stone-900/30 border-4 border-[#f8f9fa]"><PieChart className="w-5 h-5" /></button>
      
      <button onClick={() => { setCurrentView('kds'); setHasUnreadSupport(false); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'kds' ? 'text-amber-500' : 'text-stone-400'}`}><ChefHat className={`w-5 h-5 mb-1 ${currentView === 'kds' ? 'fill-amber-100' : ''}`} /><span className="text-[9px] font-bold">Cocina</span></button>
      <button onClick={() => { setCurrentView('productos'); setHasUnreadSupport(false); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${currentView === 'productos' ? 'text-indigo-600' : 'text-stone-400'}`}><Package className={`w-5 h-5 mb-1 ${currentView === 'productos' ? 'fill-indigo-100' : ''}`} /><span className="text-[9px] font-bold">Stock</span></button>
    </nav>
  );
};

export default BottomNav;