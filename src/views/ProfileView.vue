<template>
  <div class="profile-container">
    <div v-if="authStore.isAuthenticated" class="profile-card">
      <h2>👤 會員檔案</h2>

      <p>歡迎回來，這裡是您的個人資訊中心。</p>

      <div class="info-section">
        <p><strong>帳號角色：</strong> {{ authStore.role || '未定義' }}</p>

        <p v-if="userEmail"><strong>電子郵件：</strong> {{ userEmail }}</p>

        <p><strong>登入狀態：</strong>
          <span :class="{'text-success': authStore.isAuthenticated}">
            已登入
          </span>
        </p>
      </div>

      <button @click="handleLogout" class="logout-btn">
        登出
      </button>
      <router-link :to="{ name: 'ProfileEdit' }" class="edit-profile-btn">
        修改會員資料
      </router-link>
      <div class="action-links">
        <router-link :to="{ name: 'Orders' }">查看歷史訂單</router-link>
      </div>

    </div>
    <div v-else>
      <p>請先登入以查看您的個人檔案。</p>
      <router-link :to="{ name: 'Login' }" class="login-link">前往登入</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

// 引入 Auth Store
const authStore = useAuthStore();

// 處理登出邏輯
const handleLogout = () => {
  // 呼叫 Pinia Store 中的 logout action
  authStore.logout();
};

// 🚨 關鍵修正：直接從 Store 中讀取 Email
const userEmail = computed(() => {
  return authStore.userEmail || 'N/A';
});
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}

.profile-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.info-section p {
  margin-bottom: 10px;
  font-size: 1.1em;
}

.text-success {
  color: green;
  font-weight: bold;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c82333;
}

.action-links {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.action-links a {
  color: #007bff;
  text-decoration: none;
  margin-right: 15px;
}

.edit-profile-btn {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #007bff; /* 藍色 */
  color: white;
  text-decoration: none;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  text-align: center;
}
</style>