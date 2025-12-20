<template>
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
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import Footer from '@/components/Footer.vue';
// 🎯 這裡使用 computed 確保響應式地讀取 Email
const welcomeMessage = computed(() => {
  if (authStore.isAuthenticated && authStore.userEmail) {
    // 根據您的需求，顯示 email 或您可以從 email 提取用戶名部分
    return `${authStore.userEmail}，歡迎您登入外語書城！`;
  }
  return '';
});
// 引入 Pinia Store 以獲取登入狀態
const authStore = useAuthStore();
</script>

<style>
/* 讓整個 App 垂直撐開，確保 Footer 留在底部 */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1; /* 🌟 關鍵：這會把內容區撐大，將 Footer 推到底部 */
  padding: 20px;
}

/* 模擬公告樣式 */
.demo-warning-banner {
  background-color: #ffc107; /* 黃色警示 */
  color: #000;
  text-align: center;
  padding: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
/* 這裡放全域或 App.vue 的樣式 */
.app-header {
  background-color: #343a40; /* 深色背景 */
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
  color: #adb5bd; /* 淺灰色文字 */
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
  color: #ffc107; /* 亮黃色作為管理員標誌 */
  font-weight: bold;
}

.app-main {
  padding: 20px;
}

/* 確保 router-link 激活狀態有區別 */
.router-link-active {
  color: white !important;
  font-weight: bold;
}
.welcome-message{
  color:white;
}
</style>
