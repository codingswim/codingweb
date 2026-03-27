<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSevenDayWeather } from "@/api/qweatherapi";
import ChartBox from "../ChartBox/index.vue";
import * as echarts from "echarts";

// 气象数据接口
interface WeatherData {
  fxDate: string;
  tempMax: number;
  tempMin: number;
}

// 组件属性
const props = defineProps({
  city: {
    type: String,
    required: true,
  },
});

const chartRef = ref(null);
const weatherData = ref([
  { date: "01-01", high: 18, low: 8 },
  { date: "01-02", high: 20, low: 10 },
  { date: "01-03", high: 22, low: 12 },
  { date: "01-04", high: 25, low: 14 },
  { date: "01-05", high: 23, low: 13 },
  { date: "01-06", high: 19, low: 9 },
  { date: "01-07", high: 17, low: 7 },
]);

const fetchData = async () => {
  const res: any = await getSevenDayWeather(props.city);
  if (res.code == 200) {
    const daily = res.daily.map((item: WeatherData) => ({
      date: item.fxDate.slice(5, 10),
      high: item.tempMax,
      low: item.tempMin,
    }));
    weatherData.value = daily;
  }
  initChart();
};

onMounted(() => {
  fetchData();
});

const initChart = () => {
  // 1. 创建 echarts 实例
  const myChart = echarts.init(chartRef.value);

  // 2. 处理数据
  const dates = weatherData.value.map((item) => item.date);
  const highTemp = weatherData.value.map((item) => item.high);
  const lowTemp = weatherData.value.map((item) => item.low);

  // 3. 配置项（美观版）
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
      // 最高温度线
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
      // 最低温度线
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

  // 4. 渲染
  myChart.setOption(option);

  // 自适应窗口大小
  window.addEventListener("resize", () => {
    myChart.resize();
  });
};
</script>

<template>
  <ChartBox title="近7日气温趋势">
    <div ref="chartRef" class="chart"></div>
  </ChartBox>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
