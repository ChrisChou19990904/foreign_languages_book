import apiClient from '@/plugins/axios';

/**
 * 認證相關的 API 服務模組
 * 負責處理與後端 /api/auth 端點的請求
 */
const AuthService = {

    /**
     * 處理用戶登入
     * POST /api/auth/authenticate
     * @param {Object} credentials - 包含 email 和 password
     * @returns {Promise<Object>} 包含 token 和 role 的回應
     */
    authenticate(credentials) {
        if (!credentials.email || !credentials.password) {
            return Promise.reject(new Error("登入請求缺少 email 或 password。"));
        }
        return apiClient.post('/auth/authenticate', credentials);
    },

    /**
     * 處理用戶註冊
     * POST /api/auth/register
     * @param {Object} userData - 包含 firstName, lastName, email, password 等註冊數據
     * @returns {Promise<Object>} 包含 token 和 role 的回應
     */
    register(userData) {
        if (!userData.email || !userData.password) {
            return Promise.reject(new Error("註冊請求缺少 email 或 password。"));
        }
        return apiClient.post('/auth/register', userData);
    }

    // 可以在此處添加忘記密碼等其他服務
};

export default AuthService;