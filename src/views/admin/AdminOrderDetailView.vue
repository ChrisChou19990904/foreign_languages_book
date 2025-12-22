<template>
  <div class="admin-order-detail-container">
    <div v-if="isLoading" class="loading-message">
      <p>正在載入訂單 #{{ orderId }} 詳情...</p>
    </div>
    <div v-else-if="error" class="error-message">
      <p>錯誤：{{ error }}</p>
    </div>
    <div v-else-if="order" class="order-content">
      <div class="header-section">
        <h2 class="order-title">
          訂單詳情：#{{ order.orderId }}
        </h2>

        <div class="status-update-box">
          <span :class="['order-status-badge', getStatusClass(order.status)]">
            目前狀態: {{ displayStatus(order.status) }}
          </span>
          <select
              @change="handleStatusUpdate($event.target.value)"
              class="status-update-select"
              :value="order.status.toLowerCase()"
              :disabled="isUpdatingStatus || ['done', 'cancelled'].includes(order.status.toLowerCase())"
          >
            <option v-for="(name, status) in getStatusOptions(order.status)"
                    :key="status"
                    :value="status">
              {{ name }}
            </option>
          </select>
          <div v-if="isUpdatingStatus" class="update-message">更新中...</div>
          <div v-if="updateError" class="update-error">{{ updateError }}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block admin-info">
          <h3>👤 用戶與訂單基本資訊</h3>
          <p><strong>用戶 ID:</strong> {{ order.userId }}</p><br>
          <p><strong>成立時間:</strong><br> {{ formatDate(order.createdAt) }}</p>
        </div>

        <div class="info-block">
          <h3>📦 收件資訊</h3>
          <p><strong>收件人名字:</strong><br> {{ order.recipientName }}</p><br>
          <p><strong>收件人電話:</strong><br> {{ order.recipientPhone }}</p><br>
          <p><strong>收件人地址:</strong><br> {{ order.shippingAddress }}</p>
        </div>

        <div class="info-block">
          <h3>💰 支付與費用資訊</h3>
          <p><strong>付款方式:</strong> {{ displayPaymentMethod(order.paymentMethod) }}</p>
          <p><strong>商品總價:</strong> NT$ {{ (order.totalPrice).toFixed(0) }}</p>
          <p><strong>運費:</strong> NT$ 60</p>
          <p class="grand-total"><strong>應付總金額:</strong> NT$ {{ (order.totalPrice + 60).toFixed(0) }}</p>
        </div>
      </div>

      <div class="item-list">
        <h3>🛒 訂單商品明細</h3>
        <div class="item-header">
          <span>商品名稱 (Book ID)</span>
          <span class="qty">數量</span>
          <span class="price">單價 (結帳時)</span>
          <span class="subtotal">小計</span>
        </div>
        <div v-for="item in order.items" :key="item.orderItemId" class="item-row">
          <span>
            <router-link :to="`/book/${item.bookId}`">{{ item.bookTitle }}</router-link>
            <small class="book-id-tag"> (ID: {{ item.bookId }})</small>
          </span>
          <span class="qty">{{ item.quantity }}</span>
          <span class="price">NT$ {{ item.price.toFixed(0) }}</span>
          <span class="subtotal">NT$ {{ (item.price * item.quantity).toFixed(0) }}</span>
        </div>
      </div>

      <div class="back-link">
        <router-link to="/admin/orders">← 返回訂單列表</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import AdminOrderService from '@/services/adminOrderService';

const route = useRoute();
const order = ref(null);
const isLoading = ref(false);
const error = ref(null);
const isUpdatingStatus = ref(false);
const updateError = ref(null);

// 獲取路由中的訂單 ID
const orderId = computed(() => route.params.id);

// 狀態映射表 (用於顯示)
const statusMap = {
  pending: '待付款',
  awaiting_payment: '待支付確認', // 👈 新增
  paid: '已付款',
  shipped: '已出貨',
  delivered: '已抵達',           // 👈 新增
  done: '已完成',
  cancelled: '已取消',
};

// 狀態流程 (供 Select Option 使用)
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

// --- 資料獲取 ---

const fetchOrderDetail = async () => {
  // 1. 直接從路由獲取 ID，確保是最新的
  const id = route.params.id;

  if (!id) {
    error.value = '網址中未包含有效的訂單 ID。';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // 2. 正確傳入 ID。後端會回傳包含 items 和收件資訊的 OrderDetailDTO
    const response = await AdminOrderService.getOrderDetail(id);

    // 3. 直接賦值。response.data 就是那筆訂單的完整物件
    order.value = response.data;

    // 如果後端回傳空值，顯示錯誤
    if (!order.value) {
      error.value = `資料庫中找不到 ID 為 ${id} 的訂單。`;
    }

  } catch (err) {
    // 捕捉後端 403 (權限不足) 或 404 (找不到)
    error.value = err.response?.data?.message || '連線伺服器失敗，請檢查管理員權限。';
    console.error(`訂單詳情載入失敗:`, err);
  } finally {
    isLoading.value = false;
  }
};

// --- 狀態更新 ---

const handleStatusUpdate = async (newStatus) => {
  if (newStatus === order.value.status.toLowerCase()) {
    updateError.value = null;
    return;
  }
  if (!confirm(`確定將訂單 #${order.value.orderId} 的狀態更新為 [${displayStatus(newStatus)}] 嗎？`)) {
    return;
  }

  isUpdatingStatus.value = true;
  updateError.value = null;

  try {
    const response = await AdminOrderService.updateOrderStatus(order.value.orderId, newStatus);

    // 更新本地訂單狀態
    order.value = response.data;

    // 成功後清空錯誤訊息
    updateError.value = null;

  } catch (err) {
    const serverMessage = err.response?.data?.message || '更新狀態失敗。';
    updateError.value = serverMessage;
    console.error('Status update failed:', err);
  } finally {
    isUpdatingStatus.value = false;
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
  return statusMap[status.toLowerCase()] || '未知狀態';
};

const getStatusClass = (status) => {
  const s = status.toLowerCase();
  switch (s) {
    case 'paid': return 'status-paid';
    case 'shipped': return 'status-shipped';
    case 'delivered': return 'status-shipped'; // 沿用出貨顏色
    case 'done': return 'status-done';
    case 'pending': return 'status-pending';
    case 'awaiting_payment': return 'status-pending'; // 👈 新增顏色
    case 'cancelled': return 'status-cancelled';
    default: return '';
  }
};

const displayPaymentMethod = (method) => {
  if (!method) return '未知';
  const m = method.toLowerCase();
  return m === 'credit_card' ? '信用卡' : '貨到付款';
}

const getStatusOptions = (currentStatus) => {
  if (!order.value || !currentStatus) return {};

  const status = currentStatus.toLowerCase();
  const method = order.value.paymentMethod ? order.value.paymentMethod.toUpperCase() : '';

  // 1. 貨到付款流程
  if (method === 'COD' || method === 'CASH_ON_DELIVERY') {
    const codFlow = {
      pending: { pending: '待處理', shipped: '設為已出貨', cancelled: '取消訂單' },
      shipped: { shipped: '已出貨', delivered: '設為已抵達' },
      delivered: { delivered: '已抵達', done: '設為已完成' },
      done: { done: '已完成' },
      cancelled: { cancelled: '已取消' }
    };
    return codFlow[status] || {};
  }

  // 2. 信用卡流程
  const creditFlow = {
    pending: { pending: '待付款', awaiting_payment: '進入支付跳轉', cancelled: '取消訂單' },
    awaiting_payment: { awaiting_payment: '待支付確認', cancelled: '支付失敗/取消' },
    paid: { paid: '已付款', shipped: '設為已出貨' },
    shipped: { shipped: '已出貨', delivered: '設為已抵達' },
    delivered: { delivered: '已抵達', done: '設為已完成' },
    done: { done: '已完成' },
    cancelled: { cancelled: '已取消' },
  };

  return creditFlow[status] || {};
};

// --- 生命週期 ---

onMounted(fetchOrderDetail);
watch(() => route.params.id, fetchOrderDetail);
</script>

<style scoped>
.admin-order-detail-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.order-title {
  color: #3498db;
}

/* 狀態更新區塊 */
.status-update-box {
  display: flex;
  align-items: center;
  gap: 15px;
}
.order-status-badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9em;
  font-weight: bold;
}
.status-update-select {
  padding: 8px 10px;
  border: 1px solid #3498db;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-weight: bold;
}
.status-update-select:disabled {
  cursor: not-allowed;
  background-color: #e9ecef;
}
.update-message { color: #2980b9; }
.update-error { color: red; font-size: 0.9em; }

/* 狀態顏色 */
.status-paid { background-color: #d4edda; color: #155724; }
.status-shipped { background-color: #fff3cd; color: #856404; }
.status-done { background-color: #d1ecf1; color: #0c5460; }
.status-pending { background-color: #f8d7da; color: #721c24; }
.status-cancelled { background-color: #e9ecef; color: #6c757d; }

/* 資訊區塊 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 三欄佈局 */
  gap: 20px;
  margin-bottom: 30px;
}
.info-block {
  padding: 15px;
  border: 1px solid #eee;
  border-left: 5px solid #3498db;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.admin-info {
  border-left-color: #e67e22; /* 管理員額外資訊用不同顏色區分 */
}

.info-block h3 {
  border-bottom: 1px dashed #ddd;
  padding-bottom: 8px;
  margin-bottom: 10px;
  color: #333;
  font-size: 1.1em;
}
.info-block p {
  margin: 3px 0;
  font-size: 0.95em;
}
.grand-total {
  font-size: 1.05em;
  font-weight: bold;
  color: #c0392b;
  border-top: 1px dashed #ccc;
  padding-top: 8px;
  margin-top: 8px;
}

/* 商品明細 */
.item-list {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.item-list h3 {
  margin-bottom: 15px;
  color: #333;
}
.item-header, .item-row {
  display: grid;
  grid-template-columns: 4fr 1fr 1.5fr 1.5fr;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  text-align: right;
  align-items: center;
  font-size: 0.95em;
}

.item-header {
  font-weight: bold;
  background-color: #f0f0f0;
  padding: 10px 15px;
  border-radius: 4px 4px 0 0;
  border-bottom: 2px solid #ccc;
  text-align: right;
}
.item-header span:first-child { text-align: left; }

.item-row span:first-child { text-align: left; }
.item-row:last-child {
  border-bottom: none;
}

.item-row a {
  color: #3498db;
  text-decoration: none;
}
.item-row a:hover {
  text-decoration: underline;
}
.book-id-tag {
  color: #999;
  font-size: 0.8em;
}

.subtotal {
  font-weight: 500;
  color: #007bff;
}

.loading-message, .error-message {
  text-align: center;
  padding: 40px;
  border: 1px dashed #ccc;
  margin-top: 20px;
}
.error-message {
  color: red;
}

.back-link {
  margin-top: 30px;
  text-align: right;
}
.back-link a {
  color: #3498db;
  text-decoration: none;
}
.back-link a:hover {
  text-decoration: underline;
}
</style>