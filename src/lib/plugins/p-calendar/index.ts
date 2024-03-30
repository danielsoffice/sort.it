import TextBox from "$lib/components/Items/TextBox.svelte"

function getDates(id: string, type: "box" | "item") {
    const info = { type: "calendar.basic" }
    if (id.length > 10) {
        var now = new Date();
        var title = now.toLocaleDateString('en-US', { "month": "long" })
        let daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        return { ...info, holds: 'calendar.basic', children: [...Array(daysInMonth + 1).keys()].slice(1).map(x => x.toString()), title: title }
    } else {
        return { ...info, holds: 'calendar.date', children: ["Event"], title: id }
    }
}
function getDateItems(id: string, type: "box" | "item") {

    return { type: "calendar.date", content: { text: id }, id: id }
}

const basic = {
    kind: "box",
    holds: ['calendar.date', 'calendar.basic'],
    sourceFunc: getDates,
}
const date = {
    kind: "item",
    sourceFunc: getDateItems,
    component: TextBox
}
export const init = (registerFunc: Function) => {
    registerFunc("basic", basic)
    registerFunc("date", date)
}