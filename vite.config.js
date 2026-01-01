import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 🌟 新增下面這段 server 配置
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://foreign-languages-book-back-end-3.onrender.com', // 你的 Spring Boot 位址
        changeOrigin: true,
        // 不需要 rewrite，因為你的後端 Controller 本身就是 /api 開頭
      }
    }
  },
  // 🌟 必須新增此區塊，Vitest 才能讀取到你的測試
  test: {
    globals: true,           // 支援 describe, it, expect 等全域變數
    environment: 'jsdom',    // 模擬瀏覽器環境（Pinia 與 DOM 測試必備）
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'], // 強制掃描所有測試檔
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // 確保測試時也能辨識 @ 符號
    }
  }
})
