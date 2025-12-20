import { defineStore } from 'pinia';
// 引入我們之前確認已存在的 CartService 服務層
import CartService from '@/services/cartService';
import { useAuthStore } from './auth'; // 引入 Auth Store 檢查登入狀態

/**
 * 購物車狀態 Store (Pinia)
 * 管理購物車明細列表、總數量和總價格。
 */
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
        async updateCartItem(bookId, quantity) {
            // 處理刪除情況：如果數量 <= 0，嘗試刪除
            if (quantity <= 0) {
                const existingItem = this.items.find(item => item.book.bookId === bookId);
                if (existingItem) {
                    await this.deleteCartItem(existingItem.cartItemId);
                }
                return;
            }

            try {
                const payload = { bookId, quantity };
                const response = await CartService.addOrUpdateCartItem(payload);
                const updatedItem = response.data;

                // 更新 Pinia Store 中的 items (即時響應)
                const index = this.items.findIndex(item => item.cartItemId === updatedItem.cartItemId);

                if (index !== -1) {
                    // 已存在，更新明細
                    this.items[index] = updatedItem;
                } else {
                    // 新增明細
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