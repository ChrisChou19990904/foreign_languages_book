<template>
  <div class="order-detail-container">
    <div v-if="isLoading" class="loading-message">
      <p>正在載入訂單 #{{ orderId }} 詳情...</p>
    </div>
    <div v-else-if="error" class="error-message">
      <p>錯誤：{{ error }}</p>
    </div>
    <div v-else-if="order" class="order-content">
      <h2 class="order-title">
        訂單詳情：#{{ order.orderId }}
        <span :class="['order-status-badge', getStatusClass(order.status)]">
          {{ displayStatus(order.status) }}
        </span>
      </h2>

      <div class="info-grid">
        <div class="info-block">
          <h3>📦 收件資訊</h3>
          <p><strong>收件人名字:</strong> {{ order.recipientName }}</p>
          <p><strong>收件人電話:</strong> {{ order.recipientPhone }}</p>
          <p><strong>收件地址:</strong> {{ order.shippingAddress }}</p>
          <p><strong>成立時間:</strong> {{ formatDate(order.createdAt) }}</p>
        </div>

        <div class="info-block">
          <h3>💰 支付資訊</h3>
          <p><strong>付款方式:</strong> {{ displayPaymentMethod(order.paymentMethod) }}</p>
          <p><strong>商品總價:</strong> NT$ {{ order.totalPrice }}</p>
          <p><strong>運費:</strong> NT$ 60</p>
          <p class="grand-total"><strong>應付總金額:</strong> NT$ {{ order.totalPrice+60 }}</p>
        </div>
      </div>

      <div class="item-list">
        <h3>🛒 訂單商品明細</h3>
        <div class="item-header">
          <span>商品名稱</span>
          <span class="qty">數量</span>
          <span class="price">單價</span>
          <span class="subtotal">小計</span>
        </div>
        <div v-for="item in order.items" :key="item.orderItemId" class="item-row">
          <span>{{ item.bookTitle }}</span>
          <span class="qty">{{ item.quantity }}</span>
          <span class="price">NT$ {{ item.price }}</span>
          <span class="subtotal">NT$ {{ (item.price * item.quantity).toFixed(0) }}</span>
        </div>
      </div>

      <div class="back-link">
        <router-link to="/orders">← 返回訂單列表</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, nextTick} from 'vue';
import { useRoute } from 'vue-router';
import OrderService from '@/services/orderService';

const route = useRoute();
const order = ref(null);
const isLoading = ref(false);
const error = ref(null);

// 獲取路由中的訂單 ID
const orderId = computed(() => route.params.id);

/**
 * 獲取單筆訂單詳情
 */
const fetchOrderDetail = async () => {
  await nextTick();
  const id = String(orderId.value);
  if (!id || id === 'undefined') { // 🎯 修正：增加對 "undefined" 字串的檢查
    error.value = '未提供有效的訂單 ID。';
    return;
  }

  isLoading.value = true;
  error.value = null;
  try {
    // 呼叫 OrderService 獲取單筆訂單詳情
    const response = await OrderService.getOrderDetail(id);
    order.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || '無法取得訂單詳情，可能訂單不存在或您沒有權限查看。';
    console.error(`Failed to fetch order ${id} detail:`, err);
  } finally {
    isLoading.value = false;
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
  const statusMap = {
    awaiting_payment: '待支付確認', // 👈 新增
    processing: '金流處理中',       // 👈 新增
    pending: '待付款',
    paid: '已付款',
    shipped: '已出貨',
    done: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status.toLowerCase()] || '未知狀態';
};

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'awaiting_payment':
    case 'processing': return 'status-warning';
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

// --- 生命週期 ---

onMounted(fetchOrderDetail);
</script>

<style scoped>
.order-detail-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
}

.order-title {
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-status-badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9em;
  font-weight: bold;
}
.status-paid { background-color: #d4edda; color: #155724; }
.status-shipped { background-color: #fff3cd; color: #856404; }
.status-done { background-color: #d1ecf1; color: #0c5460; }
.status-pending { background-color: #f8d7da; color: #721c24; }
.status-cancelled { background-color: #e9ecef; color: #6c757d; }

/* 資訊區塊 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}
.info-block {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.info-block h3 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
  color: #333;
}
.info-block p {
  margin: 5px 0;
  line-height: 1.5;
}
.grand-total {
  font-size: 1.1em;
  font-weight: bold;
  color: #c0392b;
  border-top: 1px dashed #ccc;
  padding-top: 10px;
  margin-top: 10px;
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
  grid-template-columns: 3fr 1fr 1.2fr 1.2fr;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  text-align: right;
  align-items: center;
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
  color: #007bff;
  text-decoration: none;
}
.back-link a:hover {
  text-decoration: underline;
}
</style>