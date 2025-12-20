import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // 假設您使用 Pinia

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // 確保這個 baseURL 是正確的
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