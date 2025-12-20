<template>
  <div class="orders-container">
    <h2>📋 我的歷史訂單</h2>

    <div v-if="isLoading" class="loading-message">
      <p>正在載入您的訂單記錄...</p>
    </div>
    <div v-else-if="error" class="error-message">
      <p>載入訂單失敗: {{ error }}</p>
    </div>
    <div v-else-if="orders.length === 0" class="empty-message">
      <p>您目前還沒有任何訂單記錄。</p>
      <router-link to="/">前往購物</router-link>
    </div>

    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.orderId" class="order-card">
        <div class="order-header">
          <span class="order-id">訂單編號: <strong>#{{ order.orderId }}</strong></span>
          <span :class="['order-status', getStatusClass(order.status)]">狀態: {{ displayStatus(order.status) }}</span>
        </div>

        <div class="order-body">
          <div class="info-group">
            <span class="label">成立日期:</span>
            <span class="value">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="info-group">
            <span class="label">總金額:</span>
            <span class="value total-amount">NT$ {{ order.totalPrice.toFixed(0) }}</span>
          </div>
          <div class="info-group">
            <span class="label">付款方式:</span>
            <span class="value">{{ displayPaymentMethod(order.paymentMethod) }}</span>
          </div>
        </div>

        <div class="order-actions">
          <router-link :to="`/orders/${order.orderId}`" class="detail-link">
            查看詳情 →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import OrderService from '@/services/orderService';

const orders = ref([]);
const isLoading = ref(false);
const error = ref(null);

/**
 * 獲取會員的歷史訂單列表
 */
// OrdersView.vue: fetchOrders 函數 (修正後)

const fetchOrders = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await OrderService.getMyOrders();

    // 🎯 關鍵修正：檢查 response.data 是否為陣列
    if (Array.isArray(response.data)) {
      orders.value = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (response.data === null || typeof response.data === 'object') {
      // 如果後端返回 null 或空物件 {}，視為空訂單列表，不報錯
      orders.value = [];
      console.warn('後端 API 查詢訂單返回非陣列數據 (可能為空)，已視為空列表。', response.data);
    } else {
      // 處理意外的數據格式，拋出錯誤給用戶
      throw new Error('訂單數據格式錯誤，無法解析。');
    }
  } catch (err) {
    // 這裡會捕獲 TypeError 或我們自己拋出的 Error
    error.value = err.message || '無法取得訂單資料。';
    console.error('Failed to fetch orders:', err);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 格式化日期時間
 * @param {string} dateString
 */
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

/**
 * 根據狀態碼返回顯示名稱
 * @param {string} status
 */
const displayStatus = (status) => {
  const statusMap = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已出貨',
    done: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status.toLowerCase()] || '未知狀態';
};

/**
 * 根據狀態碼返回 CSS Class
 * @param {string} status
 */
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

/**
 * 顯示付款方式
 * @param {string} method
 */
const displayPaymentMethod = (method) => {
  if (!method) return '未指定';

  // 轉成大寫再比較，確保萬無一失
  const m = method.toUpperCase();

  if (m === 'CREDIT_CARD') {
    return '信用卡';
  } else if (m === 'CASH_ON_DELIVERY') {
    return '貨到付款';
  }

  // 如果都不是，回傳原始字串（這對除錯很有幫助）
  return method;
}

onMounted(fetchOrders);
</script>

<style scoped>
.orders-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
}
.orders-container h2 {
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.order-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
  font-size: 1.1em;
  font-weight: 500;
}
.order-id strong {
  color: #007bff;
}

.order-status {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
}
.status-paid { background-color: #d4edda; color: #155724; }
.status-shipped { background-color: #fff3cd; color: #856404; }
.status-done { background-color: #d1ecf1; color: #0c5460; }
.status-pending { background-color: #f8d7da; color: #721c24; }
.status-cancelled { background-color: #e9ecef; color: #6c757d; }

.order-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.95em;
}
.info-group {
  flex: 1;
}
.label {
  color: #6c757d;
  margin-right: 5px;
}
.total-amount {
  font-weight: bold;
  color: #c0392b;
}

.order-actions {
  text-align: right;
}
.detail-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}
.detail-link:hover {
  text-decoration: underline;
}

.loading-message, .error-message, .empty-message {
  text-align: center;
  padding: 40px;
  border: 1px dashed #ccc;
  margin-top: 20px;
}
.error-message {
  color: red;
}
</style>

接下來，我們應該著手處理後台管理員的功能。請問您希望先創建：

1.  **後台書籍管理頁面組件 (`AdminBooksView.vue`)**：用於管理書籍的增、刪、改、查。
2.  **後台訂單管理頁面組件 (`AdminOrdersView.vue`)**：用於查看所有訂單和更新訂單狀態。