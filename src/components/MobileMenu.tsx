import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Link as LinkIcon, Download, Store, ArrowRight, Settings, CreditCard, Headphones, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  catalogUrl: string;
  downloadQR: () => void; // Recibida pero usaremos una local más potente para el celular
  setCurrentView: (view: any) => void;
  hasUnreadSupport: boolean;
  handleLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, setIsOpen, catalogUrl, setCurrentView, hasUnreadSupport, handleLogout }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // 🔥 SOLUCIÓN 1: Copiado forzado (funciona en IPs locales sin HTTPS)
  const handleCopyLink = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(catalogUrl).then(() => alert("¡Link copiado!"));
    } else {
      // Truco para redes locales (HTTP)
      const textArea = document.createElement("textarea");
      textArea.value = catalogUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("¡Link copiado!");
      } catch (err) {
        alert("Tu link es: " + catalogUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  // 🔥 SOLUCIÓN 2: Descarga y Compartido nativo aislado en el menú
  const handleMobileQR = () => {
    const svg = document.getElementById("mobile-qr-hidden-svg"); 
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg); 
    const svgUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    
    const canvas = document.createElement("canvas"); 
    const ctx = canvas.getContext("2d"); 
    const img = new Image();
    
    img.onload = () => { 
      canvas.width = 400; 
      canvas.height = 550; 
      
      if(ctx) { 
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#1c1c1e";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText('Nexora Store', canvas.width / 2, 70); // Nombre por defecto o puedes pasar el companyInfo
        
        const qrSize = 300;
        const xPos = (canvas.width - qrSize) / 2;
        ctx.drawImage(img, xPos, 100, qrSize, qrSize); 
        
        ctx.fillStyle = "#6b7280";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("ESCANEA PARA VER EL CATÁLOGO", canvas.width / 2, 450);
        ctx.fillText("¡Haz tu pedido por WhatsApp!", canvas.width / 2, 480);
      } 
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `Mi_Catalogo_QR.png`;
        const file = new File([blob], fileName, { type: "image/png" });
        
        // Intenta abrir el menú nativo de WhatsApp/Compartir del celular
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Mi Tienda QR',
              text: 'Escanea para ver mi catálogo'
            });
            return;
          } catch (err) {
            console.log("Compartir cancelado");
          }
        }

        // Descarga de respaldo
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.style.display = "none";
        downloadLink.href = url;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(url);
        }, 100);
      }, 'image/png');
    };
    img.src = svgUrl;
  };

  return (
    <div className="md:hidden fixed inset-0 z-[120] flex flex-col justify-end">
      {/* QR OCULTO PARA ASEGURAR QUE EXISTA AL RENDERIZAR EL MENÚ */}
      <div className="hidden">
        <QRCodeSVG id="mobile-qr-hidden-svg" value={catalogUrl} size={300} bgColor={"#ffffff"} fgColor={"#1c1c1e"} level={"H"} includeMargin={false} />
      </div>

      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}></div>
      <div className="bg-[#f8f9fa] w-full rounded-t-[32px] p-5 pb-8 relative z-10 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
         <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-5"></div>
         
         <div className="mb-5 bg-gradient-to-br from-indigo-900 to-violet-900 rounded-[24px] p-5 shadow-lg text-white flex items-center justify-between gap-4 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="z-10">
              <h3 className="font-black text-lg mb-1 flex items-center gap-2"><QrCode className="w-4 h-4"/> Mi Tienda QR</h3>
              <p className="text-indigo-200 text-xs mb-4 font-medium leading-tight pr-2">Comparte el catálogo con tus clientes para recibir pedidos en WhatsApp.</p>
              <div className="flex gap-2">
                 <button onClick={handleCopyLink} className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all p-2.5 rounded-xl text-white flex items-center justify-center"><LinkIcon className="w-5 h-5"/></button>
                 <button onClick={handleMobileQR} className="bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/30"><Download className="w-4 h-4"/> Compartir QR</button>
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-2xl shadow-xl z-10 flex-shrink-0">
              <QRCodeSVG value={catalogUrl} size={80} bgColor={"#ffffff"} fgColor={"#1c1c1e"} level={"H"} />
            </div>
         </div>

         <div className="space-y-2.5">
           <button onClick={() => { setIsOpen(false); window.open(catalogUrl, '_blank'); }} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 p-4 rounded-[20px] flex items-center justify-between shadow-md active:scale-95 transition-all text-white font-black">
             <div className="flex items-center gap-3"><Store className="w-5 h-5 text-white" /><span className="text-sm">Ver Mi Catálogo Online</span></div><ArrowRight className="w-4 h-4 text-white/80"/>
           </button>
           <button onClick={() => { setIsOpen(false); setCurrentView('configuracion'); }} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm active:scale-95 border border-stone-100 transition-all">
             <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-indigo-500" /><span className="font-black text-stone-700 text-sm">Ajustes del Negocio</span></div><ArrowRight className="w-4 h-4 text-stone-300"/>
           </button>
           <button onClick={() => { setIsOpen(false); navigate('/membresia'); }} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm active:scale-95 border border-stone-100 transition-all">
             <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-indigo-500" /><span className="font-black text-stone-700 text-sm">Planes y Membresía</span></div><ArrowRight className="w-4 h-4 text-stone-300"/>
           </button>
           <button onClick={() => { setIsOpen(false); setCurrentView('soporte'); }} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm active:scale-95 border border-stone-100 transition-all">
             <div className="flex items-center gap-3"><div className="relative"><Headphones className="w-5 h-5 text-teal-500" />{hasUnreadSupport && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>}</div><span className="font-black text-stone-700 text-sm">Soporte Técnico</span></div><ArrowRight className="w-4 h-4 text-stone-300"/>
           </button>
           <button onClick={handleLogout} className="w-full mt-2 bg-rose-50 hover:bg-rose-100 p-4 rounded-[20px] flex items-center gap-3 active:scale-95 text-rose-600 font-black justify-center transition-all"><LogOut className="w-5 h-5"/> Cerrar Sesión</button>
         </div>
      </div>
    </div>
  );
};

export default MobileMenu;