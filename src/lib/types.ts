import type { SvelteComponent } from "svelte"

export type Kind = "box" | "item";
interface ThingDefGen {
    sourceFunc: (id: string, type: "box" | "item") => Promise<any>
    createFunc?: (vars: { parent: string, kind: "box" | "item", type: string }) => Promise<any>
    mutateFunc?: (vars: { id: string, type: "box" | "item", data: {} }) => Promise<any>
    deleteFunc?: (vars: { id: string, type: "box" | "item" }) => Promise<any>
    parentTypes?: string[]
    draggable?: boolean
}
interface BoxDefn {
    kind: "box"
    holds: string[]
    childTypes?: string[]
    childrenPassed?: boolean
}
interface ItemDefn {
    kind: "item"
    component: typeof SvelteComponent<any>
}

export type ThingDef = ThingDefGen & (BoxDefn | ItemDefn)
export type BoxDef = ThingDefGen & BoxDefn
export type ItemDef = ThingDefGen & ItemDefn

export interface Thing {
    id: string
    parent: string | null
    type: string
    [key: string]: any
}
export type Box = ({
    holds: string
    children: string[] | object[]
    order: Order
} | {
    order: Order
    copies: string
}) & Thing

export type Item = {
    content: { text: string, [key: string]: any }
} & Thing


type Order = {
    order: "default"
} | {
    order: "custom"
    custom: number[]
}