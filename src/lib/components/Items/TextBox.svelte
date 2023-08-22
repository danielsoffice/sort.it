<script lang="ts">
    import type { Item } from "$lib/types";
    import { onMount } from "svelte";

    export let content: Item["content"];
    export let key = "text";
    export let updater: Function;
    export let fake: boolean;

    $: text = content[key] ?? "";

    function keyPressed(event: any) {
        if (event.key == "Enter") {
        }
    }

    let saveTimeout: number = 0;
    function saveContent(event: any) {
        if (!mounted) return;
        clearTimeout(saveTimeout);
        if (event.target.value == "") performUpdate("");
        else
            saveTimeout = setTimeout(() => {
                performUpdate(event.target.value);
            }, 1000);
    }

    function performUpdate(newText: string) {
        let oldContent = structuredClone(content);
        oldContent[key] = newText;
        updater(oldContent);
        clearTimeout(saveTimeout);
    }

    let mounted = false;
    onMount(() => (mounted = true));
</script>

<input
    type="text"
    value={text}
    on:input={saveContent}
    on:keydown={keyPressed}
    placeholder={fake ? "Type to Create" : ""}
/>

<style>
    input {
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        text-decoration: inherit;
        border: none;
        font-size: 14px;
        outline: none;
        user-select: contain !important;
    }
</style>
