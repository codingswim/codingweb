<script setup lang="ts">
import { ref, onMounted } from "vue";
import Title from "./Title.vue";
import Map from "./map.vue";
import ChartBox from "./ChartBox/index.vue";
import SevenDayWeather from "./components/SevenDayWeather.vue";
import RealTimeWeather from "./components/RealTimeWeather.vue";
import Indices from "./components/Indices.vue";
import Right1 from "./components/Right1.vue";
import Right2 from "./components/Right2.vue";
import Right3 from "./components/Right3.vue";

const cityId = ref("101180109");

let screen = ref();
const getScale = (width = 1920, height = 1080) => {
  let ww = window.innerWidth / width;
  let wh = window.innerHeight / height;
  return ww < wh ? ww : wh;
};

onMounted(() => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`;
});
window.onresize = () => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`;
};

/*
1. 实时天气

2. 近七日天气

3. 天气指数

4. 空气质量

5. 


*/
</script>
<template>
  <div class="container" ref="screen">
    <Title />
    <!-- 内容区域  -->

    <div class="content">
      <!-- 左侧 3 个图表 -->
      <div class="left">
        <SevenDayWeather :city="cityId" />
        <RealTimeWeather :city="cityId" />
        <Indices :city="cityId" />
      </div>

      <!-- 中间 1 个图表 -->
      <div class="middle">
        <Map />
      </div>

      <!-- 右侧 3 个图表 -->
      <div class="right">
        <Right3 />
        <Right2 />
        <Right1 />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.container {
  background-color: #d1e7ff;
  width: 1920px;
  height: 1080px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform-origin: left top;
  padding: 0 20px 20px;

  .content {
    display: flex;
    gap: 16px;
    height: calc(100% - 100px);

    .middle {
      width: 50%;
      height: 100%;
    }

    .left,
    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chart {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
