<!--
  Template
-->
<template lang="jade">
div#timersPanel.gallery-curve-wrapper
  div.gallery-header
    span Timers
    p.caption Manage timers, which allow you to "say" things in intervals in chat.
          
  div.gallery-body
    div.title-wrapper
      h4 Timers
    div.content(v-if="isActive")
      div.row
        div.right
          a.btn.waves-effect.waves-light.orange(href="#", @click="openAddModal")
            i.material-icons.left add
            | Add Timer

      div.row
        table.responsive-table.striped
          thead: tr
            td
            td(style="text-align: left;") Message
            td(style="width: 8rem;") Interval (min)
            td Enabled
          tbody
            tr(v-for="timer in timers")
              td: i.material-icons(@click="deleteTimer(timer)") delete
              td: input(type="text", v-model="timer.message", @blur="saveTimer(timer)")
              td(style="width: 8rem;")
                input(type="number", v-model.number="timer.interval", @blur="saveTimer(timer)", min="1")
              td
                input.filled-in(:id="`timer_${ timer._id }`", type="checkbox", v-model="timer.isEnabled", @change="saveTimer(timer)")
                label(:for="`timer_${ timer._id }`")

  //- Add modal
  div#addTimerModal.modal
    div.modal-content
      div.row(style="margin-bottom: 0;")
        div.input-field.col.s8.default-field
          input#newTimerMessage(type="text", v-model="newTimer.message")
          label(for="newTimerMessage") Message

        div.input-field.col.s4.default-field
          input#newTimerInterval(type="number", v-model="newTimer.interval", min="1")
          label.active(for="newTimerInterval") Interval (min)

    div.modal-footer
      a.btn-flat.modal-action.waves-effect.waves-orange(:class="{ disabled: !canSaveTimer }", @click="addNewTimer") Add
      a.btn-flat.modal-action.modal-close.waves-effect.waves-red Cancel
</template>

<!--
  Styles
-->
<style scoped lang="less">
td {
  text-align: center;

  i.material-icons {
    cursor: pointer;
  }

  input {
    margin-bottom: 0px !important;
  }
}
</style>

<!--
  Script
-->
<script>
import { debounce } from 'lodash';

import Timer from '../../../models/Timer';
import Globals from '../../../../bot/Globals';

let interval = null;

export default {
  props: [ 'isActive' ],
  data() {
    return {
      timers: [],
      newTimer: {
        message: '',
        interval: 1
      },
      canSaveTimer: false
    };
  },
  watch: {
    newTimer: {
      handler() {
        this.canSaveTimer = ( this.newTimer != null ) && ( this.newTimer.message != null && this.newTimer.message.trim().length > 0 ) &&
                            ( this.newTimer.interval != null && this.newTimer.interval >= 1 );
      },
      deep: true
    }
  },
  methods: {
    loadTimers() {
      Timer.find({})
        .then((timers) => this.timers = timers)
        .then(() => this.setupInterval());
    },
    openAddModal() {
      $('#addTimerModal').modal('open');
    },
    addNewTimer() {
      const timer = Timer.create(this.newTimer);
      timer.save()
        .then((timer) => {
          this.timers.push(timer);
          $('#addTimerModal').modal('close');
          this.$forceUpdate();
        });
    },
    deleteTimer(timer) {
      timer.delete()
        .then(() => {
          this.timers = this.timers.filter(t => t._id !== timer._id);
          this.$forceUpdate();
        })
    },
    saveTimer(timer) {
      timer.save();
    },
    setupInterval() {
      if ( interval == null ) {
        interval = setInterval(() => {
          this.timers.forEach((timer) => {
            if ( timer.isEnabled !== true || !Globals.connected ) return;

            if ( timer._count == null ) {
              timer._count = timer.interval;
            }
            timer._count--;

            if ( timer._count === 0 ) {
              Globals.say(timer.message);
              timer._count = timer.interval;
            }
          });
        }, 60000);
      }
    }
  },
  mounted() {
    this.loadTimers();

    const that = this;
    $(this.$el).find('#addTimerModal')
      .remove()
      .appendTo('body')
      .modal({
        complete() {
          that.newTimer.message = '';
          that.newTimer.interval = 1;
        }
      });
  },
  destroyed() {
    if ( interval != null ) {
      clearInterval(interval);
      interval = null;
    }
  }
}
</script>