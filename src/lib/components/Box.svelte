<script lang="ts">
    import {preferences} from "$lib/stores";
    import DataLoader from "./DataLoader.svelte";
    import {createMutation, useIsMutating, useQueryClient} from "@tanstack/svelte-query";
    import {getContext, setContext} from "svelte";
    import type {Box, BoxDef, Item, OrderDef, storeChildUpdateFunction, ThingDef} from "$lib/types";
    import TypeSelector from "./Controls/TypeSelector.svelte";
    import Svg from "./SVG.svelte";
    import {type DndEvent, dragHandleZone, TRIGGERS} from "svelte-dnd-action";
    import {errorDispatcher} from "$lib/utils";
    import TextBox from "./Items/TextBox.svelte";
    import {flip} from "svelte/animate";
    import {quintOut} from "svelte/easing";
    import type PluginManager from "$lib/plugins";
    import PopupMenu from "./PopupMenu.svelte";
    import ConnectorLine from "$lib/components/ConnectorLine.svelte";

    export let id: string;
    export let parent: [string, null | string];
    export let box: Box;

    let children: { id: string }[] = [];
    $: orderChildren(box.children, box.order);

    const manager = getContext("PluginManager") as PluginManager;

    let childUpdateFunctions: {[id: string]: Function} = {};
    setContext("storeChildUpdateFunction", (id: Parameters<storeChildUpdateFunction>[0], updateFunc: Parameters<storeChildUpdateFunction>[1]) =>{
       childUpdateFunctions[id] = updateFunc;
    });

    /**
     * Responsible for initial order as well as re-ordering if list of children or order changes.
     * The box component re-renders when children is assigned, so it is assigned once before completion.
     * @param initChildren
     * @param order
     */
    function orderChildren(
        initChildren: string[],
        order: object,
    ) {
        let workingChildren = initChildren.map((id) => ({ id }));

        // TODO: allow box ordering
        if (box.holds_type == "box") {
            return (children = workingChildren);
        }

        if(box.children[0]){
            if(!queryClient.getQueryData([box.holds, { id: box.children[0], parent: id }])){
                console.log([box.holds, { id: box.children[0], parent: id }])
            }
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
                        ) * box.order.reversed,
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
        } else {
            children = workingChildren;
        }
    }



    const queryClient = useQueryClient();

    const isMutatingChildren = useIsMutating({
        mutationKey: [box.holds, { parent: id, type: "update" }],
    });

    const getDef: (thing: string) => ThingDef = getContext("getDef");
    const parentDef: BoxDef = getDef(parent[0]) as BoxDef;
    let def: BoxDef = getDef(box.type) as BoxDef;

    let deleteAction: any;
    let updateAction: any;
    let updateCloneAction: any;
    let createAction: any;
    let fakeMutation = createMutation({
        mutationFn: ()=>new Promise(()=>console.log("Read-only mode prevented write."))
    })


    $: holdsBoxes = (getContext("isBox") as Function)(box.holds);

    if (!holdsBoxes)
        setContext("makeReal", (content: {}) => {
            console.log("made it real!");
        });

    function saveCustomOrder(newChildren?: { id: string }[]) {
        let customOrder: number[];

        let childrenList = (newChildren ?? children).map((child) => child.id);
        
        if (
            box.order.order == "custom" && box.order.custom &&
            box.order.custom.toString() == childrenList.toString()
        ) return;

        $updateAction.mutate({
            id: id,
            kind: "box",
            data: {
                order: {
                    order: "custom",
                    custom: childrenList,
                },
            },
        });
    }

    let self: HTMLDivElement;

    const invalSelf = () =>
        queryClient.invalidateQueries({ queryKey: [box.type, { id }] });
    const updateSelf = (data: Box, boxId = id) => {
        queryClient.setQueriesData({ queryKey: [box.type, {id: boxId}] }, data);
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

    updateCloneAction = createMutation({
        mutationKey: [box.type, { id: box.id, parent: parent[1], type: "update" }],
        mutationFn: def.mutateFunc || (() => ({}) as Promise<any>),
        onSuccess: (data: Box) => updateSelf(data, box.id),
    });

    createAction = createMutation({
        mutationKey: [box.type, { id, parent: parent[1], type: "create" }],
        mutationFn: def.createFunc || (() => ({}) as Promise<any>),

        onSuccess: invalSelf,
    });

    let savedMutations: {[key: string]: any};
    preferences.subscribe(({readOnlyMode})=>{
        if(readOnlyMode){
            savedMutations = {
                createAction: createAction,
                updateAction: updateAction,
                updateCloneAction: updateCloneAction,
                deleteAction: deleteAction
            }
            createAction = fakeMutation;
            updateAction = fakeMutation;
            updateCloneAction = fakeMutation;
            deleteAction = fakeMutation;
        } else if (savedMutations){
            ({deleteAction, updateAction, updateCloneAction, createAction} = savedMutations);
        }
    })

    isMutatingChildren.subscribe((value) => {
        if (value === 0) orderChildren(box.children, box.order);
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
        if (box.children.length && box.type == "core.box" && !box.copies && !confirm("Are you sure you want to delete this box?")) return
        $deleteAction.mutate({
            id: box.id,
            kind: "box",
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
    const changeParent = createMutation({
        // mutationKey: [box.holds, { id: itemId, parent: id }],
        mutationFn: getDef(box.holds).mutateFunc || (() => ({}) as Promise<any>),
        onSuccess: (_data: Box) => invalSelf()
    });


    function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
        children = e.detail.items
    }
    function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
        children = e.detail.items

        if(e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ANOTHER) invalSelf()
        if(e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ZONE){
            const itemId = e.detail.info.id;
            const itemParent  = (queryClient.getQueryData([box.holds, { id: itemId, parent: id }])).parent;
            if(id === itemParent){
                saveCustomOrder(children);
            } else {
                if($preferences['readOnlyMode']) return

                $changeParent.mutate({
                    id: itemId,
                    kind: "item",
                    data: { parent: id },
                }, {
                    onSuccess() {
                        queryClient.invalidateQueries({ queryKey: [box.type, { id: itemParent }] })
                    },
                },)
            }

        }
    }

    setContext("createFunction", addChildEvent);

    function updateOrder(name: string) {
        $updateCloneAction.mutate({
            id:  box.id,
            kind: "box",
            data: {
                order: {
                    ...box.order,
                    order: name,
                },
            },
        });
    }

    function updateOrderReversed(reversed: -1 | 1) {
        $updateCloneAction.mutate({
            id:  box.id,
            kind: "box",
            data: {
                order: {
                    ...box.order,
                    reversed
                },
            },
        });
    }

    function copyEvent(optionalData: { [key: string]: any } = {}) {
        let data: any;
        let extraData = {...optionalData, copies: id}
        $createAction.mutate(
            {
                parent: parent[1],
                type: 'core.box',
                kind: 'box',
                optionalData: extraData,
            },
            {
                onSuccess(datas, variables, context) {
                    data = structuredClone(datas);
                    invalParent()
                },
            },
        );
        return data;
    }

    let controlBarVisible = true;

    let showCopiesOrigin = false;

    function customFade(params){
        console.log(params)
    }
</script>
{#if showCopiesOrigin}
    <ConnectorLine element1={self} element2={document.querySelector(`[data-id='${id}']`)} />
{/if}
<div
    {id}
    class="box"
    bind:this={self}
    style={"opacity:" + (false ? 0.5 : 1).toString()}
    data-id={box.id}
>
    <div class="control-bar">
        {#if controlBarVisible}
            {#if def.createFunc}
                <div>
<!--                    <button-->
<!--                        class="icon-btn"-->
<!--                        on:click={addChildEvent}-->
<!--                        on:keypress={addChildEvent}>-->
<!--                        <Svg icon="plus" /></button-->
<!--                    >-->
                    <PopupMenu onClick={addChildEvent}>
                        <svelte:fragment slot="button">
                            <Svg icon="plus" />
                        </svelte:fragment>
                        <svelte:fragment slot="secondary-menu">
                            <div class="dropdown">
                                <button class="btn">Add from file</button>
                            </div>
                        </svelte:fragment>
                    </PopupMenu>
                </div>
            {/if}
            {#if parentDef.deleteFunc && parent[1] !== null}
                <div>
                    <button
                        class="icon-btn"
                        on:click={deleteEvent}
                        on:keypress={deleteEvent}
                        ><Svg icon="ex"/>
                    </button
                    >
                </div>
            {/if}
            <div>
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
                                    updateOrderReversed(box.order.reversed === 1 ? -1 : 1);
                                }}
                            >
                                {#if box.order.reversed === 1}
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
                    <svelte:fragment slot="secondary-menu">
                        <div>hey</div>
                    </svelte:fragment>
                </PopupMenu>
            {/if}
            </div>
            {#if parent[1] && parentDef.createFunc && !box.copies}
            <div>
                <button
                        class="icon-btn"
                        on:click={copyEvent}
                        on:keypress={copyEvent}
                ><Svg icon="copy"/>
                </button
                >
            </div>{:else if box.copies }
                <div>
                    <button
                            class="icon-btn hoverable"
                            on:mouseenter={()=>showCopiesOrigin=true}
                            on:mouseleave={()=>showCopiesOrigin=false}
                    ><Svg icon="copy"/>
                    </button
                    >
                </div>
            {/if}
            {#if parent[1] === null}
                <div>
                    <button
                            title="Reload all boxes and items"
                            class="icon-btn"
                            on:click={()=>{queryClient.invalidateQueries()}}
                    ><Svg icon="refresh"/>
                    </button
                    >
                </div>
            {/if}
        {:else}
            <h3>{box.title}</h3>
        {/if}
        <div>
            <button
                class=" icon-btn"
                on:click={() => (controlBarVisible = !controlBarVisible)}
                on:contextmenu={()=>console.log(box)}
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
        id={id+"-children"}
        class="children"
        class:holdsItems={!holdsBoxes}
        use:dragHandleZone={{
            items: children,
            type: box.copies ? id : box.holds,
            dragDisabled: holdsBoxes || !$preferences['dragDropMode'],
            // dropFromOthersDisabled: true || box.copies,
        }}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
    >
        {#each children as child (child.id)}
            <div

                animate:flip={{
                    duration: $preferences['doAnimations'] ? 250 : 0,
                    easing: quintOut,
                }}
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
        </div>
    {/if}
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
    h3 {
        color: var(--item-text-color);
        font-weight: 600;
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
        flex: 0 0 auto;
    }

    #order-dropdown {
        display: flex;
    }

    :global(.control-bar > div) {
        flex: 1 1 auto;
        text-align: center;
    }

    :global(.control-bar button:hover) {
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
