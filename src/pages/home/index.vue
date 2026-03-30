<script setup lang="ts">
import Header from "@/components/Header/index.vue";
</script>

<template>
  <div class="container">
    <div class="header">
      <Header />
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  width: 100%;
  padding-top: 56px;

  .header {
    height: 56px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: var(--bg-color);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
}
</style>
