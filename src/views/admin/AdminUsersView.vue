<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-people-fill"></i> 會員管理系統</h2>
      <span class="badge bg-primary">總註冊人數：{{ users.length }}</span>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <table class="table table-hover table-bordered border-secondary align-middle">
          <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>用戶名稱</th>
            <th>Email</th>
            <th>角色</th>
            <th>註冊時間</th>
            <th>帳號狀態</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in users" :key="user.userId">
            <td>{{ user.userId }}</td>
            <td><strong>{{ user.username }}</strong></td>
            <td>{{ user.email }}</td>
            <td>
              <select
                  class="form-select form-select-sm"
                  v-model="user.role"
                  @change="handleRoleChange(user)"
              >
                <option value="USER">一般會員 (USER)</option>
                <option value="ADMIN">管理員 (ADMIN)</option>
              </select>
            </td>
            <td>
              <small class="text-muted">
                {{ formatDateTime(user.createdAt) }}
              </small>
            </td>
            <td>
                <span :class="['badge', user.isActive ? 'bg-success' : 'bg-secondary']">
                  {{ user.isActive ? '啟用中' : '已停權' }}
                </span>
            </td>
            <td>
              <button
                  :class="['btn btn-sm', user.isActive ? 'btn-outline-danger' : 'btn-outline-success']"
                  @click="handleToggleStatus(user)"
                  :disabled="loading"
              >
                {{ user.isActive ? '停權' : '啟用' }}
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">載入資料中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import adminUserService from '@/services/adminUserService';

const users = ref([]);
const loading = ref(false);

// 1. 初始化獲取所有會員
const fetchUsers = async () => {
  try {
    const res = await adminUserService.getAllUsers();
    users.value = res.data;
  } catch (err) {
    alert('獲取會員清單失敗，請確認管理員權限');
    console.error(err);
  }
};

// 2. 切換停權/啟用狀態
const handleToggleStatus = async (user) => {
  if (!confirm(`確定要${user.isActive ? '停權' : '啟用'}用戶 ${user.username} 嗎？`)) return;

  loading.value = true;
  try {
    await adminUserService.toggleUserActive(user.userId);
    user.isActive = !user.isActive; // 前端同步更新，不用重新刷頁面，體驗更好
  } catch (err) {
    alert('更新狀態失敗');
  } finally {
    loading.value = false;
  }
};

// 3. 切換角色
const handleRoleChange = async (user) => {
  try {
    await adminUserService.updateUserRole(user.userId, user.role);
    alert(`已將 ${user.username} 的權限更新為 ${user.role}`);
  } catch (err) {
    alert('權限更新失敗');
    fetchUsers(); // 失敗時刷回原始資料
  }
};
// 🌟 新增：格式化時間的函數
const formatDateTime = (dateStr) => {
  if (!dateStr) return '此會員註冊時開發者還沒創建紀錄註冊時間的功能';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
onMounted(fetchUsers);
</script>

<style scoped>
/* 讓表格外框更明顯 */
.table {
  border: 2px solid #dee2e6; /* 外層大框線 */
}

/* 讓每一個儲存格都有明顯的框線 */
.table th,
.table td {
  border: 1px solid #ced4da !important; /* 強制覆蓋 Bootstrap 預設的淡色線 */
}

.table th {
  font-weight: 600;
  background-color: #f1f3f5; /* 讓標頭背景稍微深一點點，對比更強 */
  border-bottom: 2px solid #adb5bd !important; /* 標頭底線加粗 */
}

/* 滑鼠滑過時，改變整列的邊框顏色（選配） */
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
  outline: 1px solid #0d6efd; /* 滑鼠移上去時有一層藍色外框 */
}

.card {
  border: 1px solid #dee2e6; /* 給外層卡片也加上框線 */
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05); /* 加上一點點陰影會更有質感 */
}
</style>