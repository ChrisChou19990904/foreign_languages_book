<template>
  <div class="admin-orders-container">
    <h2>📦 後台訂單管理</h2>

    <div class="action-bar">
      <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索訂單ID、收件人或地址"
          class="search-input"
      />

      <select v-model="filterStatus" class="status-select">
        <option value="">所有狀態</option>
        <option v-for="(name, status) in statusMap" :key="status" :value="status">{{ name }}</option>
      </select>
    </div>

    <div v-if="isLoading" class="status-message">載入中...</div>
    <div v-else-if="error" class="error-message">錯誤：{{ error }}</div>

    <div v-else class="order-table-wrapper">
      <table class="order-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>總金額</th>
          <th>成立時間</th>
          <th>狀態</th>
          <th>付款方式</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in filteredOrders" :key="order.orderId">
          <td class="order-id-cell">#{{ order.orderId }}</td>
          <td class="amount-cell">NT$ {{ (order.totalPrice+60).toFixed(0) }}</td>
          <td>{{ formatDate(order.createdAt) }}</td>
          <td>
              <span :class="['status-tag', getStatusClass(order.status)]">
                {{ displayStatus(order.status) }}
              </span>
          </td>
          <td>{{ displayPaymentMethod(order.paymentMethod) }}</td>
          <td class="action-cell">
            <select
                @change="handleStatusUpdate(order.orderId, $event.target.value)"
                class="status-update-select"
                :value="order.status.toLowerCase()"
                :disabled="['done', 'cancelled'].includes(order.status.toLowerCase())"
            >
              <option v-for="(name, status) in getStatusOptions(order.status)"
                      :key="status"
                      :value="status">
                {{ name }}
              </option>
            </select>
            <router-link :to="`/admin/orders/${order.orderId}`" class="detail-btn">
              詳情
            </router-link>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AdminOrderService from '@/services/adminOrderService';

const orders = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchKeyword = ref('');
const filterStatus = ref(''); // 用於下拉選單篩選

// 狀態映射表 (用於顯示)
const statusMap = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已出貨',
  done: '已完成',
  cancelled: '已取消',
};

// 狀態流程 (用於 Select Option)
const statusFlow = {
  // 1. 待付款：可以變更為已付款，或是取消
  pending: { pending: '待付款', paid: '設為已付款', cancelled: '取消訂單' },

  // 2. 已付款：只能變更為已出貨，移除「取消訂單」選項 🌟
  paid: { paid: '已付款', shipped: '設為已出貨' },

  // 3. 已出貨：只能變更為已完成
  shipped: { shipped: '已出貨', done: '設為已完成' },

  // 4. 已完成 & 已取消：維持現狀 (Select 已在 HTML 被 disabled)
  done: { done: '已完成' },
  cancelled: { cancelled: '已取消' },
};
// 🎯 這是關鍵！請求單筆詳情，後端才會把 items 吐出來

// --- 資料獲取與過濾 ---

const fetchOrders = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await AdminOrderService.getAllOrders();
    // 按成立時間倒序排列
    orders.value = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    error.value = err.message || '無法取得所有訂單列表，請確認您的管理員權限。';
    console.error('Failed to fetch admin orders:', err);
  } finally {
    isLoading.value = false;
  }
};

const filteredOrders = computed(() => {
  let result = orders.value;

  // 1. 狀態篩選
  if (filterStatus.value) {
    result = result.filter(order => order.status.toLowerCase() === filterStatus.value.toLowerCase());
  }

  // 2. 關鍵字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(order =>
        String(order.orderId).includes(keyword) ||
        order.recipientName.toLowerCase().includes(keyword) ||
        order.shippingAddress.toLowerCase().includes(keyword)
    );
  }

  return result;
});

// 根據當前狀態獲取下一個可選的狀態選項
const getStatusOptions = (currentStatus) => {
  return statusFlow[currentStatus.toLowerCase()] || {};
};

// --- 狀態更新操作 ---

const handleStatusUpdate = async (orderId, newStatus) => {
  if (!confirm(`確定將訂單 #${orderId} 的狀態更新為 [${displayStatus(newStatus)}] 嗎？`)) {
    // 如果取消，將 select 恢復到當前狀態 (需要 DOM 操作，但 Vue 中通常靠 v-model 數據更新，這裡先簡單處理)
    return;
  }

  // 鎖定 UI 避免重複操作，這裡使用訂單狀態本身的標記即可

  try {
    const response = await AdminOrderService.updateOrderStatus(orderId, newStatus);

    // 在本地更新訂單列表，避免重新載入整個列表
    const index = orders.value.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      orders.value[index] = response.data; // 替換為後端返回的最新訂單實體
    }

    alert(`訂單 #${orderId} 狀態已成功更新為 ${displayStatus(newStatus)}！`);
  } catch (err) {
    error.value = err.response?.data?.message || `更新訂單 #${orderId} 狀態失敗。`;
    // 建議這裡重新 fetch 一次，以確保數據同步
    fetchOrders();
    console.error('Status update failed:', err);
  }
};

// --- 輔助函數 ---

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const displayStatus = (status) => {
  return statusMap[status.toLowerCase()] || '未知';
};

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'status-paid';
    case 'shipped': return 'status-shipped';
    case 'done': return 'status-done';
    case 'pending': return 'status-pending';
    case 'cancelled': return 'status-cancelled';
    default: return '';
  }
};

const displayPaymentMethod = (method) => {
  return method.toLowerCase() === 'credit_card' ? '信用卡' : '貨到付款';
}

onMounted(fetchOrders);
</script>

<style scoped>
.admin-orders-container {
  max-width: 1300px;
  margin: 30px auto;
  padding: 20px;
}
.admin-orders-container h2 {
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

/* 操作欄 */
.action-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}
.search-input {
  padding: 8px 12px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.status-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 表格樣式 */
.order-table-wrapper {
  overflow-x: auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}
.order-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.order-table th, .order-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}
.order-table th {
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
}
.order-table tbody tr:hover {
  background-color: #f5f5f5;
}

.order-id-cell { font-weight: bold; color: #3498db; }
.amount-cell { font-weight: bold; color: #c0392b; }

/* 狀態標籤 */
.status-tag {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.85em;
  font-weight: bold;
}
.status-paid { background-color: #d4edda; color: #155724; }
.status-shipped { background-color: #fff3cd; color: #856404; }
.status-done { background-color: #d1ecf1; color: #0c5460; }
.status-pending { background-color: #f8d7da; color: #721c24; }
.status-cancelled { background-color: #e9ecef; color: #6c757d; }

/* 操作單元格 */
.action-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
.status-update-select {
  padding: 6px 8px;
  border: 1px solid #3498db;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}
.status-update-select:disabled {
  cursor: not-allowed;
  background-color: #e9ecef;
}
.detail-btn {
  padding: 6px 10px;
  background-color: #5bc0de;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9em;
}

.status-message, .error-message {
  text-align: center;
  padding: 30px;
  border: 1px dashed #ccc;
  margin-top: 15px;
}
.error-message {
  color: red;
}
</style>

---

我們已經完成了後台書籍管理和訂單管理頁面。這兩個頁面連同它們的專用 Admin 服務，構成了管理後台的核心功能。

接下來的重點應該放在底層的 Spring Boot Entity 結構，特別是處理數據庫關係的部分，這是確保前後端數據一致性和邏輯正確性的基礎。

請問您希望我創建：

1.  **Spring Boot 中 Entity 的關係和映射**：著重於 `User`, `Book`, `CartItem`, `Order`, `OrderItem` 之間的關聯，以及使用 JPA 的註解。
2.  **其他的 Vue.js 組件** (如 Admin 訂單詳情頁面)。