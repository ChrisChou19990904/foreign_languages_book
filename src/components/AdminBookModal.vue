<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>{{ modalTitle }}</h3>
      <form @submit.prevent="saveBook">
        <div class="form-group">
          <label>書名</label>
          <input v-model="form.title" type="text" required />
        </div>
        <div class="form-group">
          <label>作者</label>
          <input v-model="form.author" type="text" required />
        </div>
        <div class="form-group">
          <label>ISBN</label>
          <input v-model="form.isbn" type="text" required />
        </div>
        <div class="form-group">
          <label>圖片網址 (ImageUrl)</label>
          <input v-model="form.imageUrl" type="text" placeholder="輸入書籍封面圖片的 URL" />
        </div>
        <div class="form-group">
          <label>價格 / 庫存</label>
          <div class="split-group">
            <input v-model.number="form.price" type="number" placeholder="價格" required min="1" step="0.01" />
            <input v-model.number="form.stock" type="number" placeholder="庫存" required min="0" />
          </div>
        </div>

        <div class="form-group">
          <label>語言 / 出版日期</label>
          <div class="split-group">
            <select v-model="form.lang" required>
              <option :value="null" disabled>請選擇語言</option>
              <option v-for="langOption in LANGUAGE_OPTIONS" :key="langOption.value" :value="langOption.value">
                {{ langOption.label }}
              </option>
            </select>
            <input v-model="form.publishedDate" type="date" required />
          </div>
        </div>

        <div class="form-group">
          <label>上架狀態</label>
          <input type="checkbox" v-model="form.isAvailable" id="isAvailable" />
          <label for="isAvailable" style="display: inline-block; margin-left: 10px;">{{ form.isAvailable ? '上架中' : '已下架' }}</label>
        </div>
        <div class="form-group">
          <label>簡介</label>
          <textarea v-model="form.description"></textarea>
        </div>

        <div v-if="formError" class="modal-error">{{ formError }}</div>

        <div class="modal-actions">
          <button type="submit" :disabled="isSaving">
            {{ isSaving ? '儲存中...' : '儲存' }}
          </button>
          <button type="button" @click="$emit('close')" class="cancel-btn">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import AdminBookService from '@/services/adminBookService';

const props = defineProps({
  visible: Boolean,
  mode: String,
  initialBook: Object,
  // ❗ 移除 categories 屬性
});

const emit = defineEmits(['close', 'saved']);

const isSaving = ref(false);
const formError = ref(null);

const modalTitle = computed(() => (props.mode === 'create' ? '新增書籍' : '編輯書籍'));

// 🎯 定義語言選項 (必須與後端 Language.java Enum 名稱匹配)
const LANGUAGE_OPTIONS = [
  { value: 'ENGLISH', label: '英語' },
  { value: 'JAPANESE', label: '日語' },
  { value: 'KOREAN', label: '韓語' },
  { value: 'FRENCH', label: '法語' },
  { value: 'SPANISH', label: '西班牙語' },
  { value: 'PORTUGUESE', label: '葡萄牙語' },
  { value: 'GERMAN', label: '德語' },
  { value: 'ITALIAN', label: '義大利語' },
  { value: 'RUSSIAN', label: '俄羅斯語' },
  { value: 'TURKISH', label: '土耳其語' },
  { value: 'ARABIC', label: '阿拉伯語' },
  { value: 'THAI', label: '泰語' },
  { value: 'VIETNAMESE', label: '越南語' },
  { value: 'INDONESIAN', label: '印尼語' },
];

const defaultData = {
  title: '',
  author: '',
  isbn: '',
  price: 0.00,
  stock: 0,
  isAvailable: true,
  description: '',
  // 🎯 使用 lang 欄位代替 categoryId
  lang: null,
  publishedDate: new Date().toISOString().substring(0, 10),
  imageUrl: '',
};

const form = ref({ ...defaultData });

watch(() => props.initialBook, (newBook) => {
  if (props.visible) {
    if (props.mode === 'update' && newBook.bookId) {
      // 編輯模式
      form.value = {
        ...defaultData,
        ...newBook,
        // 確保 lang 欄位存在，並且日期格式正確
        lang: newBook.lang || null,
        publishedDate: newBook.publishedDate ? new Date(newBook.publishedDate).toISOString().substring(0, 10) : defaultData.publishedDate,
        isAvailable: newBook.isOnsale, // 使用 isOnsale 匹配
      };
    } else {
      // 新增模式
      form.value = { ...defaultData };
    }
    formError.value = null;
  }
}, { immediate: true, deep: true });

const saveBook = async () => {
  formError.value = null;
  isSaving.value = true;

  if (form.value.price <= 0 || form.value.stock < 0) {
    formError.value = '價格必須大於 0，庫存不能為負數。';
    isSaving.value = false;
    return;
  }

  try {
    // 🎯 構建 payload：只包含 DTO 期望的欄位
    const payload = {
      title: form.value.title,
      author: form.value.author,
      isbn: form.value.isbn,
      price: Number(form.value.price),
      stock: Number(form.value.stock),
      description: form.value.description,

      // 🎯 關鍵：發送大寫的語言字串
      lang: form.value.lang,

      publishedDate: form.value.publishedDate,
      isOnsale: form.value.isAvailable,
      imageUrl: form.value.imageUrl,
    };

    if (props.mode === 'create') {
      await AdminBookService.createBook(payload);
    } else {
      await AdminBookService.updateBook(form.value.bookId, payload);
    }

    alert(`${modalTitle.value} 成功！`);
    emit('saved');
    emit('close');

  } catch (err) {
    const serverMessage = err.response?.data?.message || `儲存失敗，請檢查輸入。`;
    formError.value = serverMessage;
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
/* 簡單樣式，請根據您原有的樣式調整 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input:not([type="checkbox"]), .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.split-group {
  display: flex;
  gap: 15px;
}
.split-group input, .split-group select {
  flex: 1;
}
.modal-error {
  color: red;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid red;
  background: #ffe6e6;
  border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.cancel-btn {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button[type="submit"]:not(:disabled) {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>