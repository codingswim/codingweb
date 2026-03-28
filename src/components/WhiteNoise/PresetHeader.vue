<template>
  <div class="preset-header">
    <div class="preset-header__live">
      <span class="preset-header__pulse" aria-hidden="true" />
      <span class="preset-header__live-text">{{ $t("whiteNoise.live") }}</span>
    </div>
    <div class="preset-header__presets">
      <button
        v-for="p in presets"
        :key="p.id"
        type="button"
        class="preset-chip"
        :class="{ 'preset-chip--on': activePresetId === p.id }"
        @click="$emit('select', p.id)"
      >
        <span v-if="activePresetId === p.id" class="preset-chip__viz" aria-hidden="true">
          <span v-for="n in 3" :key="n" class="preset-chip__bar" />
        </span>
        <span class="preset-chip__label">{{ $t(`whiteNoise.presets.${p.id}`) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PresetDef } from "@/constants/whiteNoiseSounds";

defineProps<{
  presets: PresetDef[];
  activePresetId: string | null;
}>();

defineEmits<{
  select: [id: string];
}>();
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.preset-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 18px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba($wn-primary-color, 0.6);
  color: $wn-text-color;
}

.preset-header__live {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.preset-header__pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  animation: wn-pulse 2s ease-out infinite;
}

@keyframes wn-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.preset-header__live-text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: $wn-text-color;
}

.preset-header__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
}

.preset-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:hover {
    border-color: rgba($wn-primary-color, 0.35);
    background: rgba($wn-primary-color, 0.06);
  }

  &--on {
    border-color: rgba($wn-primary-color, 0.45);
    background: rgba($wn-primary-color, 0.5);
    font-weight: 500;
    color: #fff;
  }
}

.preset-chip__viz {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.preset-chip__bar {
  width: 2px;
  border-radius: 1px;
  background: $wn-primary-color;
  animation: wn-chip 0.85s ease-in-out infinite;

  &:nth-child(1) {
    height: 5px;
    animation-delay: 0s;
  }
  &:nth-child(2) {
    height: 10px;
    animation-delay: 0.12s;
  }
  &:nth-child(3) {
    height: 7px;
    animation-delay: 0.24s;
  }
}

@keyframes wn-chip {
  0%,
  100% {
    transform: scaleY(0.5);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>
