import React, { useState, useEffect } from 'react';
import { AlertOctagon, Clock, Sparkles, UserCircle } from 'lucide-react';

interface UpgradeBannerProps {
  user: any;
  onNavigateToPlans?: () => void;
  isBanned?: boolean;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ user, onNavigateToPlans, isBanned }) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    // Calculamos los días restantes en base a la fecha de la DB
    if (user?.subscriptionEnd && !isBanned) {
      const endDate = new Date(user.subscriptionEnd);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    }
  }, [user, isBanned]);

  return (
    <div className={`w-full p-5 md:p-6 rounded-[24px] border mb-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${isBanned ? 'bg-rose-900/20 border-rose-500/30' : 'bg-[#1c1c1e] border-white/5'}`}>
      <div className="flex items-center gap-4 w-full">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 shrink-0">
          <UserCircle className="w-7 h-7 text-indigo-400" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-lg md:text-xl font-black text-white flex items-center gap-2">
            Hola, {user?.name?.split(' ')[0] || user?.firstName || 'Usuario'} <Sparkles className="w-5 h-5 text-amber-400" />
          </span>
          {isBanned ? (
             <span className="text-rose-400 font-bold text-xs md:text-sm flex items-center gap-2 mt-1">
               <AlertOctagon className="w-4 h-4" /> Cuenta suspendida por administración
             </span>
          ) : (
             <span className="text-stone-400 text-xs md:text-sm font-medium flex items-center gap-2 mt-0.5">
               <Clock className="w-4 h-4 text-amber-500" /> 
               {daysLeft !== null ? `Te quedan ${daysLeft} días de prueba gratuita` : "Tu suscripción está activa"}
             </span>
          )}
        </div>
      </div>
      
      {!isBanned && onNavigateToPlans && (
        <button onClick={onNavigateToPlans} className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap">
          Mejorar Plan
        </button>
      )}
    </div>
  );
};

export default UpgradeBanner;