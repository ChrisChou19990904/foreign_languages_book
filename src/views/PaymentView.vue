<template>
  <div class="payment-alert">
    <h4>🔒 模擬支付環境</h4>
    <p>此頁面為 UI 流程展示，所有支付動作均為模擬。您可以輸入任意數字進行測試。</p>
  </div>
  <div class="payment-simulator">
    <h3>💳 模擬安全支付閘道</h3>
    <p>訂單編號：#{{ $route.params.orderId }}</p>
    <div class="card-box">
      <label>信用卡號</label>
      <input type="text" placeholder="卡號：4524 .... .... ...." class="mock-input">
      <div class="row">
        <label>有效期 (MM/YY)</label>
        <select v-model="expiryMonth">
          <option v-for="m in 12" :key="m" :value="m">{{ m.toString().padStart(2, '0') }}</option>
        </select>
        <span> / </span>
        <select v-model="expiryYear">
          <option v-for="y in 10" :key="y" :value="24 + y">{{ 24 + y }}</option>
        </select>
        <label>安全碼 (CVV)</label>
        <input type="text" placeholder="CVV" class="mock-input short">
      </div>
      <button @click="processPayment" :disabled="isPaying" class="pay-btn">
        {{ isPaying ? '通訊中...' : '確認支付 NT$' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios'; // 或者是你封裝的 OrderService
import OrderService from '@/services/orderService'; // 🌟 改用你現有的服務
const route = useRoute();
const router = useRouter();
const isPaying = ref(false);
const expiryMonth = ref('01'); // 預設 01 月
const expiryYear = ref('25');
const cvv = ref('');// 預設 25 年
const processPayment = async () => {
  isPaying.value = true;
  try {
    // 呼叫我們剛才在後端寫的 Patch API
    // 🌟 使用 OrderService 的方法
    console.log("準備發送 PATCH 請求...");
    await OrderService.completePayment(route.params.orderId);

    alert('支付成功！即將跳轉回訂單詳情。');
    router.replace(`/orders/${route.params.orderId}`);
  } catch (err) {
    console.error("Payment Error:", err);
    // 這裡可以看到後端傳回來的錯誤訊息
    const msg = err.response?.data?.message || err.response?.data || '請稍後再試';
    alert('支付失敗：' + msg);
  } finally {
    isPaying.value = false;
  }
};
</script>

<style scoped>
/* 簡單做一點看起來像信用卡的樣式 */
.payment-simulator { max-width: 400px; margin: 50px auto; text-align: center; }
.card-box { background: #f4f4f4; padding: 20px; border-radius: 10px; border: 1px solid #ddd; }
.mock-input { width: 100%; margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
.row { display: flex; gap: 10px; }
.short { width: 50%; }
.pay-btn { background: #28a745; color: white; border: none; padding: 15px; width: 100%; cursor: pointer; font-weight: bold; }
</style>