/**
 * @typedef FooterContext
 *
 * @property {number} _avg
 * @property {number} _count
 * @property {number} _sum
 */

import {ifNull} from "./TableHelpers.js";

/**
 * @param {TableColumn[]} columns
 * @param {Object[]} data
 * @constructor
 */
export default function TableFooterCalculator(columns, data) {
    const depth = columns.reduce((t, c) => {
        if (Array.isArray(c.footer)) {
            return Math.max(t, c.footer.length);
        } else {
            return Math.max(t, typeof c.footer === 'string' ? 1 : 0);
        }
    }, 0)

    if (depth === 0) {
        return [];
    }

    const footers = new Array(depth)

    for (let i = 0; i < depth; i++) {
        footers[i] = {}
    }

    columns.forEach(c => {
        if (Array.isArray(c.footer)) {
            for (let i = 0; i < c.footer.length; i++) {
                footers[i][c.field] = createFooterFn(c.footer[i]);
            }
        } else if (typeof c.footer === 'string' || typeof c.footer === 'function') {
            footers[0][c.field] = createFooterFn(c.footer);
        }
    })

    const footerRows = [];

    footers.forEach((footerCells, level) => {
        let row = createFooterRow(footerCells, data, footerRows)
        row['_level'] = level

        footerRows.push(row);
    });

    return footerRows;
}

function createFooterRow(footerCells, data, footerRows) {
    const proxy = new Proxy(
        {
            _field: '__none__',
            _depth: 0,
            _data: data,
            _rows: footerRows,
        },
        {
            get(target, key, receiver) {
                if (key === '_field' || key === '_depth') {
                    return target[key]
                }

                if (key === '_count') {
                    return data.map(x => x[target._field]).length
                }

                if (key === '_vcount') {
                    return data.map(x => x[target._field]).filter(x => x !== null).length
                }

                if (key === '_sum') {
                    return data.map(x => parseFloat(x[target._field])).reduce((agr, c) => agr + ifNull(c, 0), 0)
                }

                if (key === '_avg') {
                    return data.map(x => parseFloat(x[target._field])).reduce((agr, c) => agr + ifNull(c, 0), 0) / data.length
                }

                // if result found in cache return it, otherwise calculate
                return key in target ?
                    target[key] :
                    callFooterFunction(footerCells[key], key, proxy);
            },
            set: function (obj, prop, value) {
                obj[prop] = value

                return true;
            },
        });

    return Object.keys(footerCells).reduce((row, key) => {
        row[key] = callFooterFunction(footerCells[key], key, proxy);

        return row;
    }, {})
}


/**
 * @param {string|function} fn
 * @returns {*}
 */
function createFooterFn(fn) {
    if (typeof fn === 'function') {
        return fn
    } else {
        fn = fn.replace(/@([\w.]+)/g, 'this.$1')
        return new Function(`return (${fn})`);
    }
}

/**
 * @param {function} fn
 * @param {string} field
 * @param {Object} footerData
 *
 * @desc Footer uchun qiymatni hisoblab beradi, field - qaysi maydon uchun hisoblanayotgani, depth - qidiruvda
 * nechi marta ichma ich, chaqirilganligi, agar depth katta bo'lsa, demak recursiv formula yozilgan serverda
 *
 * @return {string|number}
 */
function callFooterFunction(fn, field, footerData) {
    // eski qiymatni yozib qoyamiz pastga tushib chiqqanda qayta o'zlashtirish uchun
    let old = footerData._field;

    // yangi fieldni o'zlashtiramiz, aynan shu field uchun qiymat hisoblanadi
    footerData._field = field;
    // +1 pastga tushamiz
    footerData._depth += 1;

    // agar xatolik bersa 0 qiymat turadi
    let value = 0;

    // tushishlar soni 10 martadan oshib ketsa recursive call bo'lgani bildiradi, 0 qaytaramiz (hisoblashni imkoni yoq)
    if (footerData._depth > 10) {
        console.error(`Recursive call above 10! Checkout formula FN[ ${fn} ], FIELD = ${field}`)
    } else {
        value = fn.call(footerData)
    }

    // qiymatni footerni ma'lumotlari ichiga yozib qoyamiz, keyinchalik kerak bo'lganda qayta hisoblamaslik uchun
    footerData[field] = value;
    footerData._field = old;
    // tepaga chiqamiz
    footerData._depth -= 1;

    return value;
}
