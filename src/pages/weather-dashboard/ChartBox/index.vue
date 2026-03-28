<template>
  <div class="chart-box">
    <div class="chart-title">
      <el-icon><Stopwatch /></el-icon>
      <span>{{ title }}</span>
    </div>

    <!-- 内容插槽：放 ECharts / 地图 / 文字 / 数据 -->
    <div class="chart-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Stopwatch } from "@element-plus/icons-vue";
// 接收标题
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
/* 统一图表容器样式 */
.chart-box {
  width: 100%;
  height: 100%;
  background: #dfeeff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* 标题统一样式 */
.chart-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .el-icon {
    margin-right: 8px;
    font-size: 24px;
    color: #1387e7;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    color: #5A7B97;
  }
}

/* 内容区域：自动占满剩余高度 */
.chart-content {
  flex: 1;
  width: 100%;
  position: relative;
}
</style>
