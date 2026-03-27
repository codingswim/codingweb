<template>
  <div ref="chartRef" class="map-3d-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import "echarts-gl";

const chartRef = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

onMounted(async () => {
  // 1. 加载郑州地图 JSON
  const res = await fetch("/map/henan.json");
  const geoJson = await res.json();

  // 2. 注册地图
  echarts.registerMap("henan", geoJson);

  // 3. 初始化 3D 图表
  myChart = echarts.init(chartRef.value!);

  // 4. 渲染 3D 地图
  render3DMap();
});

function render3DMap() {
  if (!myChart) return;

  myChart.setOption({
    backgroundColor: "#D1E7FF",

    // 标题
    title: {
      // text: "郑州市 3D 地图",
      left: "center",
      textStyle: { color: "#fff", fontSize: 20 },
    },

    // 3D 地图必须用 geo3D
    geo3D: {
      map: "henan", // 对应注册名
      zoom: 1.3,
      altitude: 8000, // 3D 高度
      itemStyle: {
        color: "#00a8ff", // 城市颜色
        opacity: 0.9,
        borderWidth: 1,
        borderColor: "#fff",
      },
      // label: {
      //   show: true,
      //   textStyle: { color: "#fff", fontSize: 14 },
      // },
      emphasis: {
        itemStyle: { color: "#0088ff" }, // 高亮颜色
      },

      // 3D 视角控制
      viewControl: {
        // autoRotate: true, // 自动旋转
        // rotateSpeed: 5,
        // distance: 15, // 镜头距离
        // alpha: 60, // 倾斜角度

      },
    },

    // 3D 系列
    series: [
      {
        type: "map3D",
        map: "henan",
        // 修改区域颜色，随机不同颜色
        itemStyle: {
          color: "#00a8ff",
          opacity: 0.9,
          itemStyle: {
            color: "#00a8ff",
          },
        },
        // data: areaData, // 使用区域数据

        // 区域名称显示高级一点
        label: {
          show: true,
          textStyle: {
            color: "#000",
            fontSize: 14,
            fontWeight: "bold",
          },
        },
      },
    ],
  });
}

// 销毁
onUnmounted(() => {
  myChart?.dispose();
});
</script>

<style scoped>
.map-3d-container {
  width: 100%;
  height: 100%;
}
</style>
