# 🎵 CODING WEB - 现代化多功能 Web 应用

<div align="center">

![Vue](https://img.shields.io/badge/Vue-3.5.30-42b883.svg?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.0.0-646cff.svg?style=flat-square&logo=vite)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.13.5-409eff.svg?style=flat-square&logo=element)

一个基于 Vue 3 + TypeScript + Vite 构建的现代化多功能 Web 应用，集成了音乐播放、天气仪表盘、白噪音播放器、网站导航等多个实用功能模块。

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [技术栈](#-技术栈) • [项目结构](#-项目结构) 

</div>

---

## 📖 项目简介

CODING WEB 是一个功能丰富的现代化 Web 应用，采用最新的前端技术栈构建，提供优雅的用户界面和流畅的用户体验。项目采用模块化设计，每个功能模块独立开发，便于维护和扩展。

### 核心特性

- 🎨 **现代化设计** - 采用最新的 Vue 3 Composition API 和 TypeScript
- 🚀 **高性能** - 基于 Vite 构建，提供极致的开发和构建体验
- 📱 **响应式布局** - 完美适配各种设备尺寸
- 🌍 **国际化支持** - 内置多语言支持（中文简体、中文繁体、英文）
- 🎨 **主题切换** - 支持亮色/暗色主题切换
- 🔧 **类型安全** - 完整的 TypeScript 类型定义
- 📦 **组件化** - 基于 Element Plus 的组件库

---

## ✨ 功能特性

### 🎵 网易云音乐播放器

- 🎶 音乐搜索和播放
- 📝 歌词显示和同步
- 🎛️ 播放控制（播放/暂停/上一首/下一首）
- 📋 音乐列表管理
- 🎨 精美的播放界面

### 🌤️ 天气仪表盘

- 🌡️ 实时天气数据展示
- 📊 ECharts 图表可视化
- 🗺️ 地图展示
- 📅 未来 7 天天气预报
- ⏰ 未来 7 小时天气预报
- 📈 天气指数展示

### 🎧 白噪音播放器

- 🌊 多种白噪音音效（雨声、海浪、森林等）
- 🎛️ 音量控制和混音
- 📊 音频可视化
- ⚙️ 自定义预设
- 🎨 精美的卡片式界面

### 🔗 网站导航门户

- 🔍 网站搜索功能
- 📋 网站分类管理
- 🎯 快速访问常用网站
- 📱 响应式布局

---

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| [Vue](https://vuejs.org/) | 3.5.30 | 渐进式 JavaScript 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | JavaScript 的超集，提供类型安全 |
| [Vite](https://vitejs.dev/) | 8.0.0 | 下一代前端构建工具 |

### UI 组件库

| 技术 | 版本 | 说明 |
|------|------|------|
| [Element Plus](https://element-plus.org/) | 2.13.5 | 基于 Vue 3 的组件库 |
| [Element Plus Icons](https://element-plus.org/zh-CN/component/icon.html) | 2.3.2 | Element Plus 图标库 |

### 状态管理 & 路由

| 技术 | 版本 | 说明 |
|------|------|------|
| [Pinia](https://pinia.vuejs.org/) | 3.0.4 | Vue 官方状态管理库 |
| [Vue Router](https://router.vuejs.org/) | 4.6.4 | Vue 官方路由管理器 |

### 数据可视化

| 技术 | 版本 | 说明 |
|------|------|------|
| [ECharts](https://echarts.apache.org/) | 6.0.0 | 强大的数据可视化库 |
| [ECharts GL](https://echarts.apache.org/zh/option-gl.html) | 2.0.9 | ECharts 3D 扩展 |

### 工具库

| 技术 | 版本 | 说明 |
|------|------|------|
| [Axios](https://axios-http.com/) | 1.13.6 | HTTP 客户端 |
| [Lodash-es](https://lodash.com/) | 4.17.23 | JavaScript 实用工具库 |
| [Day.js](https://day.js.org/) | 1.11.20 | 轻量级日期处理库 |
| [Vue I18n](https://vue-i18n.intlify.dev/) | 11.3.0 | Vue 国际化插件 |
| [SortableJS](https://sortablejs.github.io/) | 1.15.7 | 拖拽排序库 |
| [Vuedraggable](https://github.com/SortableJS/Vue.Draggable) | 4.1.0 | Vue 拖拽组件 |

### 其他依赖

| 技术 | 版本 | 说明 |
|------|------|------|
| [Supabase](https://supabase.com/) | 2.99.2 | 开源 Firebase 替代品 |
| [QWeather Icons](https://github.com/qwd/Icons) | 1.8.0 | 和风天气图标库 |

### 开发工具

| 技术 | 版本 | 说明 |
|------|------|------|
| [Sass](https://sass-lang.com/) | 1.98.0 | CSS 预处理器 |
| [Vue TSC](https://github.com/vuejs/language-tools) | 3.2.5 | Vue TypeScript 类型检查 |
| [Unplugin Auto Import](https://github.com/antfu/unplugin-auto-import) | 21.0.0 | 自动导入 API |
| [Unplugin Vue Components](https://github.com/antfu/unplugin-vue-components) | 31.0.0 | 自动导入组件 |
| [Rollup Plugin Visualizer](https://github.com/btd/rollup-plugin-visualizer) | 7.0.1 | 打包分析工具 |
| [Vite Plugin Checker](https://github.com/fi3ework/vite-plugin-checker) | 0.12.0 | 类型检查插件 |
| [Vite Plugin Progress](https://github.com/jeddygao/vite-plugin-progress) | 0.0.7 | 构建进度显示 |
| [Vite Plugin Imagemin](https://github.com/anncwb/vite-plugin-imagemin) | 0.6.1 | 图片压缩插件 |

---

## 📁 项目结构

```
codingweb/
├── public/                 # 静态资源
│   ├── map/                # 地图数据
│   ├── sounds/             # 白噪音音频文件
│   └── favicon.svg         # 网站图标
├── src/                    # 源代码
│   ├── api/                # API 接口
│   │   ├── music.ts        # 音乐 API
│   │   └── qweather.ts     # 天气 API
│   ├── assets/             # 资源文件
│   │   └── images/         # 图片资源
│   ├── components/         # 公共组件
│   │   └── Header/         # 头部组件
│   ├── composables/        # 组合式函数
│   │   └── useWhiteNoiseAudio.ts
│   ├── constants/          # 常量定义
│   │   └── whiteNoiseSounds.ts
│   ├── i18n/               # 国际化配置
│   │   ├── langs/          # 语言包
│   │   │   ├── en-US.ts    # 英文
│   │   │   ├── zh-CN.ts    # 中文简体
│   │   │   └── zh-TW.ts    # 中文繁体
│   │   └── index.ts
│   ├── pages/              # 页面组件
│   │   ├── home/           # 首页
│   │   ├── portal/         # 网站导航
│   │   ├── weather-dashboard/  # 天气仪表盘
│   │   ├── white-noise/    # 白噪音播放器
│   │   └── wyy-music/      # 网易云音乐
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 样式文件
│   │   ├── reset/          # 重置样式
│   │   ├── themes/         # 主题样式
│   │   └── variables.scss  # 全局变量
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .env.local              # 环境变量
├── .gitignore              # Git 忽略文件
├── index.html              # HTML 模板
├── package.json            # 项目依赖
├── pnpm-lock.yaml          # 依赖锁定文件
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目文档
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd codingweb

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev
```

应用将在 `http://localhost:8080` 启动。

### 构建生产版本

```bash
# 类型检查
pnpm ts-check

# 构建生产版本
pnpm build
```

构建产物将生成在 `dist` 目录。

### 预览生产版本

```bash
# 预览构建后的应用
pnpm preview
```

---

## 🔧 配置说明

### Vite 配置

项目使用 Vite 作为构建工具，配置文件为 `vite.config.ts`，主要配置包括：

- 插件配置（Vue、自动导入、组件注册等）
- 路径别名（`@` 指向 `src` 目录）
- 代理配置（API 请求代理）
- 构建优化（代码分割、资源压缩等）

### TypeScript 配置

TypeScript 配置文件为 `tsconfig.json`，主要配置包括：

- 编译选项（目标版本、模块系统等）
- 路径别名
- 类型检查严格模式

### 环境变量

环境变量配置在 `.env.local` 文件中：

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=CODING WEB
```

使用方式：

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## 📦 构建优化

项目已配置多种构建优化策略：

### 代码分割

- 第三方库单独打包（vendor、vendor_ui、vendor_echarts 等）
- 按路由自动分割
- CSS 代码分割

### 资源优化

- 图片自动压缩（PNG、JPEG、GIF、SVG）
- 资源内联（小于 4KB）
- Gzip/Brotli 压缩

### 打包分析

生产构建后会自动生成打包分析报告（`stats.html`），用于分析包大小和依赖关系。

---

## 🌐 部署

### 静态部署

```bash
# 构建生产版本
pnpm build

# 将 dist 目录部署到静态服务器
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Vercel 部署

项目已配置 Vercel 代理，可以直接部署到 Vercel 平台。

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交规范

- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📮 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [ECharts](https://echarts.apache.org/)
- [Pinia](https://pinia.vuejs.org/)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by CODING WEB Team

</div>