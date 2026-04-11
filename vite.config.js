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
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'B-Battle: 意志力記帳',
        short_name: 'B-Battle',
        description: '結合 AI 吐槽與戰鬥機制的遊戲化記帳 App',
        theme_color: '#F7F4EF',
        background_color: '#F7F4EF',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn.iconscout.com/icon/free/png-256/free-swords-icon-download-in-svg-png-gif-file-formats--weapon-battle-armor-war-viking-pack-role-playing-icons-2651347.png',
            sizes: '256x256',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/',
})
