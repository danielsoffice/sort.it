import axios from 'axios';
import { v4 as uuid } from 'uuid';
import type { BoxDef, ThingDef } from '$lib/types';
import TextBox from '$lib/components/Items/TextBox.svelte';
import Link from '$lib/components/Items/Link.svelte';

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
        throw Error(`Failed to get ${type}`)
    return responseGet.json()
}
async function addChild(vars: { parent: string, kind: "box" | "item", type: string }) {
    const response = await axios.post(server + vars.kind + "/", {
        parent: vars.parent,
        id: uuid(),
        holds: "core.box",
        type: vars.type
    }, config).catch((error) => {
        throw new Error('Failed to create child: ' + error)
    })

    return response.data
}
async function updateThing(vars: { id: string, type: "box" | "item", data: {} }) {
    const response = await axios.patch(server + vars.type + "/" + vars.id + "/", vars.data, config).catch(() => { throw new Error("Failed to perform Update") })
    return response.data
}

async function deleteThing(vars: { id: string, type: "box" | "item" }) {
    const response = await axios.delete(server + vars.type + "/" + vars.id + "/", config).catch((error) => {
        throw new Error('Failed to Delete Thing')
    })
    return response.data
}



const box: Partial<BoxDef> = {
    kind: "box",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    childrenPassed: true
}

const item: ThingDef = {
    kind: "item",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    component: TextBox
}

const link: ThingDef = {
    kind: "item",
    sourceFunc: fetchThing,
    createFunc: addChild,
    mutateFunc: updateThing,
    deleteFunc: deleteThing,
    component: Link
}

export const init = (registerFunc: Function) => {
    registerFunc("box", box)
    registerFunc("item", item)
    registerFunc("link", link)
}