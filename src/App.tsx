import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Membership from './pages/Membership';
import AdminPanel from './pages/AdminPanel';
import SettingsPanel from './pages/SettingsPanel'; // 🔥 IMPORTAMOS EL PANEL DE CONFIGURACIÓN 🔥
import SalesHistory from './pages/SalesHistory'; // 🔥 IMPORTAMOS EL LIBRO MAYOR DE VENTAS 🔥
import SplashScreen from './pages/SplashScreen'; // 🔥 AQUÍ IMPORTAMOS EL SPLASH SCREEN 🔥

// Componente para proteger las rutas privadas
const ProtectedRoute = ({ children, requireAdmin = false }: { children: any, requireAdmin?: boolean }) => {
  const token = localStorage.getItem('nexora_token');
  const userLocalStr = localStorage.getItem('user');
  
  // Si no hay token guardado, patada de vuelta al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, verificamos el rol
  if (userLocalStr) {
    try {
      const user = JSON.parse(userLocalStr);
      
      // Si la ruta requiere admin y no es admin, lo mandamos al dashboard
      if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
      }
      
      // Si va al Dashboard normal pero ES ADMIN, lo pateamos a su panel
      if (!requireAdmin && user.role === 'ADMIN') {
         return <Navigate to="/admin-panel" replace />;
      }

    } catch (e) {
      console.error("Error leyendo user local");
      return <Navigate to="/login" replace />;
    }
  }

  // Si pasa todas las pruebas, entra.
  return children;
};

function App() {
  // 🔥 ESTADO QUE CONTROLA LA PANTALLA DE CARGA 🔥
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {/* Si showSplash es true, mostramos la animación por encima de todo */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Tu aplicación real carga por debajo tranquilamente */}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Ruta principal del inventario (Solo usuarios normales) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* ⚙️ Ruta de Configuración de Empresa (Para el dueño del negocio) */}
          <Route 
            path="/configuracion" 
            element={
              <ProtectedRoute>
                <SettingsPanel />
              </ProtectedRoute>
            } 
          />

          {/* 🧾 NUEVA RUTA: Historial de Ventas y Facturas */}
          <Route 
            path="/historial-ventas" 
            element={
              <ProtectedRoute>
                <SalesHistory />
              </ProtectedRoute>
            } 
          />

          {/* 💸 Ruta de la pasarela de pagos */}
          <Route 
            path="/membresia" 
            element={
              <ProtectedRoute>
                <Membership />
              </ProtectedRoute>
            } 
          />

          {/* 👑 Ruta del Panel de Administrador (Solo ADMIN) */}
          <Route 
            path="/admin-panel" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          /> 
          
          {/* Cualquier otra ruta errónea, la mandamos al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;