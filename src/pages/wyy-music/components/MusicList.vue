<script setup lang="ts">
import type { MusicItem } from "@/pages/wyy-music/types/music";

// 接收父组件传递的数据
const props = withDefaults(
  defineProps<{
    musicList: MusicItem[];
    currentSong: MusicItem | null;
  }>(),
  {
    // 默认值为空数组
    musicList: () => [],
    // 默认值为 null
    currentSong: null,
  }
);

// 定义可以向父组件触发的事件
const emit = defineEmits(["selectSong"]);

const handleSelectSong = (song: MusicItem) => {
  // 向父组件传递歌曲数据
  emit("selectSong", song);
};
</script>

<template>
  <div class="main">
    <div
      v-for="song in props.musicList"
      :key="song.id"
      class="song-item"
      :class="{ active: props.currentSong && song.id === props.currentSong.id }"
    >
      <span @click="handleSelectSong(song)">
        {{ song.name }} - {{ song.ar[0].name }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main {
  width: 100%;
  padding: 0 32px;
  color: #fff;
  font-size: 24px;
  line-height: 42px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  .song-item {
    text-align: center;
    cursor: pointer;
  }

  .active {
    font-size: 36px;
    color: #e60026;
  }
}
</style>
