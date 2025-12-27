import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // 引入 Pinia Store
import CheckoutView from '@/views/CheckoutView.vue'; // 🎯 引入結帳組件
const routes = [
    // 公開頁面
    { path: '/', name: 'Home', component: () => import('@/views/BooksView.vue') },
    { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue') },
    // 🎯 關鍵修正：添加 checkout 路由
    {
        path: '/checkout',
        name: 'Checkout',
        component: CheckoutView, // 使用上面引入的 CheckoutView
        // 💡 建議：可能需要要求用戶登入才能訪問結帳頁面
        meta: { requiresAuth: true }
    },
    // 會員專屬頁面 (需登入)
    { path: '/profile', name: 'Profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/cart', name: 'Cart', component: () => import('@/views/CartView.vue'), meta: { requiresAuth: true } },
    { path: '/orders', name: 'Orders', component: () => import('@/views/OrdersView.vue'), meta: { requiresAuth: true } },
    {
        path: '/orders/:id', // 必須包含動態參數 :id
        name: 'OrderDetail', // 給予一個清晰的名稱
        // 假設您的組件位於 @/views/OrderDetailView.vue
        component: () => import('@/views/OrderDetailView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile/edit',
        name: 'ProfileEdit', // 這是 ProfileView 中 router-link 使用的名稱
        component: () => import('@/views/ProfileEditView.vue'), // 假設您將創建這個檔案
        meta: { requiresAuth: true } // 確保只有登入用戶才能訪問
    },
    {
        path: '/payment/:orderId',
        name: 'Payment',
        component: () => import('@/views/PaymentView.vue'), // 剛才我們討論的那個模擬頁面
        meta: { requiresAuth: true }
    },
    // 後台管理頁面 (需 ADMIN 權限)
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/books',
        name: 'AdminBooks',
        component: () => import('@/views/admin/AdminBooksView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/orders',
        name: 'AdminOrders', // 使用一個清晰的名稱
        component: () => import('@/views/admin/AdminOrdersView.vue'), // 假設檔案名
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 2. **後台單筆訂單詳情 (詳情頁)**
    {
        path: '/admin/orders/:id', // 🎯 修正路徑：帶有動態參數
        name: 'AdminOrderDetail', // 🎯 修正名稱：使用詳情名稱
        component: () => import('@/views/admin/AdminOrderDetailView.vue'), // 🎯 修正組件：指向詳情組件
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/users',
        name: 'AdminUsers',
        // 🌟 這裡的路徑要指向 admin 子資料夾
        component: () => import('@/views/admin/AdminUsersView.vue'),
        meta: { requiresAdmin: true } // 之後可以用這個做權限攔截
    },
    // ... 其他後台路由
    {
        path: '/book/:id',
        name: 'BookDetail',
        component: () => import('@/views/BookDetailView.vue')
    },
    {
        path: '/profile/change-password',
        name: 'ChangePassword',
        component: () => import('@/views/ChangePasswordView.vue'),
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// 全局前置守衛 (Navigation Guard)
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // 1. 檢查是否需要登入
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // 未登入，導向登入頁
        return next({ name: 'Login' });
    }

    // 2. 檢查是否需要管理員權限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        // 登入但不是管理員，導向首頁或 403 頁
        alert('您沒有權限進入此頁面。');
        return next({ name: 'Home' });
    }

    // 3. 如果是已登入狀態，且嘗試訪問登入/註冊頁，則導向首頁
    if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
        return next({ name: 'Home' });
    }

    next(); // 允許通過
});
export default router;