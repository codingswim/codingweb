// Vite 核心
import { defineConfig } from 'vite'
import path from 'path'

// 插件
import vue from '@vitejs/plugin-vue'
import progress from 'vite-plugin-progress'
import checker from 'vite-plugin-checker'
import viteImagemin from 'vite-plugin-imagemin'
import { visualizer } from 'rollup-plugin-visualizer';

// 自动导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// 环境变量
const isProduction = process.env.NODE_ENV === 'production'

// 路径常量
const aliasPath = {
  '@': path.resolve(__dirname, 'src')
}

export default defineConfig({
  plugins: [
    // 核心框架
    vue(),

    // 开发体验插件（进度条）
    progress(),

    // 自动导入配置
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),
    // 组件自动导入配置
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    }),

    // 类型检查（仅生产）
    checker({
      typescript: isProduction,
      vueTsc: isProduction,
      enableBuild: true,     // 仅在 build 时执行
      overlay: false,        // 开发时不显示错误覆盖层
    }),

    // 打包分析（仅生产）
    ...(isProduction ? [
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'stats.html'
      })
    ] : []),

    // 图片压缩（仅生产）
    ...(isProduction ? [
      viteImagemin({
        gifsicle: { optimizationLevel: 7, interlaced: false },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 80 },
        pngquant: { quality: [0.6, 0.8] },
        svgo: { plugins: [{ removeViewBox: false }] }
      })
    ] : [])
  ],

  // 路径别名
  resolve: {
    alias: aliasPath
  },

  // CSS 配置
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  },

  // 依赖预构建优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus'],
    esbuildOptions: {
      supported: {
        'top-level-await': true
      }
    }
  },

  // 生产构建
  build: {
    sourcemap: false,
    target: 'es2022',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,

    // 代码分隔
    rollupOptions: {
      output: {
        // JS 输出规则
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',

        // 静态资源分类打包
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (!name) return 'assets/[name]-[hash].[ext]';
          if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) return 'images/[name]-[hash].[ext]';
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return 'fonts/[name]-[hash].[ext]';
          if (name.endsWith('.css')) return 'css/[name]-[hash].[ext]';
          return 'assets/[name]-[hash].[ext]';
        },

        // 手动代码拆包
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) return 'vendor_ui'
            if (id.includes('echarts')) return 'vendor_echarts'
            if (id.includes('lodash')) return 'vendor-utils';
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor_vue'
            }
            return 'vendor'
          }
        },
      },
    }
  },

  // 开发服务器
  server: {
    port: 8080,
    open: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'https://api-wyy-coding.vercel.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
})