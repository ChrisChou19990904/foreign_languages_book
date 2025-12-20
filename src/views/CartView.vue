<template>
  <div class="cart-view-container">
    <h2>🛒 我的購物車</h2>

    <div v-if="isLoading" class="loading-message">載入購物車明細中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="cartItems.length === 0" class="empty-cart">
      <p>您的購物車是空的，快去逛逛我們的 <router-link to="/">書籍清單</router-link> 吧！</p>
    </div>

    <div v-else class="cart-content">

      <div class="cart-items-list">
        <div v-for="item in cartItems" :key="item.cartItemId" class="cart-item-card">

          <div class="item-image-col">
            <img :src="item.book.imageUrl || 'placeholder.png'" :alt="item.book.title" class="item-image" />
          </div>

          <div class="item-info-col">
            <h4 class="item-title">
              <router-link :to="`/book/${item.book.bookId}`">{{ item.book.title }}</router-link>
            </h4>
            <p class="item-author">作者: {{ item.book.author }}</p>
            <p class="item-price">單價: NT$ {{ item.book.price }}</p>
            <p class="item-stock" :class="{ 'error-text': item.book.stock < item.quantity }">
              庫存: {{ item.book.stock }}
              <span v-if="item.book.stock < item.quantity">(庫存不足!)</span>
            </p>
          </div>

          <div class="item-actions-col">
            <div class="quantity-control">
              <label for="qty-{{item.cartItemId}}">數量:</label>
              <input
                  type="number"
                  :id="`qty-${item.cartItemId}`"
                  v-model.number="item.quantity"
                  min="1"
                  :max="item.book.stock"
                  @change="debounceUpdateQuantity(item)"
              />
            </div>

            <p class="item-subtotal">小計: NT$ {{ (item.book.price * item.quantity).toFixed(0) }}</p>

            <button @click="handleDeleteItem(item.cartItemId)" class="delete-btn" :disabled="isDeleting[item.cartItemId]">
              {{ isDeleting[item.cartItemId] ? '刪除中' : '刪除' }}
            </button>
          </div>
        </div>

        <div v-if="updateMessage" :class="{ 'success-message': !updateError, 'error-message': updateError }" class="cart-update-msg">
          {{ updateMessage }}
        </div>
      </div>

      <div class="cart-summary">
        <h3>訂單摘要</h3>
        <div class="summary-line">
          <span>商品總數量:</span>
          <span class="value">{{ totalQuantity }} 件</span>
        </div>
        <div class="summary-line">
          <span>商品總金額:</span>
          <span class="value">NT$ {{ totalPrice.toFixed(0) }}</span>
        </div>
        <div class="summary-line shipping">
          <span>運費:</span>
          <span class="value">NT$ {{ shippingFee.toFixed(0) }}</span>
        </div>
        <div class="summary-line total">
          <span>應付總金額:</span>
          <span class="value final-total">NT$ {{ finalTotal.toFixed(0) }}</span>
        </div>

        <button
            @click="handleCheckout"
            :disabled="!isCheckoutReady"
            class="checkout-btn"
        >
          前往結帳 ({{ finalTotal.toFixed(0) }})
        </button>
        <p v-if="!isCheckoutReady" class="warning-msg">
          請先解決庫存不足問題才能結帳。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import CartService from '@/services/cartService'; // 引入購物車服務

const router = useRouter();

const cartItems = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isDeleting = ref({}); // 用來追蹤哪個商品正在被刪除
const updateMessage = ref('');
const updateError = ref(false);

// 購物車總計計算
const shippingFee = ref(60); // 假設固定運費 NT$ 60

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
});

const finalTotal = computed(() => {
  return totalPrice.value > 0 ? totalPrice.value + shippingFee.value : 0;
});

// 檢查是否可以結帳 (所有商品數量都不能超過庫存)
const isCheckoutReady = computed(() => {
  if (cartItems.value.length === 0) return false;
  return cartItems.value.every(item => item.quantity <= item.book.stock && item.quantity > 0);
});

// --- 資料獲取邏輯 ---

const fetchCart = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await CartService.getCartItems();
    cartItems.value = response.data;

  } catch (err) {
    error.value = '載入購物車內容失敗，請確認您已登入。';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// --- 商品數量更新邏輯 ---

let updateTimeout = null;
const debounceUpdateQuantity = (item) => {
  // 簡單的數量驗證
  if (item.quantity < 1) item.quantity = 1;
  if (item.quantity > item.book.stock) {
    // 雖然前端限制了 max，但用戶可能手動輸入，所以需要後續提示
  }

  // 清除舊的計時器
  clearTimeout(updateTimeout);

  // 300ms 後執行更新
  updateTimeout = setTimeout(() => {
    handleUpdateQuantity(item);
  }, 300);
};

const handleUpdateQuantity = async (item) => {
  updateMessage.value = '更新中...';
  updateError.value = false;

  try {
    const payload = {
      bookId: item.book.bookId,
      quantity: item.quantity,
    };

    // POST /api/user/cart (用於新增或更新)
    const response = await CartService.addOrUpdateCartItem(payload);

    // 找到並更新本地 cartItems 中的對應項目
    const index = cartItems.value.findIndex(i => i.cartItemId === item.cartItemId);
    if (index !== -1) {
      // 後端應該會返回更新後的 CartItem 實體，我們用它來同步本地狀態
      // 此處簡單更新數量，實際應同步整個返回的 item
      cartItems.value[index].quantity = response.data.quantity;
    }

    updateMessage.value = `《${item.book.title}》數量更新成功！`;

  } catch (err) {
    const serverMessage = err.response?.data?.message || err.response?.data || '更新數量失敗。';
    updateMessage.value = serverMessage;
    updateError.value = true;
  }
};


// --- 商品刪除邏輯 ---

const handleDeleteItem = async (cartItemId) => {
  isDeleting.value[cartItemId] = true;
  updateMessage.value = '刪除中...';
  updateError.value = false;

  try {
    // DELETE /api/user/cart/{cartItemId}
    await CartService.deleteCartItem(cartItemId);

    // 從本地狀態中移除該商品
    cartItems.value = cartItems.value.filter(item => item.cartItemId !== cartItemId);

    updateMessage.value = '商品已從購物車中移除。';

  } catch (err) {
    const serverMessage = err.response?.data?.message || err.response?.data || '刪除失敗。';
    updateMessage.value = serverMessage;
    updateError.value = true;
  } finally {
    isDeleting.value[cartItemId] = false;
  }
};

// --- 結帳邏輯 ---

const handleCheckout = () => {
  if (isCheckoutReady.value) {
    // 導向結帳頁面
    router.push('/checkout');
  } else {
    alert('請先移除或減少庫存不足的商品！');
  }
};

// --- 生命週期 ---

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
/* 頁面容器 */
.cart-view-container {
  max-width: 1200px;
  margin: 30px auto;
  padding: 20px;
}
.cart-view-container h2 {
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

/* 狀態和錯誤訊息 */
.loading-message, .error-message, .empty-cart {
  text-align: center;
  padding: 50px;
  font-size: 1.1em;
}
.error-message {
  color: red;
  background-color: #ffeaea;
}
.success-message {
  color: green;
  background-color: #e6ffe6;
}
.error-text {
  color: red;
  font-weight: bold;
}
.warning-msg {
  color: #e67e22;
  margin-top: 10px;
}
.cart-update-msg {
  padding: 10px;
  border-radius: 4px;
  margin-top: 20px;
}

/* 購物車內容佈局 */
.cart-content {
  display: flex;
  gap: 30px;
}

/* 購物車明細列表 */
.cart-items-list {
  flex-grow: 1;
  max-width: 75%;
}

.cart-item-card {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px dashed #eee;
}

.item-image-col {
  flex-basis: 100px;
  margin-right: 20px;
}
.item-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info-col {
  flex-grow: 1;
  text-align: left;
}
.item-title a {
  font-size: 1.1em;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;
}
.item-price, .item-author, .item-stock {
  font-size: 0.9em;
  color: #555;
  margin: 3px 0;
}

.item-actions-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-basis: 200px;
}

.quantity-control input {
  width: 50px;
  padding: 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.item-subtotal {
  font-weight: bold;
  font-size: 1em;
  color: #333;
}
.delete-btn {
  padding: 5px 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 購物車總結 */
.cart-summary {
  flex-basis: 300px;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}
.cart-summary h3 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1em;
}
.summary-line.total {
  border-top: 2px solid #ddd;
  padding-top: 10px;
  margin-top: 15px;
  font-size: 1.2em;
  font-weight: bold;
}
.final-total {
  color: #c0392b;
  font-size: 1.1em;
}
.checkout-btn {
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
}
.checkout-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>