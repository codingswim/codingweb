<script setup lang="ts">
import { ref, watch } from "vue";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { getCurrentTheme, toggleTheme, THEME_TYPES } from "@/utils/theme";

const currentTheme = ref(getCurrentTheme() !== THEME_TYPES.LIGHT);
watch(currentTheme, () => {
  toggleTheme();
});
</script>

<template>
  <div class="theme-switch">
    <el-switch
      v-model="currentTheme"
      :active-icon="Moon"
      :inactive-icon="Sunny"
      inline-prompt
      size="large"
    />
  </div>
</template>

<style scoped lang="scss">
.theme-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 8px;
  background-color: var(--el-bg-color-light);
  transition: all 0.3s ease;
}

/* 修复图标颜色跟随主题 */
:deep(.el-switch__icon) {
  color: var(--el-text-color-primary);
  transition: color 0.3s ease;
}

/* 让开关颜色跟随主题变化 */
:deep(.el-switch) {
  --el-switch-on-color: var(--border-color);
  --el-switch-off-color: var(--border-color);
  --el-switch-on-border-color: var(--border-color);
  --el-switch-off-border-color: var(--border-color);
  --el-switch-core-bg-color: var(--bg-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 深色主题下的开关样式 */
.theme-dark :deep(.el-switch) {
  --el-switch-off-color: rgba(255, 255, 255, 0.2);
  --el-switch-off-border-color: rgba(255, 255, 255, 0.2);
}
</style>
