import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/users';

export default {
    /**
     * 獲取所有會員列表
     */
    async getAllUsers() {
        const token = localStorage.getItem('token');
        return await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    /**
     * 切換會員啟用/停權狀態
     */
    async toggleUserActive(userId) {
        const token = localStorage.getItem('token');
        return await axios.patch(`${API_URL}/${userId}/toggle-active`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    /**
     * 更新會員角色 (USER/ADMIN)
     */
    async updateUserRole(userId, roleName) {
        const token = localStorage.getItem('token');
        return await axios.patch(`${API_URL}/${userId}/role`,
            { role: roleName },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }
};