<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import * as echarts from "echarts";
import type { ECharts } from "echarts";
import ChartBox from "../ChartBox/index.vue";
import { useWeatherDashboardStore } from "@/stores/weather";

const store = useWeatherDashboardStore();
const next7DaysWeather = computed(() => store.next7DaysWeather);
const chartRef = ref<HTMLElement | null>(null);

let myChart: ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;
  if (myChart) return; // 防止重复实例化（核心优化）

  myChart = echarts.init(chartRef.value);
  myChart.showLoading({
    text: "加载数据中...",
    color: "#4dabf7",
    maskColor: "rgba(255,255,255,0)",
  });
};

const updateChart = () => {
  if (!myChart || next7DaysWeather.value.length === 0) {
    myChart?.hideLoading();
    return;
  }

  const dates = next7DaysWeather.value.map((item) => item.date);
  const highTemp = next7DaysWeather.value.map((item) => item.high);
  const lowTemp = next7DaysWeather.value.map((item) => item.low);

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#eee",
      borderWidth: 1,
      textStyle: { color: "#333" },
      padding: [10, 15],
      formatter: "{b}<br/>最高温：{c0}°C<br/>最低温：{c1}°C",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: "#ddd" } },
      axisLabel: { color: "#666", fontSize: 12 },
    },
    yAxis: {
      type: "value",
      name: "°C",
      axisLine: { lineStyle: { color: "#ddd" } },
      axisLabel: { color: "#666" },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
    },
    series: [
      {
        name: "最高温度",
        type: "line",
        data: highTemp,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#ff6b6b", width: 3 },
        itemStyle: { color: "#ff6b6b" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255,107,107,0.3)" },
            { offset: 1, color: "rgba(255,107,107,0)" },
          ]),
        },
      },
      {
        name: "最低温度",
        type: "line",
        data: lowTemp,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#4dabf7", width: 3 },
        itemStyle: { color: "#4dabf7" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(77,171,247,0.2)" },
            { offset: 1, color: "rgba(77,171,247,0)" },
          ]),
        },
      },
    ],
  };

  myChart.setOption(option, true);
  myChart.hideLoading();
};

watch(
  () => next7DaysWeather.value,
  (newVal) => {
    if (newVal.length) updateChart();
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  myChart?.dispose();
  myChart = null;
});
</script>

<template>
  <ChartBox title="未来7日气温趋势">
    <div ref="chartRef" class="chart" />
  </ChartBox>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
