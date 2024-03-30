<script lang="ts">
    import { dragDropStatus } from "$lib/stores";
    import DataLoader from "./DataLoader.svelte";
    import { createMutation, useQueryClient } from "@tanstack/svelte-query";
    import { getContext, setContext } from "svelte";
    import type { Box, BoxDef, Item, OrderDef, ThingDef } from "$lib/types";
    import TypeSelector from "./Controls/TypeSelector.svelte";
    import Svg from "./SVG.svelte";
    import { dndzone } from "svelte-dnd-action";
    import { errorDispatcher } from "$lib/utils";
    import TextBox from "./Items/TextBox.svelte";

    export let id: string;
    export let parent: [string, null | string];
    export let box: Box;

    let children: { id: string }[] = [];
    $: orderChildren(box.children, box.order);

    const manager = getContext("PluginManager") as PluginManager;

    function orderChildren(initChildren: string[], order: object) {
        let childs = initChildren.map((id) => ({ id }));
        let needsFixing = false;

        // TODO: allow box ordering
        if (box.holds_type == "box") {
            children = childs;
            return;
        }

        const childContent = childs.map(
            (child) =>
                queryClient.getQueriesData<Item>({
                    queryKey: [box.holds, { id: child.id }],
                })[0][1] as Item,
        );

        if (box.order) {
            if (box.order.order === "custom") {
                console.log("custom");
            } else if (box.order.order.includes(".")) {
                const [plugin, orderBy]: string[] = box.order.order.split(".");
                if(manager.orders[plugin] && manager.orders[plugin][orderBy])

                // if (manager.orders["core"]["Checked"].orderMethod == "compare")
                //     orderDefinition = manager.orders["core"][
                //         "Checked"
                //     ] as OrderDef & { orderMethod: "compare" };
                // else
                //     orderDefinition = manager.orders["core"][
                //         "Checked"
                //     ] as OrderDef & { orderMethod: "full" };

                // let compareFn = orderDefinition.compareFunc;
            }
        }
        if (box.order)
            switch (box.order["order"]) {
                case "custom":
                    var temp: { id: string }[] = [];
                    box.order.custom.forEach((index) => {
                        if (index >= childs.length || index <= -1) {
                            errorDispatcher.log(
                                400,
                                "Attempted to access invalid index. " +
                                    "ID: " +
                                    id,
                            );
                            needsFixing = true;
                        } else {
                            let spliced = childs.splice(index, 1, {
                                id: "",
                            })[0];
                            if (spliced.id) temp.push(spliced);
                        }
                    });

                    temp = [
                        ...temp,
                        ...childs.filter((child) => child.id != ""),
                    ];
                    childs = structuredClone(temp);
                    children = childs;
                    break;
                case "checked":
                    if (
                        manager.orders["core"]["Checked"].orderMethod ==
                        "compare"
                    ) {
                        let orderDefinition = manager.orders["core"][
                            "Checked"
                        ] as OrderDef & { orderMethod: "compare" };
                        childContent.sort((child1, child2) => {
                            let compareFn = orderDefinition.compareFunc;
                            return compareFn(child1.content, child2.content);
                        });
                    }

                    children = childContent.map((child) => ({ id: child.id }));
                    break;
                case "default":
                    children = childContent;
                default:
                    break;
            }
        if (needsFixing) saveCustomOrder();
    }

    const queryClient = useQueryClient();

    import { useIsMutating } from "@tanstack/svelte-query";
    import { flip } from "svelte/animate";
    import { quintOut } from "svelte/easing";
    import { blur, fade, fly, scale, slide } from "svelte/transition";
    import type PluginManager from "$lib/plugins";
    const isMutatingChildren = useIsMutating({
        mutationKey: [box.holds, { parent: id, type: "update" }],
    });
    isMutatingChildren.subscribe((value) => {
        if (value === 0) orderChildren(box.children, box.order);
    });

    const getDef: (thing: string) => ThingDef = getContext("getDef");
    const parentDef: BoxDef = getDef(parent[0]) as BoxDef;
    const def: BoxDef = getDef(box.type) as BoxDef;

    $: holdsBoxes = (getContext("isBox") as Function)(box.holds);

    if (!holdsBoxes)
        setContext("makeReal", (content: {}) => {
            console.log("made it real!");
        });

    let self: HTMLDivElement;

    const invalSelf = () =>
        queryClient.invalidateQueries({ queryKey: [box.type, { id }] });
    const updateSelf = (data: Box) => {
        queryClient.setQueriesData({ queryKey: [box.type, { id }] }, data);
    };
    const invalParent = () =>
        queryClient.invalidateQueries({
            queryKey: [parent[0], { id: parent[1] }],
        });
    const deleteAction = createMutation({
        mutationFn: parentDef.deleteFunc || (() => ({}) as Promise<any>),

        onSuccess: invalParent,
    });

    const updateAction = createMutation({
        mutationKey: [box.type, { id, parent: parent[1], type: "update" }],
        mutationFn: def.mutateFunc || (() => ({}) as Promise<any>),
        onSuccess: (data: Box) => updateSelf(data),
    });

    const createAction = createMutation({
        mutationKey: [box.type, { id, parent: parent[1], type: "create" }],
        mutationFn: def.createFunc || (() => ({}) as Promise<any>),

        onSuccess: invalSelf,
    });
    function addChildEvent(optionalData: { [key: string]: any } = {}) {
        let data: any;
        $createAction.mutate(
            {
                parent: id,
                type: box.holds,
                kind: box.holds_type,
                optionalData,
            },
            {
                onSuccess(datas, variables, context) {
                    data = structuredClone(datas);
                },
            },
        );
        return data;
    }

    function changeTypeEvent(type: string) {
        $updateAction.mutate({
            id: id,
            kind: "box",
            data: { holds: type, holds_type: getDef(type).kind },
        });
    }

    function deleteEvent() {
        if (!box.children.length || box.type != "core.box")
            $deleteAction.mutate({
                id: id,
                kind: "box",
            });
    }
    function saveCustomOrder(newChildren?: { id: string }[]) {
        let customOrder: number[];
        if (newChildren != undefined) {
            customOrder = newChildren.map((child) =>
                box.children.indexOf(child.id),
            );
            if (
                box.order.order == "custom" &&
                box.order.custom.toString() == customOrder.toString()
            )
                return;
        } else {
            customOrder = children.map((child) =>
                box.children.indexOf(child.id),
            );
        }

        $updateAction.mutate({
            id: id,
            kind: "box",
            data: {
                order: {
                    order: "custom",
                    custom: customOrder,
                },
            },
        });
    }

    function saveContent(content: Record<string, any>) {
        $updateAction.mutate({
            id: id,
            kind: "box",
            data: { title: content.text },
        });
    }

    function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
        console.log(e);
        children = e.detail.items;
    }
    function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
        saveCustomOrder(e.detail.items);
    }

    setContext("createFunction", addChildEvent);
</script>

<div
    id={id.toString()}
    class="box"
    bind:this={self}
    style={"opacity:" + (false ? 0.5 : 1).toString()}
    data-id={id}
>
    <div class="control-bar">
        {#if def.createFunc}
            <div>
                <button on:click={addChildEvent} on:keypress={addChildEvent}
                    ><Svg icon="plus" /></button
                >
            </div>
        {/if}
        {#if parentDef.deleteFunc && parent[1] !== null}
            <div>
                <button on:click={deleteEvent} on:keypress={deleteEvent}
                    ><Svg icon="ex" width=".95rem" height=".95rem" /></button
                >
            </div>
        {/if}
        {#if true}
            <div class="options">
                <Svg icon="options" />
            </div>
        {/if}
    </div>
    <div>
        <TextBox
            content={{ text: box.title ?? "" }}
            updater={saveContent}
            rows={1}
        />
    </div>
    <div
        class="children"
        class:holdsItems={!holdsBoxes}
        use:dndzone={{
            items: children,
            type: box.copies ? id : box.holds,
            dragDisabled: holdsBoxes || !$dragDropStatus,
            dropFromOthersDisabled: box.copies,
        }}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
    >
        {#each children as child (child.id)}
            <div
                animate:flip={{ duration: 250, easing: quintOut }}
                in:scale={{ duration: 150 }}
                out:slide={{ duration: 150, axis: "x" }}
            >
                <DataLoader
                    parent={[box.type, id]}
                    id={child.id}
                    thing={box.holds}
                />
            </div>
        {/each}
    </div>
    {#if !box.children.length && def.holds.length > 1}
        <div class="info">
            <TypeSelector
                holds={def.holds}
                initVal={box.holds}
                {changeTypeEvent}
            />
            <!-- {:else}
            <div style={"flex: 10 10 100% !important;"}>{box.holds}</div> -->
        </div>
    {/if}
    <!-- {#if !holdsBoxes}
            <Item
                item={{ id: "", parent: id, type: box.holds }}
                parent={[box.type, id]}
            />
        {/if} -->
</div>

<style>
    .children {
        padding: 3px;
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
    }
    .holdsItems {
        flex-direction: column;
    }
    .box {
        transition-duration: 0.3s;
        border: 1px solid;
        min-width: var(--box-width);
        margin: 3px;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
    }
    .children {
        overflow: auto;
    }
    .info {
        height: 25px;
        text-align: center;
        font-size: 80%;
    }
    /* .info div {
        display: inline-block;
        margin-top: 4px;
    } */
    input {
        outline: none;
    }
    .options {
        flex: 0 0 16px;
        padding: 2px;
    }
    .control-bar {
        border-bottom: 1px solid inherit;
        /* line-height: 1.25; */
        font-size: 80%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        background: var(--box-color);
        overflow: hidden;
        color: white;
    }
    .control-bar button {
        background-color: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
    }

    :global(.control-bar div) {
        flex: 1 1 auto;
        text-align: center;
    }

    .control-bar button:hover {
        background: #0001;
    }

    .title {
        display: block;
        width: calc(100% - 8px);
        margin-left: 2px;
        text-decoration: inherit;
        border: none;
        border-bottom: 1px solid gray;
        margin-bottom: 5px;
        background: transparent;
    }
    button {
        /* padding: 0px; */
        /* height: 1.2rem; */
    }
</style>
