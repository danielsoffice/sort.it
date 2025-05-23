import type { SvelteComponent } from "svelte"

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type pluginInitFunc = (registers: { registerType: (name: string, thing: ThingDef) => void, registerOrder: (order: OrderDef) => void }) => void

export type Kind = "box" | "item";
export type ViewOptionsDef = {
    orders?: string[]
    pages?: {
        controlType: 'arrows' | 'dropdown' | 'range'
        label?: string
    }
}
export type ViewOptions = {
    order: string
    page: string
}

interface ThingDefGen {
    sourceFunc: (id: string, type: "box" | "item", viewSelections?: ViewOptions) => Promise<Box | Item> | Box | Item
    mutateFunc?: (vars: { id: string, kind: "box" | "item", data: {} }) => Promise<any>
    deleteFunc?: (vars: { id: string, kind: "box" | "item" }) => Promise<any>
    parentTypes?: string[]
    draggable?: boolean
    editable?: boolean
}
interface BoxDefn {
    createFunc?: (vars: { parent: string, kind: "box" | "item", type: string, optionalData: { [key: string]: any } }) => Promise<any>
    kind: "box"
    holds: string[]
    childTypes?: string[]
    viewOptions?: ViewOptionsDef
    classes?: string
}
interface ItemDefn {
    kind: "item"
    component: typeof SvelteComponent<any>
}

/**
 * Should only be used in functions in which both boxes and items can be passed.
 * Should not be used to declare a box or item.
 */
export type ThingDef = ThingDefGen & (BoxDefn | ItemDefn)
export type BoxDef = ThingDefGen & BoxDefn
export type ItemDef = ThingDefGen & ItemDefn

export interface Thing {
    id: string
    parent: string | null
    type: string
    position: number
    [key: string]: any
}
export type Box = ({
    holds: string
    holds_type: "box" | "item"
    children: string[]
    order: Order
    kind: "box",
    title: string,
} | {
    order: Order
    copies: string
}) & Thing

export type Item = {
    content: { text: string, [key: string]: any }
    kind: "item"
} & Thing

export type OrderDef = {
    name: string
    desc?: string
    reversible: boolean
} & ({
    orderMethod: "compare"
    compareFunc: (child1: Item['content'], child2: Item['content']) => -1 | 0 | 1
} | {
    orderMethod: "full"
    orderFunc: () => void
})

type Order = {
    reversed: -1 | 1
} & ({
    order: "default"
} | {
    order: "checked"
} | {
    order: "custom"
    custom: number[]
})

export type storeChildUpdateFunction = (id: string, updateFunc: Function) => void

export type addChildAction = (
    optionalData?: { [key: string]: any },
    baseThing?: {
        id: string;
        placement: -1 | 1;
    }
) => Promise<Box | Item>;