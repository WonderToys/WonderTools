<!--
  Template
-->
<template lang="jade">
div#variablesPanel.gallery-curve-wrapper
  div.gallery-header
    span Variables
    p.caption View a list of every available variable.
  div.gallery-body
    div.title-wrapper
      h4 Variables
    div.content(v-if="isActive")
      div.row
        span.red-text Note that this panel is still a work in progress. It's not the prettiest but it works... for now :)
      div.row
        table.striped.responsive-table
          thead: tr
            td Variable
            td Description
            td Usage
          tbody
            tr(v-for="variable in variables")
              td {{ variable.displayName || variable.name }}
              td {{ variable.description }}
              td {{ variable.usage }}
</template>

<!--
  Script
-->
<script>
import variableStore from '../../../../bot/core/variable/variableStore';

export default {
  props: [ 'isActive' ],
  data() {
    return {
      variables: []
    };
  },
  watch: {
    isActive() {
      if ( this.isActive !== true ) return;

      this.loadVariables();
    }
  },
  methods: {
    loadVariables() {
      this.variables = variableStore._variables.sort((a, b) => {
        const aName = a.displayName || a.name;
        const bName = b.displayName || b.name;

        return aName.localeCompare(bName);
      });
    }
  }
}
</script>