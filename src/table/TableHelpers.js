export function ifNull(x, def) {
    return isNullNumeric(x) ? def : x
}

export function isNullNumeric(x) {
    return x === null || x === undefined || Number.isNaN(x)
}

export const findBottomColumns = (cols) => {
    return cols.reduce((arr, item) => {
        if (Array.isArray(item.children) && item.children.length > 0) {
            arr.push(...findBottomColumns(item.children))
        } else {
            arr.push(item)
        }

        return arr
    }, [])
}
