<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  ElMessage,
  ElIcon,
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElDialog,
} from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { useWebsiteStore, Website } from "@/stores/website";
import { useSearchStore } from "@/stores/search";
import defaultFavicon  from "@/assets/portal.svg";
import Draggable from "vuedraggable";

const { t } = useI18n();

const websiteStore = useWebsiteStore();
const searchStore = useSearchStore();

const isMobile = ref<boolean>(window.innerWidth <= 768);
const showModal = ref<boolean>(false);
const form = ref({ name: "", url: "" });

const saveLoading = ref<boolean>(false);
const failedIcons = ref<number[]>([]); // 记录加载失败的图标 id

watch(
  () => searchStore.searchTerm,
  (newTerm: string) => {
    websiteStore.syncFilteredList(newTerm);
  },
  { immediate: true }
);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(async () => {
  await websiteStore.fetchList();

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const gotoWebsite = (item: Website) => {
  window.open(item.url, "_blank");
};

// 图片加载失败时隐藏图标
const handleImageError = (e: Event, id: number) => {
  (e.target as HTMLImageElement).style.display = "none";
  failedIcons.value.push(id);
};

// 生成 favicon URL
const getFaviconUrl = (domain: string) => {
  try {
    const urlObj = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    return `${baseUrl}/favicon.ico`;
  } catch (e) {
    console.error("无效的URL:", domain);
    return "";
  }
};

const deleteWebsite = async (id: number, e: Event) => {
  e.stopPropagation();

  try {
    await websiteStore.deleteWebsite(id);
    ElMessage({
      message: t("message.deleteSuccess"),
      type: "success",
    });
  } catch (error) {
    ElMessage({
      message: t("message.deleteFailed") || "删除失败",
      type: "error",
    });
  }
};

const handleSave = async () => {
  saveLoading.value = true;
  try {
    await websiteStore.addWebsite({
      name: form.value.name.trim(),
      url: form.value.url.trim(),
    });
    ElMessage({
      message: t("message.saveSuccess"),
      type: "success",
    });
    closeModal();
  } catch (error) {
    ElMessage({
      message: t("message.saveFailed") || "保存失败",
      type: "error",
    });
  } finally {
    saveLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  form.value = { name: "", url: "" };
};

const onDragEnd = async () => {
  try {
    await websiteStore.updateSort();
    ElMessage.success(t("message.sortSuccess"));
  } catch (e) {
    ElMessage.error(t("message.sortFailed"));
    await websiteStore.fetchList();
  }
};
</script>

<template>
  <div>
    <Draggable
      v-model="websiteStore.filteredList"
      item-key="id"
      class="websites"
      animation="200"
      @end="onDragEnd"
      :disabled="searchStore.searchTerm"
    >
      <template #item="{ element: item }">
        <div class="website_item" @click="gotoWebsite(item)">
          <el-popconfirm
            class="box-item"
            width="200px"
            :title="$t('message.confirmDelete')"
            placement="top-end"
            @confirm="deleteWebsite(item.id, $event)"
            :confirm-button-text="$t('message.confirm')"
            :cancel-button-text="$t('message.cancel')"
          >
            <template #reference>
              <el-icon class="del_icon" @click.stop><Delete /></el-icon>
            </template>
          </el-popconfirm>

          <div class="website_icon">
            <img
              v-if="!failedIcons.includes(item.id)"
              :src="getFaviconUrl(item.url)"
              alt=""
              class="favicon"
              @error="handleImageError($event, item.id)"
            />
            <img v-else :src="defaultFavicon" alt="" class="favicon" />
          </div>
          <div class="website_name">{{ item.name }}</div>
        </div>
      </template>
    </Draggable>

    <el-empty
      v-if="websiteStore.filteredList.length === 0 && !websiteStore.loading"
      :description="$t('message.empty')"
      :image-size="100"
    />
  </div>

  <div class="add_button" @click="showModal = true">
    <el-button
      type="primary"
      circle
      icon="plus"
      size="large"
      style="font-size: 24px"
    ></el-button>
  </div>

  <!-- Element Plus 对话框 -->
  <el-dialog
    :title="$t('message.addShortcut')"
    :width="isMobile ? '90%' : '512px'"
    @close="closeModal"
    v-model="showModal"
    close-icon="false"
    custom-class="custom-dialog"
  >
    <el-form :model="form" label-width="50px">
      <el-form-item :label="$t('message.name')">
        <el-input v-model="form.name" :placeholder="$t('message.example') + '：GitHub'" />
      </el-form-item>
      <el-form-item :label="$t('message.url')">
        <el-input
          v-model="form.url"
          :placeholder="$t('message.example') + '：https://github.com'"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        :style="{
          padding: '0 16px',
          display: saveLoading ? 'none' : 'inline-block',
        }"
        @click="closeModal"
        >{{ $t("message.cancel") }}</el-button
      >
      <el-button
        type="primary"
        style="padding: 0 16px"
        @click="handleSave"
        :disabled="!form.name.trim() || !form.url.trim()"
        :loading="saveLoading"
      >
        {{ $t("message.save") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 网站列表容器 - 响应式布局 */
.websites {
  text-align: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px; /* 使用gap替代margin，更现代的布局方式 */
  padding-bottom: 40px;
}

/* 网站项 - 响应式尺寸 */
.website_item {
  flex: 0 0 clamp(80px, 20vw, 100px); /* 最小80px，最大100px，中间自适应 */
  height: clamp(100px, 25vw, 120px);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
  width: clamp(80px, 20vw, 100px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .del_icon {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 16px;
    color: var(--text-color);
    cursor: pointer;
    opacity: 0;
  }

  &:hover {
    /* 鼠标悬停时悬浮 */
    transform: scale(1.05);
    border-color: var(--primary-color);

    .del_icon {
      opacity: 0.7;
    }
  }
}

/* 图标容器 */
.website_icon {
  width: clamp(40px, 10vw, 48px);
  height: clamp(40px, 10vw, 48px);
  border-radius: 50%;
  margin-bottom: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favicon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 网站名称 */
.website_name {
  width: 90%;
  overflow: hidden;
  /* 超出一行隐藏 不显示省略号 */
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: clamp(12px, 2.5vw, 14px);
  color: var(--text-color);
}

/* 媒体查询 - 针对移动端优化 */
@media (max-width: 768px) {
  .websites {
    gap: 12px;
  }

  .website_item {
    flex: 0 0 calc(25% - 12px); /* 移动端每行4个 */
    height: 100px;

    /* 在移动端始终显示删除图标 */
    .del_icon {
      opacity: 0.6;
    }

    /* 移动端触摸效果 */
    &:active {
      transform: scale(0.95);
    }
  }

  /* 修复Element Plus对话框在移动端的样式 */
  :deep(.el-dialog) {
    margin: 0 auto;
    max-width: 95%;
  }

  :deep(.el-dialog__body) {
    padding: 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 14px;
  }

  :deep(.el-input) {
    font-size: 14px;
  }

  /* 适配更小的屏幕（手机） */
  @media (max-width: 480px) {
    .website_item {
      flex: 0 0 calc(33.33% - 20px); /* 小屏每行3个 */
    }
  }
}

.add_button {
  position: fixed;
  bottom: 50px;
  right: 50px;
  z-index: 1000;
}

/* 拖拽时鼠标变抓手 */
.website_item {
  cursor: grab;
}
.website_item:active {
  cursor: grabbing;
}

/* 拖拽占位半透明 */
:deep(.sortable-ghost) {
  opacity: 0.5;
  background: #f5f5f5;
}
</style>
