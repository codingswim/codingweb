<script setup lang="ts">
// 导入Vue3组合式API核心函数：ref创建响应式变量、onMounted组件挂载生命周期钩子
import { ref, onMounted } from "vue";

// 导入和风天气获取天气指数详情的接口请求函数
import { getWeatherIndexDetail } from "@/api/qweather";

// 导入自定义图表容器组件（带标题的公共卡片组件）
import ChartBox from "../ChartBox/index.vue";

// 完整导入ECharts库，用于绘制仪表盘图表
import * as echarts from "echarts";

// 定义天气指数数据类型接口（TS类型约束），规范接口返回数据格式
// interface WeatherIndex {
//   name: string; // 指数名称，如穿衣指数、运动指数
//   category: string; // 指数分类
//   level: string; // 指数等级
//   text: string; // 指数描述文本
//   type: string; // 指数类型标识
// }

// 定义组件接收的父组件参数（props）
const props = defineProps({
  city: {
    // 参数名：城市
    type: String, // 类型：字符串
    required: true, // 必传参数，不传会报错
  },
});

// 创建DOM引用，用于挂载ECharts图表（指定类型为HTML元素或null）
const chartRef = ref<HTMLElement | null>(null);

// 创建响应式数组，存储天气指数列表数据，类型为WeatherIndex接口数组
// const indices = ref<WeatherIndex[]>([]);

// 控制台打印指数数据，用于开发调试查看数据结构

// 异步函数：从接口获取天气指数数据
const fetchData = async () => {
  try {
    // 调用天气接口，传入城市参数，await等待异步请求结果
    const res: any = await getWeatherIndexDetail(props.city);

    // 控制台打印接口返回结果，开发调试用

    // 判断接口请求状态码，200表示成功
    if (res.code == 200) {
      // 此处可补充：请求成功后给indices赋值逻辑
    }
  } catch (error) {
    // 请求失败时，控制台打印错误信息
    console.error("获取天气指数失败:", error);
    // 接口异常时，可在此处使用模拟数据兜底
  }
};

// 仪表盘图表使用的模拟数据（固定写死，可替换为接口真实数据）
// const weatherData = [
//   { name: "穿衣指数", value: 25 }, // 指数名称 + 指数值（0~100范围）
//   // 以下为注释掉的其他指数模拟数据
//   // { name: "运动指数", value: 45 },
//   // { name: "洗车指数", value: 78 },
//   // { name: "防晒指数", value: 90 },
// ];

// 初始化ECharts仪表盘图表核心函数
const initChart = () => {
  // 如果图表DOM容器不存在，直接退出，防止报错
  if (!chartRef.value) return;

  // 根据DOM容器初始化ECharts实例
  let myChart = echarts.init(chartRef.value);

  // 声明图表配置项变量
  let option;

  // ECharts完整配置项

  option = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "75%"],
        radius: "90%",
        min: 0,
        max: 1,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.25, "#FF6E76"],
              [0.5, "#FDDD60"],
              [0.75, "#58D9F9"],
              [1, "#7CFFB2"],
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "12%",
          width: 20,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 2,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: "auto",
            width: 5,
          },
        },
        axisLabel: {
          color: "#464646",
          fontSize: 20,
          distance: -60,
          rotate: "tangential",
          formatter: function (value: number) {
            if (value === 0.875) {
              return "Grade A";
            } else if (value === 0.625) {
              return "Grade B";
            } else if (value === 0.375) {
              return "Grade C";
            } else if (value === 0.125) {
              return "Grade D";
            }
            return "";
          },
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 20,
        },
        detail: {
          fontSize: 30,
          offsetCenter: [0, "-35%"],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value * 100) + "";
          },
          color: "inherit",
        },
        data: [
          {
            value: 0.7,
            name: "Grade Rating",
          },
        ],
      },
    ],
  };

  // 将配置项设置到ECharts实例，渲染图表
  myChart.setOption(option);
};

// 组件挂载完成后执行：获取数据 + 渲染图表
onMounted(() => {
  fetchData(); // 请求天气指数接口数据
  initChart(); // 初始化ECharts图表
});
</script>

<template>
  <!-- 使用自定义图表卡片组件，传入标题 -->
  <ChartBox title="天气指数">
    <!-- ECharts图表挂载的DOM容器，通过ref绑定 -->
    <div ref="chartRef" class="chart"></div>
  </ChartBox>
</template>

<style scoped>
/* 图表容器样式：宽高100%，充满父容器 */
.chart {
  width: 100%;
  height: 100%;
}
</style>
