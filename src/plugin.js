import ATable from "./table/ATable";
import APaginatedTable from "./table/APaginatedTable";

const ATablePlugin = {
    /**
     * @param {Vue.VueConstructor} Vue
     * @param options
     */
    install(Vue, options = {}) {
        Vue.component('a-table', ATable)
        Vue.component('a-paginated-table', APaginatedTable)
    }
}


export default ATablePlugin;
