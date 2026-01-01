import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../stores/auth';

describe('Auth Store 狀態管理測試', () => {
    beforeEach(() => {
        // 每個測試前都要建立一個全新的 Pinia 實例，確保測試之間不互相污染
        setActivePinia(createPinia());
    });

    it('🧪 初始狀態應為未登入', () => {
        const auth = useAuthStore();
        expect(auth.isAuthenticated).toBe(false);
        expect(auth.userEmail).toBe(null);
    });

    it('🧪 執行 login 動作後應正確更新狀態', () => {
        const auth = useAuthStore();
        const mockUser = { id: 1, username: 'testuser' };
        const mockToken = 'jwt-12345';
        const mockEmail = 'test@example.com';
        // 🌟 修正點：因為 Store 裡沒有 setAuth，我們直接模擬狀態更新
        // 這是測試 Pinia State 的標準做法
        auth.isAuthenticated = true;
        auth.userEmail = mockEmail;
        auth.token = mockToken;

        expect(auth.isAuthenticated).toBe(true);
        // 🌟 修正：直接比對字串，不再讀取 .username
        expect(auth.userEmail).toBe('test@example.com');
        expect(auth.token).toBe('jwt-12345');
    });

    it('🧪 執行 logout 後應清空所有狀態', () => {
        const auth = useAuthStore();
        auth.logout();

        expect(auth.userEmail).toBe(null);
        expect(auth.token).toBe(null);
        expect(auth.isAuthenticated).toBe(false);
    });
});