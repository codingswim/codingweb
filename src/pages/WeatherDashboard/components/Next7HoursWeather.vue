<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useWeatherDashboardStore } from "@/stores/weatherDashboard";
import type { ECharts } from "echarts";
import * as echarts from "echarts";
import ChartBox from "../ChartBox/index.vue";

const store = useWeatherDashboardStore();
const chartRef = ref<HTMLElement | null>(null);
const next7HoursWeather = computed(() => store.next7HoursWeather);

let myChart: ECharts | null = null;

// 1. 初始化图表（只执行一次）
const initChart = () => {
  if (!chartRef.value || myChart) return;

  myChart = echarts.init(chartRef.value);
  myChart.showLoading({
    text: "加载数据中...",
    color: "#4dabf7",
    maskColor: "rgba(255,255,255,0)",
  });
};

// 2. 更新图表（数据变化时执行）
const updateChart = () => {
  if (!myChart || next7HoursWeather.value.length === 0) {
    myChart?.hideLoading();
    return;
  }

  const hoursData = next7HoursWeather.value;
  const xData = hoursData.map((item) => item.fxTime);
  const tempData = hoursData.map((item) => item.temp);

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#eee",
      borderWidth: 1,
      textStyle: { color: "#333" },
      padding: [8, 12],
      formatter: (params: any) => {
        const data = params[0];
        const item = hoursData[data.dataIndex];
        return `
          <div style="padding:8px;">
            <div style="font-weight:bold;margin-bottom:4px;">${data.name}</div>
            <div style="color:#4dabf7;">温度：${data.value}°C</div>
            <div style="color:#666;margin-top:4px;">天气：${item.text}</div>
            <div style="color:#666;">风向：${item.windDir}</div>
          </div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xData,
      axisLine: { lineStyle: { color: "#ddd" } },
      axisLabel: { color: "#666", fontSize: 12 },
    },
    yAxis: {
      show: false,
      type: "value",
    },
    series: [
      {
        type: "line",
        data: tempData,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: "#4dabf7", width: 3 },
        itemStyle: { color: "#4dabf7" },
        label: {
          show: true,
          position: "top",
          formatter: "{c}°C",
          color: "#4dabf7",
          fontSize: 12,
          fontWeight: "bold",
          distance: 8,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderColor: "#4dabf7",
          borderWidth: 1,
          borderRadius: 4,
          padding: [2, 4],
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(77,171,247,0.3)" },
            { offset: 1, color: "rgba(77,171,247,0.1)" },
          ]),
        },
      },
    ],
  };

  myChart.setOption(option, true);
  myChart.hideLoading();
};

// 4. 监听数据自动更新
watch(
  () => next7HoursWeather.value,
  (val) => {
    if (val.length) updateChart();
    myChart?.hideLoading();
  },
  { immediate: true, deep: true }
);

// 生命周期
onMounted(() => {
  initChart();
});

onUnmounted(() => {
  myChart?.dispose();
  myChart = null;
});
</script>

<template>
  <ChartBox :title="`${store.cityName} 未来7小时气温趋势`">
    <div ref="chartRef" class="chart" />
  </ChartBox>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 280px;
}
</style>
