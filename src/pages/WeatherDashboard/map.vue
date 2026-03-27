<template>
  <div ref="chartRef" class="map-3d-container"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import "echarts-gl";
import { debounce } from "lodash-es";
import { ref, onMounted, onUnmounted } from "vue";
import { useWeatherDashboardStore } from "@/stores/weatherDashboard";

const defaultBgColor = "#87CEFA";
const defaultFontColor = "#ffffff";
const selectedBgColor = "#FFFA99";
const selectedFontColor = "#000000";

const store = useWeatherDashboardStore();
const chartRef = ref<HTMLElement | null>(null);

let myChart: echarts.ECharts | null = null;
let geoJson: any = null;

const selectedName = ref(store.cityName);

const resizeChart = debounce(() => {
  myChart?.resize();
});

// 点击切换
const handleMapClick = (params: any) => {
  if (!params.name) return;
  selectedName.value = params.name;
  store.setCityName(params.name);
  updateMapStyle();
};

// 更新样式：区域颜色 + 字体颜色
function updateMapStyle() {
  if (!myChart || !geoJson) return;

  const data = geoJson.features.map((item: any) => {
    const name = item.properties.name;
    const isSelected = name === selectedName.value;

    return {
      name: name,
      itemStyle: {
        color: isSelected ? selectedBgColor : defaultBgColor,
        opacity: 1,
      },
      label: {
        show: true,
        color: isSelected ? selectedFontColor : defaultFontColor,
        fontSize: isSelected ? 16 : 14,
        fontWeight: "bold",
      },
    };
  });

  myChart.setOption({
    title:{
      text: store.cityName,
    },
    series: [{ id: "zhengzhouMap", data: data }],
  });
}

// 渲染地图
function render3DMap() {
  if (!myChart || !geoJson) return;

  myChart.setOption({
    title: {
      text: store.cityName,
      left: "center",
      top: 20,
      textStyle: { color: "#177BD8", fontSize: 22, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0, 20, 60, 0.7)",
      textStyle: { color: "#fff" },
    },
    series: [
      {
        id: "zhengzhouMap",
        type: "map3D",
        map: "zhengzhou",
        zoom: 1.3,
        altitude: 8000,
        roam: true,
        viewControl: { autoRotate: true, rotateSpeed: 4, alpha: 55 },
        itemStyle: { borderWidth: 1.5, borderColor: "#ffffff" },
        emphasis: {
          label: { color: selectedFontColor },
          itemStyle: { color: "#F5DE9D" },
        },
        data: geoJson.features.map((item: any) => ({
          name: item.properties.name,
        })),
      },
    ],
  });

  // 🔥 初始化完成后立即设置默认选中样式
  updateMapStyle();
}

// 初始化
onMounted(async () => {
  if (!chartRef.value) return;

  try {
    const res = await fetch("/map/zhengzhou.json");
    geoJson = await res.json();
    echarts.registerMap("zhengzhou", geoJson);

    myChart = echarts.init(chartRef.value);
    myChart.showLoading({ text: "3D 地图加载中..." });

    render3DMap();
    store.setCityName(selectedName.value); // 同步默认城市

    myChart.on("click", "series", handleMapClick);
    myChart.hideLoading();

    window.addEventListener("resize", resizeChart);
  } catch (err) {
    console.error("地图加载失败", err);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeChart);
  myChart?.dispose();
  myChart = null;
});
</script>

<style scoped>
.map-3d-container {
  width: 100%;
  height: 100%;
}
</style>
