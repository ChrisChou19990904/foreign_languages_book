import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../stores/cart';

describe('Cart Store 購物車邏輯測試', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('🧪 加入重複書籍時，應增加數量而非新增項目', () => {
        const cart = useCartStore();
        const book = { bookId: 1, title: '日語入門', price: 300 };

        cart.addToCart(book);
        cart.addToCart(book); // 再次加入同一本

        expect(cart.items.length).toBe(1);
        expect(cart.items[0].quantity).toBe(2);
    });

    it('🧪 總價計算應符合預期', () => {
        const cart = useCartStore();
        cart.items = [
            { bookId: 1, price: 100, quantity: 2 },
            { bookId: 2, price: 50, quantity: 1 }
        ];

        // 假設你有一個 getter 叫 totalAmount
        expect(cart.totalAmount).toBe(250);
    });
});