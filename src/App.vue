<template>
  <div id="app">
    <div v-if="isLoading" class="global-loader">
      <div class="spinner"></div>
      <p class="loader-text">📖 正在載入外語書城...</p>
    </div>

    <div class="demo-warning-banner">
      ⚠️ 本網站僅供全端開發作品展示，非真實電商平台。不具備實際交易功能，請勿輸入真實信用卡資訊。
    </div>

    <header class="app-header">
      <nav class="navbar">
        <router-link :to="{ name: 'Home' }" class="logo">
          📖 外語書城
        </router-link>
        <span v-if="welcomeMessage" class="welcome-message">
          {{ welcomeMessage }}
        </span>
        <div class="nav-links">
          <template v-if="authStore.isAuthenticated">
            <router-link :to="{ name: 'Profile' }" class="nav-item">
              會員中心
            </router-link>
            <router-link :to="{ name: 'Cart' }" class="nav-item">
              🛒 購物車
            </router-link>
            <router-link :to="{ name: 'Orders' }" class="nav-item">
              📦 訂單查詢
            </router-link>
            <button @click="authStore.logout()" class="nav-item logout-btn">
              登出
            </button>
          </template>

          <template v-else>
            <router-link :to="{ name: 'Login' }" class="nav-item">
              登入
            </router-link>
            <router-link :to="{ name: 'Register' }" class="nav-item">
              註冊
            </router-link>
          </template>

          <router-link v-if="authStore.isAdmin" :to="{ name: 'AdminDashboard' }" class="nav-item admin-link">
            ⚙️ 後台管理
          </router-link>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { ref, computed, onMounted } from 'vue'; // 🌟 確保引入 ref 與 onMounted
import Footer from '@/components/Footer.vue';

const authStore = useAuthStore();

// 🎯 Loading 邏輯控制
const isLoading = ref(true);
onMounted(() => {
  // 設定 0.8 秒後關閉動畫，剛好遮蓋初始渲染的閃爍
  setTimeout(() => {
    isLoading.value = false;
  }, 800);
});

// 🎯 原有的歡迎訊息邏輯
const welcomeMessage = computed(() => {
  if (authStore.isAuthenticated && authStore.userEmail) {
    return `${authStore.userEmail}，歡迎您登入外語書城！`;
  }
  return '';
});
</script>

<style>
/* --- 1. 你原本的基礎結構樣式 (保持不動) --- */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding: 20px;
}

.demo-warning-banner {
  background-color: #ffc107;
  color: #000;
  text-align: center;
  padding: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.app-header {
  background-color: #343a40;
  padding: 15px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  color: white;
  font-size: 1.5em;
  font-weight: bold;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-item {
  color: #adb5bd;
  text-decoration: none;
  transition: color 0.3s;
  padding: 5px 10px;
}

.nav-item:hover {
  color: white;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #adb5bd;
  font-size: 1em;
  padding: 5px 10px;
}

.logout-btn:hover {
  color: white;
}

.admin-link {
  color: #ffc107;
  font-weight: bold;
}

.router-link-active {
  color: white !important;
  font-weight: bold;
}

.welcome-message {
  color: white;
}

/* --- 2. 🎯 新增的 Loading 專用樣式 (放在最後，互不干擾) --- */
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* 極高層級，確保蓋過所有元件 */
}

.spinner {
  width: 45px;
  height: 45px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader-text {
  margin-top: 20px;
  color: #2c3e50;
  font-weight: bold;
  letter-spacing: 1px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
