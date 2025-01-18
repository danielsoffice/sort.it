<script lang="ts">
    import type { Item } from "$lib/types";
    import { getContext, onMount } from "svelte";
    import {preferences} from "$lib/stores";

    export let content: Item["content"];
    export let key = "text";
    export let updater: Function;
    export let fake: boolean = false;
    export let rows: number = 2;

    $: text = content[key] ?? "";

    const deleteFunc: () => void = getContext("deleteFunction");
    const createFunc: (optionalData?: { [key: string]: any }) => void =
        getContext("createFunction");

    let ctrlPressed = false;
    function keyPressed(
        event: KeyboardEvent & {
            currentTarget: EventTarget & HTMLTextAreaElement;
        },
    ) {
        if (event.key == "Control") {
            ctrlPressed = true;
        } else if (event.key == "Backspace") {
            if (event.currentTarget.value === "") {
                deleteFunc();
            }
        } else if (event.key == "Enter") {
            if(ctrlPressed)
            createFunc();
        }
    }
    function keyUnpressed(
        event: KeyboardEvent & {
            currentTarget: EventTarget & HTMLTextAreaElement;
        },
    ) {
        if (event.key == "Control") {
            ctrlPressed = false;
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
            if(line.trim()) createFunc({ content: { text: line } });
        });
    }

    let saveTimeout: NodeJS.Timeout;
    function saveContent(event: InputEvent & { currentTarget: EventTarget & HTMLTextAreaElement; }) {
        if (!mounted) return;

        fixHeight();

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
    onMount(() => {
        mounted = true;
        fixHeight();
    });

    function fixHeight(){
        textarea.style.height = 'calc(1.25rem + 3px)';
        textarea.style.height = textarea.scrollHeight+1 + "px";
    }


    let textarea: HTMLTextAreaElement;

    let fontSize = 0;
    preferences.subscribe((prefs)=>{
        if(mounted && fontSize !== prefs.rootFontSize) {
            setTimeout(fixHeight, 350);
        }
        fontSize = prefs.rootFontSize;
    });

</script>

<textarea
    value={text}
    on:input={saveContent}
    on:keydown={keyPressed}
    on:keyup={keyUnpressed}
    on:paste={textPasted}
    bind:this={textarea}
    placeholder={fake ? "Type to Create" : ""}
/>

<style>
    textarea {
        resize: none;
        display: block;
        width: 100%;
        height: calc(1rem + 3px);
        box-sizing: border-box;
        text-decoration: inherit;
        border: none;
        outline: none;
        user-select: contain !important;
        background: transparent;
        color: inherit;
        font: inherit;
        line-height: initial;
        padding: 0px;
        margin: 2px;
    }
</style>
