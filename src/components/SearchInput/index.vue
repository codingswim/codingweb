<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSearchStore } from "@/stores/search";
import { useWebsiteStore } from "@/stores/website";

const { t } = useI18n();
const searchStore = useSearchStore();
const websiteStore = useWebsiteStore();
</script>

<template>
  <div class="search">
    <input
      type="text"
      v-model="searchStore.searchTerm"
      :placeholder="t('message.pleaseInput')"
      @blur="websiteStore.syncFilteredList(searchStore.searchTerm)"
      @clear="websiteStore.syncFilteredList('')"
    />
  </div>
</template>

<style scoped>
/* 搜索框 - 响应式 */
.search {
  margin: 0 auto 32px;
  max-width: 720px;
  width: 100%;
}

.search input {
  height: clamp(40px, 8vw, 48px);
  width: 100%;
  border-radius: 25px;
  padding: 0 20px;
  border: 1px solid var(--border-color);
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: var(--text-color);
}

/* 响应式 移动端修改 search 的宽度 */
@media (max-width: 768px) {
  .search {
    width: 90%;
    margin: 0 auto 24px;
  }
}
</style>
