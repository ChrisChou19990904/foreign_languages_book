<template>
  <div class="change-password-container">
    <h2>修改密碼</h2>
    <p class="subtitle">為了帳號安全，建議定期更換密碼。</p>

    <form @submit.prevent="handleChangePassword" class="password-form">
      <div class="form-group">
        <label>目前的密碼</label>
        <input
            type="password"
            v-model="passwordForm.oldPassword"
            required
            placeholder="請輸入目前的密碼"
        />
      </div>

      <div class="form-group">
        <label>新密碼</label>
        <input
            type="password"
            v-model="passwordForm.newPassword"
            required
            placeholder="請輸入新密碼"
        />
      </div>

      <div class="form-group">
        <label>確認新密碼</label>
        <input
            type="password"
            v-model="passwordForm.confirmPassword"
            required
            placeholder="請再次輸入新密碼"
        />
        <span v-if="isPasswordMismatch" class="error-text">兩次輸入的新密碼不一致</span>
      </div>

      <div class="button-group">
        <button type="submit" :disabled="isSubmitting || isPasswordMismatch" class="btn-submit">
          {{ isSubmitting ? '處理中...' : '確認修改' }}
        </button>
        <button type="button" @click="$router.go(-1)" class="btn-cancel">取消返回</button>
      </div>

      <p v-if="message" :class="['message', isError ? 'error' : 'success']">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/apiClient'; // 確保路徑正確

const router = useRouter();
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const isSubmitting = ref(false);
const message = ref('');
const isError = ref(false);

// 🔍 檢查兩次新密碼是否一致
const isPasswordMismatch = computed(() => {
  return passwordForm.value.newPassword !== passwordForm.value.confirmPassword &&
      passwordForm.value.confirmPassword !== '';
});

const handleChangePassword = async () => {
  isSubmitting.value = true;
  message.value = '';

  try {
    // 🎯 調用你剛寫好的後端 API: POST /api/user/change-password
    const response = await apiClient.post('/user/change-password', {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    });

    isError.value = false;
    message.value = response.data; // "密碼修改成功..."

    // 修改成功後，3秒後跳轉回個人資料頁
    setTimeout(() => {
      router.push({ name: 'Profile' });
    }, 2000);

  } catch (err) {
    isError.value = true;
    message.value = err.response?.data || '修改失敗，請檢查舊密碼是否正確。';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.change-password-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error-text {
  color: red;
  font-size: 0.85em;
  margin-top: 5px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-submit {
  flex: 2;
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

.btn-submit:disabled {
  background-color: #ccc;
}

.btn-cancel {
  flex: 1;
  background-color: #f44336;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

.message {
  margin-top: 15px;
  text-align: center;
  padding: 10px;
}

.success { color: green; background-color: #e8f5e9; }
.error { color: red; background-color: #ffebee; }
</style>