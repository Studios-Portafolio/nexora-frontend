import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Boxes, ShieldCheck, Loader2, X } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // 🔥 URL ACTUALIZADA PARA PRODUCCIÓN 🔥
  // Ojo: Asegúrate de poner el link de Render de tu Backend aquí
  const API_BASE = 'https://nexora-inventory-backend.onrender.com/api/auth'; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? `${API_BASE}/login` : `${API_BASE}/register`;
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await axios.post(endpoint, payload);

      if (response.data.success || response.data.token) {
        localStorage.clear(); 
        
        localStorage.setItem('nexora_token', response.data.token);
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));

        // 🚦 CONTROL DE TRÁFICO ESTRICTO 🚦
        if (user.role === 'ADMIN') {
          window.location.href = '/admin-panel'; 
        } else if (user.status === 'BLOCKED' || user.status === 'PENDING') {
          window.location.href = '/membresia';   
        } else {
          window.location.href = '/';           
        }
      }
    } catch (err: any) {
      console.error("Error de autenticación:", err);
      setError(err.response?.data?.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#1c1917] lg:bg-[#f8f9fa] select-none font-sans relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-[0.05] lg:hidden" style={{ backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse lg:hidden"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse delay-1000 lg:hidden"></div>

      <div className="hidden lg:flex w-1/2 bg-stone-900 relative overflow-hidden items-center justify-center flex-col p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Boxes className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">Nexora Enterprise</h1>
          <p className="text-xl text-stone-400 font-medium max-w-md mx-auto">Ecosistema logístico B2B2C.</p>
        </div>
        
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center border-t border-white/10 pt-6 z-10">
          <p className="text-stone-500 text-sm font-bold">© 2026 Nexora Systems</p>
          <div className="flex items-center text-teal-400 text-sm font-black"><ShieldCheck className="w-4 h-4 mr-2" /> Entorno Seguro</div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 z-10 relative lg:static">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl lg:bg-white rounded-[32px] shadow-2xl p-8 md:p-10 border border-white/10 lg:border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">{isLogin ? 'Iniciar Sesión' : 'Nueva Cuenta'}</h2>
            <p className="text-stone-500 font-bold mt-2">Acceso a terminal seguro</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center animate-in zoom-in-95">
              <X className="w-5 h-5 mr-2 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-black text-stone-500 mb-2 uppercase tracking-widest">Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input type="text" required className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-stone-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-black text-stone-500 mb-2 uppercase tracking-widest">Correo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="email" required className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-stone-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-stone-500 mb-2 uppercase tracking-widest">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="password" required className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-stone-900" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <div className="flex items-center justify-center">{isLogin ? 'Entrar al Sistema' : 'Crear Cuenta'} <ArrowRight className="w-5 h-5 ml-2" /></div>}
            </button>
          </form>
          
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-6 text-stone-500 lg:text-stone-500 hover:text-indigo-600 font-bold text-sm transition-colors">{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}</button>
        </div>
      </div>
    </div>
  );
};

export default Login;