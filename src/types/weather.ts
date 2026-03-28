// src/types/weather.ts

/**
 * 和风天气接口响应类型
 */
export interface Next7DaysWeatherResponse {
    fxDate: string;
    tempMax: number;
    tempMin: number;
}

export interface Next7HoursWeatherResponse {
    fxTime: string;
    temp: number;
    icon: string;
    text: string;
    windDir: string;
}

/**
 * 页面渲染使用的数据类型
 */
export interface Next7DaysWeatherData {
    date: string;
    high: number;
    low: number;
}

export interface Next7HoursWeatherData {
    fxTime: string;
    temp: number;
    icon: string;
    text: string;
    windDir: string;
}

export interface WeatherNowData {
    temp: string;
    icon: string;
    text: string;
    windDir: string;
    windScale: string;
    humidity: string;
}

/**
 * 天气缓存类型
 */
export interface WeatherCache {
    weatherNow: WeatherNowData;
    next7DaysWeather: Next7DaysWeatherData[];
    next7HoursWeather: Next7HoursWeatherData[];
    timestamp: number;
}