import apiClient from '@/plugins/axios'; // 引入已配置 JWT 的 Axios 實例

/**
 * 管理員訂單相關的 API 服務模組
 * 所有操作都需要 ADMIN 權限 (路徑是 /api/admin/orders)
 */
const AdminOrderService = {

    /**
     * 獲取所有用戶的訂單
     * GET /api/admin/orders
     * @returns {Promise<Array>} 所有訂單列表
     */
    // 🎯 方法 A：獲取所有訂單（列表頁用）
    getAllOrders() {
        return apiClient.get(`/admin/orders`);
    },
    getOrderDetail(orderId) {
        if (!orderId) return Promise.reject(new Error("未提供訂單 ID"));
        // 🌟 這裡的路徑必須加上 orderId，才能觸發後端回傳 OrderDetailDTO
        return apiClient.get(`/admin/orders/${orderId}`);
    },

    /**
     * 更新單筆訂單的狀態
     * PUT /api/admin/orders/{orderId}/status
     * @param {number} orderId
     * @param {string} newStatus - 新的狀態 (e.g., 'paid', 'shipped', 'done', 'cancelled')
     * @returns {Promise<Object>} 更新後的訂單實體
     */
    updateOrderStatus(orderId, newStatus) {
        if (!orderId || !newStatus) {
            return Promise.reject(new Error("必須提供訂單 ID 和新狀態。"));
        }
        // 假設 API 接收一個簡單的 JSON body: { "status": "shipped" }
        return apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus.toUpperCase() });
    }
};

export default AdminOrderService;