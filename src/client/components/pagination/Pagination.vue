<!--
  Template
-->
<template lang="jade">
div.pagination-container
  ul.pagination
    li(:class="{ disabled: currentPage === 1, 'waves-effect': currentPage > 1 }")
      a(href="javascript:void(0);", @click="setCurrentPage(currentPage - 1)")
        i.material-icons chevron_left

    li(v-for="page in pages", :class="{ 'active orange': currentPage === page, 'waves-effect': (currentPage !== page) && page !== '...', disabled: page === '...' }")
      a(href="javascript:void(0);", @click="setCurrentPage(page)") {{ page }}

    li(:class="{ disabled: currentPage === numPages, 'waves-effect': currentPage < numPages }")
      a(href="javascript:void(0);", @click="setCurrentPage(currentPage + 1)")
        i.material-icons chevron_right
</template>

<!--
  Script
-->
<script>
export default {
  props: [ 'page', 'totalItems', 'perPage' ],
  data() {
    return {
      currentPage: this.page,
      numPages: 1,
      pages: [],
    };
  },
  watch: {
    totalItems() {
      this.calculatePages();
    },
    perPage() {
      this.calculatePages();
    }
  },
  methods: {
    setCurrentPage(page) {
      if ( page === '...' ) return;
      if ( page < 1 || page > this.numPages ) return;

      let previousPage = this.currentPage;

      this.currentPage = page;
      this.calculatePages();

      this.$emit('page-changed', this.currentPage, previousPage);
    },
    calculatePages() {
      if ( this.totalItems == null || this.perPage == null ) return;

      let pages = Math.floor(this.totalItems / this.perPage);
      if ( (this.totalItems % this.perPage) > 0 ) pages++;

      this.numPages = pages;

      const current = this.currentPage;
      const last = this.numPages;
      const delta = 2;
      const left = current - delta;
      const right = current + delta + 1;
      const range = [];
      const rangeWithDots = []
      let l = null;
    
      range.push(1)  
      for ( let i = current - delta; i <= current + delta; i++ ) {
        if ( i >= left && i < right && i < last && i > 1 ) {
          range.push(i);
        }
      }  
      range.push(last);

      for ( let i of range ) {
        if ( l ) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      }

      this.pages = rangeWithDots;
    }
  },
  mounted() {
    this.calculatePages();
  }
}
</script> 