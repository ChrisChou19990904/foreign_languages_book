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
            <router-link :to="{ name: 'Profile' }" class="nav-item">會員中心</router-link>
            <router-link :to="{ name: 'Cart' }" class="nav-item">🛒 購物車</router-link>
            <router-link :to="{ name: 'Orders' }" class="nav-item">📦 訂單查詢</router-link>
            <button @click="authStore.logout()" class="nav-item logout-btn">登出</button>
          </template>
          <template v-else>
            <router-link :to="{ name: 'Login' }" class="nav-item">登入</router-link>
            <router-link :to="{ name: 'Register' }" class="nav-item">註冊</router-link>
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
import { ref, computed, onMounted } from 'vue'; // 🌟 引入 ref, onMounted
import Footer from '@/components/Footer.vue';

const authStore = useAuthStore();

// 🎯 Loading 邏輯
const isLoading = ref(true);
onMounted(() => {
  // 模擬載入時間，確保初次進入或重新整理時能看到精美的過場
  setTimeout(() => {
    isLoading.value = false;
  }, 1000); // 1秒後關閉
});

const welcomeMessage = computed(() => {
  if (authStore.isAuthenticated && authStore.userEmail) {
    return `${authStore.userEmail}，歡迎您登入外語書城！`;
  }
  return '';
});
</script>

<style>
/* 🎯 Loading 專用樣式 */
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white; /* 也可以用稍微透明的 white 或深色 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10000; /* 確保在所有組件最上方 */
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader-text {
  margin-top: 15px;
  color: #34495e;
  font-weight: bold;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 以下為原本的樣式... */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-main {
  flex: 1;
  padding: 20px;
}
/* ... 後續樣式保持不變 ... */
</style>
