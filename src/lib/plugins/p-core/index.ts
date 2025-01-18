import axios from 'axios';
import { v4 as uuid } from 'uuid';
import type { BoxDef, ItemDef, OrderDef, ThingDef, pluginInitFunc } from '$lib/types';
import TextBox from '$lib/components/Items/TextBox.svelte';
import Link from '$lib/components/Items/Link.svelte';
import Checkable from '$lib/components/Items/Checkable.svelte';
import RichText from '$lib/components/Items/RichText.svelte';
import Embed from '$lib/components/Items/Embed.svelte';

const config = {
    // proxy: {
    //     host: '/api',
    //     // port: 8001
    // }
}
// const server = "https://sortit.danielsoffice.us/api/"
const server = "http://localhost:8000/api/"

async function fetchThing(id: string, type: "box" | "item") {
    let responseGet = await fetch(`${server + type}/${id}/ `)
    if (responseGet.status !== 200)
        throw Error(responseGet.status.toString())
    return responseGet.json()
}
async function addChild(vars: { parent: string, kind: "box" | "item", type: string, optionalData: { [key: string]: any } }) {
    const optionalData = vars.optionalData ?? {}
    const response = await axios.post(server + vars.kind + "/", {
        parent: vars.parent,
        id: uuid(),
        holds: "core.box",
        holds_type: "box",
        type: vars.type,
        ...optionalData
    }, config).catch((error) => {
        throw new Error('Failed to create child: ' + error)
    })

    return response.data
}
async function updateThing(vars: { id: string, kind: "box" | "item", data: {} }) {
    const response = await axios.patch(server + vars.kind + "/" + vars.id + "/", vars.data, config).catch(() => { throw new Error("Failed to perform Update") })
    return response.data
}

async function deleteThing(vars: { id: string, kind: "box" | "item" }) {
    const response = await axios.delete(server + vars.kind + "/" + vars.id + "/", config).catch((error) => {
        throw new Error('Failed to Delete Thing')
    })
    return response.data
}



const box: BoxDef = {
    kind: "box",
    holds: [],
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
}

const item: ItemDef = {
    kind: "item",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    component: TextBox
}

const richText: ItemDef = {
    kind: "item",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    component: RichText
}

const link: ItemDef = {
    kind: "item",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    component: Link
}

const embed: ItemDef = {
    kind: "item",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    component: Embed
}

async function fetchCheckables(id: string, type: "box" | "item") {
    let thing = await fetchThing(id, type);
    // thing['children'] = [...thing['children'], {
    //     id: "a",
    //     parent: id,
    //     type: "checkable",
    //     kind: "item",
    //     content: { text: "fuck you" }
    // }]
    thing.content = { text: "dad" }
    return thing

}

const checkable: ThingDef = {
    kind: "item",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    component: Checkable
}

const orderByChecked: OrderDef = {
    name: "Checked",
    reversible: true,
    orderMethod: "compare",
    compareFunc: (
        child1: Item["content"],
        child2: Item["content"]
    ) =>
        child1.is_checked
            ? child2.is_checked
                ? 0
                : 1
            : child2.is_checked
                ? -1
                : 0
}

const orderByAlphabetical: OrderDef = {
    name: "Alphabetical",
    reversible: true,
    orderMethod: "compare",
    compareFunc: (child1: Item["content"], child2: Item["content"]) =>
        child1.text?.toLowerCase() < child2.text?.toLowerCase() ?
            -1 : child1.text?.toLowerCase() > child2.text?.toLowerCase() ? 1 : 0
    ,
}

export const init: pluginInitFunc = ({registerType, registerOrder}) => {
    registerType("box", box)
    registerType("item", item)
    registerType("richtext", richText)
    registerType("link", link)
    registerType("checkable", checkable)
    registerType("embed", embed)

    registerOrder(orderByChecked)
    registerOrder(orderByAlphabetical)
}