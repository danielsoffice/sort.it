<script lang="ts">
    import type { Item } from "$lib/types";
    import { getContext, onMount } from "svelte";
    import type { BoxDef, ItemDef } from "$lib/types";
    import { useMutation, useQueryClient } from "@sveltestack/svelte-query";
    import type { Thing } from "$lib/types";
    import Svg from "./SVG.svelte";

    export let item: Thing;
    export let parent: [string, null | string];

    const id = item.id;

    const queryClient = useQueryClient();

    const parentDef: BoxDef = (getContext("getDef") as Function)(parent[0]);
    const def: ItemDef = (getContext("getDef") as Function)(item.type);

    const invalParent = () => queryClient.invalidateQueries(parent);
    const invalSelf = () => queryClient.invalidateQueries([item.type, id]);
    const updateSelf = (data: Item) => {
        queryClient.setQueryData([item.type, id], data);
    };
    const deleteAction = useMutation(
        parentDef.deleteFunc || (() => ({} as Promise<any>)),
        {
            onSuccess: invalParent,
        }
    );
    const updateAction = useMutation(
        def.mutateFunc || (() => ({} as Promise<any>)),
        {
            onSuccess: (data: Item) => updateSelf(data),
        }
    );

    function deleteEvent() {
        if (!item.content.text)
            $deleteAction.mutate({ id: id, type: def.kind });
    }

    function saveContent(content: object) {
        $updateAction.mutate({
            id: id,
            type: "item",
            data: { content: content },
        });
    }

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

    let shiftPressed = false;
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
<div
    class="item"
    class:fake={id == ""}
    on:contextmenu|preventDefault={deleteEvent}
    on:keydown={enterPressed}
    data-id={id}
>
    <svelte:component
        this={def.component}
        content={item.content ?? {}}
        updater={saveContent}
        fake={id == ""}
    />
    <div>
        <Svg icon="options" />
    </div>
</div>

<style>
    .item {
        box-sizing: border-box;
        /* padding: 0px 3px; */
        min-height: 25px;
        min-width: 50px;

        color: var(--item-color);
        border-radius: 3px;
        border: 1px solid var(--item-color);

        transition-duration: 0.3s;
        /* user-select: all; */

        display: flex;
        align-items: center;
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
