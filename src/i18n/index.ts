import { createI18n } from 'vue-i18n';
import zhCN from './langs/zh-CN'
import zhTW from './langs/zh-TW'
import enUS from './langs/en-US'

// 语言包集合
const messages = {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS
};

// 创建 i18n 实例
const i18n = createI18n({
    legacy: false, // 启用组合式 API，禁用旧版 API
    locale: localStorage.getItem('portal-lang') || 'zh-CN', // 默认语言
    fallbackLocale: 'zh-CN', // 回退语言
    messages
});

export default i18n;