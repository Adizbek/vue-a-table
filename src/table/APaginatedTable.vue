<template>
  <div>
    <a-table :columns="columns" :rows="rows">
      <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope"/>
      </template>
    </a-table>

    <base-pagination v-if="links && links.length > 3" :links="links" :tag="linkTag"/>
  </div>
</template>

<script>
import ATable from "./ATable";
import BasePagination from "../pagination/BasePagination";

export default {
  name: "APaginatedTable",
  components: {BasePagination, ATable},

  props: {
    columns: {
      type: Array
    },

    rows: {
      type: Array
    },

    links: {
      type: Array
    },

    linkTag: {}
  }
}
</script>
