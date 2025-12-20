import { defineStore } from 'pinia';
import router from '@/router'; // 假設路由定義在 @/router
import AuthService from '@/services/authService';
// 調整為使用後端定義的 API 路徑
const AUTH_API_ENDPOINT = '/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        role: localStorage.getItem('role') || null,
        // 🚨 修正 1：新增 userEmail 狀態，並從 LocalStorage 讀取
        userEmail: localStorage.getItem('userEmail') || null,
        isAuthenticated: !!localStorage.getItem('token'),
    }),

    getters: {
        isAdmin: (state) => state.role === 'ADMIN',
        isMember: (state) => state.role === 'USER',
        // 🚨 修正 2：新增一個 Getter，方便在 ProfileView 中使用
        getUserEmail: (state) => state.userEmail,
    },

    actions: {
        /**
         * 處理登入邏輯
         * POST /api/auth/authenticate
         */
        async login(email, password) { // 👈 登入時我們有 Email 參數
            try {
                const response = await AuthService.authenticate({ email, password });
                const { token, role } = response.data;

                // 儲存狀態
                this.token = token;
                this.role = role;
                this.isAuthenticated = true;

                // 🚨 修正 3：將 Email 儲存到狀態和本地儲存
                this.userEmail = email;

                // 儲存到本地儲存
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('userEmail', email); // 👈 關鍵修正

                // 依據角色導向不同頁面
                if (role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }

                return true;
            } catch (error) {
                console.error('登入失敗:', error.response?.data || error.message);
                this.logout(false);
                throw error;
            }
        },

        /**
         * 處理註冊邏輯
         * POST /api/auth/register
         */
        async register(userData) { // 👈 註冊時 userData 包含 Email
            try {
                const response = await AuthService.register(userData);
                const { token, role } = response.data;

                // 儲存狀態
                this.token = token;
                this.role = role;
                this.isAuthenticated = true;

                // 🚨 修正 4：將註冊時的 Email 儲存到狀態和本地儲存
                this.userEmail = userData.email;

                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('userEmail', userData.email); // 👈 關鍵修正

                // 註冊成功後導向首頁
                router.push('/');

                return true;
            } catch (error) {
                console.error('註冊失敗:', error.response?.data || error.message);
                this.logout(false);
                throw error;
            }
        },


        /**
         * 登出邏輯
         */
        logout(shouldRedirect = true) {
            // 清除狀態
            this.token = null;
            this.role = null;
            this.userEmail = null; // 🚨 修正 5：清除 Email 狀態
            this.isAuthenticated = false;

            // 清除本地儲存
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userEmail'); // 🚨 修正 6：清除 Email 本地儲存

            if (shouldRedirect) {
                router.push('/login');
            }
        },

        // 檢查本地狀態並確保一致性
        initialize() {
            if (this.token && this.role) {
                this.isAuthenticated = true;
            } else {
                this.logout(false);
            }
        }
    },
});