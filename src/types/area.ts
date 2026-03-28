// src/types/area.ts

/**
 * 郑州各区域信息 类型定义（TS 严格校验）
 */
export interface ZhengzhouAreaInfo {
    code: string;        // 和风天气城市编码
    population: number;  // 常住人口（单位：万人）
    area: number;        // 行政区划面积（单位：平方公里 km²）
}
/**
 * 郑州各区域完整信息对象
 */
export const zhengzhouAreaMap: Record<string, ZhengzhouAreaInfo> = {
    中原区: { code: "101180102", population: 98.57, area: 195 },
    二七区: { code: "101180103", population: 109.20, area: 159 },
    管城回族区: { code: "101180104", population: 83.48, area: 107 },
    金水区: { code: "101180105", population: 222.45, area: 136.66 },
    上街区: { code: "101180106", population: 20.09, area: 61.73 },
    惠济区: { code: "101180107", population: 59.17, area: 232.8 },
    新郑市: { code: "101180108", population: 121.74, area: 701.74 },
    登封市: { code: "101180109", population: 72.68, area: 1217 },
    新密市: { code: "101180110", population: 82.51, area: 1001 },
    荥阳市: { code: "101180111", population: 73.78, area: 943 },
    巩义市: { code: "101180112", population: 80.01, area: 1042.6 },
    中牟县: { code: "101180113", population: 146.41, area: 1393 }
};