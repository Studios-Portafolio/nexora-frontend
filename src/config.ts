// ==========================================
// CONFIGURACIÓN CENTRAL DE NEXORA FRONTEND
// ==========================================

// URL Maestra de Render (El cerebro en la nube)
const RENDER_URL = "https://nexora-api-psrx.onrender.com";

// Exportamos las rutas exactas. 
// Si import.meta.env falla en el APK, tomará RENDER_URL automáticamente para que nunca se caiga la app.
export const API_URL = import.meta.env?.VITE_API_URL || `${RENDER_URL}/api`;
export const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL || RENDER_URL;

console.log("🟢 Nexora conectada al Backend en:", RENDER_URL);