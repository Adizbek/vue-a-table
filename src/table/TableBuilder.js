/**
 * @callback ValueTransformCallback
 * @param  {number|string|any} value
 * @param  {string} key
 * @param  {object} row
 */

/**
 * @callback ValueResolverCallback
 * @param  {string} key
 * @param  {object} row
 */

/**
 * @typedef TableColumn
 * @property {string} field
 * @property {string} label
 * @property {boolean} sortable
 * @property {string|'auto'} width
 * @property {'left'|'right'|'center'} dataAlign
 * @property {'left'|'right'|'center'} footerAlign
 * @property {string|string[]|function|function[]} footer
 * @property {boolean} useTemplateForFooter
 * @property {?ValueTransformCallback} valueTransform
 * @property {?ValueResolverCallback} valueResolver


/**
 * @param {TableColumn} column
 * @param {Number} row
 * @param {Number} col
 * @param {Number} rowspan
 * @param {Number} colspan
 * @constructor
 */
function Cell(column, row, col, rowspan, colspan) {
    this.column = column;
    this.row = row;
    this.col = col;
    this.rowspan = rowspan;
    this.colspan = colspan;

    if (!this.column.children || (Array.isArray(this.column.children) && this.column.children.length === 0)) {
        this.isDataField = true
    }
}

/**
 * @param {TableColumn[]} columns
 * @constructor
 */
export default function TableBuilder(columns) {
    this.columns = columns;
}

/**
 * @return {Cell[][]}
 */
TableBuilder.prototype.getAutoColumn = function () {
    let tree = this.groupedColumns();

    return this.getHeaderRows({
        columns: tree
    });
}

TableBuilder.prototype.groupedColumns = function () {
    const _groupColumns = (columns, currentRow = 0, parentColumn = {}, rows = []) => {
        // track how many rows we got
        rows[currentRow] = rows[currentRow] || [];
        const grouped = [];

        const setRowSpan = column => {
            const rowSpan = rows.length - currentRow;
            if (
                column &&
                (!column.children || column.children.length === 0) && // parent columns are supposed to be one row
                rowSpan > 1 &&
                (!column.rowSpan || column.rowSpan < rowSpan)
            ) {
                column.rowSpan = rowSpan;
            }
        };

        columns.forEach((column, index) => {
            const newColumn = {...column};
            rows[currentRow].push(newColumn);
            parentColumn.colSpan = parentColumn.colSpan || 0;
            if (newColumn.children && newColumn.children.length > 0) {
                newColumn.children = _groupColumns(newColumn.children, currentRow + 1, newColumn, rows);
                parentColumn.colSpan += newColumn.colSpan;
            } else {
                parentColumn.colSpan += 1;
            }
            // update rowspan to all same row columns
            for (let i = 0; i < rows[currentRow].length - 1; i += 1) {
                setRowSpan(rows[currentRow][i]);
            }
            // last column, update rowspan immediately
            if (index + 1 === columns.length) {
                setRowSpan(newColumn);
            }
            grouped.push(newColumn);
        });

        return grouped;
    };

    return _groupColumns(this.columns);
}

TableBuilder.prototype.getHeaderRows = function ({columns = [], currentRow = 0, rows = [], isLast = true}) {
    rows = rows || [];
    rows[currentRow] = rows[currentRow] || [];

    columns.forEach((column, i) => {
        if (column.rowSpan && rows.length < column.rowSpan) {
            while (rows.length < column.rowSpan) {
                rows.push([]);
            }
        }
        const cellIsLast = isLast && i === columns.length - 1;

        let cell = new Cell(column, currentRow, i, column.rowSpan || 1, column.colSpan || 1);

        if (Array.isArray(column.children) && column.children.length > 0) {
            this.getHeaderRows({
                columns: column.children,
                currentRow: currentRow + 1,
                rows,
                isLast: cellIsLast,
            });
        }
        if ('colSpan' in column) {
            cell.colSpan = column.colSpan;
        }
        if ('rowSpan' in column) {
            cell.rowSpan = column.rowSpan;
        }
        if (cell.colSpan !== 0) {
            rows[currentRow].push(cell);
        }
    });
    return rows.filter(row => row.length > 0);
}
