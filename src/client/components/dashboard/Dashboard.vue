<!--
  Template
-->
<template lang="jade">
div.gallery.row
  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter
    viewers-panel

  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter(v-for="panel in panels", :data-panel-name="panel.name")
    component(:is="panel", v-for="panel in panels")
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
import { loadPanels } from '../panelLoader/panelLoader';

import ViewersPanel from './panels/ViewersPanel.vue';

export default {
  components: {
    ViewersPanel
  },
  data() {
    return {
      panels: []
    };
  },
  methods: {
    loadPanels
  },
  mounted() {
    this.loadPanels()
      .then((panels) => {
        this.panels = panels;

        process.nextTick(() => {
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
        });
      });
  }
}
</script>