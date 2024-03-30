<script lang="ts">
    import type { Item } from "$lib/types";
    import { getContext, onMount } from "svelte";

    export let content: Item["content"];
    export let key = "text";
    export let updater: Function;
    export let fake: boolean = false;
    export let rows: number = 2;

    $: text = content[key] ?? "";

    const deleteFunc: () => void = getContext("deleteFunction");
    const createFunc: (optionalData?: { [key: string]: any }) => void =
        getContext("createFunction");

    function keyPressed(
        event: KeyboardEvent & {
            currentTarget: EventTarget & HTMLTextAreaElement;
        },
    ) {
        if (event.key == "Backspace") {
            if (event.currentTarget.value === "") {
                deleteFunc();
            }
        } else if (event.key == "Enter") {
            createFunc();
        }
    }

    function textPasted(
        event: ClipboardEvent & {
            currentTarget: EventTarget & HTMLTextAreaElement;
        },
    ) {
        const text = event.clipboardData?.getData("text");
        if (!text || !text.includes("\n")) return;

        event.preventDefault();
        const lines = text.split("\n");
        performUpdate(lines.splice(0, 1)[0]);
        lines.forEach((line: string) => {
            createFunc({ content: { text: line } });
        });
    }

    let saveTimeout: NodeJS.Timeout;
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

<textarea
    value={text}
    on:input={saveContent}
    on:keydown={keyPressed}
    on:paste={textPasted}
    placeholder={fake ? "Type to Create" : ""}
    {rows}
/>

<style>
    textarea {
        resize: none;
        display: block;
        width: 100%;
        height: auto;
        box-sizing: border-box;
        text-decoration: inherit;
        border: none;
        outline: none;
        user-select: contain !important;
        background: transparent;
        color: inherit;
        font: inherit;

        padding: 0px;
        margin: 2px;
    }
</style>
