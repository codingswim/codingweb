<script setup lang="ts">
import { useLyric } from "@/pages/wyy-music/composables/useLyric";
import { watch, ref, onMounted, onUnmounted, computed } from "vue";

const props = defineProps<{
  songId: number;
  songName: string;
}>();

const { lyricLines, loading, error, fetch, clear, hasLyric } = useLyric({
  songId: props.songId,
  immediate: false,
  onError: (err) => {
    console.error("获取歌词失败:", err);
  },
});

// 歌词容器引用
const lyricContentRef = ref<HTMLElement | null>(null);

// 动态字体大小
const watermarkFontSize = computed(() => {
  if (!props.songName) return 0;

  // 统计中英文字符数量
  const chineseChars = (props.songName.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishChars = (props.songName.match(/[a-zA-Z]/g) || []).length;
  const otherChars = props.songName.length - chineseChars - englishChars;

  // 中文字符权重为1，英文字符权重为0.5，其他字符权重为0.3
  const effectiveLength = chineseChars + englishChars * 0.5 + otherChars * 0.3;

  const baseSize = 120;
  const minSize = 50;
  const reductionPerChar = 8; // 每多一个有效字符减少8px

  // 计算字体大小，确保不小于最小值
  const calculatedSize = baseSize - (effectiveLength - 1) * reductionPerChar;
  return Math.max(calculatedSize, minSize);
});

// 自动滚动相关
let scrollInterval: number | null = null;
const scrollSpeed = 1; // 滚动速度（像素/帧）

// 开始自动滚动
const startAutoScroll = () => {
  if (scrollInterval) return;

  scrollInterval = window.setInterval(() => {
    if (lyricContentRef.value) {
      const container = lyricContentRef.value;
      const maxScrollTop = container.scrollHeight - container.clientHeight;

      // 如果已经滚动到底部，重新从顶部开始
      if (container.scrollTop >= maxScrollTop) {
        container.scrollTop = 0;
      } else {
        container.scrollTop += scrollSpeed;
      }
    }
  }, 50); // 每50毫秒滚动一次
};

// 停止自动滚动
const stopAutoScroll = () => {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
};

// 组件挂载时开始滚动
onMounted(() => {
  startAutoScroll();
});

// 组件卸载时停止滚动
onUnmounted(() => {
  stopAutoScroll();
});

watch(
  () => props.songId,
  (newSongId) => {
    if (newSongId) {
      clear();
      fetch(newSongId);
      // 切换歌曲时重新开始滚动
      stopAutoScroll();
      startAutoScroll();
    }
  }
);
</script>

<template>
  <div class="container">
    <!-- 歌曲名称水印背景 -->
    <div class="song-name-watermark" :style="{ fontSize: watermarkFontSize + 'px' }">
      <!-- 剔除括号()内中的内容 -->
      {{ props.songName && props.songName.replace(/\([^)]*\)/g, "").replace(/\s+/g, "") }}
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="hasLyric" class="lyric-content" ref="lyricContentRef">
      <div v-for="(line, index) in lyricLines" :key="index" class="lyric-line">
        {{ line.text }}
      </div>
    </div>
    <div v-else class="no-lyric">暂无歌词</div>
  </div>
</template>

<style scoped lang="scss">
.container {
  padding: 20px;
  overflow: hidden;
  height: 80vh;
}
.error,
.no-lyric,
.loading {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #ddd;
}

.lyric-content {
  overflow-y: auto;
  height: 100%;
  scroll-behavior: auto;

  // 隐藏滚动条但保留滚动功能
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.lyric-line {
  text-align: center;
  padding: 10px 0;
  // color: #fff;
  position: relative;
  z-index: 2;
}
// 歌曲名称水印背景
.song-name-watermark {
  position: fixed;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #ddd;
  pointer-events: none;
  user-select: none;
  z-index: -88;
  letter-spacing: 10px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  // 竖向文字排列
  writing-mode: vertical-rl; // 从右到左竖向排列
  text-orientation: upright; // 文字直立显示

  // 动态字体大小
  transition: font-size 0.3s ease; // 平滑过渡效果

  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
