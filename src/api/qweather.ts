// 环境变量
const VITE_QWEATHER_URL = import.meta.env.VITE_QWEATHER_URL;
const VITE_QWEATHER_API_KEY = import.meta.env.VITE_QWEATHER_API_KEY;
import axios, { AxiosInstance, AxiosResponse } from 'axios';


// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
    baseURL: VITE_QWEATHER_URL,
    timeout: 10000, // 10秒超时
    headers: {
        "Content-Type": "application/json"
    }
});
// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 统一添加 API Key
        if (config.params) {
            config.params.key = VITE_QWEATHER_API_KEY;
        } else {
            config.params = { key: VITE_QWEATHER_API_KEY };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// 响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // 统一处理响应数据
        if (response.status === 200) {
            return response;
        }
        return response;
    },
    (error) => {
        // 统一处理错误
        console.error('API 请求错误:', error);

        // 错误提示
        let errorMessage = '网络请求失败';
        if (error.response) {
            // 服务器返回错误
            switch (error.response.status) {
                case 400:
                    errorMessage = '请求参数错误';
                    break;
                case 401:
                    errorMessage = '未授权';
                    break;
                case 404:
                    errorMessage = '请求的资源不存在';
                    break;
                case 500:
                    errorMessage = '服务器内部错误';
                    break;
                default:
                    errorMessage = `请求失败 (${error.response.status})`;
            }
        } else if (error.request) {
            // 请求已发出但没有收到响应
            errorMessage = '服务器无响应';
        }

        return Promise.reject(new Error(errorMessage));
    }
);

// 获取近七日天气
export const getSevenDayWeather = (city: string) => {
    return apiClient.get('/v7/weather/7d', {
        params: { location: city }
    });
}

// 逐小时天气预报
export const getHourlyWeather = (city: string) => {
    return apiClient.get('/v7/weather/24h', {
        params: { location: city }
    });
}

// 天气指数
export const getWeatherIndexDetail = (city: string) => {
    return apiClient.get('/v7/indices/1d?type=0&location=' + city);
}

// 获取天气指数
export const getWeatherNow = (city: string) => {
    return apiClient.get('/v7/weather/now?location=' + city);
}
