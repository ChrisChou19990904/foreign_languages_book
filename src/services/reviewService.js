import axios from 'axios';

// 建立 Axios 實例或使用現有的配置
const API_URL = 'http://localhost:8080/api';

export default {
    // 獲取評論 (公開)
    getReviews(bookId) {
        return axios.get(`${API_URL}/public/books/${bookId}/reviews`);
    },

    // 新增評論 (需 JWT Token)
    addReview(reviewData) {
        const token = localStorage.getItem('token'); // 假設你的 token 存放在這裡
        return axios.post(`${API_URL}/user/reviews`, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};