<script setup lang="ts">
import { toRefs } from "vue";
import type { MusicItem } from "@/types/music";
import {
  StarFilled,
  ChatLineRound,
  CaretLeft,
  CaretRight,
  VideoPause,
  VideoPlay,
} from "@element-plus/icons-vue";

const emit = defineEmits(["toggle-play", "prev", "next"]);
const props = withDefaults(
  defineProps<{
    currentSong: MusicItem | null;
    isPlaying: boolean;
  }>(),
  {
    currentSong: null,
    isPlaying: false,
  }
);
const { currentSong, isPlaying } = toRefs(props);

</script>

<template>
  <div class="controls_main">
    <div class="control controls_left">
      <div>
        <h3>{{ currentSong?.name }}</h3>
        <p>{{ currentSong?.ar[0].name }}</p>
      </div>
      <div>
        <el-icon><StarFilled /></el-icon>
      </div>
      <div>
        <el-icon><ChatLineRound /></el-icon>
      </div>
    </div>
    <div class="control controls_center">
      <div @click="emit('prev')">
        <el-icon><CaretLeft /></el-icon>
      </div>
      <div @click="emit('toggle-play')">
        <el-icon v-if="isPlaying"><VideoPause /></el-icon>
        <el-icon v-else><VideoPlay /></el-icon>
      </div>
      <div @click="emit('next')">
        <el-icon><CaretRight /></el-icon>
      </div>
    </div>
    <div class="control controls_right">
      <div>超清母带</div>
      <div>
        <el-icon><FirstAidKit /></el-icon>
      </div>
      <div>
        <el-icon><Share /></el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.controls_main {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  .control {
    display: flex;
    align-items: center;
    color: #c0c0c0;
    font-size: 30px;
    gap: 30px;
  }
  .controls_left {
    justify-content: flex-start;
    div:first-child {
      font-size: 16px;
      font-weight: 500;
    }
    div:nth-child(2) {
      color: #e60026;
      position: relative;
      &::after {
        content: "10w+";
        position: absolute;
        top: 5px;
        right: -10px;
        font-size: 10px;
        color: #fff;
      }
    }
  }
  .controls_center {
    justify-content: center;
    font-size: 50px;
    div {
      cursor: pointer;
    }
    div:hover {
      color: #e60026;
      transform: scale(1.1);
    }
  }
  .controls_right {
    text-align: right;
    justify-content: flex-end;
    div:first-child {
      font-size: 16px;
      font-weight: 500;
      border: 1px solid #c0c0c0;
      padding: 2px;
      border-radius: 5px;
    }
  }
}
</style>
