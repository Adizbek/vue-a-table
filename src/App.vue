<template>
  <div id="app">
    <a-table :columns="cols" :rows="rows">
      <template v-slot:rank="{row, field, value, originalRow}">
        #{{ row.rank }} in local rating, field = {{ field }}, value = {{ value }}

        <input type="number" v-model="originalRow[field]">
      </template>

      <template #empty>
        <div>No data here!</div>
      </template>
    </a-table>

    <a-table :columns="cols" :rows="[]">
      <template #empty>
        <div>No data here!</div>
      </template>
    </a-table>

    <a-paginated-table :columns="cols" :rows="rows" :links="links"/>
    <a-paginated-table :columns="cols" :rows="[]" :links="links">
      <template #empty>
        <div>No data here!</div>
      </template>
    </a-paginated-table>
  </div>
</template>

<script>
import ATable from "@/table/ATable";
import APaginatedTable from "@/table/APaginatedTable";

export default {
  name: 'App',
  components: {APaginatedTable, ATable},

  data() {
    return {
      cols: [
        {label: 'ID', field: 'id'},
        {label: 'Name', field: 'name'},
        {label: 'Rank', field: 'rank'},
      ],
      rows: [
        {id: 1, name: "Adizbek", rank: 50},
        {id: 2, name: "Lazizbek", rank: 569}
      ],

      links: [
        {
          "url": null,
          "label": "&laquo; Previous",
          "active": false
        },
        {
          "url": "/clients?page=1",
          "label": "1",
          "active": true
        },
        {
          "url": "/clients?page=2",
          "label": "2",
          "active": false
        },
        {"url": "/clients?page=2", "label": "Next &raquo;", "active": false}
      ]
    }
  }
}
</script>

<style>
@import "~bootstrap/dist/css/bootstrap.min.css";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
