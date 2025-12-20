<template>
  <div class="checkout-container">
    <h2>💳 結帳資訊確認</h2>

    <div v-if="isLoading" class="loading-message">正在載入購物車資訊...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="cartItems.length === 0" class="empty-cart-message">
      <p>購物車是空的，無法結帳。請先<router-link to="/cart">加入商品</router-link>。</p>
    </div>

    <div v-else class="checkout-grid">

      <div class="shipping-payment-form">
        <h3>收件人與付款資訊</h3>

        <form @submit.prevent="handleCheckout">

          <fieldset class="form-section">
            <legend>收件資訊</legend>
            <div class="form-group">
              <label for="recipientName">收件人姓名 <span class="required">*</span></label>
              <input type="text" id="recipientName" v-model="checkoutForm.recipientName" required />
            </div>
            <div v-if="checkoutForm.paymentMethod === 'CASH_ON_DELIVERY'" class="form-group">
              <label>聯絡電話 <span class="required">*</span></label>
              <input type="tel" v-model="checkoutForm.recipientPhone" required placeholder="格式：0912345678" />
            </div>
            <div class="form-group">
              <label for="shippingAddress">
                收件地址 <span class="required">*</span>
                <small v-if="checkoutForm.paymentMethod === 'CASH_ON_DELIVERY'" style="color: #e74c3c;">
                  (貨到付款請務必填寫正確地址)
                </small>
              </label>
              <input type="text" id="shippingAddress" v-model="checkoutForm.shippingAddress" required />
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend>付款方式 <span class="required">*</span></legend>
            <div class="radio-group">
              <input type="radio" id="credit_card" value="CREDIT_CARD" v-model="checkoutForm.paymentMethod" required />
              <label for="credit_card">信用卡/金融卡 (Credit Card)</label>
            </div>
            <div class="radio-group">
              <input type="radio" id="cod" value="CASH_ON_DELIVERY" v-model="checkoutForm.paymentMethod" required />
              <label for="cod">貨到付款 (Cash on Delivery)</label>
            </div>
            <div v-if="!checkoutForm.paymentMethod" class="validation-error">請選擇付款方式。</div>
          </fieldset>

          <button type="submit" :disabled="isProcessing || !isCartValid" class="submit-checkout-btn">
            {{ isProcessing ? '處理訂單中...' : `確認結帳 (NT$ ${finalTotal.toFixed(0)})` }}
          </button>

          <div v-if="checkoutMessage" :class="{ 'error-message': checkoutError, 'success-message': !checkoutError }" class="checkout-msg">
            {{ checkoutMessage }}
          </div>
        </form>
      </div>

      <div class="order-summary-panel">
        <h3>訂單明細</h3>

        <div class="summary-items">
          <div v-for="item in cartItems" :key="item.cartItemId" class="summary-item">
            <span class="item-name">{{ item.book.title }}</span>
            <span class="item-qty">x {{ item.quantity }}</span>
            <span class="item-subtotal">NT$ {{ (item.book.price * item.quantity).toFixed(0) }}</span>
            <div v-if="item.quantity > item.book.stock" class="inventory-warning">
              ⚠️ 庫存僅剩 {{ item.book.stock }}，請回購物車修改！
            </div>
          </div>
        </div>

        <div class="summary-totals">
          <div class="total-line"><span>商品總金額:</span><span>NT$ {{ totalPrice.toFixed(0) }}</span></div>
          <div class="total-line shipping-fee"><span>運費 (NT$ {{ shippingFee }}):</span><span>NT$ {{ shippingFee.toFixed(0) }}</span></div>
          <div class="total-line grand-total">
            <span>應付總金額:</span>
            <span class="final-price">NT$ {{ finalTotal.toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CartService from '@/services/cartService'; // 購物車服務
import OrderService from '@/services/orderService'; // 訂單服務

const router = useRouter();

const cartItems = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isProcessing = ref(false);
const checkoutMessage = ref('');
const checkoutError = ref(false);

const shippingFee = 60; // 固定運費

// 表單數據
const checkoutForm = reactive({
  recipientName: '',
  shippingAddress: '',
  recipientPhone: '',
  paymentMethod: 'CREDIT_CARD', // 預設信用卡
});

// --- 計算屬性 ---

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
});

const finalTotal = computed(() => {
  return totalPrice.value > 0 ? totalPrice.value + shippingFee : 0;
});

// 檢查購物車是否有效 (數量是否超過庫存)
const isCartValid = computed(() => {
  return cartItems.value.every(item => item.quantity <= item.book.stock);
});

// --- 資料獲取與檢查 ---

const fetchCart = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await CartService.getCartItems();
    cartItems.value = response.data;

    // 如果購物車為空，導回首頁或購物車頁面
    if (cartItems.value.length === 0) {
      error.value = '購物車是空的。';
      // router.replace('/cart'); // 導回購物車
    }

    // 檢查庫存問題
    if (!isCartValid.value) {
      error.value = '部分商品數量超過庫存，請先回購物車修改後再結帳。';
    }

  } catch (err) {
    error.value = '載入購物車資訊失敗，請重新整理。';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// --- 結帳處理 ---

const handleCheckout = async () => {
  checkoutMessage.value = '';
  checkoutError.value = false;

  // 基本表單驗證 (HTML required 屬性已處理大部分)
  if (!checkoutForm.recipientName || !checkoutForm.shippingAddress || !checkoutForm.paymentMethod) {
    checkoutMessage.value = '請填寫所有必填的收件資訊和付款方式。';
    checkoutError.value = true;
    return;
  }

  // 再次檢查庫存是否有效
  if (!isCartValid.value) {
    checkoutMessage.value = '無法結帳：購物車中有商品庫存不足。';
    checkoutError.value = true;
    return;
  }

  isProcessing.value = true;

  try {
    // 呼叫 OrderService 執行結帳 (POST /api/user/orders/checkout)
    const response = await OrderService.checkout(checkoutForm);

    // 結帳成功
    const newOrderId = response.data.orderId;
    // 🌟 修改這裡：根據付款方式決定去哪裡
    if (checkoutForm.paymentMethod === 'CREDIT_CARD') {
      checkoutMessage.value = '訂單已成立，正在導向模擬支付網關...';

      // 延遲一點點時間讓用戶看到成功訊息，然後跳轉到模擬付款頁
      setTimeout(() => {
        router.replace(`/payment/${newOrderId}`);
      }, 1000);

    } else {
      // 貨到付款 (CASH_ON_DELIVERY)
      checkoutMessage.value = `訂單 #${newOrderId} 創建成功！請於取貨時付款。`;

      setTimeout(() => {
        router.replace(`/orders/${newOrderId}`);
      }, 1500);
    }

  } catch (err) {
    // 後端錯誤處理（如庫存再次不足、資料庫鎖定失敗等）
    const serverMessage = err.response?.data?.message || '結帳失敗，請稍後再試。';
    checkoutMessage.value = serverMessage;
    checkoutError.value = true;
  } finally {
    isProcessing.value = false;
  }
};

// --- 生命週期 ---

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.checkout-container {
  max-width: 1100px;
  margin: 30px auto;
  padding: 20px;
}
.checkout-container h2 {
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.checkout-grid {
  display: flex;
  gap: 40px;
}

/* 1. 表單區 */
.shipping-payment-form {
  flex: 2;
  text-align: left;
}
.shipping-payment-form h3 {
  margin-bottom: 20px;
}

.form-section {
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 6px;
}
.form-section legend {
  font-weight: bold;
  font-size: 1.1em;
  padding: 0 10px;
  color: #007bff;
}
.required {
  color: red;
}

.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}
.form-group input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.radio-group {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.radio-group input[type="radio"] {
  margin-right: 10px;
}

.validation-error {
  color: red;
  font-size: 0.9em;
  margin-top: 5px;
}

/* 2. 訂單摘要區 */
.order-summary-panel {
  flex: 1;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}
.order-summary-panel h3 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.summary-items {
  max-height: 300px;
  overflow-y: auto;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}
.summary-item {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr;
  gap: 5px;
  padding: 5px 0;
  font-size: 0.9em;
}
.item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.inventory-warning {
  grid-column: 1 / span 3;
  color: #e67e22;
  font-weight: bold;
  margin-top: 5px;
}

.summary-totals {
  font-size: 1em;
}
.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.shipping-fee {
  color: #555;
  font-size: 0.95em;
}
.grand-total {
  border-top: 2px solid #ccc;
  padding-top: 10px;
  font-weight: bold;
  font-size: 1.2em;
}
.final-price {
  color: #c0392b;
}

/* 結帳按鈕與訊息 */
.submit-checkout-btn {
  width: 100%;
  padding: 15px;
  margin-top: 20px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.2em;
  cursor: pointer;
}
.submit-checkout-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.checkout-msg {
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}
.error-message {
  color: red;
  background-color: #ffeaea;
}
.success-message {
  color: green;
  background-color: #e6ffe6;
}
.empty-cart-message {
  text-align: center;
  padding: 50px;
  font-size: 1.1em;
}
</style>