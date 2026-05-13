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
import PublicCatalog from './pages/PublicCatalog'; // 🔥 IMPORTAMOS EL CATÁLOGO PÚBLICO 🔥

// 🔥 INTERCEPTOR GLOBAL DE SEGURIDAD BANCARIA 🔥
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("🚨 SEGURIDAD: Usuario no autorizado o cuenta suspendida. Expulsando...");
      
      // Destruimos las llaves de la memoria temporal
      sessionStorage.removeItem('nexora_token');
      sessionStorage.removeItem('user');
      
      // Limpiamos también el local por si quedó basura de versiones anteriores
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('user');
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 🔥 PROTECCIÓN DE RUTAS CON MEMORIA TEMPORAL 🔥
const ProtectedRoute = ({ children, requireAdmin = false }: { children: any, requireAdmin?: boolean }) => {
  // Leemos desde sessionStorage (Si cierra la pestaña o saca la app de 2do plano, esto se borra)
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