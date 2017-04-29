<!--
  Template
-->
<template lang="jade">
div.gallery.row
  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter
    viewers-panel
</template>

<!--
  Style
-->
<style scoped lang="less">
@import 'components/dashboard/dashboard';
</style>

<!--
  Script
-->
<script>
import ViewersPanel from './panels/ViewersPanel.vue';

export default {
  components: {
    ViewersPanel
  },
  updated() {
    $('.gallery-expand').galleryExpand({
      onShow($e) {
        $e.find('ul.tabs').tabs();
      }
    });
  },
  mounted() {
    var $masonry = $('.gallery');
    $masonry.masonry({
      itemSelector: '.gallery-filter',
      columnWidth: '.gallery-filter',
      transitionDuration: 0
    });

    $('.gallery-expand').galleryExpand({
      onShow($e) {
        $e.find('ul.tabs').tabs();
      }
    });
  }
}
</script>