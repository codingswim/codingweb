<template>
  <div class="visualizer-container">
    <canvas
      ref="canvasRef"
      class="spectrum-canvas"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let rafId = 0;
let lastData: Uint8Array | null = null;
let smoothedData: Uint8Array | null = null; // 用于平滑动画

// 平滑系数 (0~1, 越小越平滑)
const SMOOTHING = 0.6;

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const container = canvas.parentElement;
  const width = container ? container.clientWidth : window.innerWidth;
  const height = 80; // 固定高度，可根据需要调整
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

function drawIdle() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  resizeCanvas();
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 绘制灰色静态度量条（表示无音频时）
  const barCount = 60;
  const barWidth = (w / barCount) * 0.7;
  const spacing = (w / barCount) * 0.3;
  for (let i = 0; i < barCount; i++) {
    const x = i * (barWidth + spacing);
    const barHeight = 3; // 很矮的静态度量
    const y = (h - barHeight) / 2;
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(x, y, barWidth, barHeight);
  }
}

function drawSpectrum() {
  const canvas = canvasRef.value;
  const analyser = props.analyser;
  if (!canvas || !analyser || !props.isPlaying) {
    drawIdle();
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  resizeCanvas();
  const w = canvas.width;
  const h = canvas.height;

  const bufferLength = analyser.frequencyBinCount;
  const data = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(data);

  // 平滑处理（使动画更柔和）
  if (!smoothedData || smoothedData.length !== bufferLength) {
    smoothedData = new Uint8Array(bufferLength);
    lastData = new Uint8Array(bufferLength);
  }
  for (let i = 0; i < bufferLength; i++) {
    if (lastData) {
      smoothedData[i] = Math.max(
        data[i],
        Math.floor(lastData[i] * SMOOTHING + data[i] * (1 - SMOOTHING))
      );
    } else {
      smoothedData[i] = data[i];
    }
  }
  // 更新上次数据
  if (lastData) {
    lastData.set(smoothedData);
  }

  // 取前 2/3 频段（人耳敏感范围）
  const bars = 80;
  const step = Math.max(1, Math.floor(bufferLength * 0.7 / bars));
  const barWidth = (w / bars) * 0.8;
  const spacing = (w / bars) * 0.2;

  ctx.clearRect(0, 0, w, h);

  // 渐变画笔
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#FEE88F");      // 亮金色
  gradient.addColorStop(0.6, "#FFB347");    // 橙色
  gradient.addColorStop(1, "#FF8C42");      // 橙红

  for (let i = 0; i < bars; i++) {
    let sum = 0;
    for (let j = 0; j < step; j++) {
      const idx = i * step + j;
      if (idx < smoothedData.length) sum += smoothedData[idx];
    }
    const avg = sum / step;
    // 映射高度（0~255 -> 2~h*0.8）
    const barHeight = Math.max(2, (avg / 255) * h * 0.8);
    const x = i * (barWidth + spacing);
    const y = h - barHeight;

    // 圆角矩形
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 4);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 添加微光晕
    ctx.shadowBlur = 4;
    ctx.shadowColor = "rgba(255, 180, 70, 0.5)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function tick() {
  if (!props.isPlaying || !props.analyser) {
    cancelAnimationFrame(rafId);
    drawIdle();
    return;
  }

  drawSpectrum();
  rafId = requestAnimationFrame(tick);
}

function startOrStop() {
  cancelAnimationFrame(rafId);
  if (props.isPlaying && props.analyser) {
    tick();
  } else {
    drawIdle();
  }
}

watch(
  () => [props.analyser, props.isPlaying] as const,
  () => {
    nextTick(() => startOrStop());
  },
  { immediate: true }
);

// 窗口大小改变时重新计算尺寸
let resizeObserver: ResizeObserver | null = null;
watch(canvasRef, (el) => {
  resizeObserver?.disconnect();
  if (el && el.parentElement) {
    resizeObserver = new ResizeObserver(() => startOrStop());
    resizeObserver.observe(el.parentElement);
  }
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
});
</script>

<style scoped lang="scss">
.visualizer-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: -100;
  height: 80px; /* 与 canvas 高度一致 */
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.2));
  backdrop-filter: blur(4px);
}

.spectrum-canvas {
  display: block;
  width: 100%;
  height: 80px;
  margin: 0 auto;
}
</style>