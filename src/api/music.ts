import axios from "axios";
import { HotSongsApiResponse, SongDetailApiResponse, LyricApiResponse, SongUrlApiResponse, HotSongsRequestParams } from "@/pages/wyy-music/types/music";
const API_URL = "https://api-wyy-coding.vercel.app";

/*
 * 获取李荣浩所有歌曲
*/

// Partial 把 HotSongsRequestParams 中的字段都变成可选的
export const getLiRongHaoSongs = async (params: Partial<HotSongsRequestParams> = {}) => {
    const { artist = 4292, limit = 9999 } = params; // 指定默认值
    return await axios.get<HotSongsApiResponse>(
        `${API_URL}/artist/songs?id=${artist}&limit=${limit}`
    );
}

/**
 * 获取歌曲信息
 */
export const getSongInfo = async (songId: number) => {
    return await axios.get<SongDetailApiResponse>(
        `${API_URL}/song/detail?ids=${songId}`
    );
}

/**
 * 获取歌词
 */
export const getLyric = async (songId: number) => {
    return await axios.get<LyricApiResponse>(
        `${API_URL}/lyric?id=${songId}`
    );
}
/**
 * 获取播放地址
 */
export const getSongUrl = async (songId: number) => {
    return await axios.get<SongUrlApiResponse>(
        `${API_URL}/song/url?id=${songId}`
    );
}
