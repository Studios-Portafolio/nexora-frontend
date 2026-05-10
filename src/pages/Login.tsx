import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Boxes, ShieldCheck, Loader2, X, Eye, EyeOff, KeyRound } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 ESTADOS PARA EL MODAL DE RECUPERACIÓN CON PIN 🔥
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Pedir Correo, 2: Pedir PIN y Nueva Clave
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('nexora_saved_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const API_BASE = 'https://nexora-api-psrx.onrender.com/api/auth';

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
        const emailToSave = formData.email;
        localStorage.clear(); 
        localStorage.setItem('nexora_saved_email', emailToSave);
        localStorage.setItem('nexora_token', response.data.token);
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));

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
      setError(err.response?.data?.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SOLICITAR EL PIN (PASO 1) 🔥
  const handleRequestPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    
    try {
      const res = await axios.post(`${API_BASE}/forgot-password`, { email: forgotEmail });
      if (res.data.success) {
        setForgotMessage('✅ ' + res.data.message);
        setForgotStep(2); // Avanzamos a la pantalla del PIN
      }
    } catch (err: any) {
      setForgotMessage('❌ ' + (err.response?.data?.message || 'Error al solicitar el código.'));
    } finally {
      setForgotLoading(false);
    }
  };

  // 🔥 VERIFICAR PIN Y CAMBIAR CLAVE (PASO 2) 🔥
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    
    try {
      const res = await axios.post(`${API_BASE}/reset-password`, {
        email: forgotEmail,
        pin: forgotPin,
        newPassword: forgotNewPassword
      });
      if (res.data.success) {
        setForgotMessage('✅ ' + res.data.message);
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotPin('');
          setForgotNewPassword('');
        }, 3000);
      }
    } catch (err: any) {
      setForgotMessage('❌ ' + (err.response?.data?.message || 'Error al cambiar la contraseña.'));
    } finally {
      setForgotLoading(false);
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-black text-stone-500 uppercase tracking-widest">Contraseña</label>
                {isLogin && (
                  <button type="button" onClick={() => { setShowForgotModal(true); setForgotStep(1); setForgotMessage(''); }} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    ¿Olvidaste tu clave?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="w-full pl-12 pr-12 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-stone-900" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <div className="flex items-center justify-center">{isLogin ? 'Entrar al Sistema' : 'Crear Cuenta'} <ArrowRight className="w-5 h-5 ml-2" /></div>}
            </button>
          </form>
          
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-6 text-stone-500 lg:text-stone-500 hover:text-indigo-600 font-bold text-sm transition-colors">{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}</button>
        </div>
      </div>

      {/* 🔥 MODAL DE RECUPERACIÓN DE CONTRASEÑA DE 2 PASOS 🔥 */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 bg-stone-100 rounded-full z-10"><X className="w-5 h-5"/></button>
            
            <h3 className="text-2xl font-black text-stone-900 mb-2">Recuperar Clave</h3>
            <p className="text-stone-500 text-sm font-medium mb-6">
              {forgotStep === 1 
                ? 'Ingresa tu correo y te enviaremos un PIN de 6 dígitos.' 
                : 'Revisa tu bandeja de entrada y coloca el código recibido.'}
            </p>
            
            {forgotMessage && (
              <div className={`p-3 mb-4 rounded-xl text-sm font-bold ${forgotMessage.includes('✅') ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {forgotMessage}
              </div>
            )}

            {/* PASO 1: PEDIR CORREO */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestPin} className="space-y-4 animate-in slide-in-from-left-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 mb-1 uppercase tracking-widest">Correo de la cuenta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="email" required className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm active:scale-95 transition-all mt-4">
                  {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Enviar Código PIN'}
                </button>
              </form>
            )}

            {/* PASO 2: PEDIR PIN Y NUEVA CONTRASEÑA */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 mb-1 uppercase tracking-widest">Código PIN de 6 dígitos</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="text" maxLength={6} required placeholder="123456" className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none font-black text-center text-lg tracking-[0.5em] focus:ring-2 focus:ring-indigo-500" value={forgotPin} onChange={(e) => setForgotPin(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-500 mb-1 uppercase tracking-widest">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="password" required className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-black text-sm active:scale-95 transition-all mt-4">
                  {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Actualizar Contraseña'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;