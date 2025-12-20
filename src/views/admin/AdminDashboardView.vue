<template>
  <div class="admin-dashboard">
    <h2>📊 歡迎，管理員</h2>
    <p class="greeting">這是您的商城概覽中心。</p>

    <div class="stats-grid">
      <div class="stat-card total-orders">
        <h3>今日訂單數</h3>
        <p class="value">{{ stats.todayOrders }}</p>
        <small>較昨日 {{ stats.orderChange }}%</small>
      </div>

      <div class="stat-card total-sales">
        <h3>本月銷售額</h3>
        <p class="value">NT$ {{ formatNumber(stats.monthlySales) }}</p>
        <small>目標達成度 {{ stats.salesGoal }}%</small>
      </div>

      <div class="stat-card low-stock">
        <h3>低庫存商品</h3>
        <p class="value">{{ stats.lowStockCount }}</p>
        <small>需立即補貨</small>
      </div>

      <div class="stat-card new-users">
        <h3>新註冊會員</h3>
        <p class="value">{{ stats.newUsers }}</p>
        <small>本週新增</small>
      </div>
    </div>

    <div class="quick-links">
      <h3>快速操作</h3>
      <router-link to="/admin/books" class="quick-link books-link">
        新增/編輯書籍
      </router-link>
      <router-link to="/admin/orders" class="quick-link orders-link">
        處理待出貨訂單
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 模擬後台數據
const stats = ref({
  todayOrders: 15,
  orderChange: '+12',
  monthlySales: 154800,
  salesGoal: 85,
  lowStockCount: 7,
  newUsers: 45,
});

const fetchDashboardStats = () => {
  // 這裡應該呼叫 AdminService.getDashboardStats() 來獲取實時數據
  // 為了範例，我們使用靜態數據
  console.log('Fetching dashboard statistics...');
};

const formatNumber = (num) => {
  return num.toLocaleString('zh-TW'); // 格式化數字為千分位
};

onMounted(fetchDashboardStats);
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}
.admin-dashboard h2 {
  color: #2c3e50;
  margin-bottom: 5px;
}
.greeting {
  color: #6c757d;
  margin-bottom: 30px;
  font-size: 1.1em;
}

/* 數據卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 5px solid;
}

.stat-card h3 {
  margin-top: 0;
  font-size: 1em;
  color: #6c757d;
}
.stat-card .value {
  font-size: 2.2em;
  font-weight: bold;
  margin: 5px 0 10px;
}
.stat-card small {
  display: block;
  color: #999;
  font-size: 0.9em;
}

/* 顏色區分 */
.total-orders { border-left-color: #3498db; }
.total-sales { border-left-color: #2ecc71; }
.low-stock { border-left-color: #e67e22; }
.new-users { border-left-color: #9b59b6; }


/* 快速連結 */
.quick-links {
  margin-top: 30px;
}
.quick-links h3 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.quick-link {
  display: inline-block;
  padding: 15px 25px;
  margin-right: 15px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  color: white;
  transition: transform 0.2s;
}
.quick-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.books-link { background-color: #2c3e50; }
.orders-link { background-color: #3498db; }
</style>