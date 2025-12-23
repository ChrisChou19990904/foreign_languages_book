<template>
  <div class="books-view-container">
    <h2>📚 外語書籍清單</h2>

    <div class="search-bar">
      <input
          type="text"
          v-model="searchKeyword"
          @input="debounceSearch"
          placeholder="搜索書名、作者或 ISBN..."
      />
      <select v-model="selectedLang" @change="fetchBooks">

          <option value="all">所有語言</option>

          <option value="english">英文</option>

          <option value="japanese">日文</option>

          <option value="korean">韓文</option>

          <option value="spanish">西班牙文</option>

        <option value="portuguese">葡萄牙文</option>

          <option value="french">法文</option>

          <option value="german">德文</option>

          <option value="italian">義大利文</option>

          <option value="russian">俄羅斯文</option>

          <option value="turkish">土耳其文</option>

          <option value="arabic">阿拉伯文</option>

          <option value="thai">泰文</option>

          <option value="vietnamese">越南文</option>

          <option value="indonesian">印尼文</option>

      </select>
    </div>

    <div v-if="isLoading" class="loading-message">載入中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="books.length === 0" class="no-results">
      沒有找到符合條件的書籍。
    </div>

    <div v-else class="book-list">
      <div v-for="book in books" :key="book.bookId" class="book-card">
        <img :src="book.imageUrl || 'placeholder.png'" alt="書籍封面" class="book-image" />
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">作者: {{ book.author }}</p>
          <p class="book-price">價格: NT${{ book.price }}</p>
          <p class="book-stock" :class="{ 'low-stock': book.stock < 10 && book.stock > 0, 'out-of-stock': book.stock === 0 }">
            庫存: {{ book.stock > 0 ? book.stock : '售罄' }}
          </p>
          <button @click="viewDetail(book.bookId)" class="detail-btn">查看詳情</button>
          <button
              v-if="book.stock > 0"
              @click="addToCart(book)"
              :class="['cart-btn', { 'btn-in-cart': isBookInCart(book.bookId) }]"
              :disabled="isBookInCart(book.bookId)"
          >
            {{ isBookInCart(book.bookId) ? '已在購物車' : '加入購物車' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'; // 🎯 引入 computed
import { useRouter } from 'vue-router';
import BookService from '@/services/bookService';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart'; // 🎯 改為使用 Store，移除單獨的 CartService 引入
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore(); // 🎯 初始化 CartStore

const books = ref([]);
const searchKeyword = ref('');
const selectedLang = ref('all');
const isLoading = ref(false);
const error = ref(null);

let searchTimeout = null;

// --- 核心邏輯 ---

// 🎯 判斷書籍是否已在購物車 (用於按鈕狀態控制)
const isBookInCart = (bookId) => {
  return cartStore.items.some(item => item.book.bookId === bookId);
};

const fetchBooks = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    let response;
    if (searchKeyword.value) {
      response = await BookService.searchBooks(searchKeyword.value);
    } else if (selectedLang.value !== 'all') {
      response = await BookService.getBooksByLang(selectedLang.value);
    } else {
      response = await BookService.searchBooks('');
    }
    books.value = response.data;
  } catch (err) {
    error.value = '載入書籍列表失敗。' + (err.response?.data || '');
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchBooks();
  }, 300);
};

const viewDetail = (bookId) => {
  router.push(`/book/${bookId}`);
};

/**
 * 🎯 修改後的 addToCart
 * 配合親戚建議：將邏輯交給 Store 處理，確保重複加入時會彈出提醒
 */
const addToCart = async (book) => {
  if (!authStore.isAuthenticated) {
    alert('請先登入才能加入購物車！');
    router.push('/login');
    return;
  }

  if (book.stock <= 0) {
    alert('該書籍目前已售罄！');
    return;
  }

  try {
    // 🌟 直接調用 cartStore 的 action
    // 這樣會觸發我們在 cart.js 寫的 alert(`🛒 購物車已有此商品...`)
    await cartStore.updateCartItem(book.bookId, 1);

    // 如果 updateCartItem 成功執行（且沒有被 alert 攔截返回）
    // 只有在真正新增成功時，可以考慮給予成功的 Feedback
    // 但因為 store 已經處理了 alert，這裡可以保持簡單
  } catch (err) {
    const serverMessage = err.response?.data || '加入購物車失敗，請稍後再試。';
    alert(`❌ 失敗：${serverMessage}`);
    console.error("Add to Cart Error:", err);
  }
};

// --- 生命週期與監聽 ---

onMounted(() => {
  fetchBooks();
  // 🎯 建議：掛載時也獲取一次最新的購物車狀態，確保按鈕狀態準確
  if (authStore.isAuthenticated) {
    cartStore.fetchCartItems();
  }
});

watch(selectedLang, () => {
  if (!searchKeyword.value) {
    fetchBooks();
  }
});

</script>

<style scoped>
.books-view-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.search-bar { display: flex; gap: 15px; margin-bottom: 30px; }
.book-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }

.book-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  background: #fff;
}
.book-card:hover { transform: translateY(-5px); }

.book-image {
  width: 100%; height: 250px; object-fit: contain;
  padding: 15px; background: #fcfcfc;
}

.detail-btn, .cart-btn {
  width: 100%; padding: 10px; margin-top: 8px;
  border: none; border-radius: 6px; cursor: pointer;
  transition: all 0.2s;
}

.detail-btn { background: #007bff; color: white; }
.cart-btn { background: #28a745; color: white; }

/* 🎯 關鍵：禁用狀態樣式 */
.cart-btn:disabled {
  background-color: #e0e0e0 !important;
  color: #888 !important;
  cursor: not-allowed;
  border: 1px solid #ccc;
}
</style>