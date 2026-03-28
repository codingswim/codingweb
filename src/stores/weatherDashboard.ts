import { defineStore } from 'pinia'
import { getSevenDayWeather, getHourlyWeather, getWeatherNow } from '@/api/qweatherapi'
import { ref, watchEffect } from 'vue'

// 👇 类型导入
import type { Next7DaysWeatherResponse, Next7HoursWeatherResponse, Next7DaysWeatherData, Next7HoursWeatherData, WeatherNowData, WeatherCache } from '@/types/weather'
// 👇 导入区域数据
import { zhengzhouAreaMap } from '@/types/area'


// 👇 缓存过期时间：5分钟（毫秒）
const CACHE_EXPIRE_TIME = 5 * 60 * 1000;

// 👇 定义天气看板状态
export const useWeatherDashboardStore = defineStore('weatherDashboard', () => {
    const loading = ref(false)
    const cityName = ref("中原区")

    // 实时天气
    const weatherNow = ref<WeatherNowData>({ temp: "", icon: "", text: "", windDir: "", windScale: "", humidity: "" })
    // 7天天气
    const next7DaysWeather = ref<Next7DaysWeatherData[]>([])
    // 7小时天气
    const next7HoursWeather = ref<Next7HoursWeatherData[]>([])

    // ===================== 3. 缓存容器（核心） =====================
    const weatherCache = ref<Record<string, WeatherCache>>({})

    // ===================== 4. 缓存工具函数 =====================
    // 判断缓存是否有效
    const isCacheValid = (areaCode: string): boolean => {
        const cache = weatherCache.value[areaCode];
        if (!cache) return false;
        // 当前时间 - 缓存时间 < 过期时间 → 有效
        return Date.now() - cache.timestamp < CACHE_EXPIRE_TIME;
    };

    // 写入缓存
    const setWeatherCache = (areaCode: string) => {
        weatherCache.value[areaCode] = {
            weatherNow: { ...weatherNow.value },
            next7DaysWeather: [...next7DaysWeather.value],
            next7HoursWeather: [...next7HoursWeather.value],
            timestamp: Date.now(),
        };
    };

    // 从缓存读取数据
    const getWeatherFromCache = (areaCode: string) => {
        const cache = weatherCache.value[areaCode];
        weatherNow.value = cache.weatherNow;
        next7DaysWeather.value = cache.next7DaysWeather;
        next7HoursWeather.value = cache.next7HoursWeather;
    };

    // ===================== 原有请求逻辑（无修改） =====================
    const fetchNext7DaysWeather = async (areaCode: string) => {
        const res = await getSevenDayWeather(areaCode);
        if (res.status == 200) {
            const daily = res.data.daily.map((item: Next7DaysWeatherResponse) => ({
                date: item.fxDate.slice(5, 10),
                high: item.tempMax,
                low: item.tempMin,
            }));
            next7DaysWeather.value = daily;
        }
    }

    const fetchNext7HoursWeather = async (areaCode: string) => {
        const res = await getHourlyWeather(areaCode);
        if (res.status == 200) {
            const data = res.data.hourly.slice(0, 7).map((item: Next7HoursWeatherResponse) => ({
                fxTime: new Date(item.fxTime).getHours() + ":00",
                temp: Number(item.temp),
                icon: item.icon,
                text: item.text,
                windDir: item.windDir,
            }));
            next7HoursWeather.value = data;
        }
    }

    const fetchWeatherNow = async (areaCode: string) => {
        const res = await getWeatherNow(areaCode);
        if (res.status == 200) {
            weatherNow.value = res.data.now;
        }
    }

    // ===================== 5. 核心：带缓存的请求方法 =====================
    const handleFetch = async (areaCode: string) => {
        // 1. 缓存命中 → 直接读取，不请求
        if (isCacheValid(areaCode)) {
            getWeatherFromCache(areaCode);
            return;
        }

        // 2. 缓存未命中/已过期 → 发起请求
        loading.value = true;
        try {
            await Promise.all([
                fetchNext7DaysWeather(areaCode),
                fetchNext7HoursWeather(areaCode),
                fetchWeatherNow(areaCode)
            ]);
            // 请求成功 → 写入缓存
            setWeatherCache(areaCode);
        } finally {
            loading.value = false;
        }
    }

    const setCityName = (name: string) => {
        cityName.value = name;
    }

    // 监听城市变化，触发带缓存的请求
    watchEffect(() => {
        handleFetch(zhengzhouAreaMap[cityName.value].code);
    })


    // ===================== 6. 返回状态和方法 =====================
    return {
        loading,
        cityName,
        setCityName,
        weatherNow,
        next7DaysWeather,
        next7HoursWeather,
        weatherCache,
    }
})