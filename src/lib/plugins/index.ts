import { plugins } from "./config.js"
import type { BoxDef, OrderDef, ThingDef, pluginInitFunc } from "$lib/types";
import { LogLevel, log } from "$lib/logging";

let defaultAttrs: Partial<ThingDef> = {
    parentTypes: [],
    childTypes: [],
}

export default class PluginManager {
    PLUGINS: string[]

    boxClasses: string[] = []
    itemClasses: string[] = []
    classes: { [plugin: string]: { [name: string]: ThingDef } } = {}

    orders: { [plugin: string]: { [name: string]: OrderDef } } = {}
    orderList: string[] = ['default', 'custom']



    constructor() {

        this.PLUGINS = [...plugins, "core"]
    }
    async loadPlugins() {
        let pluginsToLoad = structuredClone(this.PLUGINS)
        for (const plugin of pluginsToLoad) {
            let registerType = (name: string, thing: ThingDef) => this.registerType(plugin, name, thing)
            let registerOrder = (order: OrderDef) => this.registerOrder(plugin, order)
            let initFunc: pluginInitFunc;
            try {
                initFunc = (await import(`./p-${plugin}/index.ts`)).init
            } catch (e) {
                log(LogLevel.Error, `Plugin '${plugin}' is either not installed or is invalid.`)
                this.PLUGINS = this.PLUGINS.filter(currPlugin => currPlugin != plugin)
                continue;
            }
            initFunc({registerType, registerOrder})
        }
        for (const item of this.boxClasses) {
            let thing = this.getDef(item) as BoxDef
            if (thing.holds.length === 0)
                thing.holds = [...this.boxClasses, ...this.itemClasses]

        }
    }
    getDef(type: string) {
        const [plugin, name] = type.split(".");
        return this.classes[plugin][name];
    }

    registerType(plugin: string, name: string, thing: ThingDef) {
        const newClass = {
            ...defaultAttrs,
            ...thing
        }

        if (!this.classes[plugin])
            this.classes[plugin] = {}
        this.classes[plugin][name] = newClass

        if (thing.kind == "box")
            this.boxClasses.push(`${plugin}.${name}`)
        else
            this.itemClasses.push(`${plugin}.${name}`)

    }

    registerOrder(plugin: string, order: OrderDef) {
        if (!this.orders[plugin])
            this.orders[plugin] = {}
        this.orders[plugin][order.name] = order;
        this.orderList.push(`${plugin}.${order.name}`)
    }

}