<!--
  Template
-->
<template lang="jade">
div.command-editor(wait-for="command", :data-command-id="getScopedId(model)")
  div.row(v-if="command.isCustom === true")
    div.input-field.col.s6.default-field
      input(:id="`${ getScopedId(model) }_command`", type="text", v-model="model.command")
      label.active(:for="`${ getScopedId(model) }_command`") Command

    div.input-field.col.s6.default-field
      input(:id="`${ getScopedId(model) }_actionString`", type="text", v-model="model.actionString")
      label.active(:for="`${ getScopedId(model) }_actionString`") Action Text

  div.row
    div.input-field.col.s6.default-field(v-if="fieldVisible('cooldown')")
      input(:id="`${ getScopedId(model) }_cooldown`", type="number", v-model.number="model.cooldown", min="0")
      label.active(:for="`${ getScopedId(model) }_cooldown`") Cooldown (seconds)

    div.input-field.col.s6.default-field(v-if="fieldVisible('userCooldown')")
      input(:id="`${ getScopedId(model) }_userCooldown`", type="number", v-model.number="model.userCooldown", min="0")
      label.active(:for="`${ getScopedId(model) }_userCooldown`") User Cooldown (seconds)

  div.row
    div.input-field.col.s4.default-field(v-if="fieldVisible('accessLevel')")
      select(:id="`${ getScopedId(model) }_accessLevel`", v-model.number="model.accessLevel", @change="updateModel('accessLevel')")
        option(value="0") God
        option(value="1") Moderator
        option(value="2") Subscriber
        option(value="3") Follower
        option(value="4") Viewer
      label(:for="`${ getScopedId(model) }_accessLevel`") Access Level

    div.input-field.col.s4.default-field(v-if="fieldVisible('messageTypes')")
      select(:id="`${ getScopedId(model) }_messageTypes`", multiple, v-model="model.messageTypes")
        option(value="chat") Chat
        option(value="whisper") Whisper
      label(:for="`${ getScopedId(model) }_messageTypes`") Message Types

    div.input-field.col.s4.default-field(v-if="fieldVisible('counterType')")
      select(:id="`${ getScopedId(model) }_counterType`", v-model.number="model.counterType")
        option(value="1") None
        option(value="2") Automatic
        option(value="3") Manual
      label(:for="`${ getScopedId(model) }_counterType`") Counter Type

  div.row(v-if="fieldVisible('isEnabled')")
    div.input-field.col.s12.default-field
      input.filled-in(:id="`${ getScopedId(model) }_enabled`", type="checkbox", v-model="model.isEnabled")
      label(:for="`${ getScopedId(model) }_enabled`") Enable this command

  div.row(v-for="ex in addExtensions", v-html="ex.value(command)", v-if="model._id != null")

</template>

<!--
  Style
-->
<style scoped lang="less">
div.row {
  &:last-child {
    margin-bottom: 0;
  }
}
</style>

<!--
  Script
-->
<script>
import { debounce } from 'lodash';

import { getExtensions } from '../panelLoader/panelLoader';

export default {
  props: [ 'command', 'hideFields' ],
  data() {
    return {
      model: this.command.config,
      addExtensions: []
    };
  },
  watch: {
    command: {
      handler() {
        this.saveModel();
      },
      deep: true
    }
  },
  methods: {
    getScopedId(model) {
      return model._id || 'new';
    },
    saveModel: debounce(function() {
      if ( this.model == null || this.model._id == null ) return;
      
      if ( typeof(this.model.cooldown) === 'string' || this.model.cooldown < 0 ) this.model.cooldown = 0;
      if ( typeof(this.model.userCooldown) === 'string' || this.model.userCooldown < 0 ) this.model.userCooldown = 0;
      this.$forceUpdate();

      this.model.save();
    }, 500),
    updateModel(element) {
      const elementId = element.attr('id');
      const field = elementId.split('_')[1];
      const value = element.val();

      if ( Array.isArray(value) ) {
        this.model[field] = value;
      }
      else {
        this.model[field] = parseInt(value);
      }

      this.saveModel();
      console.log('saved');
    },
    fieldVisible(field) {
      const hideFields = this.hideFields || [];
      return !hideFields.some(f => f === field);
    }
  },
  updated() {
    const scoped = `.command-editor[data-command-id="${ this.getScopedId(this.model) }"]`;
    $(`${ scoped } select`).material_select('destroy');
    $(`${ scoped } select`).material_select();
    $(`${ scoped } ul.multiple-select-dropdown input[type="checkbox"]`).addClass('filled-in');
  },
  mounted() {
    const that = this;

    const scoped = `.command-editor[data-command-id="${ this.getScopedId(this.model) }"]`;
    $(`${ scoped } select`).material_select('destroy');
    $(`${ scoped } select`).material_select();
    $(`${ scoped } ul.multiple-select-dropdown input[type="checkbox"]`).addClass('filled-in');

    $('body').off('change.commandEditor', `${ scoped } .default-field select`);
    $('body').on('change.commandEditor', `${ scoped } .default-field select`, function() {
      that.updateModel($(this));
    });

    this.addExtensions = getExtensions('$CommandEditor')
      .filter(ex => ex.add != null)
      .map(ex => ex.add);
  }
}
</script>