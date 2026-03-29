<script setup lang="ts">
</script>
<template>
  <div class="title">
    <h1>{{ $t("global.title") }}</h1>
    <span class="beta">{{ $t("global.beta") }}</span>
  </div>
</template>
<script setup lang="ts"></script>

<style scoped lang="scss">
.title {
  display: flex;
  line-height: 56px;
}

.title h1 {
  font-size: clamp(16px, 5vw, 24px);
  font-weight: 400;
}

.title .beta {
  font-size: clamp(12px, 2vw, 14px);
  font-weight: 400;
  margin-left: 8px;
}
</style>
