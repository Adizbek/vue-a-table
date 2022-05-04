<template>
  <table class="table table-bordered table-hover a-table">
    <thead class="thead-light">
    <tr :key="index" v-for="(colRows,index) in builtColumns">
      <th :key="col.column.field" v-for="col in colRows" :width="col.column.width">
        <span v-html="col.column.label"/>

        <span v-if="col.column.sortable" @click="doSort(col.column.field)"
              class="ml-1" style="cursor:pointer;">
          <i v-if="col.column.field === sortBy.column && sortBy.direction === 1" class="mdi mdi-sort-ascending"></i>
          <i v-else-if="col.column.field === sortBy.column && sortBy.direction === -1"
             class="mdi mdi-sort-descending"></i>

          <i v-else class="mdi mdi-sort"></i>
        </span>
      </th>
    </tr>
    </thead>

    <tbody v-if="transformedTableRows.length > 0">
    <tr v-for="row in transformedTableRows" :key="getRowKey(row)">
      <td :key="td.field" v-for="td in bottomColumns" :class="`text-${td.dataAlign || 'left'}`" :width="td.width">
        <component v-if="td.component" :is="td.component" :column="td.field" :row="row" :rows="rows" row-type="data"
                   :value="_get(row, td.field) "/>
        <span v-else>{{ _get(row, td.field) }}</span>
      </td>
    </tr>
    </tbody>

    <tfoot v-if="transformedFooterRows.length > 0" class="thead-light">
    <tr v-for="row in transformedFooterRows" :key="getRowKey(row)">
      <th :key="td.field" v-for="td in bottomColumns" :class="`text-${td.footerAlign || td.dataAlign || 'left'}`"
          :width="td.width">
        <component v-if="td.useComponentForFooter && td.component" :is="td.component" :column="td.field" :row="row"
                   :rows="rows" row-type="footer" :value="row[td.field]"/>
        <span v-else>{{ row[td.field] }}</span>
      </th>
    </tr>
    </tfoot>
  </table>
</template>

<script>
import _get from 'lodash.get'
import TableBuilder from "./TableBuilder";
import TableFooterCalculator from "./TableFooterCalculator";
import {findBottomColumns} from "./TableHelpers";

export default {
  name: "ATable",

  props: {
    columns: {
      type: Array,
    },

    rows: {
      type: Array
    },

    rowKey: {
      type: [String, Function],
      default: 'id'
    }
  },

  data() {
    return {
      sortBy: {},
    }
  },

  computed: {
    builtColumns() {
      let builder = new TableBuilder(this.columns);

      return builder.getAutoColumn();
    },

    /**
     * @returns {TableColumn[]}
     */
    bottomColumns() {
      return findBottomColumns(this.columns)
    },

    /**
     * @returns {Object<string, ValueTransformCallback>}
     */
    valueTransforms() {
      return this.bottomColumns.reduce((obj, cur) => {
        if (cur.valueTransform) {
          obj[cur.field] = cur.valueTransform
        }

        return obj
      }, {})
    },

    hasTransformer() {
      return this.transformerKeys.length > 0
    },

    transformerKeys() {
      return Object.keys(this.valueTransforms)
    },

    tableRows() {
      let data = [...this.rows];

      for (let row of data) {
        for (let col of this.bottomColumns) {
          if (typeof col.valueResolver === 'function') {
            row[col.field] = col.valueResolver(col.field, row)
          }
        }
      }

      data.forEach(this.assignRownums)

      if (this.sortBy && this.sortBy.direction)
        this.applySort(data, this.sortBy)

      return data;
    },

    footerRows() {
      return TableFooterCalculator(this.bottomColumns, this.tableRows)
    },

    transformedTableRows() {
      return this.tableRows.map(rows => {
        return this.transformValues(rows)
      })
    },

    transformedFooterRows() {
      return this.footerRows.map(rows => {
        return this.transformValues(rows)
      })
    }
  },

  methods: {
    _get,

    getRowKey(row) {
      if (typeof this.rowKey === 'string') {
        return row[this.rowKey]
      } else {
        return this.rowKey(row);
      }
    },

    transformValues(object) {
      let newData = {...object};

      for (let key of this.transformerKeys) {
        newData[key] = this.valueTransforms[key](object[key], key, object)
      }

      return newData;
    },

    assignRownums(object, index) {
      object._rownum = index + 1
    },

    /**
     * @param {any[]} data
     * @param {{direction: 1|-1, column: string}} sortBy
     */
    applySort(data, sortBy) {
      if (sortBy && sortBy.column) {
        data.sort((a, b) => {
          const column = sortBy.column;

          if (_get(a, column) < _get(b, column)) {
            return -1 * Math.sign(sortBy.direction);
          } else if (_get(a, column) > _get(b, column)) {
            return Math.sign(sortBy.direction);
          } else {
            return 0;
          }
        })
      }
    },

    /**
     * @param {string} dataField
     */
    doSort(dataField) {
      if (this.sortBy && this.sortBy.column === dataField) {
        const direction = this.sortBy.direction === 1 ? -1 : this.sortBy.direction === -1 ? undefined : 1;

        if (direction !== undefined) {
          this.sortBy = {
            column: dataField,
            direction
          }
        } else {
          this.sortBy = {};
        }
      } else {
        this.sortBy = {
          column: dataField,
          direction: 1
        }
      }
    }
  }
}
</script>

<style>
.a-table thead tr th {
  text-align: center;
  vertical-align: middle;
}

.a-table td {
  vertical-align: middle;
}
</style>
