import axios from 'axios';

// 1. 定義基礎網址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://foreign-languages-book-back-end-8.onrender.com/api';

// 2. 定義 Admin 專用的網址
const ADMIN_API_URL = `${API_BASE_URL}/admin/users`;

export default {
    /**
     * 獲取所有會員列表
     */
    async getAllUsers() {
        const token = localStorage.getItem('token');
        return await axios.get(ADMIN_API_URL, { // ✅ 使用 ADMIN_API_URL
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    /**
     * 切換會員啟用/停權狀態
     */
    async toggleUserActive(userId) {
        const token = localStorage.getItem('token');
        // 🚨 修正：原稿寫 API_URL，應改為 ADMIN_API_URL
        return await axios.patch(`${ADMIN_API_URL}/${userId}/toggle-active`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    /**
     * 更新會員角色 (USER/ADMIN)
     */
    async updateUserRole(userId, roleName) {
        const token = localStorage.getItem('token');
        // 🚨 修正：原稿寫 API_URL，應改為 ADMIN_API_URL
        return await axios.patch(`${ADMIN_API_URL}/${userId}/role`,
            { role: roleName },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }
};