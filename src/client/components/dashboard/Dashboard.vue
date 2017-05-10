<!--
  Template
-->
<template lang="jade">
div.gallery.row
  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter(data-panel-name="$ModulesPanel")
    modules-panel(:is-active="isPanelActive('$ModulesPanel')", @modules-changed="onModulesChanged")

  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter(data-panel-name="$CustomCommandsPanel")
    custom-commands-panel(:is-active="isPanelActive('$CustomCommandsPanel')")
      
  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter(data-panel-name="$ViewersPanel")
    viewers-panel(:is-active="isPanelActive('$ViewersPanel')")

  div.col.l3.m4.s12.gallery-item.gallery-expand.gallery-filter(v-for="panel in panels", :data-panel-name="panel")
    component(:is="panel", :is-active="isPanelActive(panel)")

  div#scrollButtonContainer.fixed-action-btn(style="bottom: 12px; right: 11%;", :class="{ visible: showToTopButton }")
    a.btn-floating.btn-large.orange.waves-effect.waves-light(@click="scrollTop")
      i.material-icons arrow_upward
</template>

<!--
  Style
-->
<style scoped lang="less">
@import 'components/dashboard/dashboard';

#scrollButtonContainer {
  opacity: 0;
  transition: opacity 0.4s ease-out;

  &.visible {
    opacity: 1.0;
    transition: opacity 0.4s ease-in;    
  }

  a {
    border-radius: 4px;
    width: 40px;
    height: 40px;
    line-height: 40px;

    > i.material-icons {
      line-height: 40px;
    }
  }
}
</style>

<!--
  Script
-->
<script>
import { loadPanels } from '../panelLoader/panelLoader';

import CustomCommandsPanel from './panels/CustomCommandsPanel.vue';
import ViewersPanel from './panels/ViewersPanel.vue';
import ModulesPanel from './panels/ModulesPanel.vue';

export default {
  components: {
    CustomCommandsPanel,
    ViewersPanel,
    ModulesPanel
  },
  data() {
    return {
      panels: [],
      activePanel: '',
      showToTopButton: false,
      didModulesChange: false
    };
  },
  watch: {
    activePanel() {
      if ( this.activePanel === '' && this.didModulesChange === true ) {
        this.$nextTick(() => {
          location.reload();
        });
      }
    }
  },
  methods: {
    isPanelActive(panel) {
      return this.activePanel === panel;
    },
    scrollTop() {
      $('.placeholder').animate({ scrollTop: 0 }, 'fast');
    },
    onModulesChanged() {
      this.didModulesChange = true;
    },
    setupPanels() {
      return loadPanels()
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

            $('.placeholder').off('scroll');
            $('.placeholder').on('scroll', function() {
              const $this = $(this);
              if ( $this.scrollTop() >= 500 ) {
                that.showToTopButton = true;
              }
              else {
                that.showToTopButton = false;
              }
            });
          });
        });
    }
  },
  mounted() {
    this.setupPanels();
  }
}
</script>