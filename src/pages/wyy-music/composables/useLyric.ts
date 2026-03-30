import { ref, type Ref } from "vue";
import { getLyric } from "@/api/music";
import type { LyricLine } from "@/pages/wyy-music/types/music";
import { parseLrc } from "@/utils/lyric";

// 定义入参类型
export interface UseLyricOptions {
    songId: number;
    immediate?: boolean;
    onError?: (error: Error) => void;
}

// 定义返回值类型
export interface UseLyricReturn {
    /** 歌词文本 */
    lyric: Ref<string>;
    /** 歌词行数组 */
    lyricLines: Ref<LyricLine[]>;
    loading: Ref<boolean>;
    error: Ref<string | null>;
    /** 获取歌词函数 */
    fetch: (songId?: number) => Promise<void>;
    /** 清空歌词 */
    clear: () => void;
    /** 是否有歌词 */
    hasLyric: Ref<boolean>;
}

// hook 实现
export const useLyric = (options: UseLyricOptions): UseLyricReturn => {
    const lyric = ref("");
    const lyricLines = ref<LyricLine[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const hasLyric = ref(false);

    const fetch = async (songId?: number) => {
        try {
            loading.value = true;
            error.value = null;
            const id = songId ?? options.songId;
            if (!id) {
                throw new Error("歌曲 ID 不能为空");
            }
            const { data } = await getLyric(id);
            if (data.code === 200 && data.lrc?.lyric) {
                lyric.value = data.lrc.lyric;
                lyricLines.value = parseLrc(data.lrc.lyric);
                hasLyric.value = true;
            } else {
                throw new Error("获取歌词失败");
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "未知错误";
            error.value = errorMsg;
            hasLyric.value = false;
            options.onError?.(new Error(errorMsg));
        } finally {
            loading.value = false;
        }
    }
    /**
        * 清空歌词
        */
    const clear = () => {
        lyric.value = "";
        lyricLines.value = [];
        error.value = null;
        hasLyric.value = false;
    };

    /**
     * 初始化时立即获取歌词，默认 false
     */
    if (options.immediate) {
        fetch();
    }

    return {
        lyric,
        lyricLines,
        loading,
        error,
        fetch,
        clear,
        hasLyric,
    }
}