<template>
  <div class="home-page">
    <div class="welcome-card">
      <h2>欢迎使用真菌和地衣标本数据库后台管理系统</h2>
      <p>请从左侧菜单选择功能模块开始操作</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.home-page {
  padding: 20px;
}

.welcome-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  h2 {
    color: #2d5ffb;
    margin-bottom: 12px;
    font-size: 22px;
  }

  p {
    color: #808695;
    font-size: 14px;
  }
}
</style>
