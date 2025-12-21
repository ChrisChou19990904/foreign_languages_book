import axios from 'axios';

// ✅ 使用環境變數，確保 Vercel 能連到 Render
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://foreign-languages-book-back-end-8.onrender.com/api';

export default {
    // 獲取評論 (公開)
    getReviews(bookId) {
        return axios.get(`${API_URL}/public/books/${bookId}/reviews`);
    },

    // 新增評論 (需 JWT Token)
    addReview(reviewData) {
        const token = localStorage.getItem('token');
        return axios.post(`${API_URL}/user/reviews`, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};