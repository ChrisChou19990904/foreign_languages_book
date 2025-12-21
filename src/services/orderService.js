import apiClient from '@/plugins/axios'; // 引入已配置 JWT 的 Axios 實例
import axios from 'axios';

/**
 * 訂單相關的 API 服務模組
 */
const OrderService = {

    // ===================================================================
    // 會員操作 (需登入: /api/user/orders)
    // ===================================================================

    /**
     * 執行結帳流程，將購物車內容轉換為訂單並扣除庫存。
     * POST /api/user/orders/checkout
     * @param {Object} payload
     * @param {string} payload.paymentMethod - 付款方式 (credit_card, cod)
     * @param {string} payload.recipientName - 收件人姓名
     * @param {string} payload.shippingAddress - 收件地址
     * @returns {Promise<Object>} 創建成功的 Order 實體
     */
    checkout(payload) {
        if (!payload.paymentMethod || !payload.recipientName || !payload.shippingAddress) {
            return Promise.reject(new Error("結帳請求缺少必要的收件資訊。"));
        }
        return apiClient.post(`/user/orders/checkout`, payload);
    },

    /**
     * 獲取當前會員的所有歷史訂單
     * GET /api/user/orders
     * @returns {Promise<Array>} Order 實體列表 (依時間倒序)
     */
    getMyOrders() {
        return apiClient.get(`/user/orders`);
    },
// 🌟 新增這個方法
    // 🌟 修正後的 completePayment
    completePayment(orderId) {
        // 1. 使用 apiClient，它會自動補上 https://...onrender.com/api
        // 2. 因為 apiClient 已經有 baseURL: '.../api'，所以這裡只需寫剩下的路徑
        // 3. 攔截器會自動幫你帶上 Authorization Token，不用手動寫 headers
        return apiClient.patch(`/user/orders/${orderId}/complete-payment`);
    },
    /**
     * 獲取單筆訂單詳情 (會員只能查看自己的訂單)
     * GET /api/user/orders/{orderId}
     * @param {number} orderId - 訂單 ID
     * @returns {Promise<Object>} Order 實體
     */
    getOrderDetail(orderId) {
        if (!orderId) {
            return Promise.reject(new Error("必須提供訂單 ID。"));
        }
        return apiClient.get(`/user/orders/${orderId}`);
    },

    // ===================================================================
    // 管理員操作 (需 ADMIN 權限: /api/admin/orders)
    // ===================================================================

    /**
     * 管理員獲取所有訂單列表
     * GET /api/admin/orders
     * @returns {Promise<Array>} 所有 Order 實體列表
     */
    getAllOrdersForAdmin() {
        return apiClient.get(`/admin/orders`);
    },

    /**
     * 管理員更新訂單狀態
     * PATCH /api/admin/orders/{orderId}/status
     * @param {number} orderId - 訂單 ID
     * @param {string} newStatus - 新的訂單狀態 (e.g., 'paid', 'shipped', 'done')
     * @returns {Promise<Object>} 更新後的 Order 實體
     */
    updateOrderStatus(orderId, newStatus) {
        if (!orderId || !newStatus) {
            return Promise.reject(new Error("必須提供訂單 ID 和新的狀態。"));
        }
        return apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
    }
};

export default OrderService;