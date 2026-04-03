<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElLoading } from "element-plus";
import { useWebsiteStore } from "@/stores/website";
import SearchInput from "@/pages/portal/SearchInput/index.vue";
import WebsiteList from "@/pages/portal/WebsiteList/index.vue";
import defaultFavicon from "@/assets/portal.svg";
import { useRouter } from "vue-router";
const router = useRouter();
const handleClick = () => {
  router.push("/");
};

const websiteStore = useWebsiteStore();
const { t, locale } = useI18n();
let timer: ReturnType<typeof setInterval> | null = null;

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) {
    return t("portal.goodNight");
  } else if (hour < 12) {
    return t("portal.goodMorning");
  } else if (hour < 14) {
    return t("portal.goodNoon");
  } else if (hour < 18) {
    return t("portal.goodAfternoon");
  } else {
    return t("portal.goodEvening");
  }
};
const greeting = ref<string>(getGreeting());

// 监听语言变化，当语言切换时立即更新问候语
watch(
  locale,
  () => {
    greeting.value = getGreeting();
  },
  { immediate: true }
);

// 监听 loading 变化
watch(
  () => websiteStore.loading,
  (newLoading, oldLoading) => {
    const loading = ElLoading.service({
      lock: true,
      text: "Loading",
      background: "rgba(0, 0, 0, 0.1)",
    });
    if (!newLoading && oldLoading) {
      loading.close();
    }
  }
);

// 组件挂载时设置定时器，每分钟更新一次问候语
onMounted(() => {
  // 初始更新
  greeting.value = getGreeting();

  // 设置定时器，每分钟更新一次
  timer = setInterval(() => {
    greeting.value = getGreeting();
  }, 60000); // 60秒 = 1分钟
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <div class="portal">
    <h1>{{ greeting }}</h1>
    <p>{{ t("portal.lyric") }}</p>
    <SearchInput />
    <WebsiteList />
    <el-backtop
      :right="50"
      :bottom="120"
      :style="{ background: 'var(--primary-color)', color: '#fff' }"
    />

    <div class="favicon">
      <img :src="defaultFavicon" alt="" @click="handleClick" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.portal {
  position: relative;
}

h1 {
  text-align: center;
  color: var(--text-color);
  margin: 91px 0 20px;
  font-size: clamp(16px, 5vw, 24px);
  font-weight: 500;
}

p {
  text-align: center;
  color: var(--text-color);
  margin: 20px auto 40px;
  font-size: clamp(12px, 5vw, 16px);
  width: 90%;
}

.favicon {
  width: 70px;
  height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 30px;
  padding: 15px;

  img:hover {
    cursor: pointer;
  }
}
</style>
