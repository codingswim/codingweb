<template>
  <div
    class="sound-card"
    :class="{
      'sound-card--active': active,
      'sound-card--error': loadError,
    }"
    @click="onToggle"
  >
    <button type="button" class="sound-card__main" :disabled="loadError">
      <span v-if="active && isPlaying" class="sound-card__viz" aria-hidden="true">
        <span v-for="n in 4" :key="n" class="sound-card__bar" />
      </span>
      <el-icon class="sound-card__icon" :size="28">
        <component :is="iconComp" />
      </el-icon>
      <span class="sound-card__label">{{ label }}</span>
    </button>
    <div v-if="active" class="sound-card__slider" @click.stop>
      <el-slider
        :model-value="Math.round(volume * 100)"
        :show-tooltip="false"
        @update:model-value="onVol"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import type { Component } from "vue";
import type { WhiteNoiseSoundId } from "@/constants/whiteNoiseSounds";

const props = defineProps<{
  soundId: WhiteNoiseSoundId;
  label: string;
  iconComp: Component;
  active: boolean;
  volume: number;
  loadError: boolean;
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  toggle: [WhiteNoiseSoundId];
  "update:volume": [WhiteNoiseSoundId, number];
}>();

const { t } = useI18n();

function onToggle() {
  if (props.loadError) {
    ElMessage.warning(
      t("whiteNoise.missingFile", { name: props.label, id: props.soundId })
    );
    return;
  }
  emit("toggle", props.soundId);
}

function onVol(v: number | number[]) {
  const n = Array.isArray(v) ? v[0] : v;
  emit("update:volume", props.soundId, Math.min(1, Math.max(0, n / 100)));
}

const iconComp = computed(() => props.iconComp);
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.sound-card {
  width: 140px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 12px 10px;
  border-radius: 14px;
  background: transparent;
  border: 1px solid transparent;
  transition: background 0.2s, box-shadow 0.2s, border-color 0.2s;

  &--active {
    border-color: $wn-primary-color;
    transform: translateY(-4px);
  }

  &--error {
    opacity: 0.45;
  }
  // 如果是选中状态，就不放大了
  &:hover:not(.sound-card--active) {
    .el-icon.sound-card__icon {
      transform: scale(1.5);
      color: $wn-primary-color;
    }

    .sound-card__label {
      color: $wn-primary-color;
    }
  }

  .sound-card__main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 100%;
    height: 100%;
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px;
    color: #fff;
    position: relative;

    &:disabled {
      cursor: not-allowed;
    }
  }

  .sound-card__icon {
    color: $wn-text-color;
    transition: color 0.2s;
  }

  .sound-card--active .sound-card__icon {
    color: $wn-primary-color;
  }

  .sound-card__label {
    font-size: 13px;
    text-align: center;
    line-height: 1.25;
    color: $wn-text-color;
  }

  .sound-card--active .sound-card__label {
    color: $wn-primary-color;
    font-weight: 500;
  }

  .sound-card__viz {
    position: absolute;
    top: 0;
    right: 4px;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 18px;
  }

  .sound-card__bar {
    width: 3px;
    border-radius: 1px;
    background: $wn-primary-color;
    animation: wn-bounce 0.9s ease-in-out infinite;

    &:nth-child(1) {
      height: 6px;
      animation-delay: 0s;
    }
    &:nth-child(2) {
      height: 12px;
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      height: 8px;
      animation-delay: 0.08s;
    }
    &:nth-child(4) {
      height: 14px;
      animation-delay: 0.22s;
    }
  }

  @keyframes wn-bounce {
    0%,
    100% {
      transform: scaleY(0.45);
      opacity: 0.65;
    }
    50% {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  .sound-card__slider {
    :deep(.el-slider__runway) {
      background-color: rgba($wn-primary-color, 0.4);
    }
    :deep(.el-slider__bar) {
      background-color: $wn-primary-color;
    }
    :deep(.el-slider__button) {
      border-color: $wn-primary-color;
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  }
}
</style>
