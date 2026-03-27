import { defineStore } from 'pinia'
import { getSevenDayWeather, getHourlyWeather } from '@/api/qweatherapi'
import { ref, watchEffect } from 'vue'

// 区域名称到城市代码的映射（示例数据，需要根据实际情况修改）
const areaCodeMap: Record<string, string> = {
    中原区: "101180102",
    二七区: "101180103",
    管城回族区: "101180104",
    金水区: "101180105",
    上街区: "101180106",
    惠济区: "101180107",
    新郑市: "101180108",
    登封市: "101180109",
    新密市: "101180110",
    荥阳市: "101180111",
    巩义市: "101180112",
    中牟县: "101180113",
};

// 未来7天天气数据接口
interface Next7DaysWeatherResponse {
    fxDate: string;
    tempMax: number;
    tempMin: number;
}

// 未来7小时天气数据接口
interface Next7HoursWeatherResponse {
    fxTime: string;
    temp: number;
    icon: string;
    text: string;
    windDir: string;
}

// 未来7天天气数据
interface Next7DaysWeatherData {
    date: string;
    high: number;
    low: number;
}

// 未来7小时天气数据
interface Next7HoursWeatherData {
    fxTime: string;
    temp: number;
    icon: string;
    text: string;
    windDir: string;
}


export const useWeatherDashboardStore = defineStore('weatherDashboard', () => {
    const loading = ref(false)

    const cityName = ref("中原区");
    const setCityName = (name: string) => {
        cityName.value = name;
    }

    // 未来7天天气数据
    const next7DaysWeather = ref<Next7DaysWeatherData[]>([])
    // 未来7小时天气数据
    const next7HoursWeather = ref<Next7HoursWeatherData[]>([])

    /*
        应该做一个缓存，比如几分钟内不请求，直接从缓存中取
    */


    // 获取未来7天天气数据
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

    // 获取未来7小时天气数据
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

    const handleFetch = async (areaCode: string) => {
        loading.value = true;
        try {
            await Promise.all([fetchNext7DaysWeather(areaCode), fetchNext7HoursWeather(areaCode)]);
        } finally {
            loading.value = false;
        }
    }

    watchEffect(() => {
        handleFetch(areaCodeMap[cityName.value]);
    })

    return {
        loading,
        cityName,
        setCityName,

        next7DaysWeather,
        fetchNext7DaysWeather,

        next7HoursWeather,
        fetchNext7HoursWeather,
    }
})