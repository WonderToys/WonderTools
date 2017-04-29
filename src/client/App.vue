<!--
  Template
-->
<template lang="jade">
div.app-container
  div#main
    dashboard

  app-bar
</template>

<!-- 
  Style
-->
<style lang="less">
body {
  overflow-y: auto;
  background-color: #f4f4f4;
}

#main {
  margin-bottom: 64px;
}
</style>

<!-- 
  Script
-->
<script>
import Dashboard from './components/dashboard/Dashboard.vue';
import AppBar from './components/appBar/AppBar.vue';

export default {
  components: {
    Dashboard,
    AppBar,
  }
}
</script>