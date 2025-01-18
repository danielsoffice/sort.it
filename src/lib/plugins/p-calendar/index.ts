import TextBox from "$lib/components/Items/TextBox.svelte"
import type {Box, BoxDef, ItemDef, pluginInitFunc} from "$lib/types";

function getDates(id: string, type: "box" | "item"): any {
    const info = { type: "calendar.basic" }
    if (id.length > 10) {
        var now = new Date();
        var title = now.toLocaleDateString('en-US', { "month": "long" })
        let daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        return { ...info, holds: 'calendar.basic', children: [...Array(daysInMonth + 1).keys()].slice(1).map(x => x.toString()), title: title } as Box
    } else {
        return { ...info, holds: 'calendar.date', children: ["Event"], title: id } as Item
    }
}
function getDateItems(id: string, type: "box" | "item"): any {
    return { type: "calendar.date", content: { text: id }, id: id }
}

const basic: BoxDef = {
    kind: "box",
    holds: ['calendar.date', 'calendar.basic'],
    editable: false,
    sourceFunc: getDates,
}
const date: ItemDef = {
    kind: "item",
    sourceFunc: getDateItems,
    editable: false,
    component: TextBox
}
export const init: pluginInitFunc = ({registerType}) => {
    registerType("basic", basic)
    registerType("date", date)
}