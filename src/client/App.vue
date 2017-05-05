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
@import 'app';
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