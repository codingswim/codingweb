/**
 * 解析 LRC 歌词
 * @param raw LRC 歌词字符串
 * @returns 解析后的歌词数组
 */

export const parseLrc = (raw: string): { time: number; text: string }[] => {
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

/**
 * 拆分成单个文字
 * @param text 歌词字符串
 * @returns 拆分成的单个文字数组
 */
export const splitLyricIntoChars = (text: string) => {
  if (!text) return [];
  return text.split("").map((char, index) => ({ char, index }));
};


/**
 * 格式化时间
 * @param sec 时间秒数
 * @returns 格式化后的时间字符串
 */
export const formatTime = (sec: number) => {
  if (!sec || !Number.isFinite(sec)) return "00:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
};
