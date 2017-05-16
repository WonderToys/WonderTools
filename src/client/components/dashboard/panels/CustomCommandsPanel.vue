<!--
  Template
-->
<template lang="jade">
div#customCommandsPanel.gallery-curve-wrapper
  div.gallery-header
    span Custom Commands
    p.caption Add, remove, and modify custom commands. 
  div.gallery-body
    div.title-wrapper
      h4 Custom Commands
    div.content(v-if="isActive")
      div.row
        div.right
          a.btn.waves-effect.waves-light(href="#", @click="openAddModal")
            i.material-icons.left add
            | Add Custom Command
      div.row
        ul.collapsible.popout(data-collapsible="accordion", v-if="commands.length > 0")
          li(v-for="command in commands")
            div.collapsible-header 
              | {{ command.command }}
              div.right(style="display: inline-block; height: 25px; margin-top: 0.75rem;")
                i.material-icons(style="line-height: 22px; cursor: pointer;", @click.prevent="deleteCustomCommand(command)") delete
                input.filled-in(:id="`${ command.config._id }_enabled`", type="checkbox", v-model="command.config.isEnabled")
                label(:for="`${ command.config._id }_enabled`", data-position="top", data-tooltip="Disable this command", v-if="command.config.isEnabled === true")
                label(:for="`${ command.config._id }_enabled`", data-position="top", data-tooltip="Enable this command", v-else="")
            div.collapsible-body
              command-editor(:command="command", :hide-fields="[ 'isEnabled' ]")
        //- end accordion
        h5(v-else) No custom commands found!

  //- Add modal
  div#addCustomCommandModal.modal.modal-fixed-footer
    div.modal-content
      div.row
        p(style="font-size: 0.9rem;") Note that any module extensions are not shown for new commands and will need to be configured in the standard editor after the command has been created. This is due to an alpha/beta limitation and will be tackled before full release :)
      div.row
        command-editor(:command="newCommand", v-if="newCommand != null", :hide-fields="[ 'isEnabled' ]")
    div.modal-footer
      a.btn-flat.modal-action.waves-effect.waves-orange(:class="{ disabled: !canSaveCommand }", @click="addCustomCommand") Add
      a.btn-flat.modal-action.modal-close.waves-effect.waves-red Cancel
</template>

<!--
  Styles
-->
<style lang="less">
#addCustomCommandModal {
  input.select-dropdown {
    margin-bottom: 0px;
  }
}
</style>

<!--
  Script
-->
<script>
import CommandEditor from '../../commandEditor/CommandEditor.vue';

import { Command, CommandConfig } from '../../../../bot/core/command/Command';
import commandStore from '../../../../bot/core/command/commandStore';


const DEFAULT_NEW_COMMAND = {
  isCustom: true,
  isEnabled: true,
  accessLevel: 4,
  counterType: 1,
  cooldown: 0,
  userCooldown: 0,
  messageTypes: [ 'chat' ],
  command: null,
  actionString: null
};

// Exports
export default {
  props: [ 'isActive' ],
  components: {
    CommandEditor
  },
  data() {
    return {
      commands: [],
      newCommand: null,
      canSaveCommand: false
    };
  },
  watch: {
    isActive() {
      if ( this.isActive !== true ) return;

      this.loadCommands();
    },
    newCommand: {
      handler() {
        this.canSaveCommand = (this.newCommand != null) &&
                              (this.newCommand.command != null && this.newCommand.command.trim().length > 0) &&
                              (this.newCommand.actionString != null && this.newCommand.actionString.trim().length > 0)
      },
      deep: true
    }
  },
  methods: {
    openAddModal() {
      $('#addCustomCommandModal').modal('open');
    },
    addCustomCommand() {
      this.newCommand
        .save()
        .then(() => commandStore._register(this.newCommand))
        .then(() => {
          this.loadCommands();
          $('#addCustomCommandModal').modal('close');
        });
    },
    deleteCustomCommand(command) {
      commandStore._removeCustomCommand(command.command)
        .then(() => this.loadCommands());
    },
    loadCommands() {
      this.commands = commandStore._commands.filter(c => c.isCustom === true);
      this.$nextTick(() => {
        const $element = $(this.$el);

        $element.find('.collapsible').collapsible();
        $element.find('[data-tooltip]').tooltip({ delay: 1000 });
      });
    }
  },
  updated() {
    const $element = $(this.$el);
    $element.find('[data-tooltip]').tooltip({ delay: 1000 });
  },
  mounted() {
    const $element = $(this.$el);

    const that = this;
    $element.find('#addCustomCommandModal')
      .remove()
      .appendTo('body')
      .modal({
        ready() {
          that.newCommand = new Command(CommandConfig.create(DEFAULT_NEW_COMMAND));
        },
        complete() {
          that.newCommand = null;
        }
      });

    $element.find('[data-tooltip]').tooltip({ delay: 1000 });
  }
}
</script>