<template>
  <div class="register-container">
    <h2>會員註冊</h2>
    <form @submit.prevent="handleRegister" class="auth-form">
      <div v-if="success" class="success-message">{{ success }}</div>
      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="form-group">
        <label for="username">用戶名稱</label>
        <input
            type="text"
            id="username"
            v-model="registerForm.username"
            required
            placeholder="請輸入您的用戶名稱"
        />
      </div>

      <div class="form-group">
        <label for="email">電子郵件 (Email)</label>
        <input
            type="email"
            id="email"
            v-model="registerForm.email"
            required
            placeholder="請輸入您的 Email"
        />
      </div>

      <div class="form-group">
        <label for="password">密碼</label>
        <input
            type="password"
            id="password"
            v-model="registerForm.password"
            required
            placeholder="請輸入密碼"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">確認密碼</label>
        <input
            type="password"
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            required
            placeholder="請再次輸入密碼"
        />
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '註冊中...' : '註冊' }}
      </button>
    </form>

    <p class="mt-4">
      已經有帳號？ <router-link to="/login">點此登入</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import apiClient from '@/plugins/axios';// 確保路徑正確
// 🌟 檢查這行是否存在，路徑請根據你的專案結構調整
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
const registrationSuccess = ref(false); // 🎯 控制提示是否顯示
const errorMessage = ref('');
const formData = ref({ email: '', password: '', username: '' }); // 假設的表單數據

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const error = ref(null);
const success = ref(null);
const isLoading = ref(false);

const handleRegister = async () => {
  error.value = null;
  success.value = null;
  isLoading.value = true;

  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = '兩次輸入的密碼不一致。';
    isLoading.value = false;
    return;
  }

  try {
    const response = await apiClient.post('/auth/register', {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
    });

    // 註冊成功後清空表單
    success.value = response.data; // 來自後端 '註冊成功' 訊息
    Object.keys(registerForm).forEach(key => registerForm[key] = '');

  } catch (err) {
    const serverMessage = err.response?.data?.message || err.response?.data || '註冊失敗，請稍後再試。';
    error.value = serverMessage;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 樣式與 LoginView 相同，您可以將公共樣式提取到一個 CSS 檔案中 */
.register-container {
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
  background-color: #28a745; /* 註冊使用不同顏色 */
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
.success-message {
  color: green;
  background-color: #eaffe5;
  padding: 10px;
  border: 1px solid green;
  border-radius: 4px;
}
</style>