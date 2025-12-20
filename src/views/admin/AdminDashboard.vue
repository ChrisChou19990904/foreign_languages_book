<template>
  <div class="admin-dashboard">
    <h1>🔑 管理員儀表板 (Admin Dashboard)</h1>
    <p>這是後台管理的首頁。您可以看到系統概覽、待處理訂單數量等資訊。</p>

    <nav class="admin-nav">
      <router-link :to="{name: 'AdminUsers' }" class="nav-item">會員管理</router-link>
      <router-link :to="{ name: 'AdminBooks' }" class="nav-item">書籍管理</router-link>
      <router-link :to="{ name: 'AdminOrders' }" class="nav-item">訂單管理</router-link>
    </nav>
  </div>
</template>

<script setup>
// 這裡可以載入儀表板的統計數據
</script>

<style scoped>
/* 簡單樣式，方便區分前後台 */
.admin-dashboard {
  padding: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
h1 {
  color: #007bff;
}
</style>