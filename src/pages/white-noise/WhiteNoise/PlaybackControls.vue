<template>
  <div class="playback">
    <!-- <div class="playback__left">
      <div
        class="playback__ring"
        :style="{ '--p': Math.min(1, activeCount / 18) }"
        :title="$t('whiteNoise.activeSounds')"
      >
        <span class="playback__ring-num">{{ activeCount }}</span>
      </div>
      <button type="button" class="playback__link" @click="$emit('save')">
        {{ $t("whiteNoise.saveCombo") }}
      </button>
    </div> -->

    <div class="playback__center">
      <el-popover placement="top" :width="220" trigger="click">
        <template #reference>
          <button
            type="button"
            class="playback__icon-btn"
            :aria-label="$t('whiteNoise.timer')"
          >
            <el-icon :size="22"><Clock /></el-icon>
          </button>
        </template>
        <div class="playback__timer-pop">
          <p class="playback__timer-title">{{ $t("whiteNoise.sleepTimer") }}</p>
          <el-radio-group
            v-model="timerModel"
            size="small"
            @update:model-value="onTimerChange"
          >
            <el-radio-button label="0">{{ $t("whiteNoise.timerOff") }}</el-radio-button>
            <el-radio-button label="15">15</el-radio-button>
            <el-radio-button label="30">30</el-radio-button>
            <el-radio-button label="45">45</el-radio-button>
            <el-radio-button label="60">60</el-radio-button>
          </el-radio-group>
          <p v-if="timerRemaining > 0" class="playback__timer-left">
            {{ $t("whiteNoise.timerRemaining", { min: timerRemaining }) }}
          </p>
        </div>
      </el-popover>

      <button
        type="button"
        class="playback__play"
        :aria-label="isPlaying ? $t('whiteNoise.pause') : $t('whiteNoise.play')"
        @click="onPlayPause"
      >
        <el-icon :size="36">
          <VideoPause v-if="isPlaying" />
          <VideoPlay v-else />
        </el-icon>
      </button>

      <button
        type="button"
        class="playback__icon-btn"
        :aria-label="$t('whiteNoise.stop')"
        @click="$emit('stop')"
      >
        <span></span>
      </button>
    </div>

    <div class="playback__right">
      <el-popover placement="top" :width="240" trigger="click">
        <template #reference>
          <button
            type="button"
            class="playback__master"
            :aria-label="$t('whiteNoise.masterVolume')"
          >
            {{ masterPercent }}
          </button>
        </template>
        <div class="playback__master-pop">
          <span>{{ $t("whiteNoise.masterVolume") }}</span>
          <el-slider
            v-model="masterLocal"
            :show-tooltip="true"
            @update:model-value="onMasterInput"
          />
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Clock, VideoPlay, VideoPause } from "@element-plus/icons-vue";

const props = defineProps<{
  isPlaying: boolean;
  activeCount: number;
  masterVolume: number;
  timerRemaining: number;
}>();

const emit = defineEmits<{
  play: [];
  pause: [];
  stop: [];
  save: [];
  "update:masterVolume": [number];
  "timer-minutes": [minutes: number];
}>();

const masterLocal = ref(Math.round(props.masterVolume * 100));
const timerModel = ref("0");

watch(
  () => props.masterVolume,
  (v) => {
    masterLocal.value = Math.round(v * 100);
  }
);

const masterPercent = computed(() => Math.round(props.masterVolume * 100));

function onMasterInput(v: number | number[]) {
  const n = Array.isArray(v) ? v[0] : v;
  emit("update:masterVolume", n / 100);
}

function onTimerChange(val: string | number | boolean | undefined) {
  const s = String(val ?? "0");
  const min = parseInt(s, 10) || 0;
  emit("timer-minutes", min);
}

function onPlayPause() {
  if (props.isPlaying) emit("pause");
  else emit("play");
}
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.playback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 20px;
  // background: var(--wn-card-bg, #fff);
  border-radius: 20px;
  // box-shadow: 0 6px 32px rgba(15, 23, 42, 0.08);
  // border: 1px solid rgba(124, 111, 214, 0.12);
}

.playback__left,
.playback__center,
.playback__right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.playback__center {
  flex: 1;
  justify-content: center;
  min-width: min(100%, 220px);
}

.playback__ring {
  --p: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(
    $wn-primary-color calc(var(--p) * 360deg),
    rgba(0, 0, 0, 0.08) 0
  );
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: var(--wn-card-bg, #fff);
  }
}

.playback__ring-num {
  position: relative;
  z-index: 1;
  font-size: 15px;
  font-weight: 600;
  color: $wn-text-color;
}

.playback__link {
  border: none;
  background: none;
  color: $wn-text-color;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 4px 0;

  &:hover {
    color: $wn-primary-color;
  }
}

.playback__icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba($wn-primary-color, 1);
  color: $wn-primary-color;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    transform: scale(1.04);
  }

  span {
    display: block;
    width: 18px;
    height: 18px;
    background: $wn-primary-color;
    border-radius: 2px;
  }
}

.playback__play {
  width: 64px;
  height: 64px;
  margin: 0 30px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(145deg, $wn-primary-color);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(91, 77, 184, 0.35);
  transition: transform 0.15s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 12px 32px rgba(91, 77, 184, 0.42);
  }
}

.playback__master {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba($wn-primary-color, 1);
  color: $wn-primary-color;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    transform: scale(1.04);
  }
}

.playback__timer-pop,
.playback__master-pop {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.playback__timer-title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}

.playback__timer-left {
  margin: 0;
  font-size: 12px;
  color: var(--wn-muted, #6b7280);
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
