import { defineStore } from 'pinia';
// 引入我們之前確認已存在的 CartService 服務層
import CartService from '@/services/cartService';
import { useAuthStore } from './auth'; // 引入 Auth Store 檢查登入狀態

/**
 * 購物車狀態 Store (Pinia)
 * 管理購物車明細列表、總數量和總價格。
 */
// stores/cart.js
export const useCartStore = defineStore('cart', {
    // 狀態 (State)
    state: () => ({
        items: [], // 購物車明細列表 (CartItem 實體陣列)
        isLoading: false,
    }),

    // Getters
    getters: {
        // 獲取購物車中所有商品的總數量
        totalQuantity: (state) => {
            return state.items.reduce((total, item) => total + item.quantity, 0);
        },

        // 計算購物車中所有商品的總價格
        totalPrice: (state) => {
            // 注意：這裡假設 CartItem.book 是存在的，且 book.price 是數字類型
            return state.items.reduce((total, item) => {
                const price = item.book?.price || 0;
                // 必須將 price 轉換為數字，以防 Axios 傳輸時變成字串
                return total + (Number(price) * item.quantity);
            }, 0);
        },
    },

    // Actions
    actions: {
        /**
         * 從後端獲取購物車明細
         */
        async fetchCartItems() {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) {
                this.items = []; // 未登入則清空購物車狀態
                return;
            }

            this.isLoading = true;
            try {
                // 呼叫 CartService.js 中的 API 服務
                const response = await CartService.getCartItems();
                this.items = response.data; // 更新購物車明細
            } catch (error) {
                console.error('獲取購物車失敗:', error);
                // 如果是 401 錯誤，Axios 攔截器會處理登出
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 新增或更新購物車中的商品數量
         * @param {number} bookId - 書籍 ID
         * @param {number} quantity - 期望更新後的數量 (總量)
         */
        /**
         * 🎯 修改後的邏輯：新增或更新購物車
         */
        async updateCartItem(bookId, quantity) {
            // 1. 檢查商品是否已在購物車中 (根據 bookId)
            const existingItem = this.items.find(item => item.book.bookId === bookId);

            // 2. 🎯 實踐親戚的建議：
            // 如果商品已存在，且這次呼叫是來自「加入購物車」按鈕（通常 quantity 會傳 1 或目前的增量）
            // 我們可以判斷：如果商品已存在，就彈出提醒並中止操作。
            if (existingItem) {
                alert(`🛒 購物車已有此商品！\n欲修改數量請至購物車頁面進行調整。`);
                return; // 攔截操作，不發送 API 請求
            }

            if (quantity <= 0) {
                if (existingItem) {
                    await this.deleteCartItem(existingItem.cartItemId);
                }
                return;
            }

            try {
                const payload = { bookId, quantity };
                const response = await CartService.addOrUpdateCartItem(payload);
                const updatedItem = response.data;

                const index = this.items.findIndex(item => item.cartItemId === updatedItem.cartItemId);

                if (index !== -1) {
                    this.items[index] = updatedItem;
                } else {
                    this.items.push(updatedItem);
                }
            } catch (error) {
                console.error('更新購物車失敗:', error.response?.data?.message || error.message);
                throw error;
            }
        },

        /**
         * 刪除購物車中的單個明細
         * @param {number} cartItemId - 購物車明細 ID
         */
        async deleteCartItem(cartItemId) {
            try {
                await CartService.deleteCartItem(cartItemId);

                // 從 Pinia Store 中移除該明細
                this.items = this.items.filter(item => item.cartItemId !== cartItemId);

            } catch (error) {
                console.error('刪除購物車明細失敗:', error.response?.data?.message || error.message);
                throw error;
            }
        },

        /**
         * 清空購物車狀態 (結帳成功後或登出時由其他 Store/View 呼叫)
         */
        clearCart() {
            this.items = [];
        },
    },
});