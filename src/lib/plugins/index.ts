import { plugins } from "./config.js"
import type { BoxDef, ThingDef } from "$lib/types";

let defaultAttrs: Partial<ThingDef> = {
    parentTypes: [],
    childTypes: [],
    childrenPassed: false,
}

export default class PluginManager {
    PLUGINS: string[]
    boxClasses: string[] = []
    itemClasses: string[] = []
    classes: { [plugin: string]: { [name: string]: ThingDef } } = {}


    constructor() {

        this.PLUGINS = [...plugins, "core"]
    }
    async loadPlugins() {
        for (const plugin of this.PLUGINS) {
            let register = (name: string, thing: ThingDef) => this.registerType(plugin, name, thing)
            let initFunc = (await import(`./p-${plugin}/index.ts`)).init
            initFunc(register)
        }
        for (const item of this.boxClasses) {
            let thing = this.getDef(item) as BoxDef
            if (thing.holds == undefined)
                thing.holds = [...this.boxClasses, ...this.itemClasses]

        }
    }
    getDef(type: string) {
        const [plugin, name] = type.split(".");
        return this.classes[plugin][name];
    }

    registerType(plugin: string, name: string, thing: ThingDef) {
        let newClass = {
            type: thing.kind,
            ...defaultAttrs,
            ...thing
        }
        if (thing.kind == "box")
            this.boxClasses.push(`${plugin}.${name}`)
        else
            this.itemClasses.push(`${plugin}.${name}`)

        if (!this.classes[plugin])
            this.classes[plugin] = {}
        this.classes[plugin][name] = newClass
    }

    registerSortAlg() { }
}