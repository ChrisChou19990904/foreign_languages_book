<template>
  <div class="profile-container">
    <div v-if="authStore.isAuthenticated" class="profile-card">
      <h2>{{ authStore.isAdmin ? '👑 管理員檔案' : '👤 會員檔案' }}</h2>

      <p v-if="userName"><em class="username">{{userName}}</em> 歡迎回來，這裡是您的資訊中心。</p>

      <div class="info-section">
        <p>
          <strong>帳號身分：</strong>
          <span :class="authStore.isAdmin ? 'admin-text' : 'user-text'">
            {{ authStore.isAdmin ? '系統管理員' : '一般會員' }}
          </span>
        </p>

        <p v-if="userEmail"><strong>電子郵件：</strong> {{ userEmail }}</p>
        <p><strong>加入時間：</strong> {{ formattedDate }}</p>
        <p><strong>登入狀態：</strong>
          <span :class="{'text-success': authStore.isAuthenticated}">
            已登入
          </span>
        </p>
      </div>

      <div class="button-group">
        <button @click="handleLogout" class="logout-btn">登出</button>

        <router-link :to="{ name: 'ProfileEdit' }" class="edit-profile-btn">
          修改個人資料
        </router-link>
      </div>

      <hr class="divider" />

      <div class="action-links">
        <router-link v-if="authStore.isAdmin" :to="{ name: 'AdminDashboard' }" class="admin-link">
          🛠️ 進入後台管理系統
        </router-link>

        <router-link :to="{ name: 'Orders' }">📦 查看歷史訂單</router-link>
      </div>

    </div>
    <div v-else>
      <p>請先登入以查看您的個人檔案。</p>
      <router-link :to="{ name: 'Login' }" class="login-link">前往登入</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/apiClient'; // 🎯 引入你用來打 API 的工具
// 引入 Auth Store
const authStore = useAuthStore();
const userName = ref('載入中...'); // 🎯 建立一個變數來存名字
const createdAt = ref(null); // 🎯 新增：用來存註冊時間
// 🎯 組件一掛載，就去問後端：「這名會員叫什麼名字？」
onMounted(async () => {
  try {
    const response = await apiClient.get('/user/profile');
    // 假設你的後端 Response 裡那個存放 RealName 的欄位叫 username
    userName.value = response.data.username;
    createdAt.value = response.data.createdAt; // 🎯 確保後端 DTO 有傳這個欄位
  } catch (error) {
    console.error("無法獲取用戶名稱", error);
    userName.value = '親愛的會員';
  }
});
// 處理登出邏輯
const handleLogout = () => {
  // 呼叫 Pinia Store 中的 logout action
  authStore.logout();
};
// 🎯 優化：格式化日期，讓它顯示為 2025年5月20日
const formattedDate = computed(() => {
  if (!createdAt.value) return '來自遠古時期的尊貴會員（系統於此階段尚未開啟時間印記功能）';
  const date = new Date(createdAt.value);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
// 🚨 關鍵修正：直接從 Store 中讀取 Email
const userEmail = computed(() => {
  return authStore.userEmail || 'N/A';
});
</script>

<style scoped>
.username{
  font-size: 1.2em;
  color: #007bff;
}
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