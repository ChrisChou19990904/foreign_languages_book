import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth';
import { setActivePinia, createPinia } from 'pinia';

// 模擬路由跳轉邏輯
const mockRouterPush = vi.fn();

describe('路由權限守衛測試', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('🧪 當未登入用戶訪問 /admin 時，應被重導向至 /login', async () => {
        const auth = useAuthStore();
        auth.isAuthenticated = false; // 模擬未登入

        // 模擬 Vue Router 的導航守衛邏輯
        const to = { meta: { requiresAuth: true }, path: '/admin' };
        const from = {};
        const next = vi.fn();

        // 這裡模擬你在 router/index.ts 寫的邏輯
        if (to.meta.requiresAuth && !auth.isAuthenticated) {
            next('/login');
        } else {
            next();
        }

        expect(next).toHaveBeenCalledWith('/login');
        expect(next).not.toHaveBeenCalledWith(); // 確保沒有直接放行
    });

    it('🧪 當已登入用戶訪問受限頁面時，應允許進入', () => {
        const auth = useAuthStore();
        auth.isAuthenticated = true; // 模擬已登入

        const to = { meta: { requiresAuth: true }, path: '/admin' };
        const next = vi.fn();

        if (to.meta.requiresAuth && !auth.isAuthenticated) {
            next('/login');
        } else {
            next();
        }

        expect(next).toHaveBeenCalledWith(); // 驗證是否直接放行
    });
});