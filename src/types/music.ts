
/*
 * 歌手类型
*/
export interface Artist {
    id: number;
    name: string;
}

/*
 * 专辑类型
*/
export interface Album {
    id: number;
    name: string;
    picUrl?: string;
}

/*
 * 音乐项类型
*/
export interface MusicItem {
    id: number;
    name: string;
    al: Album;
    ar: Artist[];
    privilege: {
        st: number; // 0: 免费 1: 付费
    }
}

/*
 * 热门歌曲 API 响应类型
*/
export interface HotSongsApiResponse {
    code: number;
    songs: MusicItem[];
    [key: string]: any; // 其他字段不管
}

/**
 * 歌曲详情 API 响应类型
*/
export interface SongDetailApiResponse {
    code: number;
    songs: MusicItem[];
    [key: string]: any;
}

/**
 * 歌曲歌词 API 响应类型
*/
export interface LyricApiResponse {
    code: number;
    lrc: {
        lyric: string;
    };
    [key: string]: any;
}

/**
 * 歌曲播放地址 API 响应类型
*/
export interface SongUrlApiResponse {
    code: number;
    data: {
        id: number;
        url: string;
    }[];
    [key: string]: any;
}

/**
 * 歌词字符类型
*/
export interface LyricChar {
    char: string;
    index: number;
}

/**
 * 歌词行类型
*/
export interface LyricLine {
    time: number;
    text: string;
}
