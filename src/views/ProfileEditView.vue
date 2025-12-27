<template>
  <div class="edit-profile-container">
    <h2>🛠️ 修改個人資料</h2>

    <div v-if="isLoading" class="loading-message">
      正在加載您的資料...
    </div>

    <div v-else-if="fetchError" class="error-message">
      資料加載失敗：{{ fetchError }}
    </div>

    <form v-else @submit.prevent="handleUpdate" class="profile-edit-form">

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div v-if="updateError" class="error-message">
        更新失敗：{{ updateError }}
      </div>

      <div class="form-group">
        <label for="email">電子郵件 (不可修改)</label>
        <input
            type="email"
            id="email"
            :value="authStore.getUserEmail"
            disabled
        />
      </div>

      <div class="form-group">
        <label for="username">用戶名</label>
        <input
            type="text"
            id="username"
            v-model="profileForm.username"
            required
            placeholder="請輸入新的用戶名"
        />
      </div>

     <div class="form-group password-hint">
        如需修改密碼，請<router-link :to="{ name: 'ChangePassword' }">點此前往</router-link>。
      </div>

      <div class="action-buttons">
        <button type="submit" :disabled="isUpdating">
          {{ isUpdating ? '更新中...' : '確認修改' }}
        </button>
        <button type="button" @click="router.back()" class="cancel-btn" :disabled="isUpdating">
          取消並返回
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/apiClient'; // 💡 假設您有一個處理 JWT 的 axios 實例

const router = useRouter();
const authStore = useAuthStore();

// 表單數據 (需要與後端 ProfileDto 匹配)
const profileForm = reactive({
  username: '',
  // 這裡只包含可修改的欄位
});

// 狀態管理
const isLoading = ref(true);
const isUpdating = ref(false);
const fetchError = ref(null);
const updateError = ref(null);
const successMessage = ref(null);

// 1. 加載當前用戶資料
const fetchProfile = async () => {
  isLoading.value = true;
  fetchError.value = null;
  try {
    // GET /api/user/profile (需要 JWT)
    const response = await apiClient.get('/user/profile');

    // 假設後端返回 { username: 'oldName', email: 'user@example.com' } 結構
    const data = response.data;

    // 將現有數據載入表單
    profileForm.username = data.username;

    // 💡 注意：您需要在後端 UserController 的 GET /api/user/profile
    // 中實現一個方法來返回用戶的 username！

  } catch (err) {
    console.error('加載會員資料失敗:', err);
    fetchError.value = '無法獲取當前會員資料。';
  } finally {
    isLoading.value = false;
  }
};

// 2. 處理表單提交 (PUT 請求)
const handleUpdate = async () => {
  updateError.value = null;
  successMessage.value = null;
  isUpdating.value = true;

  try {
    // PUT /api/user/profile (需要 JWT)
    await apiClient.put('/user/profile', profileForm);

    successMessage.value = '會員資料已成功更新！';

    // 💡 如果用戶名更新成功，可能需要更新 Pinia Store 中的用戶名狀態 (如果有的話)
    // 例如: authStore.setUsername(profileForm.username);

  } catch (err) {
    console.error('更新會員資料失敗:', err);
    updateError.value = err.response?.data || '更新時發生未知錯誤。';
  } finally {
    isUpdating.value = false;
  }
};

// 組件加載時執行
onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.edit-profile-container {
  max-width: 500px;
  margin: 50px auto;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-edit-form .form-group {
  margin-bottom: 20px;
}

.profile-edit-form label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.profile-edit-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.profile-edit-form input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.action-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  flex-grow: 1;
}

.action-buttons button[type="submit"] {
  background-color: #007bff;
  color: white;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
}

.success-message {
  color: #28a745;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
}

.password-hint {
  font-size: 0.9em;
  color: #6c757d;
}
</style>