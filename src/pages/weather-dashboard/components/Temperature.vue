<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import ChartBox from "../ChartBox/index.vue";
import socket from "@/utils/socket";
import * as echarts from "echarts";

const num = ref(20);
const isConnected = ref(false);
const chartRef = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  if (!myChart) {
    myChart = echarts.init(chartRef.value);
  }

  const option = {
    series: [
      {
        type: "gauge",
        center: ["50%", "70%"],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 60,
        splitNumber: 12,
        itemStyle: {
          color: "#FFAB91",
        },
        progress: {
          show: true,
          width: 30,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 30,
          },
        },
        axisTick: {
          distance: -45,
          splitNumber: 5,
          lineStyle: {
            width: 2,
            color: "#999",
          },
        },
        splitLine: {
          distance: -52,
          length: 14,
          lineStyle: {
            width: 3,
            color: "#999",
          },
        },
        axisLabel: {
          distance: -20,
          color: "#999",
          fontSize: 20,
        },
        anchor: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          width: "70%",
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, "-15%"],
          fontSize: 30,
          fontWeight: "bolder",
          formatter: "{value} °C",
          color: "inherit",
        },
        data: [
          {
            value: num.value,
          },
        ],
      },

      // 湿度仪表盘
      {
        type: "gauge",
        center: ["50%", "70%"],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 60,
        itemStyle: {
          color: "#FD7347",
        },
        progress: {
          show: true,
          width: 8,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        detail: {
          show: false,
        },
        data: [
          {
            value: num.value,
          },
        ],
      },
    ],
  };

  myChart.setOption(option);
};

watch(num, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    initChart();
  }
});

watch(isConnected, (newVal) => {
  if (newVal) {
    // 手动重连
    if (!socket.connected) {
      console.log("🔄 正在重连到服务器...");
      socket.connect();
    }
  } else {
    // 手动断开连接
    if (socket.connected) {
      console.log("⏹️ 正在断开与服务器的连接...");
      socket.disconnect();
    }
  }
});

onMounted(() => {
  initChart();

  // 连接成功
  socket.on("connect", () => {
    console.log("✅ 已连接到服务器");
    isConnected.value = true;
  });

  // 监听后端推送的消息（事件名前后端必须一致）
  socket.on("num", (data) => {
    num.value = data;
  });

  // 断开连接
  socket.on("disconnect", () => {
    console.log("❌ 与服务器断开连接");
    isConnected.value = false;
  });

  // 初始化连接状态
  isConnected.value = socket.connected;
});

onUnmounted(() => {
  // 移除所有socket事件监听器
  socket.off("connect");
  socket.off("num");
  socket.off("disconnect");

  // 销毁ECharts实例
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }

  // 组件卸载时，断开与服务器的连接
  if (socket.connected) {
    socket.disconnect();
  }
});
</script>

<template>
  <ChartBox title="实时气温仪表盘（非天气气温，仅用于测试）">
    <div ref="chartRef" class="chart"></div>
    <el-switch v-model="isConnected" class="switch" />
  </ChartBox>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
.switch {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
