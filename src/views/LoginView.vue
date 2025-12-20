<template>
  <div class="login-container">
    <h2>會員登入</h2>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="form-group">
        <label for="email">電子郵件 (Email)</label>
        <input
            type="email"
            id="email"
            v-model="loginForm.email"
            required
            placeholder="請輸入註冊的 Email"
        />
      </div>

      <div class="form-group">
        <label for="password">密碼</label>
        <input
            type="password"
            id="password"
            v-model="loginForm.password"
            required
            placeholder="請輸入密碼"
        />
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '登入中...' : '登入' }}
      </button>
    </form>

    <p class="mt-4">
      還沒有帳號？ <router-link to="/register">點此註冊</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/stores/auth'; // 確保路徑正確

const authStore = useAuthStore();

const loginForm = reactive({
  email: '',
  password: '',
});

const error = ref(null);
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    // 呼叫 Pinia Store 的登入 Action
    await authStore.login(loginForm.email, loginForm.password);

    // 登入成功後，Pinia Store 會自動處理導航 (router.push)

  } catch (err) {
    // 處理 Spring Boot 後端返回的錯誤訊息
    // 錯誤訊息可能在 err.response.data (來自我們定義的後端 RuntimeException)
    const serverMessage = err.response?.data?.message || err.response?.data || '登入失敗，請檢查 Email 和密碼。';
    error.value = serverMessage;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 簡單的樣式，請根據您的 UI 框架調整 */
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-group {
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.error-message {
  color: red;
  background-color: #ffeaea;
  padding: 10px;
  border: 1px solid red;
  border-radius: 4px;
}
</style>