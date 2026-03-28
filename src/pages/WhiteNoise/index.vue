<template>
  <div class="wn-page theme-ambient">
    <!-- 视频背景 -->
    <div class="video-background">
      <video
        autoPlay
        loop
        muted
        playsInline
        class="video-background__video"
      >
        <source src="/sounds/rain.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="wn-page__main">
      <h1 class="wn-page__title">{{ $t("whiteNoise.pageTitle") }}</h1>
      <p class="wn-page__sub">{{ $t("whiteNoise.pageSubtitle") }}</p>

      <PresetHeader
        :presets="BUILTIN_PRESETS"
        :active-preset-id="activePresetId"
        @select="onSelectPreset"
      />

      <section class="wn-grid">
        <SoundCard
          v-for="id in WHITE_NOISE_SOUND_IDS"
          :key="id"
          :sound-id="id"
          :label="$t(`whiteNoise.sounds.${id}`)"
          :icon-comp="WHITE_NOISE_ICON_MAP[SOUND_ICON_MAP[id]]"
          :active="tracks[id].active"
          :volume="tracks[id].volume"
          :load-error="tracks[id].loadError"
          :is-playing="isPlaying"
          @toggle="onToggle"
          @update:volume="onVolume"
        />
      </section>

      <PlaybackControls
        :is-playing="isPlaying"
        :active-count="activeCount"
        :master-volume="masterVolume"
        :timer-remaining="timerRemainingMin"
        @play="play"
        @pause="pause"
        @stop="stopAll"
        @save="saveCombo"
        @update:master-volume="setMasterVolume"
        @timer-minutes="onSleepTimer"
      />

      <div class="wn-page__viz-wrap">
        <VisualizerCanvas :analyser="analyser" :is-playing="isPlaying" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import SoundCard from '@/components/WhiteNoise/SoundCard.vue'
import PresetHeader from '@/components/WhiteNoise/PresetHeader.vue'
import PlaybackControls from '@/components/WhiteNoise/PlaybackControls.vue'
import VisualizerCanvas from '@/components/WhiteNoise/VisualizerCanvas.vue'
import { WHITE_NOISE_ICON_MAP } from '@/components/WhiteNoise/whiteNoiseIcons'
import {
  BUILTIN_PRESETS,
  STORAGE_KEY,
  SOUND_ICON_MAP,
  WHITE_NOISE_SOUND_IDS,
  type WhiteNoiseSoundId,
} from '@/constants/whiteNoiseSounds'
import { useWhiteNoiseAudio } from '@/composables/useWhiteNoiseAudio'

const { t } = useI18n()

const {
  analyser,
  isPlaying,
  masterVolume,
  tracks,
  setTrackActive,
  setTrackVolume,
  setMasterVolume,
  play,
  pause,
  stopAll,
  applyLevels,
} = useWhiteNoiseAudio()

const activePresetId = ref<string | null>(null)
const timerRemainingMin = ref(0)
let sleepTimeout: ReturnType<typeof setTimeout> | null = null
let sleepTick: ReturnType<typeof setInterval> | null = null

const activeCount = computed(
  () => WHITE_NOISE_SOUND_IDS.filter((id) => tracks.value[id].active).length
)

function clearSleepTimer() {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout)
    sleepTimeout = null
  }
  if (sleepTick) {
    clearInterval(sleepTick)
    sleepTick = null
  }
  timerRemainingMin.value = 0
}

function onSleepTimer(minutes: number) {
  clearSleepTimer()
  if (minutes <= 0) return
  const until = Date.now() + minutes * 60_000
  timerRemainingMin.value = minutes
  sleepTick = setInterval(() => {
    const left = Math.ceil((until - Date.now()) / 60_000)
    timerRemainingMin.value = Math.max(0, left)
    if (Date.now() >= until) {
      clearSleepTimer()
      pause()
    }
  }, 1000)
  sleepTimeout = setTimeout(() => {
    clearSleepTimer()
    pause()
  }, minutes * 60_000)
}

function onToggle(id: WhiteNoiseSoundId) {
  activePresetId.value = null
  setTrackActive(id, !tracks.value[id].active)
}

function onVolume(id: WhiteNoiseSoundId, v: number) {
  activePresetId.value = null
  setTrackVolume(id, v)
}

function onSelectPreset(id: string) {
  const preset = BUILTIN_PRESETS.find((p) => p.id === id)
  if (!preset) return
  activePresetId.value = id
  applyLevels(preset.tracks) // 应用预设
  play() // 播放
}

function saveCombo() {
  const payload = {
    tracks: Object.fromEntries(
      WHITE_NOISE_SOUND_IDS.map((id) => [
        id,
        {
          active: tracks.value[id].active,
          volume: tracks.value[id].volume,
        },
      ])
    ),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    ElMessage.success(t('message.saveSuccess'))
  } catch {
    ElMessage.error(t('whiteNoise.saveFailed'))
  }
}

function loadCombo() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  try {
    const o = JSON.parse(raw) as {
      tracks?: Record<string, { active?: boolean; volume?: number }>
    }
    if (!o.tracks) return
    for (const id of WHITE_NOISE_SOUND_IDS) {
      const e = o.tracks[id]
      const t = tracks.value[id]
      if (e) {
        t.active = !!e.active
        t.volume =
          typeof e.volume === 'number'
            ? Math.min(1, Math.max(0, e.volume))
            : 0.7
      } else {
        t.active = false
        t.volume = 0.7
      }
    }
    activePresetId.value = null
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  loadCombo()
})

onUnmounted(() => {
  clearSleepTimer()
})
</script>

<style scoped lang="scss">

.wn-page {
  height: 100vh;
  width: 100%;
  --wn-accent: $wn-accent;
  --wn-accent-hover: $wn-accent;
  --wn-muted: #fff;
  --wn-card-bg: #ffffff;
  --wn-viz-muted: rgba(15, 23, 42, 0.08);
  // background: linear-gradient(165deg, #f5f3ff 0%, #eef2ff 35%, #f8fafc 100%);

  position: relative;
  overflow: hidden;
}

.wn-page__header {
  height: 56px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.wn-page__main {
  max-width: 1100px;
  height: 100%;
  margin: 0 auto;
  position: relative;

  z-index: 1;
  // background: rgba(255, 255, 255, 0.85);
  // backdrop-filter: blur(10px);
  // -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.wn-page__title {
  margin: 0;
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 600;
  color: #fff;
  text-align: center;
}

.wn-page__sub {
  padding: 10px 0 30px;
  text-align: center;
  font-size: 14px;
  color: #fff;
}

.wn-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  justify-items: center;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  max-width: 100%;
}

/* 视频背景样式 */
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.video-background__video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  filter: brightness(0.7); /* 调整视频亮度，使前景内容更清晰 */
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .wn-page__main {
    max-width: 900px;
  }
}

@media (max-width: 992px) {
  .wn-page__main {
    max-width: 720px;
    margin: 16px auto;
    padding: 16px;
  }

  .wn-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .wn-page__main {
    max-width: 540px;
    margin: 12px;
    padding: 16px;
  }

  .wn-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .wn-page__title {
    padding-top: 20px;
    font-size: clamp(20px, 4vw, 24px);
  }

  .wn-page__sub {
    font-size: 13px;
    padding: 8px 0;
  }
}

@media (max-width: 576px) {
  .wn-page__main {
    max-width: 100%;
    margin: 8px;
    padding: 12px;
  }

  .wn-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 12px 8px;
  }

  .wn-page__title {
    padding-top: 16px;
    font-size: clamp(18px, 4vw, 22px);
  }

  .wn-page__sub {
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .wn-page__main {
    margin: 4px;
    padding: 8px;
  }
  .wn-grid {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 8px 4px;
  }

  .wn-page__title {
    font-size: 18px;
    padding-top: 12px;
  }
}
</style>
