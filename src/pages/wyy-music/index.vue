<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Header from "./components/Header.vue";
import { getLiRongHaoSongs, getLyric, getSongUrl } from "@/api/music";
import type { MusicItem, LyricChar } from "@/types/music";
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
import Title from "./components/Title.vue";
import MusicList from "./components/MusicList.vue";
import LyricAnimate from "./components/LyricAnimate.vue";

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
const currentLyricChars = ref<LyricChar[]>([]);

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
      const totalSeconds =
        minutes * 60 + seconds + millis / (match[3].length === 2 ? 100 : 1000);
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

watch(audioUrl, (newUrl, oldUrl) => {
  // console.log("🚀 ~ oldUrl:", oldUrl);
  // console.log("🚀 ~ newUrl:", newUrl);
  // if (newUrl) {
  //   handleTogglePlay();
  // }
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
    const playableSongs = allRes.data.songs.filter(
      (item: MusicItem) => item.privilege?.st === 0
    );
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
  } catch (error) {
    console.error(error);
  }
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

const handleAudioEnded = () => {
  isPlaying.value = false;
};
const handleTimeUpdate = () => {
  const audio = audioRef.value;
  if (!audio) return;
  currentTime.value = audio.currentTime || 0;
};

const handleTogglePlay = () => {
  const audio = audioRef.value;
  if (!audio || !audioUrl.value) return;
  if (audio.paused) {
    audio.play().then(() => (isPlaying.value = true));
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
  }
};

const handleNext = () => {
  if (!currentSong.value) return;
  const idx = musicList.value.indexOf(currentSong.value);
  if (idx < musicList.value.length - 1) currentSong.value = musicList.value[idx + 1];
};

// 处理子组件触发的事件
const handleSelectSong = (song: MusicItem) => {
  currentSong.value = song;
};

onMounted(() => {
  fetchMusicList();
});
</script>

<template>
  <div class="wrapper">
    <!-- 头部导航 -->
    <Header />
    <!-- 标题 -->
    <Title />
    <!-- 音乐列表 父组件向子组件传递数据，子组件监听歌曲选择事件 -->
    <MusicList
      :musicList="musicList"
      :currentSong="currentSong"
      @selectSong="handleSelectSong"
    />

    <div class="player-controls" v-if="currentSong">
      <div class="progress-wrap">
        <span class="time-label">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="handleProgressClick">
          <div
            class="progress-inner"
            :style="{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }"
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

    <!-- 纯文字波浪动画（你要的极简效果） -->
    <LyricAnimate
      :currentLyricText="currentLyricText"
      :currentLyricChars="currentLyricChars"
    />
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100vh;
  background: url(@/assets/images/wyybg.png) no-repeat center / cover;

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
}

</style>
