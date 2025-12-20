import apiClient from '@/plugins/axios';
import axios from 'axios';
/**
 * 書籍相關的 API 服務模組
 */
// 🌟 重點 1：API_URL 必須定義在 export default 之外，且在最上方
const API_URL = 'http://localhost:8080/api';
const BookService = {

    /**
     * 依語言分類獲取書籍列表 (例如: english, japanese)
     * @param {string} lang - 語言標籤
     * @returns {Promise<Array>} 書籍列表
     */
    getBooksByLang(lang) {
        // 呼叫 Spring Boot 的 GET /api/public/books/lang/{lang}
        return apiClient.get(`/public/books/lang/${lang}`);
    },

    /**
     * 依關鍵字搜索書籍 (搜索 Title/Author/ISBN)
     * @param {string} keyword - 搜索關鍵字
     * @returns {Promise<Array>} 書籍列表
     */
    searchBooks(keyword) {
        // 呼叫 Spring Boot 的 GET /api/public/books/search?keyword={keyword}
        return apiClient.get(`/public/books/search`, { params: { keyword } });
    },

    /**
     * 獲取單本書籍詳情
     * @param {number} bookId - 書籍 ID
     * @returns {Promise<Object>} 單本書籍資料
     */
    getBookDetail(bookId) {
        // 呼叫 Spring Boot 的 GET /api/public/books/{id}
        return apiClient.get(`/public/books/${bookId}`);
    },
    // 🌟 新增這個方法：取得評論
    getReviewsByBookId(bookId) {
        return axios.get(`${API_URL}/public/books/${bookId}/reviews`);
    },

    // 🌟 新增這個方法：發表評論
    addReview(payload) {
        // 取得儲存在 localStorage 的 JWT Token
        const token = localStorage.getItem('token');

        return axios.post(`${API_URL}/user/reviews`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`, // 記得帶上 Token，後端才知道是誰留言
                'Content-Type': 'application/json'
            }
        });
    },
};

export default BookService;