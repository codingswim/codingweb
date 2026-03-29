<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useWeatherDashboardStore } from "@/stores/weather";
const store = useWeatherDashboardStore();
const cityName = computed(() => store.cityName);
const weatherNow = computed(() => store.weatherNow);

interface DateTime {
  date: string;
  time: string;
}

// 实时时间
const dateTime = ref<DateTime>({
  date: "",
  time: "",
});
let timer: number | null = null;

// 格式化时间
const formatDateTime = () => {
  const now = new Date();
  // 年月日
  const date = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  // 时分秒
  const time = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  dateTime.value = { date, time };
};

// 启动定时器
onMounted(() => {
  formatDateTime();
  timer = window.setInterval(formatDateTime, 1000);
});

// 销毁定时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <!-- 浅色系大屏标题容器 -->
  <div class="screen-title">
    <!-- 左侧：地区 + 天气 -->
    <div class="title-left">
      <span class="location"> 📍 {{ cityName }} </span>
      <span class="weather">
        <i :class="`qi-${weatherNow.icon} weather-icon`" style="margin-right: 8px;"></i>
        {{ weatherNow.text }} · {{ weatherNow.temp + "℃" }} · {{ weatherNow.windDir }}
        {{ weatherNow.windScale }}级
      </span>
    </div>

    <!-- 中间：主标题（大屏核心） -->
    <div class="title-center">
      <h1 class="main-title">郑州市 3D 气象可视化地图</h1>
    </div>

    <!-- 右侧：实时日期时间 -->
    <div class="title-right">
      <div class="date">{{ dateTime.date }}</div>
      <div class="time">{{ dateTime.time }}</div>
    </div>
  </div>
</template>

<style scoped>
/* 大屏标题根容器 - 浅色系渐变高端背景 */
.screen-title {
  width: 100%;
  height: 100px;
  padding: 0 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

/*  ========== 左侧：地区天气 ========== */
.title-left {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 16px;
  color: #2c4e70;
  font-weight: 500;
}

.location {
  font-size: 18px;
  font-weight: 600;
}

.weather {
  opacity: 0.9;
}

/*  ========== 中间：主标题（大屏核心样式） ========== */
.title-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.main-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  /* 文字渐变：浅色系专属蓝色渐变，高级不刺眼 */
  background: linear-gradient(90deg, #165dff, #00bfff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  /* 呼吸动画：大屏动态效果 */
  animation: titleBreath 3s ease-in-out infinite alternate;
  letter-spacing: 2px;
}

/* 标题呼吸动画 */
@keyframes titleBreath {
  0% {
    opacity: 0.9;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.02);
  }
}

/*  ========== 右侧：日期时间 ========== */
.title-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  color: #3d5f82;
}

.date {
  font-size: 15px;
  font-weight: 500;
}

.time {
  font-size: 18px;
  font-weight: 600;
  color: #165dff;
}
</style>
