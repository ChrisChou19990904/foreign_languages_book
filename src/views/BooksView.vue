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
          <button v-if="book.stock > 0" @click="addToCart(book)" class="cart-btn">加入購物車</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import BookService from '@/services/bookService'; // 引入上面定義的服務
import { useAuthStore } from '@/stores/auth'; // 假設您需要登入狀態來處理購物車
import CartService from '@/services/cartService';
const router = useRouter();
const authStore = useAuthStore();

const books = ref([]);
const searchKeyword = ref('');
const selectedLang = ref('all');
const isLoading = ref(false);
const error = ref(null);

let searchTimeout = null;

// --- 核心邏輯 ---

const fetchBooks = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    let response;

    if (searchKeyword.value) {
      // 優先使用搜索 API
      response = await BookService.searchBooks(searchKeyword.value);

    } else if (selectedLang.value !== 'all') {
      // 如果沒有搜索關鍵字，則使用語言篩選 API
      response = await BookService.getBooksByLang(selectedLang.value);

    } else {
      // 預設情況：搜索空關鍵字或使用某個預設語言 (此處我們假定搜索空關鍵字等同於獲取全部上架書籍)
      // 注意: Spring Boot 的 searchBooks API 允許空關鍵字查詢所有
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

// 防抖函數：避免用戶每次輸入都發送請求
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // 當用戶停止輸入 300ms 後才執行搜索
    fetchBooks();
  }, 300);
};

const viewDetail = (bookId) => {
  router.push(`/book/${bookId}`); // 導向單本書籍詳情頁
};

const addToCart = async (book) => { // 🎯 必須是 async 函式
  if (!authStore.isAuthenticated) {
    alert('請先登入才能加入購物車！');
    router.push('/login');
    return;
  }

  // 1. 檢查庫存 (雖然後端也會檢查，但前端先檢查可以提供更好的用戶體驗)
  if (book.stock <= 0) {
    alert('該書籍目前已售罄！');
    return;
  }

  try {
    // 2. 呼叫後端 API
    const payload = {
      bookId: book.bookId,
      quantity: 1, // 預設添加數量為 1
    };

    await CartService.addOrUpdateCartItem(payload);

    // 3. 成功後提示
    alert(`✅ 書籍《${book.title}》已成功加入購物車！`);

    // 🎯 建議：成功後導向購物車頁面，或刷新購物車數量標識
    // router.push('/cart');

  } catch (err) {
    // 4. 處理後端返回的錯誤（例如庫存不足、書籍不存在等）
    const serverMessage = err.response?.data || '加入購物車失敗，請稍後再試。';
    alert(`❌ 失敗：${serverMessage}`);
    console.error("Add to Cart Error:", err);
  }
};

// --- 生命週期與監聽 ---

onMounted(() => {
  fetchBooks();
});

// 當語言篩選變化時，重新獲取數據 (不需要防抖)
watch(selectedLang, () => {
  if (!searchKeyword.value) {
    fetchBooks();
  }
});

</script>

<style scoped>
/* 簡單的響應式網格樣式 */
.books-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}
.search-bar input, .search-bar select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
}
/* 1. 調整卡片整體：讓它更有質感 */
.book-card {
  border: 1px solid #eee; /* 邊框淡一點比較高級 */
  border-radius: 12px;    /* 圓角稍微大一點 */
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  background-color: #fff;
  transition: transform 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px); /* 滑過時往上飄，增加互動感 */
}

/* 2. 核心修正：調整圖片呈現方式 */
.book-image {
  width: 100%;
  height: 250px;        /* 高度可以稍微拉高一點，讓比例更像實體書 */
  background-color: #fcfcfc; /* 給背景一個極淡的灰色，避免白色封面消失 */
  padding: 15px;        /* 關鍵：留白可以讓整本書的邊界露出來 */

  /* 💡 這是最重要的修改： */
  object-fit: contain;  /* 確保「整張圖片」都縮放在格子內，絕不裁切 */

  /* 加上陰影模擬實體書的厚度感 */
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.15));

  border-bottom: 1px solid #f0f0f0;
}

/* 3. 調整資訊區塊 */
.book-info {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 8px;
  height: 44px;         /* 保持兩行標題的高度 */
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多顯示兩行，超過顯示省略號 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.detail-btn, .cart-btn {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.detail-btn {
  background-color: #007bff;
  color: white;
}
.cart-btn {
  background-color: #28a745;
  color: white;
}
.no-results, .loading-message, .error-message {
  text-align: center;
  padding: 20px;
}
.error-message {
  color: red;
}
</style>