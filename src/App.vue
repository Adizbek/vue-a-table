<template>
  <div id="app">
    <a-table :columns="cols" :rows="rows">
      <template v-slot:rank="{row, field, value}">
        #{{row.rank}} in local rating, field = {{field}}, value = {{value}}
      </template>
    </a-table>
  </div>
</template>

<script>
import ATable from "@/table/ATable";

export default {
  name: 'App',
  components: {ATable},

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
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
