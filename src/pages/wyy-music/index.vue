<script setup lang="ts">
import Header from "./components/Header.vue";
</script>

<template>
  <div class="wrapper">
    <Header />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100vh;
  padding-top: 75px;
  .content {
    height: 100%;
  }
}
</style>
