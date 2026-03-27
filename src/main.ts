import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import 'element-plus/dist/index.css'
import './styles/main.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { getCurrentTheme, setTheme } from './utils/theme'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.use(router)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
setTheme(getCurrentTheme() as 'LIGHT' | 'DARK')
app.mount('#app')