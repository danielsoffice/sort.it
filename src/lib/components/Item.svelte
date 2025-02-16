<script lang="ts">
    import type { Item, storeChildUpdateFunction } from "$lib/types";
    import { getContext, onMount, setContext } from "svelte";
    import type { BoxDef, ItemDef } from "$lib/types";
    import { createMutation, useQueryClient } from "@tanstack/svelte-query";
    import Svg from "./SVG.svelte";
    import { dragHandle } from "svelte-dnd-action";
    import { preferences } from "$lib/stores";
    import { blur, slide } from "svelte/transition";
    import { cubicIn, linear, sineIn } from "svelte/easing";

    export let item: Item;
    export let parent: [string, null | string];

    const id = item.id;

    const queryClient = useQueryClient();

    const parentDef: BoxDef = (getContext("getDef") as Function)(parent[0]);
    const def: ItemDef = (getContext("getDef") as Function)(item.type);

    const invalParent = () =>
        queryClient.invalidateQueries({
            queryKey: [parent[0], { id: parent[1] }],
        });
    const updateSelf = (data: Item) => {
        queryClient.setQueryData([item.type, { id, parent: parent[1] }], data);
    };

    let deleteAction;
    let updateAction;
    let fakeMutation = createMutation({
        mutationFn: () => console.log("Read-only mode prevented write."),
    });

    deleteAction = createMutation({
        mutationFn: parentDef.deleteFunc || (() => ({}) as Promise<any>),

        onSuccess: invalParent,
    });
    updateAction = createMutation({
        mutationKey: [item.type, { id, parent: parent[1], type: "update" }],
        mutationFn: def.mutateFunc
            ? (data: any) => def.mutateFunc({ id, kind: "item", data: data })
            : () => ({}) as Promise<any>,
        onSuccess: (data: Item) => updateSelf(data),
    });

    let savedMutations: { [key: string]: any };
    preferences.subscribe(({ readOnlyMode }) => {
        if (readOnlyMode) {
            savedMutations = {
                updateAction: updateAction,
                deleteAction: deleteAction,
            };
            updateAction = fakeMutation;
            deleteAction = fakeMutation;
        } else if (savedMutations) {
            ({ deleteAction, updateAction } = savedMutations);
        }
    });

    function deleteEvent() {
        if (!item.content.text)
            $deleteAction.mutate({ id: id, kind: def.kind });
    }

    function saveContent(content: object) {
        $updateAction.mutate({ content });
    }

    setContext("deleteFunction", deleteEvent);
    const storeChildUpdateFunction: storeChildUpdateFunction = getContext(
        "storeChildUpdateFunction",
    );
    storeChildUpdateFunction(id);

    // function onVisibilityChange(event: any) {
    //     if (saveTimeout >= 1 && document.visibilityState === "hidden")
    //         $updateAction.mutate({
    //             id: id,
    //             type: "item",
    //             data: { content: content },
    //         });
    // }

    let mounted = false;
    onMount(() => {
        // window.addEventListener("visibilitychange", onVisibilityChange);
        mounted = true;
    });

    function deleteSelf() {
        $deleteAction.mutate({ id: id, kind: def.kind });
    }

    function enterPressed({
        key,
        shiftKey,
    }: {
        key: string;
        shiftKey: boolean;
    }) {
        if (key == "Enter") {
            const self = document.activeElement?.closest(".item") as Element;
            const next = self.nextElementSibling;
            const last = self.previousElementSibling;

            // focus the list element at the computed index
            if (!shiftKey && next) next.querySelector("input")?.focus();
            else if (last) last.querySelector("input")?.focus();
        }
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="item" class:fake={id === ""} on:keydown={enterPressed} data-id={id}>
    {#if def.editable !== false && $preferences["dragDropMode"]}
        <div
            class="drag-handle"
            use:dragHandle
            in:slide={{
                duration: $preferences["doAnimations"] ? 100 : 0,
                axis: "x",
                easing: linear,
            }}
            out:slide={{
                duration: $preferences["doAnimations"] ? 100 : 0,
                axis: "x",
                easing: linear,
            }}
        >
            <Svg icon="grip-vertical" />
        </div>
    {/if}
    <svelte:component
        this={def.component}
        content={item.content ?? {}}
        updater={saveContent}
        fake={id === ""}
    />
    {#if def.editable !== false}
        <div class="delete">
            <button class="icon-btn" on:click={deleteSelf}>
                <Svg icon="ex" />
            </button>
        </div>
    {/if}
</div>

<style>
    .item {
        box-sizing: border-box;
        /* padding: 0px 3px; */
        /*min-height: 25px;*/
        min-width: 50px;
        width: 20rem;

        border-radius: 3px;

        transition-duration: 0.3s;
        /* user-select: all; */

        display: flex;
        align-items: center;
    }
    .drag-handle {
        position: relative;
        left: -4px;
        width: 0.7rem;
        opacity: 0;
    }
    .delete {
        position: relative;
        right: 1px;
        opacity: 0;
    }
    .item:hover .drag-handle,
    .drag-handle:has(button:focus) {
        opacity: 1 !important;
    }
    .item:hover .delete,
    .delete:has(button:focus) {
        opacity: 1 !important;
    }
    @media all and (hover: none) {
        :global(textarea:focus ~ .drag-handle) {
            opacity: 1 !important;
        }
        :global(textarea:focus ~ .delete) {
            opacity: 1 !important;
        }
    }
    .delete button {
        border-radius: 50%;
        aspect-ratio: 1;
        background: transparent;
        padding: 1px;
    }
    :global(.delete button *) {
        position: relative;
        top: -1px;
    }
    .fake {
        opacity: 0.5;
    }
    :global(.item-shell:has(div input:focus)) {
        border: 2px solid var(--item-color);
    }
    /* .dropzone {
        user-select: none;
    }

    .item-hold {
        width: 12px;
        height: 25px;
        margin: 4px 5px 4px 0px;
        background: var(--item-color);
        border-radius: 0px 3px 3px 0px;
        cursor: grab;
    }

    .item-button {
        min-width: 25px;
        height: 25px;
        margin: 4px 0px;
        border: 1px solid var(--item-color);
        cursor: pointer;
    }

    .item-button:hover {
        background: var(--item-color-light);
    } */
</style>
