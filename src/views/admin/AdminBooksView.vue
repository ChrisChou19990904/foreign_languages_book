<template>
  <div class="admin-books-container">
    <h2>📚 後台書籍管理</h2>

    <div class="action-bar">
      <button @click="openModal('create')" class="create-btn">新增書籍</button>
      <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索書名、ISBN或作者"
          class="search-input"
          @input="filterBooks"
      />
    </div>

    <div v-if="isLoading" class="status-message">載入中...</div>
    <div v-else-if="error" class="error-message">錯誤：{{ error }}</div>

    <div v-else class="book-table-wrapper">
      <table class="book-table">
        <thead>
        <tr>
          <th>封面</th>
          <th>書名</th>
          <th>針對語言</th>
          <th>ID</th>
          <th>ISBN</th>
          <th>價格</th>
          <th>庫存</th>
          <th>狀態</th>
          <th>作者</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="book in filteredBooks" :key="book.bookId">
          <td>
            <img :src="book.imageUrl" alt="封面圖片" style="width: 40px; height: auto; display: block; margin: 0 auto;">
          </td>
          <td>
            <div style="font-weight: bold;">{{ book.title }}</div>
          </td>
          <td>
            <div style="font-weight: bold;"> {{ getLanguageName(book.lang) }}</div>
          </td>
          <td>
            <div style="font-weight: bold;">{{ book.bookId }} </div>
          </td>
          <td>{{ book.isbn }}</td>
          <td>NT$ {{ book.price }}</td>
          <td :class="{ 'low-stock': book.stock < 10, 'out-of-stock': book.stock === 0 }">{{ book.stock }}</td>
          <td>
      <span :class="['status-tag', book.isOnsale ? 'available' : 'unavailable']">
        {{ book.isOnsale ? '上架' : '下架' }}
      </span>
          </td>
          <td>{{ book.author }}</td>
          <td>
            <button @click="openModal('update', book)" class="edit-btn">編輯</button>
            <button @click="handleDelete(book.bookId)" class="delete-btn">刪除</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <AdminBookModal
        :visible="isModalVisible"
        :mode="modalMode"
        :initialBook="currentBook"
        @close="closeModal"
        @saved="fetchBooks"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AdminBookService from '@/services/adminBookService';
import AdminBookModal from '@/components/AdminBookModal.vue';

const books = ref([]);
// ❗ 刪除 categories 相關的狀態和邏輯
// const categories = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchKeyword = ref('');

// Modal 狀態管理
const isModalVisible = ref(false);
const modalMode = ref('create'); // 'create' or 'update'
const currentBook = ref({});

// 🎯 新增：語言選項，與 Modal 中定義的選項一致
const LANGUAGE_OPTIONS = [
  { value: 'ENGLISH', label: '英語' },
  { value: 'JAPANESE', label: '日語' },
  { value: 'KOREAN', label: '韓語' },
  { value: 'FRENCH', label: '法語' },
  { value: 'SPANISH', label: '西班牙語' },
  { value: 'GERMAN', label: '德語' },
  { value: 'ITALIAN', label: '義大利語' },
  { value: 'RUSSIAN', label: '俄羅斯語' },
  { value: 'TURKISH', label: '土耳其語' },
  { value: 'ARABIC', label: '阿拉伯語' },
  { value: 'THAI', label: '泰語' },
  { value: 'VIETNAMESE', label: '越南語' },
  { value: 'INDONESIAN', label: '印尼語' },
];

// --- 資料獲取與過濾 ---

const fetchBooks = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await AdminBookService.getAllBooksForAdmin();
    books.value = response.data;
    // ❗ 刪除獲取分類列表的邏輯
    // categories.value = await AdminBookService.getCategories();
  } catch (err) {
    error.value = err.message || '無法取得書籍列表，請確認您的管理員權限。';
    console.error('Failed to fetch books:', err);
  } finally {
    isLoading.value = false;
  }
};

const filteredBooks = computed(() => {
  if (!searchKeyword.value) {
    return books.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return books.value.filter(book =>
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.isbn.includes(keyword)
  );
});

const filterBooks = () => {
  // 由於 filteredBooks 是 computed，這裡只需要觸發 keyword 變更即可
};

// 🎯 新增：輔助方法，用於在表格中顯示語言的中文名稱
const getLanguageName = (langValue) => {
  if (!langValue) return '未分類';
  const langOption = LANGUAGE_OPTIONS.find(opt => opt.value === langValue.toUpperCase());
  return langOption ? langOption.label : '未知';
};


// --- Modal 操作 ---

const openModal = (mode, book = {}) => {
  modalMode.value = mode;
  // 深拷貝，避免直接修改表格數據
  currentBook.value = JSON.parse(JSON.stringify(book));
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  currentBook.value = {};
};

// --- 刪除操作 ---

const handleDelete = async (bookId) => {
  if (!confirm(`確定要永久刪除書籍 ID: ${bookId} 嗎？`)) {
    return;
  }

  error.value = null;
  try {
    await AdminBookService.deleteBook(bookId);
    alert(`書籍 ID: ${bookId} 刪除成功！`);
    // 重新載入列表
    fetchBooks();
  } catch (err) {
    error.value = err.response?.data?.message || `刪除書籍 ID: ${bookId} 失敗。`;
    console.error('Delete failed:', err);
  }
};

onMounted(fetchBooks);
</script>

<style scoped>
.admin-books-container {
  max-width: 1200px;
  margin: 30px auto;
  padding: 20px;
}
.admin-books-container h2 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.create-btn {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.search-input {
  padding: 8px 12px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 表格樣式 */
.book-table-wrapper {
  overflow-x: auto;
}
.book-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.book-table th, .book-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}
.book-table th {
  background-color: #f0f0f0;
  font-weight: bold;
}
.book-table tbody tr:hover {
  background-color: #fafafa;
}

.status-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
}
.status-tag.available { background-color: #d4edda; color: #155724; }
.status-tag.unavailable { background-color: #f8d7da; color: #721c24; }

.low-stock { color: orange; font-weight: bold; }
.out-of-stock { color: red; font-weight: bold; }

/* 操作按鈕 */
.edit-btn, .delete-btn {
  padding: 5px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.edit-btn {
  background-color: #007bff;
  color: white;
}
.delete-btn {
  background-color: #dc3545;
  color: white;
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