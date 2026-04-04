<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRefs, nextTick } from "vue";
import type { SimpleMusicItem } from "@/pages/wyy-music/types/music";

// 定义组件属性
const props = withDefaults(
  defineProps<{
    list: SimpleMusicItem[]; // 音乐列表数据
    loading: boolean; // 加载状态
  }>(),
  {
    list: () => [], // 默认空数组
    loading: false, // 默认未加载
  }
);

// 解构属性，使用 toRefs 保持响应性
const { list, loading } = toRefs(props);
// 定义事件
const emit = defineEmits(["select"]);

// 虚拟列表相关状态
const containerRef = ref<HTMLElement | null>(null); // 滚动容器引用
const scrollTop = ref(0); // 当前滚动位置
const itemHeight = 30; // 每个项目的固定高度
const visibleCount = ref(20); // 可视区域内显示的项目数量
const bufferCount = 5; // 缓冲区数量，避免滚动时出现空白

/**
 * 计算当前应该开始显示的项目索引
 * 减去 bufferCount 是为了预加载缓冲区的项目，避免滚动时出现空白
 */
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferCount);
});

/**
 * 计算当前应该结束显示的项目索引
 * 加上 visibleCount 和 bufferCount 是为了显示可视区域内的项目和预加载缓冲区的项目
 * 确保最后一行能够完全显示
 */
const endIndex = computed(() => {
  return Math.min(
    list.value.length,
    Math.ceil(scrollTop.value / itemHeight) + visibleCount.value + bufferCount + 1 // 额外加 1 确保最后一行完全显示
  );
});

/**
 * 计算当前可见的项目数组
 * 只渲染可视区域内的项目，提高性能
 */
const visibleItems = computed(() => {
  return list.value.slice(startIndex.value, endIndex.value);
});

/**
 * 计算虚拟列表的偏移量
 * 通过 transform: translateY 来定位可视项目的位置
 */
const offsetTop = computed(() => {
  return startIndex.value * itemHeight;
});

/**
 * 计算整个列表的总高度
 * 用于设置容器高度，模拟滚动条
 */
const totalHeight = computed(() => {
  return list.value.length * itemHeight;
});

/**
 * 处理滚动事件
 * 更新 scrollTop 值，触发重新计算可视项目
 */
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
};

/**
 * 处理选择音乐事件
 * 触发 select 事件，传递选中的音乐数据
 */
const handleSelectMusic = (music: SimpleMusicItem) => {
  emit("select", music);
};

/**
 * 组件挂载后计算可视区域高度
 * 根据容器高度和项目高度计算可见项目数量
 */
onMounted(() => {
  nextTick(() => {
    if (containerRef.value) {
      visibleCount.value = Math.ceil(containerRef.value.clientHeight / itemHeight);
    }
  });
});

/**
 * 清理事件监听
 * 由于事件监听是在模板中通过 @scroll 绑定的，无需手动清理
 */
onUnmounted(() => {
  // 无需清理，因为事件监听是在模板中通过 @scroll 绑定的
});
</script>

<template>
  <div class="container" ref="containerRef" @scroll="handleScroll">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <!-- 虚拟列表 -->
    <div v-else class="table-container" :style="{ height: totalHeight + 'px' }">
      <!-- 表头 -->
      <div class="table-header">
        <span>歌曲名</span>
        <span>歌手</span>
        <span>专辑名</span>
      </div>
      
      <!-- 空状态 -->
      <div v-if="list.length === 0" class="empty-container">
        <span>暂无数据</span>
      </div>
      
      <!-- 虚拟列表内容 -->
      <div v-else class="virtual-list" :style="{ transform: `translateY(${offsetTop}px)` }">
        <div 
          v-for="item in visibleItems" 
          :key="item.id" 
          class="table-row" 
          @click="handleSelectMusic(item)"
        >
          <span>{{ item.name }}</span>
          <span>{{ item.artistName }}</span>
          <span>{{ item.albumName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  padding: 20px;
  height: 80vh;
  width: 100%;
  overflow: auto;
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
    transition: background 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #07c160;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 14px;
}

/* 表格容器 */
.table-container {
  position: relative;
  width: 100%;
}

/* 表头 */
.table-header {
  position: sticky;
  top: 0;
  background-color: #f5f5f5;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  z-index: 100; /* 提高 z-index 确保完全遮挡下面的内容 */
  font-weight: 500;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 添加阴影增强层次感 */
}

/* 虚拟列表 */
.virtual-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

/* 表格行 */
.table-row {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
}

/* 表格单元格 */
span {
  margin-right: 10px;
  display: inline-block;
  width: 30%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}
</style>
