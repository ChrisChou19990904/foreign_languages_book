import apiClient from '@/plugins/axios';
import axios from 'axios';

// 🌟 修正：這裡絕不能寫 localhost，否則下面的評論功能在手機上會失效
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://foreign-languages-book-back-end-8.onrender.com/api';

const BookService = {
    // 這裡使用 apiClient (它已經在 plugins/axios.js 設定好 baseURL 了)
    getBooksByLang(lang) {
        return apiClient.get(`/public/books/lang/${lang}`);
    },

    searchBooks(keyword) {
        return apiClient.get(`/public/books/search`, { params: { keyword } });
    },

    getBookDetail(bookId) {
        return apiClient.get(`/public/books/${bookId}`);
    },

    // 🌟 修正：改用環境變數的 API_URL
    getReviewsByBookId(bookId) {
        return axios.get(`${API_URL}/public/books/${bookId}/reviews`);
    },

    // 🌟 修正：改用環境變數的 API_URL
    addReview(payload) {
        const token = localStorage.getItem('token');
        return axios.post(`${API_URL}/user/reviews`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    },
};

export default BookService;