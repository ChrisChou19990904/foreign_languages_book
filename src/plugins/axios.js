import axios from 'axios';

// 設置 API 基礎路徑
// 部署後可能需要修改為您的 Spring Boot 服務器地址
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// 獲取儲存的 JWT Token
const token = localStorage.getItem('jwtToken');

// 請求攔截器：在每次請求發送前，檢查本地是否有 token，並將其加入 Header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // 依據 JWT 流程，將 token 加入 Authorization Header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 回應攔截器：處理錯誤或 token 過期
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const originalRequest = error.config;

        // 檢查是否為 401 Unauthorized，表示 JWT 可能失效或過期
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // 這裡可以實現自動登出或刷新 token 邏輯
            console.error('JWT 無效或過期，嘗試登出...');

            // 簡單處理：清除本地 token 並導向登入頁
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            // 假設您在 Vue 實例中可以訪問 router
            // window.location.href = '/login';
            // 實際專案中，應透過 Pinia action 處理登出和導航

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;