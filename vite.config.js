import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: { skipWaiting: true, clientsClaim: true, cleanupOutdatedCaches: true },
      manifest: {
        name: 'B-Battle: 意志力記帳',
        short_name: 'B-Battle',
        description: '結合 AI 吐槽與戰鬥機制的遊戲化記帳 App',
        theme_color: '#F7F4EF',
        background_color: '#F7F4EF',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  base: '/',
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Code Splitting: 解決 500k 警告，將套件拆分出獨立檔案
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('lucide')) return 'vendor-icons';
            if (id.includes('recharts')) return 'vendor-charts';
            return 'vendor-others';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
})
