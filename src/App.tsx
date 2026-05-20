import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios'; 

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Membership from './pages/Membership';
import AdminPanel from './pages/AdminPanel';
import SettingsPanel from './pages/SettingsPanel';
import SalesHistory from './pages/SalesHistory';
import SplashScreen from './pages/SplashScreen';
import PublicCatalog from './pages/PublicCatalog'; 

const API_URL = 'https://nexora-api-psrx.onrender.com/api';

// 🔥 INTERCEPTOR GLOBAL DE SEGURIDAD BANCARIA CON REFRESH TOKEN 🔥
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No Autorizado) y no hemos intentado refrescar ya
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos para no caer en bucle infinito
      
      try {
        console.log("🔄 Intentando refrescar la sesión en silencio...");
        const refreshToken = localStorage.getItem('nexora_refresh_token');
        
        if (refreshToken) {
          // Pedimos un nuevo token al backend
          const res = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
          
          if (res.data.success) {
            // Guardamos el NUEVO token volátil
            sessionStorage.setItem('nexora_token', res.data.accessToken);
            
            // Actualizamos la cabecera de la petición original y la volvemos a intentar
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.warn("🚨 Falló el Refresh Token. Expulsando por seguridad...");
      }

      // Si falla todo, destruimos las llaves y sacamos al usuario
      sessionStorage.removeItem('nexora_token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('nexora_refresh_token'); 
      window.location.href = '/login';
    }

    // Para baneos o suspensiones (403)
    if (error.response && error.response.status === 403) {
      console.warn("🚫 SEGURIDAD: Cuenta suspendida. Expulsando...");
      sessionStorage.removeItem('nexora_token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// 🔥 PROTECCIÓN DE RUTAS DE ALTO NIVEL 🔥
const ProtectedRoute = ({ children, requireAdmin = false }: { children: any, requireAdmin?: boolean }) => {
  // Leemos desde sessionStorage (Si cierra la pestaña o saca la app de 2do plano, esto está vacío y exige login)
  const token = sessionStorage.getItem('nexora_token');
  const userStr = sessionStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      
      if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
      }
      
      if (!requireAdmin && user.role === 'ADMIN') {
         return <Navigate to="/admin-panel" replace />;
      }

    } catch (e) {
      console.error("Error leyendo user de la sesión");
      sessionStorage.removeItem('nexora_token');
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      <BrowserRouter>
        <Routes>
          {/* 🔥 RUTAS PÚBLICAS 🔥 */}
          <Route path="/login" element={<Login />} />
          <Route path="/catalogo/:companyId" element={<PublicCatalog />} />
          
          {/* 🔥 RUTAS PROTEGIDAS 🔥 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/configuracion" 
            element={
              <ProtectedRoute>
                <SettingsPanel />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/historial-ventas" 
            element={
              <ProtectedRoute>
                <SalesHistory />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/membresia" 
            element={
              <ProtectedRoute>
                <Membership />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin-panel" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          /> 
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;