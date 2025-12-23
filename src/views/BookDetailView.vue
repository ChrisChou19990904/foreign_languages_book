<template>
  <div class="book-detail-container">
    <div v-if="isLoading" class="loading-message">載入中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="book">

      <div class="book-main-info">
        <div class="image-area">
          <img :src="book.imageUrl || 'placeholder.png'" :alt="book.title" class="book-cover" />
        </div>

        <div class="details-area">
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author">作者：{{ book.author }}</p>
          <p class="book-isbn">ISBN：{{ book.isbn }}</p>
          <p class="book-category">針對語言：{{ getLanguageName(book.lang) }}</p>
          <p class="book-published">出版日期：{{ formatDate(book.publishedDate) }}</p>

          <div class="price-stock-area">
            <span class="price">NT$ {{ book.price }}</span>
            <span
                class="stock"
                :class="{ 'low-stock': book.stock < 10 && book.stock > 0, 'out-of-stock': book.stock === 0 }"
            >
              庫存: {{ book.stock > 0 ? book.stock : '售罄' }}
            </span>
          </div>

          <div v-if="book.stock > 0" class="add-to-cart-section">
            <label for="quantity">購買數量:</label>
            <input
                type="number"
                id="quantity"
                v-model.number="quantity"
                min="1"
                :max="book.stock"
                @change="validateQuantity"
            />
            <button
                @click="handleAddToCart"
                :disabled="isAddingToCart || quantity <= 0 || quantity > book.stock"
                class="add-to-cart-btn"
            >
              {{ isAddingToCart ? '加入中...' : '加入購物車' }}
            </button>
            <div v-if="cartMessage" :class="{ 'error-message': cartError, 'success-message': !cartError }" class="cart-msg">
              {{ cartMessage }}
            </div>
          </div>
          <div v-else class="out-of-stock-msg">
            目前商品已售罄。
          </div>
        </div>
      </div>

      <div class="book-description">
        <h2>商品介紹</h2>
        <p>{{ book.description || '暫無詳細商品介紹。' }}</p>
      </div>
      <div class="book-reviews-section">
        <hr class="section-divider" />
        <h2>🌟 讀者評論 ({{ reviews.length }})</h2>

        <div v-if="authStore.isAuthenticated" class="add-review-box">
          <h4>撰寫您的心得</h4>
          <div class="rating-input">
            <label>評分：</label>
            <select v-model.number="newReview.rating">
              <option v-for="n in 5" :key="n" :value="n">{{ n }} 星</option>
            </select>
          </div>
          <textarea
              v-model="newReview.content"
              placeholder="這本書對您的外語學習有幫助嗎？分享您的看法..."
              rows="3"
          ></textarea>
          <button @click="submitReview" :disabled="isSubmitting" class="submit-review-btn">
            {{ isSubmitting ? '傳送中...' : '送出評論' }}
          </button>
        </div>
        <div v-else class="login-prompt">
          <p>想分享心得嗎？ <router-link to="/login">請先登入會員</router-link></p>
        </div>

        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews">目前暫無評論，歡迎您成為第一位評論者！</div>
          <div v-for="res in reviews" :key="res.reviewId" class="review-card">
            <div class="review-header">
              <span class="user-name">👤 用戶: {{ res.username || '匿名讀者' }}</span>
              <span class="stars">{{ '⭐'.repeat(res.rating) }}</span>
            </div>
            <p class="review-text">{{ res.content }}</p>
            <span class="review-date">{{ formatDate(res.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found-message">
      抱歉，書籍 ID: {{ route.params.id }} 未找到或已下架。
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // 🌟 統一從 vue-router 引入
import BookService from '@/services/bookService';
import CartService from '@/services/cartService'; // 假設已創建 CartService
import { useAuthStore } from '@/stores/auth';
import reviewService from '@/services/reviewService';
import { useCartStore } from '@/stores/cart'; // 🎯 引入 Store
// 🌟 1. 統一宣告 Router 和 Route
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore(); // 🎯 初始化
const book = ref(null);
const isLoading = ref(false);
const error = ref(null);
const quantity = ref(1);
const isAddingToCart = ref(false);
const cartMessage = ref('');
const cartError = ref(false);
const isBookInCart = (bookId) => {
  if (!bookId) return false;
  return cartStore.items.some(item => item.book.bookId === bookId);
};
const LANGUAGE_MAP = {
  'ENGLISH': '英語',
  'JAPANESE': '日語',
  'KOREAN': '韓語',
  'FRENCH': '法語',
  'SPANISH': '西班牙語',
  'PORTUGUESE': '葡萄牙語',
  'GERMAN': '德語',
  'ITALIAN': '義大利語',
  'RUSSIAN': '俄羅斯語',
  'TURKISH': '土耳其語',
  'ARABIC': '阿拉伯語',
  'THAI': '泰語',
  'VIETNAMESE': '越南語',
  'INDONESIAN': '印尼語',
};
// --- 資料獲取邏輯 ---
/**
 * 將後端傳來的語言 Enum 字串轉換為中文名稱
 * @param {string} langValue - 例如 'JAPANESE'
 * @returns {string} - 例如 '日語'
 */
const getLanguageName = (langValue) => {
  // 檢查映射表是否存在該值，否則返回原始值或一個預設值
  return LANGUAGE_MAP[langValue] || langValue;
};
const reviews = ref([]);
const newReview = ref({
  rating: 5,
  content: ''
});

// 獲取評論清單
const fetchReviews = async () => {
  try {
    const response = await reviewService.getReviews(route.params.id);
    reviews.value = response.data;
  } catch (err) {
    console.error('無法載入評論:', err);
  }
};

const submitReview = async () => {
  if (!newReview.value.content.trim()) return;

  isSubmitting.value = true;
  try {
    const payload = {
      // 確保 ID 是純數字
      bookId: Number(route.params.id),
      rating: Number(newReview.value.rating),
      content: String(newReview.value.content)
    };

    console.log("🚀 發送資料：", payload);

    const res = await BookService.addReview(payload);
    console.log("✅ 伺服器回應：", res.data);

    alert("🎉 評論發表成功！");
    newReview.value.content = '';
    await fetchReviews();
  } catch (err) {
    // 這裡改用更詳細的抓法
    console.error("❌ 錯誤物件完整資訊：", err);
    if (err.response) {
      // 伺服器有回應，但狀態碼不在 2xx 範圍
      console.error("錯誤狀態碼：", err.response.status);
      console.error("伺服器回傳內容：", err.response.data);
    } else if (err.request) {
      // 請求已發出，但沒收到回應 (可能是 CORS 或 Server 沒開)
      console.error("請求已發送但無回應 (err.request)");
    } else {
      // 設定請求時發生錯誤
      console.error("請求設定錯誤：", err.message);
    }
  } finally {
    isSubmitting.value = false;
  }
};
const fetchBookDetail = async (bookId) => {
  isLoading.value = true;
  error.value = null;
  book.value = null;

  try {
    const response = await BookService.getBookDetail(bookId); // GET /api/public/books/{id}
    book.value = response.data;
    quantity.value = 1; // 重置數量
  } catch (err) {
    // 服務器返回 404 (詳情頁中已判斷是否上架)
    if (err.response && err.response.status === 404) {
      error.value = `書籍 ID: ${bookId} 未找到或已下架。`;
    } else {
      error.value = '載入書籍詳情失敗。';
      console.error(err);
    }
  } finally {
    isLoading.value = false;
  }
};

// --- 購物車邏輯 ---

const validateQuantity = () => {
  if (quantity.value < 1) {
    quantity.value = 1;
  } else if (quantity.value > book.value.stock) {
    quantity.value = book.value.stock;
  }
};

const handleAddToCart = async () => {
  if (!authStore.isAuthenticated) {
    alert('請先登入才能加入購物車！');
    router.push('/login');
    return;
  }

  // 🎯 2. 調用 Store 的 Action (取代直接用 CartService)
  // 這樣才會觸發我們在 cart.js 寫的「重複加入 alert」
  isAddingToCart.value = true;
  try {
    // 這裡我們改用 cartStore 統一管理的 action
    await cartStore.updateCartItem(book.value.bookId, quantity.value);

    // 如果成功（且沒被 alert 攔截），可以給個簡單提示
    // cartMessage.value = `成功加入購物車！`;
  } catch (err) {
    const serverMessage = err.response?.data?.message || err.response?.data || '加入購物車失敗。';
    cartMessage.value = serverMessage;
    cartError.value = true;
  } finally {
    isAddingToCart.value = false;
  }
};

// --- 輔助方法 ---

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // 假設後端返回 YYYY-MM-DD 格式
  return new Date(dateString).toLocaleDateString('zh-TW');
};
const isSubmitting = ref(false);

// --- 生命週期 ---

onMounted(async () => {
  fetchBookDetail(route.params.id);
  fetchReviews();

  // 🎯 3. 關鍵：進入詳情頁時，一定要確保購物車資料是最新的
  // 這樣按鈕的 :disabled 狀態才會立刻生效
  if (authStore.isAuthenticated) {
    await cartStore.fetchCartItems();
  }
});
// 監聽路由參數變化，當用戶直接在詳情頁切換書籍時重新載入
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchBookDetail(newId);
  }
});
</script>

<style scoped>
.book-detail-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 20px;
}

.book-main-info {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid #eee;
  padding-bottom: 30px;
}

.image-area {
  flex-basis: 40%;
  max-width: 40%;
}

.book-cover {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.details-area {
  flex-basis: 60%;
  text-align: left;
}

.book-title {
  font-size: 2.2em;
  color: #333;
  margin-bottom: 10px;
}

.book-author, .book-isbn, .book-category, .book-published {
  font-size: 1em;
  color: #555;
  margin-bottom: 8px;
}

.price-stock-area {
  margin: 20px 0;
  padding: 15px;
  background-color: #f7f7f7;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 30px;
}

.price {
  font-size: 1.8em;
  font-weight: bold;
  color: #c0392b;
}

.stock {
  font-size: 1.1em;
  font-weight: bold;
  color: green;
}
.low-stock { color: orange; }
.out-of-stock { color: red; }

/* 加入購物車樣式 */
.add-to-cart-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 25px;
  padding: 10px 0;
}
.add-to-cart-section label {
  font-weight: bold;
}
.add-to-cart-section input[type="number"] {
  width: 60px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}
.add-to-cart-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.add-to-cart-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.cart-msg {
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9em;
}
.success-message {
  background-color: #e6ffe6;
  color: green;
}
.error-message {
  background-color: #ffe6e6;
  color: red;
}
.out-of-stock-msg {
  margin-top: 20px;
  font-weight: bold;
  color: red;
}


/* 書籍描述樣式 */
.book-description h2 {
  font-size: 1.5em;
  border-left: 5px solid #007bff;
  padding-left: 10px;
  margin-bottom: 15px;
}
.book-description p {
  line-height: 1.6;
  color: #444;
  /* 🌟 加入這一行，讓 \n 換行符號生效 */
  white-space: pre-line;
}

/* 狀態訊息 */
.loading-message, .not-found-message {
  text-align: center;
  padding: 50px;
  font-size: 1.2em;
}
.book-reviews-section { margin-top: 50px; text-align: left; }
.section-divider { border: 0; border-top: 1px solid #eee; margin-bottom: 30px; }
.add-review-box {
  background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;
}
.add-review-box textarea {
  width: 100%; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px;
}
.submit-review-btn { background: #333; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; }
.review-card {
  padding: 15px 0; border-bottom: 1px solid #f0f0f0;
}
.review-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.user-name { font-weight: bold; color: #555; }
.stars { color: #f39c12; }
.review-text { color: #333; line-height: 1.6; /* 🌟 同樣加上這一行，讓讀者的換行也能顯示出來 */
  white-space: pre-line;}
.review-date { font-size: 0.85em; color: #999; }
</style>