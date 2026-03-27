<script setup lang="ts">
import * as echarts from "echarts";
import { ref, onMounted } from "vue";
import { getHourlyWeather } from "@/api/qweatherapi";
import ChartBox from "../ChartBox/index.vue";

interface HourlyWeather {
  fxTime: string;
  temp: number;
  icon: number;
  text: string;
  windDir: string;
}

const props = defineProps({
  city: {
    type: String,
    required: true,
  },
});
const chartRef = ref(null);
const hourlyData = ref<HourlyWeather[]>([]);

const fetchData = async () => {
  const res: any = await getHourlyWeather(props.city);
  if (res.code == 200) {
    const data = res.hourly.slice(0, 7).map((item: any) => ({
      fxTime: new Date(item.fxTime).getHours() + ":00",
      temp: Number(item.temp),
      icon: item.icon,
      text: item.text,
      windDir: item.windDir,
    }));
    hourlyData.value = data;
  }
  initChart();
};

onMounted(() => {
  fetchData();
});

const initChart = () => {
  if (!chartRef.value) {
    return;
  }
  const myChart = echarts.init(chartRef.value);
  var option;

  option = {
    xAxis: {
      type: "category",
      data: hourlyData.value.map((item) => item.fxTime),
      axisLine: { lineStyle: { color: "#ddd" } },
      axisLabel: { color: "#666", fontSize: 12 },
    },
    yAxis: {
      show: false,
      type: "value",
      name: "°C",
      axisLine: { lineStyle: { color: "#ddd" } },
      axisLabel: { color: "#666" },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
    },
    series: [
      {
        data: hourlyData.value.map((item) => item.temp),
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          color: "#4dabf7",
          width: 3,
        },
        itemStyle: {
          color: "#4dabf7",
        },
        // 在顶点显示温度数值
        label: {
          show: true,
          position: "top",
          formatter: "{c}°C",
          color: "#4dabf7",
          fontSize: 12,
          fontWeight: "bold",
          distance: 8,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderColor: "#4dabf7",
          borderWidth: 1,
          borderRadius: 4,
          padding: [2, 4],
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(77, 171, 247, 0.3)" },
            { offset: 1, color: "rgba(77, 171, 247, 0.1)" },
          ]),
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        const item = hourlyData.value[data.dataIndex];
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
            <div style="color: #4dabf7;">温度: ${data.value}°C</div>
            <div style="color: #666; margin-top: 4px;">天气: ${item.text}</div>
            <div style="color: #666;">风向: ${item.windDir}</div>
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
  };

  option && myChart.setOption(option);
};
</script>

<template>
  <ChartBox title="Real Time Weather">
    <div ref="chartRef" class="chart"></div>
  </ChartBox>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
