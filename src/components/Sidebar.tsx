import React from 'react';
import { LayoutDashboard, ShoppingCart, ChefHat, PieChart, History, Package, Sparkles, Headphones, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  hasUnreadSupport: boolean;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, hasUnreadSupport, handleLogout }) => {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col flex-shrink-0 z-20 shadow-sm">
      <div className="h-20 flex items-center px-8 border-b border-stone-100 flex-shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-indigo-200"><LayoutDashboard className="text-white w-4 h-4" /></div>
        <div><span className="text-xl font-black tracking-tight text-stone-800">Nexora</span><span className="ml-2 bg-indigo-50 text-indigo-600 text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest relative -top-1">v1.1</span></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 [&::-webkit-scrollbar]:hidden">
        <button onClick={() => setCurrentView('caja')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'caja' ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><ShoppingCart className={`w-5 h-5 mr-3 ${currentView === 'caja' ? 'text-orange-500' : ''}`} /> Punto de Venta</button>
        <button onClick={() => setCurrentView('kds')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'kds' ? 'bg-amber-50 text-amber-700 shadow-sm shadow-amber-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><ChefHat className={`w-5 h-5 mr-3 ${currentView === 'kds' ? 'text-amber-500' : ''}`} /> Monitor KDS</button>
        <button onClick={() => setCurrentView('resumen')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'resumen' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><PieChart className="w-5 h-5 mr-3" /> ERP y Finanzas</button>
        <button onClick={() => setCurrentView('historial')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'historial' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><History className="w-5 h-5 mr-3" /> Historial de Caja</button>
        <button onClick={() => setCurrentView('productos')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'productos' ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Package className="w-5 h-5 mr-3" /> Inventario</button>
        <button onClick={() => setCurrentView('ia')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'ia' ? 'bg-violet-50 text-violet-700 shadow-sm shadow-violet-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Sparkles className={`w-5 h-5 mr-3 ${currentView === 'ia' ? 'text-violet-600' : 'text-violet-400'}`} /> Asistente IA</button>
        <div className="my-4 border-t border-stone-100 flex-shrink-0 mx-2"></div>
        <button onClick={() => setCurrentView('soporte')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'soporte' ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-100' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><div className="relative mr-3"><Headphones className={`w-5 h-5 ${currentView === 'soporte' ? 'text-teal-600' : 'text-stone-400'}`} />{hasUnreadSupport && (<span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span></span>)}</div> Soporte Técnico</button>
        <button onClick={() => setCurrentView('configuracion')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'configuracion' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}><Settings className="w-5 h-5 mr-3" /> Configuración NIIF</button>
      </nav>
      <div className="p-4 border-t border-stone-100 flex-shrink-0"><button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"><LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión</button></div>
    </aside>
  );
};

export default Sidebar;