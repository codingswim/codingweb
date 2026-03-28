<template>
  <div class="visualizer-container">
    <!-- 左侧垂直可视化 -->
    <canvas
      ref="leftCanvasRef"
      class="wn-canvas wn-canvas-left"
      aria-hidden="true"
      :style="{ '--wn-viz-muted': vizMuted, '--wn-accent': vizAccent }"
    />
    
    <!-- 右侧垂直可视化 -->
    <canvas
      ref="rightCanvasRef"
      class="wn-canvas wn-canvas-right"
      aria-hidden="true"
      :style="{ '--wn-viz-muted': vizMuted, '--wn-accent': vizAccent }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  analyser: AnalyserNode | null
  isPlaying: boolean
}>()

const leftCanvasRef = ref<HTMLCanvasElement | null>(null)
const rightCanvasRef = ref<HTMLCanvasElement | null>(null)
const vizMuted = ref('rgba(0,0,0,0.06)')
const vizAccent = ref('#FEE88F')

let rafId = 0

function readCssVars() {
  const root = document.documentElement
  const muted =
    getComputedStyle(root).getPropertyValue('--wn-viz-muted').trim() ||
    'rgba(0,0,0,0.06)'
  const accent =
    getComputedStyle(root).getPropertyValue('--wn-accent').trim() || '#FEE88F'
  vizMuted.value = muted
  vizAccent.value = accent
}

function resize(canvas: HTMLCanvasElement) {
  if (!canvas) return
  const w = 120 // 垂直可视化的宽度
  const h = window.innerHeight // 高度为窗口高度
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.floor(w * dpr))
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}

function drawIdleStatic(canvas: HTMLCanvasElement) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  resize(canvas)
  readCssVars()
  const w = canvas.width
  const h = canvas.height
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = vizMuted.value
  const mid = w / 2
  const barH = 3 * (window.devicePixelRatio || 1)
  const gap = 4 * (window.devicePixelRatio || 1)
  const n = Math.floor(h / (barH + gap))
  for (let i = 0; i < n; i++) {
    const y = i * (barH + gap) + gap
    const bw = w * 0.12
    ctx.fillRect(mid - bw / 2, y, bw, barH)
  }
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2)
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, rr)
    ctx.fill()
  } else {
    ctx.fillRect(x, y, w, h)
  }
}

function drawVisualization(canvas: HTMLCanvasElement) {
  const analyser = props.analyser
  if (!canvas || !analyser || !props.isPlaying) {
    drawIdleStatic(canvas)
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  resize(canvas)
  readCssVars()
  const w = canvas.width
  const h = canvas.height
  const bufferLength = analyser.frequencyBinCount
  const data = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(data)

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, hexWithAlpha(vizAccent.value, 0.12))
  grad.addColorStop(1, hexWithAlpha(vizAccent.value, 0.55))
  ctx.fillStyle = grad
  ctx.clearRect(0, 0, w, h)

  const bars = 64
  const step = Math.max(1, Math.floor(bufferLength / bars))
  const barH = Math.max(2, (h / bars) * 0.55)
  const gap = (h - barH * bars) / (bars + 1)

  for (let i = 0; i < bars; i++) {
    let sum = 0
    for (let j = 0; j < step; j++) {
      sum += data[i * step + j] ?? 0
    }
    const avg = sum / step
    const bw = Math.max(4, (avg / 255) * w * 0.92)
    const y = gap + i * (barH + gap)
    const x = (w - bw) / 2
    fillRoundRect(ctx, x, y, bw, barH, barH / 2)
  }
}

function tick() {
  if (!props.isPlaying || !props.analyser) {
    cancelAnimationFrame(rafId)
    drawIdleStatic(leftCanvasRef.value!)
    drawIdleStatic(rightCanvasRef.value!)
    return
  }

  drawVisualization(leftCanvasRef.value!)
  drawVisualization(rightCanvasRef.value!)

  rafId = requestAnimationFrame(tick)
}

function hexWithAlpha(hex: string, alpha: number): string {
  const m = hex.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return `rgba(109,90,205,${alpha})`
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function startOrStop() {
  cancelAnimationFrame(rafId)
  if (props.isPlaying && props.analyser) {
    tick()
  } else {
    drawIdleStatic(leftCanvasRef.value!)
    drawIdleStatic(rightCanvasRef.value!)
  }
}

watch(
  () => [props.analyser, props.isPlaying] as const,
  () => {
    nextTick(() => startOrStop())
  },
  { immediate: true }
)

let ro: ResizeObserver | null = null

watch(leftCanvasRef, (el) => {
  ro?.disconnect()
  if (el) {
    ro = new ResizeObserver(() => {
      startOrStop()
    })
    ro.observe(el)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  ro?.disconnect()
})
</script>

<style scoped lang="scss">
.visualizer-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.wn-canvas {
  display: block;
  border-radius: 0;
  // background: linear-gradient(90deg, rgba(124, 111, 214, 0.06), transparent);
  position: fixed;
  top: 0;
  height: 100vh;
  width: 120px;
}

.wn-canvas-left {
  left: 0;
}

.wn-canvas-right {
  right: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wn-canvas {
    width: 12px;
  }
}

@media (max-width: 480px) {
  .wn-canvas {
    width: 8px;
  }
}
</style>