import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // 假設您使用 Pinia

const apiClient = axios.create({
    // ✅ 優先讀取 Vercel 的環境變數，沒有則連向 Render
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://foreign-languages-book-back-end-8.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 請求攔截器：每次請求都加入 JWT
apiClient.interceptors.request.use(config => {
    const authStore = useAuthStore();
    const token = authStore.getToken; // 確保這裡能拿到 Token

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // 🎯 確保格式正確
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 響應攔截器：處理 Token 過期或 401 錯誤，自動登出

export default apiClient;