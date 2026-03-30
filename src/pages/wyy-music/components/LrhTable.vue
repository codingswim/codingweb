<script setup lang="ts">
import { toRefs } from "vue";
import type { SimpleMusicItem } from "@/pages/wyy-music/types/music";

const props = withDefaults(
  defineProps<{
    list: SimpleMusicItem[];
    loading: boolean;
  }>(),
  {
    list: () => [],
    loading: false,
  }
);

const { list, loading } = toRefs(props);
const emit = defineEmits(["select"]);

const handleSelectMusic = (music: SimpleMusicItem) => {
  emit("select", music);
};
</script>

<template>
  <div>
    <el-table
      row-key="id"
      :data="list"
      height="80vh"
      style="width: 100%"
      v-loading="loading"
      highlight-current-row
      current-row-key="id"
      @row-click="handleSelectMusic"
    >
      <!-- <el-table-column prop="id" label="ID" /> -->
      <el-table-column prop="name" label="歌曲名" />
      <el-table-column prop="artistName" label="歌手" />
      <el-table-column prop="albumName" label="专辑名" />
    </el-table>
  </div>
</template>

<style scoped lang="scss">
p {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #999;
}
</style>
