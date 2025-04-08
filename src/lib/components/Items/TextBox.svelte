<script lang="ts">
    import type { addChildAction, Item } from "$lib/types";
    import { afterUpdate, getContext, onMount } from "svelte";
    import { preferences } from "$lib/stores";

    export let id: string;
    export let focusableElement: HTMLTextAreaElement;
    export let content: Item["content"];
    export let key = "text";
    export let updater: Function;
    export let fake: boolean = false;

    $: text = content[key] ?? "";

    type keyboardEvent = KeyboardEvent & {
        target: EventTarget & HTMLTextAreaElement;
    };

    const deleteFunc: () => void = getContext("deleteFunction");
    const createFunc: addChildAction = getContext("createFunction");
    const focusJump: Function = getContext("focusJump");

    let ctrlPressed = false;
    let shiftPressed = false;

    const shortcuts = [
        {
            // Deletes item if backspace is pressed when empty
            keybind: ["Backspace"],
            action: (event: keyboardEvent) =>
                event.target.value === "" && deleteFunc(),
        },
        {
            // Creates item after this one
            keybind: ["Control", "Enter"],
            action: () => {
                createFunc({}, { id, placement: 1 });
                awaitingJump = true;
            },
        },
        {
            // Creates item after this one
            keybind: ["Control", "ArrowUp"],
            action: () => {
                focusJump(id, -1);
            },
        },
        {
            // Creates item after this one
            keybind: ["Control", "ArrowDown"],
            action: () => {
                focusJump(id, 1);
            },
        },
    ];

    function eventKeyPressed(event: keyboardEvent) {
        if (event.key == "Control" || event.key == "Shift") {
            return;
        }

        let pressedKeybind = [event.key];
        if (event.shiftKey) pressedKeybind.splice(0, 0, "Shift");
        if (event.ctrlKey) pressedKeybind.splice(0, 0, "Control");

        shortcuts.forEach((shortcut) => {
            if (pressedKeybind.length !== shortcut.keybind.length) return;
            for (let i = 0; i < pressedKeybind.length; i++) {
                if (pressedKeybind[i] != shortcut.keybind[i]) return;
            }
            shortcut.action(event);
        });
    }
    function eventKeyUnpressed(event: keyboardEvent) {
        if (event.key == "Control") {
            ctrlPressed = false;
        } else if (event.key == "Shift") {
            shiftPressed = false;
        }
    }

    function eventBlur() {
        ctrlPressed = false;
        shiftPressed = false;
    }

    function eventTextPasted(
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
            if (line.trim())
                createFunc({ content: { text: line } }, { id, placement: 1 });
        });
    }

    let saveTimeout: NodeJS.Timeout;
    function saveContent(event: keyboardEvent) {
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

    let awaitingJump = false;

    afterUpdate(() => {
        if (awaitingJump) {
            setTimeout(() => focusJump(id, 1), 1000);
            awaitingJump = false;
        }
    });

    function fixHeight() {
        focusableElement.style.height = "calc(1.25rem + 3px)";
        focusableElement.style.height =
            focusableElement.scrollHeight + 1 + "px";
    }

    let fontSize = 0;
    preferences.subscribe((prefs) => {
        if (mounted && fontSize !== prefs.rootFontSize) {
            setTimeout(fixHeight, 350);
        }
        fontSize = prefs.rootFontSize;
    });
</script>

<textarea
    value={text}
    on:input={saveContent}
    on:keydown={eventKeyPressed}
    on:paste={eventTextPasted}
    on:blur={eventBlur}
    bind:this={focusableElement}
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
