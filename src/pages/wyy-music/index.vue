<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Header from "./components/Header.vue";
import { getLiRongHaoSongs, getLyric, getSongUrl } from "@/api/music";
import type { MusicItem } from "@/types/music";
import {
  StarFilled,
  ChatLineRound,
  CaretLeft,
  VideoPause,
  VideoPlay,
  CaretRight,
  FirstAidKit,
  Share,
} from "@element-plus/icons-vue";

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
const currentLyricChars = ref<{ char: string; index: number }[]>([]);

// 解析 LRC 歌词
const parseLrc = (raw: string): { time: number; text: string }[] => {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const result: { time: number; text: string }[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    if (!line.trim()) continue;
    let match;
    const times: number[] = [];

    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseInt(match[3], 10) : 0;
      const totalSeconds = minutes * 60 + seconds + millis / (match[3].length === 2 ? 100 : 1000);
      times.push(totalSeconds);
    }

    let text = line.replace(timeRegex, "").trim();
    if (!text) continue;

    for (const t of times) {
      result.push({ time: t, text });
    }
  }
  result.sort((a, b) => a.time - b.time);
  return result;
};

// 拆分成单个文字
const splitLyricIntoChars = (text: string) => {
  if (!text) return [];
  return text.split("").map((char, index) => ({ char, index }));
};

// 获取歌词
const fetchLyric = async (songId: number) => {
  if (!songId) return;
  try {
    const { data } = await getLyric(songId);
    if (data.code === 200 && data.lrc?.lyric) {
      lyricLines.value = parseLrc(data.lrc.lyric);
    } else {
      lyricLines.value = [];
    }
    currentLyricText.value = "";
  } catch (error) {
    console.error(error);
    lyricLines.value = [];
    currentLyricText.value = "";
  }
};

// 更新当前歌词
const updateCurrentLyric = () => {
  if (!lyricLines.value.length) {
    currentLyricText.value = "";
    return;
  }
  let matchedLyric = "";
  for (let i = lyricLines.value.length - 1; i >= 0; i--) {
    if (lyricLines.value[i].time <= currentTime.value) {
      matchedLyric = lyricLines.value[i].text;
      break;
    }
  }
  currentLyricText.value = matchedLyric;
};

// 歌词变化时拆字
watch(currentLyricText, (newText) => {
  currentLyricChars.value = splitLyricIntoChars(newText);
});

// 监听播放时间
watch(currentTime, () => {
  updateCurrentLyric();
});

// 切换歌曲
watch(currentSong, (newSong) => {
  if (newSong) {
    fetchSongUrl(newSong.id);
    fetchLyric(newSong.id);
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      currentTime.value = 0;
    }
    isPlaying.value = false;
  }
});

// ---------- 播放逻辑 ----------
const fetchMusicList = async () => {
  try {
    const allRes = await getLiRongHaoSongs();
    if (allRes.data.code !== 200 || !allRes.data.songs) return;
    const playableSongs = allRes.data.songs.filter((item: MusicItem) => item.privilege?.st === 0);
    musicList.value = playableSongs;
    if (musicList.value.length) currentSong.value = musicList.value[0];
  } catch (error) {
    console.error(error);
  }
};

const fetchSongUrl = async (songId: number) => {
  if (!songId) return;
  try {
    const { data } = await getSongUrl(songId);
    if (data.code === 200 && data.data.length) {
      audioUrl.value = data.data[0].url || "";
    }
  } catch (error) { console.error(error); }
};

const handleLoadedMetadata = () => {
  const audio = audioRef.value;
  if (!audio) return;
  duration.value = audio.duration || 0;
};

const formatTime = (sec: number) => {
  if (!sec || !Number.isFinite(sec)) return "00:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
};

const handleProgressClick = (event: MouseEvent) => {
  const bar = event.currentTarget as HTMLElement;
  const rect = bar.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  const audio = audioRef.value;
  if (!audio) return;
  audio.currentTime = duration.value * ratio;
  currentTime.value = audio.currentTime;
};

const handleAudioEnded = () => { isPlaying.value = false; };
const handleTimeUpdate = () => {
  const audio = audioRef.value;
  if (!audio) return;
  currentTime.value = audio.currentTime || 0;
};

const handleTogglePlay = () => {
  const audio = audioRef.value;
  if (!audio || !audioUrl.value) return;
  if (audio.paused) {
    audio.play().then(() => isPlaying.value = true);
  } else {
    audio.pause();
    isPlaying.value = false;
  }
};

const handlePrev = () => {
  if (!currentSong.value) return;
  const idx = musicList.value.indexOf(currentSong.value);
  if (idx > 0) {
    currentSong.value = musicList.value[idx - 1];
  };
};

const handleNext = () => {
  if (!currentSong.value) return;
  const idx = musicList.value.indexOf(currentSong.value);
  if (idx < musicList.value.length - 1) currentSong.value = musicList.value[idx + 1];
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

    <div class="player-controls" v-if="currentSong">
      <div class="progress-wrap">
        <span class="time-label">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="handleProgressClick">
          <div class="progress-inner" :style="{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }"></div>
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
          <div><el-icon><StarFilled /></el-icon></div>
          <div><el-icon><ChatLineRound /></el-icon></div>
        </div>
        <div class="control controls_center">
          <div @click="handlePrev"><el-icon><CaretLeft /></el-icon></div>
          <div @click="handleTogglePlay">
            <el-icon v-if="isPlaying"><VideoPause /></el-icon>
            <el-icon v-else><VideoPlay /></el-icon>
          </div>
          <div @click="handleNext"><el-icon><CaretRight /></el-icon></div>
        </div>
        <div class="control controls_right">
          <div>超清母带</div>
          <div><el-icon><FirstAidKit /></el-icon></div>
          <div><el-icon><Share /></el-icon></div>
        </div>
      </div>
    </div>

    <!-- 纯文字波浪动画（你要的极简效果） -->
    <div class="lyric-wave-box" v-if="currentLyricText">
      <span
        v-for="item in currentLyricChars"
        :key="item.index"
        class="char-animate"
      >
        {{ item.char }}
      </span>
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

  .audio-hidden { display: none; }

  .progress-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .time-label { font-size: 12px; color: #c0c0c0; }
  .progress-bar {
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: rgba(255,255,255,0.2);
    overflow: hidden;
    &:hover { transform: scaleY(1.6); cursor: pointer; }
  }
  .progress-inner {
    height: 100%;
    background: linear-gradient(90deg, #ff4b2b, #ff416c);
    border-radius: 999px;
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
      div { cursor: pointer; }
      div:hover { color: #e60026; transform: scale(1.1); }
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

/* ====================== 你要的极简波浪动画 ====================== */
.lyric-wave-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 85vw;
  pointer-events: none;
  gap: 2px;
}

.char-animate {
  font-size: 6rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  font-family: "Microsoft YaHei", sans-serif;
  animation: wave 1.2s ease-in-out infinite;
}

/* 从左到右依次延迟，形成流动波浪 */
.char-animate:nth-child(1)  { animation-delay: 0s; }
.char-animate:nth-child(2)  { animation-delay: 0.1s; }
.char-animate:nth-child(3)  { animation-delay: 0.2s; }
.char-animate:nth-child(4)  { animation-delay: 0.3s; }
.char-animate:nth-child(5)  { animation-delay: 0.4s; }
.char-animate:nth-child(6)  { animation-delay: 0.5s; }
.char-animate:nth-child(7)  { animation-delay: 0.6s; }
.char-animate:nth-child(8)  { animation-delay: 0.7s; }
.char-animate:nth-child(9)  { animation-delay: 0.8s; }
.char-animate:nth-child(n+10){ animation-delay: 0.9s; }

@keyframes wave {
  0%  { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100%{ transform: translateY(0); }
}
</style>