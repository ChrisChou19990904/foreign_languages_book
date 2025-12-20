<template>
  <footer class="main-footer">
    <div class="footer-content">
      <div class="footer-profile">
        <img src="@/assets/my-avatar.jpg" alt="Developer Avatar" class="avatar" />
        <div class="profile-info">
          <h3>開發者：周彥廷 (Chris Chou)</h3>
          <p>全端開發者 | 致力於打造高可靠性的 Web 應用</p>
        </div>
      </div>

      <div class="footer-copyright">
        <p>&copy; {{ currentYear }} Chris Chou. All Rights Reserved.</p>
        <p>外語學習書城專案 - 實戰作品展示</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.main-footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 40px 20px;
  margin-top: 50px;
  border-top: 4px solid #3498db;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.footer-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #fff;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.profile-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #3498db;
}

.profile-info p {
  margin: 5px 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.footer-copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  width: 100%;
  font-size: 0.85rem;
}

/* 響應式：手機版將大頭照居中 */
@media (max-width: 600px) {
  .footer-profile {
    flex-direction: column;
  }
}
</style>