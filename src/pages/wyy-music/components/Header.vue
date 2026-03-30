<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
<template>
  <header class="top-nav">
    <div class="top-nav-inner">
      <div class="logo">
        <a hidefocus="true">网易云音乐</a>
      </div>

      <nav class="nav-links">
        <RouterLink to="/wyy-music/find" class="nav-link">发现音乐</RouterLink>
        <RouterLink to="/wyy-music/lrh" class="nav-link">我的音乐</RouterLink>
        <RouterLink to="/" class="nav-link disabled">下载客户端</RouterLink>
        <a
          href="https://api-wyy-coding.vercel.app/docs/#/?id=neteasecloudmusicapienhanced"
          target="_blank"
          class="nav-link"
        >
          查看文档
        </a>
      </nav>
    </div>
  </header>
  <div class="redbox"></div>
</template>
<style>
.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;

  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #242424;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.top-nav-inner {
  width: 100%;
  max-width: 1200px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.logo {
  background: url(@/assets/images/topbar.png) no-repeat 0 9999px;
  float: left;
  width: 176px;
  height: 69px;
  background-position: 0 0;
}

.logo a {
  float: left;
  width: 157px;
  height: 100%;
  padding-right: 20px;
  text-indent: -9999px;
}

.nav-links {
  float: left;
  margin-left: 40px;
  line-height: 70px;
  color: #ccc;

  .nav-link {
    float: left;
    padding: 0 20px;
    position: relative;

    &:hover {
      background: #000;
    }
  }

  .nav-link.router-link-active {
    background: #000;
    color: #fff;
  }

  .nav-link.router-link-active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #c20c0c;
  }

  .nav-link.disabled {
    pointer-events: none;
  }
}

.redbox {
  height: 5px;
  border-bottom: none;
  background-color: #c20c0c;
  position: absolute;
  top: 70px;
  left: 0;
  width: 100%;
}
</style>
