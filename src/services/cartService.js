import apiClient from '@/plugins/axios'; // 引入已配置 JWT 的 Axios 實例

/**
 * 購物車相關的 API 服務模組
 * 所有操作都需要 JWT 驗證 (因為路徑是 /api/user/cart)
 */
const CartService = {

    /**
     * 獲取當前登入會員的購物車明細
     * GET /api/user/cart
     * @returns {Promise<Array>} 購物車明細列表 (CartItem 實體)
     */
    getCartItems() {
        return apiClient.get(`/user/cart`);
    },

    /**
     * 新增商品到購物車，或更新已有商品的數量
     * POST /api/user/cart
     * @param {Object} payload
     * @param {number} payload.bookId - 書籍 ID
     * @param {number} payload.quantity - 購買數量 (新數量)
     * @returns {Promise<Object>} 更新後的 CartItem 實體
     */
    addOrUpdateCartItem(payload) {
        // 檢查 payload 結構是否正確
        if (!payload.bookId || !payload.quantity || payload.quantity < 1) {
            return Promise.reject(new Error("參數錯誤：必須提供有效的 bookId 和 quantity (≥ 1)。"));
        }
        return apiClient.post(`/user/cart`, payload);
    },

    /**
     * 刪除購物車中的一個商品明細
     * DELETE /api/user/cart/{cartItemId}
     * @param {number} cartItemId - 購物車明細 ID (不是書籍 ID)
     * @returns {Promise<string>} 成功訊息
     */
    deleteCartItem(cartItemId) {
        if (!cartItemId) {
            return Promise.reject(new Error("參數錯誤：必須提供 cartItemId。"));
        }
        return apiClient.delete(`/user/cart/${cartItemId}`);
    },

    /**
     * 結帳功能 (雖然結帳是 OrderService 的核心，但通常會從 CartService 呼叫)
     * 為了避免循環依賴，這裡假設 OrderService 會處理結帳，或者直接在 CartView 裡呼叫 OrderService
     * @param {Object} checkoutRequest - 結帳所需的資訊 (付款方式、地址等)
     */
    // checkout(checkoutRequest) {
    //   // 可以在這裡定義，或者在 OrderService.js 中定義並在 CartView 引用
    //   // return apiClient.post(`/user/orders/checkout`, checkoutRequest);
    // }
};

export default CartService;