<script lang="ts">
    import {dragDropStatus, readOnlyStatus} from "$lib/stores";
    import DataLoader from "./DataLoader.svelte";
    import { createMutation, useQueryClient } from "@tanstack/svelte-query";
    import { getContext, setContext } from "svelte";
    import type { Box, BoxDef, Item, OrderDef, ThingDef } from "$lib/types";
    import TypeSelector from "./Controls/TypeSelector.svelte";
    import Svg from "./SVG.svelte";
    import {dndzone, dragHandleZone, SHADOW_ITEM_MARKER_PROPERTY_NAME} from "svelte-dnd-action";
    import { errorDispatcher } from "$lib/utils";
    import TextBox from "./Items/TextBox.svelte";

    export let id: string;
    export let parent: [string, null | string];
    export let box: Box;

    let reverseOrder: 1 | -1 = 1;
    let children: { id: string }[] = [];
    $: orderChildren(box.children, box.order, reverseOrder);

    const manager = getContext("PluginManager") as PluginManager;

    /**
     * Responsible for initial order as well as re-ordering if list of children or order changes.
     * The box component re-renders when children is assigned, so it is assigned once before completion.
     * @param initChildren
     * @param order
     */
    function orderChildren(
        initChildren: string[],
        order: object,
        reverse: 1 | -1,
    ) {
        let workingChildren = initChildren.map((id) => ({ id }));

        // TODO: allow box ordering
        if (box.holds_type == "box") {
            return (children = workingChildren);
        }

        if (box.order) {
            if (box.order.order === "custom") {
                let needsCustomOverwrite = false;

                if (!box.order.custom) {
                    children = workingChildren;
                    saveCustomOrder();
                    return;
                }

                var temp: { id: string }[] = [];
                box.order.custom.forEach((index) => {
                    if (index >= workingChildren.length || index <= -1) {
                        errorDispatcher.log(
                            400,
                            "Attempted to access invalid index. " + "ID: " + id,
                        );
                        needsCustomOverwrite = true;
                    } else {
                        let spliced = workingChildren.splice(index, 1, {
                            id: "",
                        })[0];
                        if (spliced.id) temp.push(spliced);
                    }
                });

                temp = [
                    ...temp,
                    ...workingChildren.filter((child) => child.id != ""),
                ];
                workingChildren = structuredClone(temp);
                children = workingChildren;

                if (needsCustomOverwrite) saveCustomOrder();
            }
            // return if order.order is invalid
            if (!box.order.order.includes(".")) {
                children = workingChildren;
                return;
            }
            const [plugin, orderBy]: string[] = box.order.order.split(".");
            // return if specified order is undefined
            if (!manager.orders[plugin] || !manager.orders[plugin][orderBy]) {
                children = workingChildren;
                return;
            }

            // all other ordering relies on data beyond the ids
            const childrenWithContent = workingChildren.map(
                (child) =>
                    queryClient.getQueriesData<Item>({
                        queryKey: [box.holds, { id: child.id }],
                    })[0][1] as Item,
            );

            // necessary step to avoid TypeScript errors
            manager.orders[plugin][orderBy].orderMethod = manager.orders[
                plugin
            ][orderBy].hasOwnProperty("compareFunc")
                ? "compare"
                : "full";

            //
            if (manager.orders[plugin][orderBy].orderMethod == "compare") {
                const orderDefinition = manager.orders[plugin][
                    orderBy
                ] as OrderDef & { orderMethod: "compare" };

                childrenWithContent.sort(
                    (child1, child2) =>
                        orderDefinition.compareFunc(
                            child1.content,
                            child2.content,
                        ) * reverse,
                );

                // if (reverse) childrenWithContent.reverse();

                children = childrenWithContent.map((child) => ({
                    id: child.id,
                }));
            } else {
                const orderDefinition = manager.orders[plugin][
                    orderBy
                ] as OrderDef & { orderMethod: "full" };

                console.log("Order unhandled: ", orderDefinition.name);

                children = workingChildren;
                return;
            }
        }
    }

    const queryClient = useQueryClient();

    import { useIsMutating } from "@tanstack/svelte-query";
    import { flip } from "svelte/animate";
    import { quintOut } from "svelte/easing";
    import { blur, fade } from "svelte/transition";
    import type PluginManager from "$lib/plugins";
    import PopupMenu from "./PopupMenu.svelte";
    import PopupModal from "$lib/components/PopupModal.svelte";
    const isMutatingChildren = useIsMutating({
        mutationKey: [box.holds, { parent: id, type: "update" }],
    });

    const getDef: (thing: string) => ThingDef = getContext("getDef");
    const parentDef: BoxDef = getDef(parent[0]) as BoxDef;
    let def: BoxDef = getDef(box.type) as BoxDef;

    let deleteAction;
    let updateAction;
    let createAction;
    let fakeMutation = createMutation({
        mutationFn: ()=>console.log("Read-only mode prevented write.")
    })

    let savedMutations: {[key: string]: any};
    readOnlyStatus.subscribe((status: boolean)=>{
        if(status){
            savedMutations = {
                createAction: createAction,
                updateAction: updateAction,
                deleteAction: deleteAction
            }
            createAction = fakeMutation;
            updateAction = fakeMutation;
            deleteAction = fakeMutation;
        } else if (savedMutations){
            ({deleteAction, updateAction, createAction} = savedMutations);
            console.log("Read mode disabled")
        }
    })

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
    deleteAction = createMutation({
        mutationFn: parentDef.deleteFunc || (() => ({}) as Promise<any>),

        onSuccess: invalParent,
    });

    updateAction = createMutation({
        mutationKey: [box.type, { id, parent: parent[1], type: "update" }],
        mutationFn: def.mutateFunc || (() => ({}) as Promise<any>),
        onSuccess: (data: Box) => updateSelf(data),
    });

    createAction = createMutation({
        mutationKey: [box.type, { id, parent: parent[1], type: "create" }],
        mutationFn: def.createFunc || (() => ({}) as Promise<any>),

        onSuccess: invalSelf,
    });

    isMutatingChildren.subscribe((value) => {
        if (value === 0) orderChildren(box.children, box.order, reverseOrder);
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

    function saveResize(width: number){
        $updateAction.mutate({
            id: id,
            kind: "box",
            data: { geometry: {width} },
        });
    }

    // console.log(saveResize)

    function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
        // children = e.detail.items
        console.log(e.detail.items);
        // children = e.detail.items;
    }
    function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
        // children = e.detail.items
        // saveCustomOrder(e.detail.items);
        console.log(children)

    }

    setContext("createFunction", addChildEvent);

    function updateOrder(name: string) {
        $updateAction.mutate({
            id: id,
            kind: "box",
            data: {
                order: {
                    ...box.order,
                    order: name,
                },
            },
        });
    }

    const enableAnimations = true;

    let controlBarVisible = true;
</script>

<div
    id={id.toString()}
    class="box"
    bind:this={self}
    style={"opacity:" + (false ? 0.5 : 1).toString()}
    data-id={id}
>
    <div class="control-bar">
        {#if controlBarVisible}
            {#if def.createFunc}
                <div>
                    <button
                        class="icon-btn"
                        on:click={addChildEvent}
                        on:keypress={addChildEvent}><Svg icon="plus" /></button
                    >
                </div>
            {/if}
            {#if parentDef.deleteFunc && parent[1] !== null && false}
                <div>
                    <button
                        class="icon-btn"
                        on:click={deleteEvent}
                        on:keypress={deleteEvent}
                        ><Svg
                            icon="ex"
                            width=".95rem"
                            height=".95rem"
                        /></button
                    >
                </div>
            {/if}
            {#if box.holds_type === "item"}
                <PopupMenu>
                    <svelte:fragment slot="button">
                        <Svg icon="order" />
                    </svelte:fragment>
                    <svelte:fragment slot="menu">
                        <div id="order-dropdown">
                            <button
                                class="icon-btn"
                                on:click={() => {
                                    reverseOrder *= -1;
                                }}
                            >
                                {#if reverseOrder === 1}
                                    <Svg icon="order-ascending" />
                                {:else}
                                    <Svg icon="order-descending" />
                                {/if}
                            </button>
                            <TypeSelector
                                holds={manager.orderList}
                                initVal={box.order
                                    ? box.order.order
                                    : "default"}
                                changeTypeEvent={updateOrder}
                            />
                        </div>
                    </svelte:fragment>
                </PopupMenu>
            {/if}
        {:else}
            <h4 contenteditable={true}>{box.title}</h4>
        {/if}
        <div>
            <button
                class=" icon-btn"
                on:click={() => (controlBarVisible = !controlBarVisible)}
            >
                <Svg icon="options" />
            </button>
        </div>
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
                    data-is-dnd-shadow-item-hint={child[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
                animate:flip={{
                    duration: enableAnimations ? 250 : 0,
                    easing: quintOut,
                }}
                in:fade={{ duration: enableAnimations ? 400 : 0 }}
                out:blur={{ duration: enableAnimations ? 400 : 0 }}
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
        display: contents;
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

    #order-dropdown {
        display: flex;
    }

    :global(.control-bar > div) {
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
</style>
