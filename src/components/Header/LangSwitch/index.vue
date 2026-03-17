<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, onMounted } from "vue";

const { locale } = useI18n();
// 支持的语言类型
type SupportedLocale = "zh-CN" | "zh-TW" | "en-US";

// 响应式图标尺寸
const iconSize = computed<string>(() => {
  const screenWidth = window.innerWidth;
  return screenWidth <= 768 ? "20px" : "24px";
});

const changeLang = (lang: SupportedLocale) => {
  locale.value = lang;
  localStorage.setItem("portal-lang", lang);
};

// 初始化语言设置
onMounted(() => {
  const savedLang = localStorage.getItem("portal-lang") as SupportedLocale | null;
  if (savedLang) {
    locale.value = savedLang;
  }
});
</script>

<template>
  <div class="langs">
    <el-dropdown>
      <svg
        t="1773409874557"
        class="langs_icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="23265"
        :width="iconSize"
        :height="iconSize"
      >
        <path
          d="M549.12 643.008L440.768 535.936l1.28-1.28A747.52 747.52 0 0 0 600.32 256h125.056V170.688H426.688V85.376H341.376v85.312H42.688v84.928h476.608A670.4 670.4 0 0 1 384 484.288a667.52 667.52 0 0 1-98.56-142.912H200.128a749.312 749.312 0 0 0 127.168 194.56L110.08 750.08l60.608 60.544L384 597.376l132.736 132.672 32.384-87.04z m240.256-216.32H704l-192 512h85.376l47.744-128h202.688l48.192 128h85.376l-192-512z m-111.808 298.688l69.12-184.768 69.12 184.768h-138.24z"
          p-id="23266"
        ></path>
      </svg>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="changeLang('zh-CN')">中文</el-dropdown-item>
          <el-dropdown-item @click="changeLang('zh-TW')">繁体中文</el-dropdown-item>
          <el-dropdown-item @click="changeLang('en-US')">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
/* 语言切换容器 */
.langs {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

/* 语言图标样式优化 */
.langs_icon {
  display: block;
  transition: transform 0.2s ease, fill 0.3s ease;
  fill: var(--text-color);
}

.langs:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.langs:hover .langs_icon {
  transform: rotate(5deg);
}

/* 修复Element Plus下拉菜单样式 */
:deep(.el-dropdown) {
  outline: none;
}

:deep(.el-dropdown-menu__item) {
  font-size: clamp(14px, 2vw, 16px);
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
}
</style>
