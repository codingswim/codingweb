import type { MusicItem, SimpleMusicItem } from "@/pages/wyy-music/types/music";

/**
 * 将完整的 MusicItem 转换为精简的 SimpleMusicItem
 * @param item 完整的音乐项（参数 + 类型	接收一个 MusicItem 类型的参数）
 * @returns 精简的音乐项（返回值类型	返回一个 SimpleMusicItem 类型的值）
 */
export function toSimpleMusicItem(item: MusicItem): SimpleMusicItem {
    return {
        id: item.id,
        name: item.name,
        artistName: item.ar?.[0]?.name || "-",
        albumName: item.al?.name || "-",
    };
}