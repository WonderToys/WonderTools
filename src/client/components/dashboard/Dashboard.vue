<!--
  Template
-->
<template lang="jade">
div.gallery.row
  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter(data-panel-name="$ViewersPanel")
    viewers-panel(:is-active="isPanelActive('$ViewersPanel')")

  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter(v-for="panel in panels", :data-panel-name="panel")
    component(:is="panel", :is-active="isPanelActive(panel)")
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
      panels: [],
      activePanel: ''
    };
  },
  methods: {
    loadPanels,
    isPanelActive(panel) {
      return this.activePanel === panel;
    }
  },
  mounted() {
    this.loadPanels()
      .then((panels) => {
        this.panels = panels;

        this.$nextTick(() => {
          const that = this;
          var $masonry = $('.gallery');
          
          $masonry.masonry({
            itemSelector: '.gallery-filter',
            columnWidth: '.gallery-filter',
            transitionDuration: 0
          });

          $('.gallery-expand').galleryExpand({
            onShow($e) {
              that.activePanel = $e.attr('data-panel-name');
              $e.find('ul.tabs').tabs();
            },
            onHide($e) {
              that.activePanel = '';
            }
          });
        });
      });
  }
}
</script>