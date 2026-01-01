/// <reference types="vitest" />
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
    globals: true,
    environment: 'jsdom',
    // 🌟 改成更明確的偵測範圍，包含 src 下的所有 test 目錄
    include: ['src/**/*.{test,spec}.js', 'src/test/**/*.spec.js'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
