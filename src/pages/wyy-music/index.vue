<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Header from "./components/Header.vue";
import { getLiRongHaoSongs, getLyric, getSongUrl } from "@/api/music";
import type { MusicItem } from "@/types/music";

const musicList = ref<MusicItem[]>([]);
const currentSong = ref<MusicItem | null>(null);

// 播放相关
const audioRef = ref<HTMLAudioElement | null>(null);
const audioUrl = ref<string>("");
const currentTime = ref<number>(0);
const duration = ref<number>(0);
const isPlaying = ref<boolean>(false);

// 歌词相关
const lyricLines = ref<{ time: number; text: string }[]>([]);
const currentLyricText = ref<string>("");

// 解析 LRC 歌词，返回带秒数的数组
const parseLrc = (raw: string): { time: number; text: string }[] => {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const result: { time: number; text: string }[] = [];

  // 时间标签正则：[mm:ss.xx] 或 [mm:ss.xx]
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    if (!line.trim()) continue;

    // 提取所有时间标签
    let match;
    const times: number[] = [];
    let lastIndex = 0;
    let textStart = -1;

    // 先找到所有时间标签的位置
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseInt(match[3], 10) : 0;
      // 兼容毫秒为2位或3位
      const totalSeconds =
        minutes * 60 + seconds + millis / (match[3].length === 2 ? 100 : 1000);
      times.push(totalSeconds);
      lastIndex = match.index + match[0].length;
    }

    // 获取歌词文本（去掉所有时间标签后的内容）
    let text = line.replace(timeRegex, "").trim();
    if (!text) continue; // 跳过只有时间标签的空行

    // 为每个时间戳生成一条记录
    for (const t of times) {
      result.push({ time: t, text });
    }
  }

  // 按时间排序（防止原始文件乱序）
  result.sort((a, b) => a.time - b.time);
  return result;
};

// 获取歌词并解析
const fetchLyric = async (songId: number) => {
  if (!songId) return;
  try {
    const { data } = await getLyric(songId);
    if (data.code === 200 && data.lrc?.lyric) {
      lyricLines.value = parseLrc(data.lrc.lyric);
    } else {
      lyricLines.value = [];
    }
    currentLyricText.value = ""; // 切换歌曲时清空当前歌词
  } catch (error) {
    console.error(error);
    lyricLines.value = [];
    currentLyricText.value = "";
  }
};

// 根据当前播放时间更新当前歌词
const updateCurrentLyric = () => {
  if (!lyricLines.value.length) {
    currentLyricText.value = "";
    return;
  }

  let matchedLyric = "";
  // 从后往前找第一个时间 <= currentTime 的歌词
  for (let i = lyricLines.value.length - 1; i >= 0; i--) {
    if (lyricLines.value[i].time <= currentTime.value) {
      matchedLyric = lyricLines.value[i].text;
      break;
    }
  }
  currentLyricText.value = matchedLyric;
};

// 监听播放时间变化，更新歌词
watch(currentTime, () => {
  updateCurrentLyric();
});

// 歌曲切换时重新获取歌词
watch(currentSong, (newSong) => {
  if (newSong) {
    fetchSongUrl(newSong.id);
    fetchLyric(newSong.id);
    // 重置播放状态
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      currentTime.value = 0;
    }
    isPlaying.value = false;
  }
});

// ---------- 以下为原有的音乐列表、播放控制逻辑 ----------
const fetchMusicList = async () => {
  try {
    const allRes = await getLiRongHaoSongs();
    if (
      allRes.data.code !== 200 ||
      !allRes.data.songs ||
      allRes.data.songs.length === 0
    ) {
      console.error("获取歌曲列表失败或无数据");
      return;
    }

    const playableSongs = allRes.data.songs.filter((item: MusicItem) => {
      return item.privilege?.st === 0;
    });
    musicList.value = playableSongs;

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

const handleLoadedMetadata = () => {
  const audio = audioRef.value;
  if (!audio) return;
  duration.value = audio.duration || 0;
  currentTime.value = audio.currentTime || 0;
};

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

const handleAudioEnded = () => {
  isPlaying.value = false;
};

const handleTimeUpdate = () => {
  const audio = audioRef.value;
  if (!audio) return;
  currentTime.value = audio.currentTime || 0;
  if (audio.duration) {
    duration.value = audio.duration;
  }
};

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

    <!-- 当前歌词显示层（屏幕中央最上层） -->
    <Transition name="fade">
      <div v-if="currentLyricText" class="current-lyric">
        {{ currentLyricText }}
      </div>
    </Transition>
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
      transform: scale(1, 1.6);
      cursor: pointer;
    }
  }

  .progress-inner {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff4b2b, #ff416c);
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

/* 当前歌词样式：屏幕正中央，大字，半透明背景，不干扰点击 */
.current-lyric {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  font-size: 3rem; /* 大字体 */
  font-weight: bold;
  color: white;
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  padding: 0.8rem 2rem;
  border-radius: 3rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 85vw;
  pointer-events: none; /* 让歌词不干扰点击下面的按钮 */
  letter-spacing: 1px;
  transition: all 0.2s ease;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 歌词淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
