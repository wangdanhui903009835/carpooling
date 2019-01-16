<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
let winWidth = window.screen.width;//物理分辨率
let size = (winWidth/ 750)*100 ;
document.documentElement.style.fontSize = (size < 100 ? size : 100) + 'px';
export default {
  name: 'App'
}
</script>
