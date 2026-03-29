<script setup lang="ts">
import type { LyricChar } from "@/types/music";

const props = withDefaults(
  defineProps<{
    currentLyricText: string;
    currentLyricChars: LyricChar[];
    isPlaying: boolean;
  }>(),
  {
    currentLyricText: "",
    currentLyricChars: () => [],
    isPlaying: false,
  }
);
</script>

<template>
  <div class="lyric-wave-box" v-if="currentLyricText">
    <span
      v-for="item in currentLyricChars"
      :key="item.index"
      :class="['char-animate', { paused: !isPlaying }]"
    >
      {{ item.char }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.lyric-wave-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 85vw;
  pointer-events: none;
  gap: 2px;
}

.char-animate {
  font-size: 6rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: "Microsoft YaHei", sans-serif;
  animation: wave 1.2s ease-in-out infinite;

  &.paused {
    animation-play-state: paused;
    opacity: 0.7; // 暂停时稍微降低透明度
  }
}

/* 从左到右依次延迟，形成流动波浪 */
.char-animate:nth-child(1) {
  animation-delay: 0s;
}
.char-animate:nth-child(2) {
  animation-delay: 0.1s;
}
.char-animate:nth-child(3) {
  animation-delay: 0.2s;
}
.char-animate:nth-child(4) {
  animation-delay: 0.3s;
}
.char-animate:nth-child(5) {
  animation-delay: 0.4s;
}
.char-animate:nth-child(6) {
  animation-delay: 0.5s;
}
.char-animate:nth-child(7) {
  animation-delay: 0.6s;
}
.char-animate:nth-child(8) {
  animation-delay: 0.7s;
}
.char-animate:nth-child(9) {
  animation-delay: 0.8s;
}
.char-animate:nth-child(n + 10) {
  animation-delay: 0.9s;
}

@keyframes wave {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
