<template>
  <div class="header">
    <div class="header_left">
      <Title />
    </div>
    <div class="header_right">
      <router-link class="header-nav-link" to="/portal">{{
        $t("portal.navTitle")
      }}</router-link>
      <router-link class="header-nav-link" to="/wyy-music">{{
        $t("wyyMusic.navTitle")
      }}</router-link>
      <router-link class="header-nav-link" to="/weather-dashboard">{{
        $t("dashboard.title")
      }}</router-link>
      <router-link class="header-nav-link" to="/white-noise">{{
        $t("whiteNoise.navTitle")
      }}</router-link>
      <router-link class="header-nav-link" to="/chat">{{
        $t("chat.navTitle")
      }}</router-link>
      <ThemeSwitch />
      <LangSwitch />
    </div>
  </div>
</template>

<script setup lang="ts">
import Title from "./Title/index.vue";
import ThemeSwitch from "./ThemeSwitch/index.vue";
import LangSwitch from "./LangSwitch/index.vue";
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 头部容器 - 响应式布局 */
.header {
  width: 100%;
  height: clamp(60px, 10vw, 100px); /* 响应式高度：移动端60px，PC端100px */
  line-height: clamp(60px, 10vw, 100px); /* 行高跟随高度 */
  display: flex;
  justify-content: space-between;
  padding: 0 clamp(36px, 3vw, 48px); /* 响应式内边距 */
  position: relative;
  z-index: 10;
}

.header_left {
  width: 50%;
  text-align: left;
}

.header_right {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.header-nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-size: clamp(13px, 1.5vw, 15px);
  white-space: nowrap;
  opacity: 0.92;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &.router-link-active {
    font-weight: 600;
    color: var(--primary-color, #409eff);
  }
}

/* 媒体查询 - 移动端优化 */
@media (max-width: 768px) {
  .header {
    height: 60px;
    line-height: 60px;
  }

  .title {
    font-size: 18px;
  }

  /* 优化Element Plus下拉菜单在移动端的显示 */
  :deep(.el-dropdown-menu) {
    font-size: 14px;
    min-width: 80px;
  }

  :deep(.el-dropdown-item) {
    padding: 8px 16px;
  }
  /* 优化主题切换开关在移动端的显示 */
  :deep(.el-switch) {
    --el-switch-width: 40px;
    --el-switch-height: 20px;
  }
  :deep(.el-switch__label) {
    font-size: 12px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .header {
    padding: 0 16px;
  }

  .title {
    font-size: 16px;
  }
}
</style>
