import React, { useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config'; 

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 🔥 ESTADO DEL OJITO
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('[Error de Registro]:', err);
      setError(
        err.response?.data?.message || 'Error al conectar con el servidor de Nexora'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-blue-50">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear Cuenta</h1>
          <p className="text-slate-500 mt-2 text-sm">Únete a Nexora Enterprise</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700 text-sm font-medium">
            ¡Cuenta creada con éxito! Redirigiendo al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                placeholder="Angel Castro"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                placeholder="admin@nexora.com"
                required
              />
            </div>
          </div>

          {/* 🔥 SECCIÓN DE CONTRASEÑA CON EL OJITO 🔥 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center group active:scale-[0.98] mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-5 h-5" />
                Registrando...
              </>
            ) : (
              <>
                Comenzar ahora
                <ArrowRight className="ml-2.5 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8 border-t border-slate-100 pt-6">
          ¿Ya tienes una cuenta? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;