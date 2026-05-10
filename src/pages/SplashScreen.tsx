import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 🔥 Aumentamos la duración: a los 4 segundos empieza a desaparecer
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4000);

    // A los 4.5 segundos matamos el componente por completo
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#f8f9fa] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center animate-[zoomIn_1s_ease-out]">
        
        {/* 🔥 El Logo ahora es más grande (w-60 h-60) */}
        <div className="bg-white p-6 rounded-[40px] shadow-2xl shadow-indigo-100 mb-8 animate-[pulse_2s_ease-in-out_infinite]">
          <img
            src="/logo-nexora.jpg" 
            alt="Nexora Logo"
            className="w-60 h-60 object-contain"
          />
        </div>
        
        {/* Barra de progreso animada más lenta (4s) para coincidir con el tiempo */}
        <div className="w-56 h-1.5 bg-stone-200 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[loading_4s_ease-in-out_forwards]"></div>
        </div>

        <p className="mt-5 text-stone-400 text-sm font-bold tracking-widest uppercase animate-pulse">
          Iniciando Sistema...
        </p>

        {/* 🔥 Etiqueta de la versión de la App 🔥 */}
        <p className="mt-2 text-stone-300 text-xs font-semibold tracking-widest">
          v1.0
        </p>

      </div>

      <style>{`
        @keyframes zoomIn {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;