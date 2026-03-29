<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from "vue";
import Header from "./components/Header.vue";
import { getLiRongHaoSongs, getLyric, getSongUrl } from "@/api/music";
import type { MusicItem, LyricChar, LyricLine } from "@/types/music";
import { parseLrc, splitLyricIntoChars, formatTime } from "@/utils/lyric";
import Title from "./components/Title.vue";
import MusicList from "./components/MusicList.vue";
import LyricAnimate from "./components/LyricAnimate.vue";
import PlayerControls from "./components/PlayerControls.vue";

// 常量抽离 便于维护
const API_SUCCESS_CODE = 200;
const SONG_PLAYABLE_ST = 0;

// ====================== 歌曲数据 ======================
const musicList = ref<MusicItem[]>([]);
const currentSong = ref<MusicItem | null>(null);

// ====================== 播放相关 自动类型推导精简 ======================
const audioRef = ref<HTMLAudioElement | null>(null);
const audioUrl = ref("");
const currentTime = ref(0);
const duration = ref(0);
const isPlaying = ref(false);

// 进度条 计算属性 优化模板
const progressWidth = computed(() => {
  if (!duration.value) return "0%";
  return `${(currentTime.value / duration.value) * 100}%`;
});

// ====================== 歌词相关 ======================
const lyricLines = ref<LyricLine[]>([]);
const currentLyricText = ref("");
const currentLyricChars = ref<LyricChar[]>([]);

// ====================== 请求锁 防止快速切歌并发错乱 ======================
let isSwitching = false;

// 获取歌词
const fetchLyric = async (songId?: number) => {
  if (!songId) return;
  try {
    const { data } = await getLyric(songId);
    lyricLines.value =
      data.code === API_SUCCESS_CODE && data.lrc?.lyric ? parseLrc(data.lrc.lyric) : [];
  } catch (err) {
    console.error("获取歌词失败：", err);
    lyricLines.value = [];
  }
  currentLyricText.value = "";
};

// 更新当前歌词
const updateCurrentLyric = () => {
  if (!lyricLines.value.length) {
    currentLyricText.value = "";
    return;
  }
  for (let i = lyricLines.value.length - 1; i >= 0; i--) {
    if (lyricLines.value[i].time <= currentTime.value) {
      currentLyricText.value = lyricLines.value[i].text;
      return;
    }
  }
  currentLyricText.value = "";
};

// ====================== 歌曲接口 ======================
const fetchMusicList = async () => {
  try {
    const { data } = await getLiRongHaoSongs();
    if (data.code !== API_SUCCESS_CODE || !data.songs) return;
    musicList.value = data.songs.filter(
      (item) => item.privilege?.st === SONG_PLAYABLE_ST
    );
    if (musicList.value.length) currentSong.value = musicList.value[0];
  } catch (err) {
    console.error("获取歌单失败：", err);
  }
};

const fetchSongUrl = async (songId?: number) => {
  if (!songId) return;
  try {
    const { data } = await getSongUrl(songId);
    if (data.code === API_SUCCESS_CODE && data.data.length) {
      audioUrl.value = data.data[0].url || "";
      // 切换歌曲后自动播放
      await nextTick();
      if (audioRef.value) {
        await audioRef.value.play();
        isPlaying.value = true;
      }
    }
  } catch (err) {
    console.error("获取播放地址失败：", err);
  }
};

// ====================== 音频事件 ======================
const handleLoadedMetadata = () => {
  if (audioRef.value) duration.value = audioRef.value.duration || 0;
};

const handleTimeUpdate = () => {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime || 0;
};

// 播放结束自动下一首
const handleAudioEnded = () => {
  isPlaying.value = false;
  handleNext();
};

const handleProgressClick = (event: MouseEvent) => {
  const bar = event.currentTarget as HTMLElement;
  const audio = audioRef.value;
  if (!audio || !duration.value) return;

  const rect = bar.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  audio.currentTime = duration.value * ratio;
  currentTime.value = audio.currentTime;
};

// ====================== 播放控制 ======================
const handleTogglePlay = async () => {
  const audio = audioRef.value;
  if (!audio || !audioUrl.value) return;

  if (audio.paused) {
    await audio.play();
    isPlaying.value = true;
  } else {
    audio.pause();
    isPlaying.value = false;
  }
};

const handlePrev = () => {
  if (!currentSong.value) return;
  const idx = musicList.value.findIndex((s) => s.id === currentSong.value!.id);
  if (idx > 0) currentSong.value = musicList.value[idx - 1];
};

const handleNext = () => {
  if (!currentSong.value) return;
  const idx = musicList.value.findIndex((s) => s.id === currentSong.value!.id);
  if (idx < musicList.value.length - 1) {
    currentSong.value = musicList.value[idx + 1];
  }
};

// 子组件选中歌曲
const handleSelectSong = (song: MusicItem) => {
  currentSong.value = song;
};

// ====================== 侦听器优化 ======================
// 歌词拆字
watch(currentLyricText, (text) => {
  currentLyricChars.value = splitLyricIntoChars(text);
});

// 高频timeupdate 简易节流优化
let lyricTimer: number | null = null;
watch(currentTime, () => {
  if (lyricTimer) return;
  lyricTimer = window.setTimeout(() => {
    updateCurrentLyric();
    lyricTimer = null;
  }, 80);
});

// 切歌统一处理 + 防并发 + 停止旧音频
watch(currentSong, async (song) => {
  if (!song || isSwitching) return;
  isSwitching = true;

  if (audioRef.value) audioRef.value.pause();
  isPlaying.value = false;
  currentTime.value = 0;

  await Promise.all([fetchSongUrl(song.id), fetchLyric(song.id)]);

  isSwitching = false;
});

onMounted(() => {
  fetchMusicList();
});
</script>

<template>
  <div class="wrapper">
    <Header />
    <Title />

    <MusicList
      :music-list="musicList"
      :current-song="currentSong"
      @select-song="handleSelectSong"
    />

    <LyricAnimate
      :current-lyric-text="currentLyricText"
      :current-lyric-chars="currentLyricChars"
      :is-playing="isPlaying"
    />

    <div class="player-controls" v-if="currentSong">
      <div class="progress-wrap">
        <span class="time-label">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="handleProgressClick">
          <div class="progress-inner" :style="{ width: progressWidth }"></div>
        </div>
        <span class="time-label">{{ formatTime(duration) }}</span>
      </div>

      <audio
        :src="audioUrl"
        v-if="audioUrl"
        ref="audioRef"
        class="audio-hidden"
        @loadedmetadata="handleLoadedMetadata"
        @timeupdate="handleTimeUpdate"
        @ended="handleAudioEnded"
      />

      <PlayerControls
        :current-song="currentSong"
        :is-playing="isPlaying"
        @toggle-play="handleTogglePlay"
        @prev="handlePrev"
        @next="handleNext"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100vh;
  background: url(@/assets/images/wyybg.png) no-repeat center / cover;
  background-size: cover;
  background-position: center;
}

.player-controls {
  width: 80%;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  margin: auto;
  padding: 16px 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audio-hidden {
  display: none;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-label {
  font-size: 12px;
  color: #c0c0c0;
}

.progress-bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;

  &:hover {
    transform: scaleY(1.6);
    cursor: pointer;
  }
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #ff4b2b, #ff416c);
  border-radius: 999px;
}
</style>
