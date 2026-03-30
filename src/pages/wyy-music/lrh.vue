<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getLiRongHaoSongs } from "@/api/music";
import type { SimpleMusicItem } from "@/pages/wyy-music/types/music";
import { toSimpleMusicItem } from "@/pages/wyy-music/converters";
import { useMusicList } from "@/pages/wyy-music/composables/useMusicList";
import LrhTable from "@/pages/wyy-music/components/LrhTable.vue";
import LrhDetail from "@/pages/wyy-music/components/LrhDetail.vue";

const currentMusic = ref<SimpleMusicItem | null>(null);

// 使用自定义 Hook 管理音乐列表
const { list, loading, error, fetchList } = useMusicList<SimpleMusicItem>({
  fetchFn: async () => {
    const res = await getLiRongHaoSongs();
    return res.data.songs.map(toSimpleMusicItem);
  },
  immediate: true,
  onError: (error) => {
    console.error("获取音乐列表失败:", error);
  },
});

watch(
  () => list.value,
  (newList) => {
    if (newList.length > 0) {
      currentMusic.value = newList[0];
    }
  }
);

onMounted(() => {
  fetchList();
});

const handleSelectMusic = (music: SimpleMusicItem) => {
  currentMusic.value = music;
};
</script>

<template>
  <div class="page">
    <div class="content">
      <div class="left">
        <LrhTable :list="list" :loading="loading" @select="handleSelectMusic" />
      </div>
      <div class="right">
        <LrhDetail :songId="currentMusic?.id!" :songName="currentMusic?.name!" />
      </div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  padding: 20px;
  box-sizing: border-box;
  .title {
    text-align: center;
  }

  .content {
    display: flex;
    padding: 0 100px;

    .left {
      width: 50%;
    }
    .right {
      flex: 1;
    }
  }
}
</style>
