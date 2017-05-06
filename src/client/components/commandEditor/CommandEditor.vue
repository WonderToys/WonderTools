<!--
  Template
-->
<template lang="jade">
div.command-editor(wait-for="command", :data-command-id="command.config._id")
  div.row
    div.input-field.col.s6.default-field(v-if="fieldVisible('cooldown')")
      input(:id="`${ model._id }_cooldown`", type="number", v-model.number="model.cooldown", min="0")
      label.active(:for="`${ model._id }_cooldown`") Cooldown (seconds)

    div.input-field.col.s6.default-field(v-if="fieldVisible('userCooldown')")
      input(:id="`${ model._id }_userCooldown`", type="number", v-model.number="model.userCooldown", min="0")
      label.active(:for="`${ model._id }_userCooldown`") User Cooldown (seconds)

  div.row
    div.input-field.col.s4.default-field(v-if="fieldVisible('accessLevel')")
      select(:id="`${ model._id }_accessLevel`", v-model.number="model.accessLevel", @change="updateModel('accessLevel')")
        option(value="0") God
        option(value="1") Moderator
        option(value="2") Subscriber
        option(value="3") Follower
        option(value="4") Viewer
      label(:for="`${ model._id }_accessLevel`") Access Level

    div.input-field.col.s4.default-field(v-if="fieldVisible('messageTypes')")
      select(:id="`${ model._id }_messageTypes`", multiple, v-model="model.messageTypes")
        option(value="chat") Chat
        option(value="whisper") Whisper
      label(:for="`${ model._id }_messageTypes`") Message Types

    div.input-field.col.s4.default-field(v-if="fieldVisible('counterType')")
      select(:id="`${ model._id }_counterType`", v-model.number="model.counterType")
        option(value="1") None
        option(value="2") Automatic
        option(value="3") Manual
      label(:for="`${ model._id }_counterType`") Counter Type

  div.row(v-if="fieldVisible('isEnabled')")
    div.input-field.col.s12.default-field
      input.filled-in(:id="`${ model._id }_enabled`", type="checkbox", v-model="model.isEnabled")
      label(:for="`${ model._id }_enabled`") Enable this command
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

export default {
  props: [ 'command', 'hideFields' ],
  data() {
    return {
      model: this.command.config
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
    saveModel: debounce(function() {
      if ( this.model.cooldown < 0 ) this.model.cooldown = 0;
      if ( this.model.userCooldown < 0 ) this.model.userCooldown = 0;

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
    },
    fieldVisible(field) {
      return !this.hideFields.some(f => f === field);
    }
  },
  updated() {
    $('#pointSystemMainPanel [data-tooltip]').tooltip({ delay: 1000 });
  },
  mounted() {
    const that = this;

    const scoped = `.command-editor[data-command-id="${ this.model._id }"]`;
    $(`${ scoped } select`).material_select('destroy');
    $(`${ scoped } select`).material_select();
    $(`${ scoped } ul.multiple-select-dropdown input[type="checkbox"]`).addClass('filled-in');

    $('body').off('change.commandEditor', `${ scoped } .default-field select`);
    $('body').on('change.commandEditor', `${ scoped } .default-field select`, function() {
      that.updateModel($(this));
    });

    $('#pointSystemMainPanel [data-tooltip]').tooltip({ delay: 1000 });
  }
}
</script>