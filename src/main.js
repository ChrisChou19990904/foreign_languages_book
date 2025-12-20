// src/main.js

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia' // 🎯 1. 引入 Pinia
import App from './App.vue'
import router from './router' // 🎯 2. 引入 Router (自動找到 src/router/index.js)

// 1. 創建 Vue 應用程式實例
const app = createApp(App)

// 2. 創建 Pinia 實例並註冊
const pinia = createPinia()
app.use(pinia) // 🚨 必須先註冊 Pinia，Router 守衛才能調用 useAuthStore()

// 3. 註冊 Router
app.use(router) // 🚨 必須註冊 Router，才能識別 <router-view> 和執行 beforeEeach

// 4. 掛載應用程式
app.mount('#app')