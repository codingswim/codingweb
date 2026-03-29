<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Header from "./components/Header.vue";
import { getLiRongHaoSongs, getLyric, getSongUrl } from "@/api/music";
import type { MusicItem } from "@/types/music";

const musicList = ref<MusicItem[]>([]);
const currentSong = ref<MusicItem | null>(null);

// 获取audio标签
const audioRef = ref<HTMLAudioElement | null>(null);
const audioUrl = ref<string>(""); // 播放地址
const currentTime = ref<number>(0); // 当前播放时间
const duration = ref<number>(0); // 歌曲总时长
const isPlaying = ref<boolean>(false); // 是否正在播放

const fetchMusicList = async () => {
  try {
    // 获取所有歌曲
    const allRes = await getLiRongHaoSongs();
    // 检查响应数据
    if (
      allRes.data.code !== 200 ||
      !allRes.data.songs ||
      allRes.data.songs.length === 0
    ) {
      console.error("获取歌曲列表失败或无数据");
      return;
    }

    // 过滤出可播放的歌曲（检查 privilege 是否存在且 st === 0）
    const playableSongs = allRes.data.songs.filter((item: MusicItem) => {
      return item.privilege?.st === 0;
    });
    musicList.value = playableSongs;

    // 播放第一首歌曲（检查是否有可播放的歌曲）
    if (musicList.value.length === 0) {
      console.warn("没有可播放的歌曲");
      return;
    }
    currentSong.value = musicList.value[0];
  } catch (error) {
    console.error(error);
    isPlaying.value = false;
  }
};

// 获取播放地址
const fetchSongUrl = async (songId: number) => {
  if (!songId) return;
  try {
    const { data } = await getSongUrl(songId);
    if (data.code === 200 && data.data.length > 0) {
      audioUrl.value = data.data[0].url || "";
      currentTime.value = 0;
      duration.value = 0;
      isPlaying.value = false;
    }
  } catch (error) {
    console.error(error);
    audioUrl.value = "";
    isPlaying.value = false;
  }
};

// 获取歌词
const fetchLyric = async (songId: number) => {
  if (!songId) return;
  try {
    const { data } = await getLyric(songId);
    if (data.code === 200) {
    }
  } catch (error) {
    console.error(error);
  }
};

watch(currentSong, (newSong) => {
  if (newSong) {
    fetchSongUrl(newSong.id); // 获取播放地址
    fetchLyric(newSong.id); // 获取歌词
  }
});

// 加载歌曲元数据
const handleLoadedMetadata = () => {
  const audio = audioRef.value;
  if (!audio) return;
  duration.value = audio.duration || 0;
  currentTime.value = audio.currentTime || 0;
};

// 格式化时间
const formatTime = (sec: number) => {
  if (!sec || !Number.isFinite(sec)) return "00:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = rs.toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const handleProgressClick = (event: MouseEvent) => {
  const bar = event.currentTarget as HTMLElement;
  if (!bar) return;
  const rect = bar.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  const audio = audioRef.value;
  const newTime = duration.value * ratio;
  if (!audio) return;
  audio.currentTime = newTime;
  currentTime.value = newTime;
};

// 歌曲播放结束
const handleAudioEnded = () => {
  isPlaying.value = false;
};

// 歌曲播放时间更新
const handleTimeUpdate = () => {
  const audio = audioRef.value;
  if (!audio) return;
  currentTime.value = audio.currentTime || 0;
  if (audio.duration) {
    duration.value = audio.duration;
  }
};

// 播放音乐事件
const handleTogglePlay = () => {
  const audio = audioRef.value;
  if (!audio || !audioUrl.value) return;
  if (audio.paused) {
    audio
      .play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch(() => {});
  } else {
    audio.pause();
    isPlaying.value = false;
  }
};

const handlePrev = () => {
  if (!currentSong.value) return;
  const currentIndex = musicList.value.indexOf(currentSong.value);
  if (currentIndex === 0) return;
  currentSong.value = musicList.value[currentIndex - 1];
};

const handleNext = () => {
  if (!currentSong.value) return;
  const currentIndex = musicList.value.indexOf(currentSong.value);
  if (currentIndex === musicList.value.length - 1) return;
  currentSong.value = musicList.value[currentIndex + 1];
};

onMounted(() => {
  fetchMusicList();
});
</script>

<template>
  <div class="wrapper">
    <Header />
    <div class="title"></div>
    <div class="main">
      <div
        v-for="song in musicList"
        :key="song.id"
        class="song-item"
        @click="currentSong = song"
      >
        <span>{{ song.name }} - {{ song.ar[0].name }}</span>
      </div>
    </div>

    <!-- 播放控制条 -->
    <div class="player-controls" v-if="currentSong">
      <div class="progress-wrap">
        <span class="time-label">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="handleProgressClick">
          <div
            class="progress-inner"
            :style="{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }"
          ></div>
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
      ></audio>

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
          <div @click="handlePrev">
            <el-icon><CaretLeft /></el-icon>
          </div>
          <div @click="handleTogglePlay">
            <el-icon v-if="isPlaying"><VideoPause /></el-icon>
            <el-icon v-else><VideoPlay /></el-icon>
          </div>
          <div @click="handleNext">
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100vh;
  background: url(@/assets/images/wyybg.png) no-repeat center / cover;

  .title {
    width: 500px;
    height: 82px;
    margin: 60px auto;
    background: url(@/assets/images/wyytitle.png) no-repeat center / cover;
  }

  .main {
    width: 100%;
    margin: 0 auto;
    color: #fff;
    font-size: 24px;
    line-height: 42px;
    padding: 0 32px;
    position: relative;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;

    .song-item {
      margin-bottom: 20px;
      text-align: center;
    }
  }

  .player-controls {
    width: 80%;
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    margin: 0 auto;
    padding: 16px 24px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .audio-hidden {
    display: none;
  }

  .controls-main {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .btn-circle {
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: #fff;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  }

  .btn-large {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }

  .btn-small {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .btn-circle:hover {
    transform: translateY(-1px);
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

    // 滑过放大
    &:hover {
      transform: scale(1, 1.6);
    }
  }

  .progress-inner {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff4b2b, #ff416c);
  }

  .controls-extra {
    display: none;
  }

  .extra-left,
  .extra-right {
    display: none;
  }

  .btn-text {
    display: none;
  }

  .btn-text:hover {
    color: #fff;
  }

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
      text-align: left;
      justify-content: flex-start;
      div:first-child {
        font-size: 16px;
        font-weight: 500;
      }

      div:nth-child(2) {
        color: #e60026;
        position: relative;
        // 加个伪元素在右上方，内容是 100w+
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
      text-align: center;
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
}
</style>
