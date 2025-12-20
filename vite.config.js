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
        target: 'http://localhost:8080', // 你的 Spring Boot 位址
        changeOrigin: true,
        // 不需要 rewrite，因為你的後端 Controller 本身就是 /api 開頭
      }
    }
  }
})
