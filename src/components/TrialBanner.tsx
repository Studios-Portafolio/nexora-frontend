import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Sparkles, UserCircle } from 'lucide-react';

interface TrialBannerProps {
  onNavigateToPlans: () => void;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ onNavigateToPlans }) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('Usuario');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 🔥 Leemos ESTRICTAMENTE de sessionStorage para que la sesión muera al cerrar la app 🔥
    const userLocalStr = sessionStorage.getItem('user'); 
    if (userLocalStr) {
      try {
        const user = JSON.parse(userLocalStr);
        // Capturamos el nombre real con el que se registró
        setUserName(user.name || user.firstName || user.legalName || 'Usuario');
        
        if (user.role === 'ADMIN' || !user.subscriptionEnd) {
           setDaysLeft(null); return;
        }
        
        // Calculamos los días restantes exactos
        const endDate = new Date(user.subscriptionEnd);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays > 0 ? diffDays : 0);
      } catch (e) { console.error("Error parseando user local"); }
    }
  }, []);

  if (!isVisible || daysLeft === null) return null;

  return (
    <div className="bg-stone-900 border-b border-stone-800 text-white px-4 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md z-30 relative shrink-0 w-full animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 shrink-0">
          <UserCircle className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm md:text-base font-black text-white flex items-center gap-2 tracking-wide">
            Hola, {userName} <Sparkles className="w-4 h-4 text-amber-400" />
          </span>
          <span className="text-xs md:text-sm text-stone-400 flex items-center gap-1.5 font-medium mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Te quedan <strong className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">{daysLeft} días</strong> de prueba gratis
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-3 shrink-0 w-full sm:w-auto justify-end">
         <button onClick={onNavigateToPlans} className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 rounded-xl font-black text-xs md:text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all active:scale-95 whitespace-nowrap border border-indigo-400/30">
           Ver Planes
         </button>
         <button onClick={() => setIsVisible(false)} className="text-stone-500 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors">
           <X className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};

export default TrialBanner;