// 1. 引入路由依赖
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 2. 引入你要跳转的页面
import Home from '@/pages/Home/index.vue'
import WeatherDashboard from '@/pages/WeatherDashboard/index.vue'
import WhiteNoise from '@/pages/WhiteNoise/index.vue'

// 3. 配置路由规则
const routes: RouteRecordRaw[] = [
    {
        path: '/',          // 地址栏路径
        name: 'Home',       // 路由名字
        component: Home,    // 对应页面组件
        meta: {
            title: '首页',   // 页面标题
            requiresAuth: false, // 是否需要登录
            keepAlive: true // 是否缓存组件
        }
    },
    {
        path: '/weather-dashboard',
        name: 'WeatherDashboard',
        component: WeatherDashboard,
        meta: {
            title: '天气看板',
            requiresAuth: false,
            keepAlive: false
        }
    },
    {
        path: '/white-noise',
        name: 'WhiteNoise',
        component: WhiteNoise,
        meta: {
            title: '白噪音助眠',
            requiresAuth: false,
            keepAlive: false
        }
    },

    // 路由重定向示例
    {
        path: '/dashboard',
        redirect: '/data-dashboard' // 重定向到数据看板页面
    },
    // 404 页面处理
    {
        path: '/:pathMatch(.*)*',
        redirect: '/' // 所有未匹配的路径重定向到首页
    }
]

// 4. 创建路由实例
const router = createRouter({
    history: createWebHistory(), // 路由模式（推荐）
    routes,
    // 滚动行为配置
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 } // 页面切换时滚动到顶部
        }
    }
})

// 5. 路由守卫 - 全局前置守卫
router.beforeEach((to, _from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        document.title = to.meta.title as string
    }

    // 这里可以添加权限验证逻辑
    // 例如：检查用户是否登录
    // if (to.meta.requiresAuth && !isLoggedIn) {
    //     next('/login')
    // } else {
    //     next()
    // }

    next() // 继续路由导航
})
// 6. 路由守卫 - 全局后置守卫
router.afterEach((to, from) => {
    // 可以在这里添加页面访问统计、埋点等逻辑
    console.log(`页面从 ${from.path} 跳转到 ${to.path}`)
})
// 7. 导出路由
export default router