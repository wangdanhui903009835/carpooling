<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>
<script>
  window.onresize =function(){
    let winWidth = document.body.clientWidth;
    let size = (winWidth / 750) * 100;
    document.documentElement.style.fontSize = (size < 100 ? size : 100) + 'px';
  }();
  let winWidth = document.body.clientWidth;
  let size = (winWidth / 750) * 100;
  document.documentElement.style.fontSize = (size < 100 ? size : 100) + 'px';
  export default {
  name: 'App'
}
</script>
