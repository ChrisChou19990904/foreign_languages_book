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
        expect(auth.isLoggedIn).toBe(false);
        expect(auth.user).toBe(null);
    });

    it('🧪 執行 login 動作後應正確更新狀態', () => {
        const auth = useAuthStore();
        const mockUser = { id: 1, username: 'testuser' };
        const mockToken = 'jwt-12345';

        // 模擬執行登入動作
        auth.setAuth(mockUser, mockToken);

        expect(auth.isLoggedIn).toBe(true);
        expect(auth.user.username).toBe('testuser');
        expect(auth.token).toBe('jwt-12345');
    });

    it('🧪 執行 logout 後應清空所有狀態', () => {
        const auth = useAuthStore();
        auth.logout();

        expect(auth.user).toBe(null);
        expect(auth.token).toBe(null);
        expect(auth.isLoggedIn).toBe(false);
    });
});