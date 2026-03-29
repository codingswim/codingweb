<template>
  <div ref="chartRef" class="map-3d-container"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import "echarts-gl";
import { debounce, throttle } from "lodash-es";
import { ref, onMounted, onUnmounted } from "vue";
import { useWeatherDashboardStore } from "@/stores/weather";
import { zhengzhouAreaMap } from "@/types/area";

// 常量配置
const defaultBgColor = "#87CEFA";
const defaultFontColor = "#ffffff";
const selectedBgColor = "#FFFA99";
const selectedFontColor = "#000000";

// 状态
const store = useWeatherDashboardStore();
const chartRef = ref<HTMLElement | null>(null);
const selectedName = ref(store.cityName);

let myChart: echarts.ECharts | null = null;
let geoJson: any = null;

// 防抖resize
const resizeChart = debounce(() => {
  myChart?.resize();
}, 300);

// 格式化 tooltip 内容
const formatTooltip = (params: { name: string }) => {
  // 直接从已有的常量中获取数据，0 性能开销
  const areaInfo = zhengzhouAreaMap[params.name];
  const population = areaInfo ? `${areaInfo.population}万` : "--";
  const area = areaInfo ? `${areaInfo.area}平方公里` : "--";

  // 模板字符串精简渲染
  return `
    <div style="padding: 10px; min-width: 160px;">
      <h3 style="margin:0 0 8px; font-size:16px;">${params.name}</h3>
      <div style="margin-bottom:4px;">人口：${population}</div>
      <div>面积：${area}</div>
    </div>
  `;
};

// ======================================
// 🔥 核心优化3：给 formatter 加节流（高频触发限制）
// ======================================
const throttledFormatter = throttle(formatTooltip, 100, {
  leading: true,
  trailing: false,
});

// 地图点击事件
const handleMapClick = (params: any) => {
  if (!params.name) return;
  selectedName.value = params.name;
  store.setCityName(params.name);
  updateMapStyle();
};

// 更新地图选中样式
function updateMapStyle() {
  if (!myChart || !geoJson) return;

  const data = geoJson.features.map((item: any) => {
    const name = item.properties.name;
    const isSelected = name === selectedName.value;

    return {
      name,
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
    title: { text: store.cityName },
    series: [{ id: "zhengzhouMap", data }],
  });
}

// 渲染3D地图
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
      // 额外优化：减少 tooltip 触发频率
      triggerOn: "mousemove",
      enterable: false,
      // 🔥 使用节流后的格式化函数
      formatter: throttledFormatter,
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

        // 🔥 全局基础标签配置（统一修复）
        label: {
          show: true,
          position: "bottom", // 1. 文字放在区域下方
          verticalOffset: 10, // 2. 向下偏移10px（核心！解决顶部截断）
          distance: 2, // 3. 3D文字距离模型高度
          lineHeight: 1.2, // 4. 固定行高，长文字不折行截断
          fontSize: 13, // 5. 微调字号，适配所有区域名称
        },

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

// 生命周期
onMounted(async () => {
  if (!chartRef.value) return;

  try {
    const res = await fetch("/map/zhengzhou.json");
    geoJson = await res.json();
    echarts.registerMap("zhengzhou", geoJson);

    myChart = echarts.init(chartRef.value);
    myChart.showLoading({ text: "3D 地图加载中..." });

    render3DMap();
    store.setCityName(selectedName.value);

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
  // 清理节流函数
  throttledFormatter.cancel();
});
</script>

<style scoped>
.map-3d-container {
  width: 100%;
  height: 100%;
}
</style>
