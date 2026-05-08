import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Nexora Enterprise',
        short_name: 'Nexora',
        description: 'Sistema Logístico y Financiero B2B2C',
        theme_color: '#4f46e5', // El color Indigo de nuestra nueva interfaz
        background_color: '#f8f9fa',
        display: 'standalone', // ESTO ES CLAVE: Oculta el navegador y la hace pantalla completa
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});