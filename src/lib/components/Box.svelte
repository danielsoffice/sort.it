<script lang="ts">
    import type { v5 } from "uuid";
    import DataLoader from "./DataLoader.svelte";
    import { useMutation, useQueryClient } from "@sveltestack/svelte-query";
    import { getContext, setContext } from "svelte";
    import type { Box, BoxDef } from "$lib/types";
    import TypeSelector from "./Controls/TypeSelector.svelte";
    import Svg from "./SVG.svelte";
    import { dndzone } from "svelte-dnd-action";
    import { errorDispatcher } from "$lib/utils";

    export let id: string;
    export let parent: [string, null | string];
    export let box: Box;

    let children: { id: string }[] = [];
    $: orderChildren(box.children, box.order);

    function orderChildren(initChildren: string[], order: object) {
        let childs = initChildren.map((id) => ({ id }));
        let needsFixing = false;
        if (box.order)
            switch (box.order["order"]) {
                case "custom":
                    let temp: { id: string }[] = [];
                    box.order.custom.forEach((index) => {
                        if (index >= childs.length || index <= -1) {
                            errorDispatcher.log(
                                400,
                                "Attempted to access invalid index. " +
                                    "ID: " +
                                    id
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
                    break;
                case "default":
                default:
                    break;
            }
        children = childs;
        if (needsFixing) saveCustomOrder();
    }

    const queryClient = useQueryClient();

    const parentDef: BoxDef = (getContext("getDef") as Function)(parent[0]);
    const def: BoxDef = (getContext("getDef") as Function)(box.type);

    $: holdsBoxes = box.holds
        ? (getContext("isBox") as Function)(box.holds)
        : true;

    if (!holdsBoxes)
        setContext("makeReal", (content: {}) => {
            console.log("made it real!");
        });

    let self: HTMLDivElement;

    const invalBox = (boxID: typeof v5) =>
        queryClient.invalidateQueries(["box", boxID]);
    const invalSelf = () => queryClient.invalidateQueries(["core.box", id]);
    const updateSelf = (data: Box) => {
        queryClient.setQueryData(["core.box", id], data);
    };
    const invalParent = () => queryClient.invalidateQueries(parent);
    const deleteAction = useMutation(
        parentDef.deleteFunc || (() => ({} as Promise<any>)),
        {
            onSuccess: invalParent,
        }
    );

    const updateAction = useMutation(
        def.mutateFunc || (() => ({} as Promise<any>)),
        {
            onSuccess: (data: Box) => updateSelf(data),
        }
    );

    const createAction = useMutation(
        def.createFunc || (() => ({} as Promise<any>)),
        {
            onSuccess: invalSelf,
        }
    );
    function addChildEvent() {
        $createAction.mutate({
            parent: id,
            kind: holdsBoxes ? "box" : "item",
            type: box.holds,
        });
    }

    function changeTypeEvent(type: string) {
        $updateAction.mutate({
            id: id,
            type: "box",
            data: { holds: type },
        });
    }

    function deleteEvent() {
        if (!box.children.length || box.type != "core.box")
            $deleteAction.mutate({
                id: id,
                type: "box",
            });
    }
    function saveCustomOrder(newChildren?: { id: string }[]) {
        let customOrder: number[];
        if (newChildren != undefined) {
            customOrder = newChildren.map((child) =>
                box.children.indexOf(child.id)
            );
            if (
                box.order.order == "custom" &&
                box.order.custom.toString() == customOrder.toString()
            )
                return;
        } else {
            customOrder = children.map((child) =>
                box.children.indexOf(child.id)
            );
        }

        $updateAction.mutate({
            id: id,
            type: "box",
            data: {
                order: {
                    order: "custom",
                    custom: customOrder,
                },
            },
        });
    }

    function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
        console.log(e);
        children = e.detail.items;
    }
    function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
        saveCustomOrder(e.detail.items);
    }
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
                    >＋</button
                >
            </div>
        {/if}
        {#if parentDef.deleteFunc && parent[1] !== null}
            <div>
                <button on:click={deleteEvent} on:keypress={deleteEvent}
                    >⨉</button
                >
            </div>
        {/if}
        {#if true}
            <div class="options">
                <Svg icon="options" />
            </div>
        {/if}
    </div>
    <input class="title" type="text" value={box.title} />
    <div
        class="children"
        class:holdsItems={!holdsBoxes}
        use:dndzone={{
            items: children,
            type: box.copies ? id : box.holds,
            dragDisabled: holdsBoxes,
            dropFromOthersDisabled: box.copies,
        }}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
    >
        {#each children as child (child.id)}
            <DataLoader
                parent={[box.type, id]}
                id={child.id}
                thing={box.holds}
            />
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
        background-color: white;
        border: 1px solid var(--box-color);
        color: var(--box-color);
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
        font-size: 60%;
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
        border-bottom: 1px solid var(--box-color);
        line-height: 1.25;
        font-size: 0.65rem;
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
    }
</style>
