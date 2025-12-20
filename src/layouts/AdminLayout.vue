<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">管理後台</div>
      <nav class="nav-menu">
        <router-link to="/admin/dashboard" class="nav-item" active-class="active">
          <i class="icon-dashboard">📊</i> 儀表板
        </router-link>
        <router-link to="/admin/books" class="nav-item" active-class="active">
          <i class="icon-books">📚</i> 書籍管理
        </router-link>
        <router-link to="/admin/orders" class="nav-item" active-class="active">
          <i class="icon-orders">📦</i> 訂單管理
        </router-link>
        <a @click="handleLogout" class="nav-item logout-btn">
          <i class="icon-logout">🚪</i> 登出
        </a>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <h1>後台管理系統</h1>
      </header>
      <div class="content-view">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
// 假設您有一個 Auth 服務
// import AuthService from '@/services/authService';

const router = useRouter();

const handleLogout = () => {
  // 執行登出邏輯 (例如：清除本地 JWT/Token)
  // AuthService.logout();

  alert('您已登出管理後台');
  router.push('/login');
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f4f7f9;
}

/* 側邊欄 */
.sidebar {
  width: 250px;
  background-color: #2c3e50; /* 深色背景 */
  color: white;
  padding: 20px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.8em;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #42b983; /* Vue 綠色 */
}

.nav-menu {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.3s;
  cursor: pointer;
}

.nav-item:hover, .nav-item.active {
  background-color: #34495e; /* 懸停/啟用時顏色 */
  border-left: 5px solid #42b983;
  padding-left: 15px; /* 補償左邊距 */
}

.nav-item i {
  margin-right: 10px;
  font-size: 1.2em;
}

.logout-btn {
  margin-top: 30px;
  color: #e74c3c;
}
.logout-btn:hover {
  background-color: #34495e;
  color: #c0392b;
}

/* 主要內容區域 */
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.top-header {
  padding: 20px 30px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.top-header h1 {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}

.content-view {
  flex-grow: 1;
  padding: 20px;
}
</style>