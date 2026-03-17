// 主题类型枚举
export const THEME_TYPES = {
    LIGHT: 'light',
    DARK: 'dark'
}

// 设置主题（核心函数）
export const setTheme = (themeType: keyof typeof THEME_TYPES) => {
    // 1. 获取根元素（html）
    const rootElement = document.documentElement

    // 2. 移除所有旧的主题 class
    rootElement.classList.remove(`theme-${THEME_TYPES.LIGHT}`, `theme-${THEME_TYPES.DARK}`)

    // 3. 添加新的主题 class
    rootElement.classList.add(`theme-${themeType}`)

    // 4. 持久化到 localStorage，刷新页面后保留主题
    localStorage.setItem('portal-theme', themeType)
}

// 获取当前主题（优先从 localStorage 读取，无则用亮色）
export const getCurrentTheme = () => {
    return localStorage.getItem('portal-theme') || THEME_TYPES.LIGHT
}

// 切换主题（切换 light/dark）
export const toggleTheme = () => {
    const currentTheme = getCurrentTheme()
    const newTheme = currentTheme === THEME_TYPES.LIGHT ? THEME_TYPES.DARK : THEME_TYPES.LIGHT
    setTheme(newTheme as keyof typeof THEME_TYPES)
    return newTheme
}