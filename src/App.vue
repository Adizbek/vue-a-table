<template>
  <div id="app">
    <a-table :columns="cols" :rows="rows"/>
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
      ],
      rows: [
        {id: 1, name: "Adizbek"},
        {id: 2, name: "Lazizbek"}
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
