import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 自动导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      // 自动导入 Vue 相关 API（可选，简化代码）
      imports: ['vue', 'pinia'],
      // 生成类型声明文件（TS 友好）
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      // 生成组件声明文件
      dts: 'src/components.d.ts'
    })
  ],
  // 路径别名（可选，简化导入路径）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // SCSS 全局变量配置（可选，比如全局样式/变量）
  css: {
    preprocessorOptions: {
      scss: {
        // 全局引入 SCSS 变量文件（需先创建 src/styles/variables.scss）
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  }
})