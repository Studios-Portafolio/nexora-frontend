import React from 'react';
import { Menu, Search, History } from 'lucide-react';

interface HeaderProps {
  setIsMobileMenuOpen: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  setCurrentView: (view: any) => void;
  companyInfo: any;
}

const Header: React.FC<HeaderProps> = ({ setIsMobileMenuOpen, searchTerm, setSearchTerm, setCurrentView, companyInfo }) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-sm z-20">
      <div className="flex-1 flex items-center gap-3">
        
        {/* 🔥 BOTÓN MENÚ MÓVIL EN LA ESQUINA SUPERIOR IZQUIERDA 🔥 */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0 active:scale-90 transition-all"
        >
          <Menu className="text-white w-5 h-5" />
        </button>

        {/* Logo estático para Escritorio */}
        <div className="hidden md:flex w-10 h-10 bg-indigo-600 rounded-lg items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
          <Menu className="text-white w-4 h-4" />
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 md:w-5 md:h-5" />
          <input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner" />
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4">
         <button onClick={() => setCurrentView('historial')} className="md:hidden p-2 text-stone-500 hover:text-indigo-600 bg-stone-50 rounded-lg active:scale-95 transition-all shadow-sm border border-stone-200"><History className="w-5 h-5" /></button>
         <span className="text-sm font-bold text-stone-700 hidden sm:block">{companyInfo.name}</span>
         <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-xl flex items-center justify-center overflow-hidden font-black shadow-md text-xs md:text-sm">{companyInfo.logo ? <img src={companyInfo.logo} alt="Logo" className="w-full h-full object-cover" /> : companyInfo.name?.substring(0,2).toUpperCase()}</div>
      </div>
    </header>
  );
};

export default Header;