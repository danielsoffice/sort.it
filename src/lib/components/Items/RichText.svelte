<script lang="ts">
    import type { Item } from "$lib/types";
    import { getContext, onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import { Color } from '@tiptap/extension-color'
    import TextStyle from '@tiptap/extension-text-style'
    import StarterKit from "@tiptap/starter-kit";
    import Svg from "$lib/components/SVG.svelte";
    import PopupModal from "$lib/components/PopupModal.svelte";

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
    function saveContent(value: any) {
        if (!mounted) return;
        clearTimeout(saveTimeout);
        if (value == "") performUpdate("");
        else
            saveTimeout = setTimeout(() => {
                performUpdate(value);
            }, 1000);
    }

    function performUpdate(newText: string) {
        let oldContent = structuredClone(content);
        oldContent[key] = newText;
        updater(oldContent);
        clearTimeout(saveTimeout);
    }

    let mounted = false;

    let element: HTMLDivElement;
    let editor: Editor;

    onMount(() => {
        mounted = true;
        editor = new Editor({
            element: element,
            extensions: [Color.configure({ types: [TextStyle.name] }),
                TextStyle,
                StarterKit],
            content: text,
            onTransaction: () => {
                // force re-render so `editor.isActive` works as expected
                editor = editor;
            },
            onUpdate(props) {
                saveContent(props.editor.getHTML());
            },
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });
</script>


<PopupModal title="Edit Rich Text Item">
    <svelte:fragment slot="button">
        <Svg icon="edit" />
    </svelte:fragment>
    <svelte:fragment slot="modal">
        {#if editor}
            <div class="control-group">
                <div class="button-group">
                    <button
                            on:click={() => console.log && editor.chain().focus().toggleBold().run()}
                            disabled={!editor.can().chain().focus().toggleBold().run()}
                            class={(editor.isActive("bold") ? "is-active" : "") + " btn"}
                    >
                        Bold
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleItalic().run()}
                            disabled={!editor.can().chain().focus().toggleItalic().run()}
                            class={(editor.isActive("italic") ? "is-active" : "") + " btn"}
                    >
                        Italic
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleStrike().run()}
                            disabled={!editor.can().chain().focus().toggleStrike().run()}
                            class={(editor.isActive("strike") ? "is-active" : "") + " btn"}
                    >
                        Strike
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleCode().run()}
                            disabled={!editor.can().chain().focus().toggleCode().run()}
                            class={(editor.isActive("code") ? "is-active" : "") + " btn"}
                    >
                        Code
                    </button>
                    <button on:click={() => editor.chain().focus().unsetAllMarks().run()}
                    class="btn">Clear marks</button>
                    <button on:click={() => editor.chain().focus().clearNodes().run()} class="btn">Clear nodes</button>
                    <button
                            on:click={() => editor.chain().focus().setParagraph().run()}
                            class={(editor.isActive("paragraph") ? "is-active" : "") + " btn"}
                    >
                        Paragraph
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            class={(editor.isActive("heading", { level: 1 }) ? "is-active" : "") + " btn"}
                    >
                        H1
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            class={(editor.isActive("heading", { level: 2 }) ? "is-active" : "") + " btn"}
                    >
                        H2
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            class={(editor.isActive("heading", { level: 3 }) ? "is-active" : "") + " btn"}
                    >
                        H3
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                            class={(editor.isActive("heading", { level: 4 }) ? "is-active" : "") + " btn"}
                    >
                        H4
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                            class={(editor.isActive("heading", { level: 5 }) ? "is-active" : "") + " btn"}
                    >
                        H5
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                            class={(editor.isActive("heading", { level: 6 }) ? "is-active" : "") + " btn"}
                    >
                        H6
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleBulletList().run()}
                            class={(editor.isActive("bulletList") ? "is-active" : "") + " btn"}
                    >
                        Bullet list
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleOrderedList().run()}
                            class={(editor.isActive("orderedList") ? "is-active" : "") + " btn"}
                    >
                        Ordered list
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleCodeBlock().run()}
                            class={(editor.isActive("codeBlock") ? "is-active" : "") + " btn"}
                    >
                        Code block
                    </button>
                    <button
                            on:click={() => editor.chain().focus().toggleBlockquote().run()}
                            class={(editor.isActive("blockquote") ? "is-active" : "") + " btn"}
                    >
                        Blockquote
                    </button>
                    <button on:click={() => editor.chain().focus().setHorizontalRule().run()} class="btn">
                        Horizontal rule
                    </button>
                    <button on:click={() => editor.chain().focus().setHardBreak().run()} class="btn">Hard break</button>
                    <button
                            on:click={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().chain().focus().undo().run()}
                            class="btn"
                    >
                        Undo
                    </button>
                    <button
                            on:click={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().chain().focus().redo().run()}
                            class="btn"
                    >
                        Redo
                    </button>
                    <button
                            on:click={() => editor.chain().focus().setColor('#958DF1').run()}
                            class={(editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active' : '') + " btn"}
                    >
                        Purple
                    </button>
                </div>
            </div>
        {/if}
        <br/>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div id="editor" bind:this={element} />
    </svelte:fragment>
</PopupModal>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="editor-preview">
    {@html text}
</div>


<!-- <textarea
    value={text}
    on:input={saveContent}
    on:keydown={keyPressed}
    on:paste={textPasted}
    placeholder={fake ? "Type to Create" : ""}
    {rows}
/> -->

<style>
    #editor-preview {
        min-height: 2rem;
        width: 100%;
        display: inline-block;
        margin-left: 4px;
        overflow: auto;
        max-height: calc(5 * (1rem + 1px) + 1px);
    }
    #editor {
        padding: 8px 5px;
        min-height: 0;
        overflow: auto;
    }
    .control-group {
        border-radius: 5px;
        padding: 8px;
        background-color: rgba(var(--detail-contrast), .05);
    }
    .control-group > .button-group {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: baseline;

    }
    .control-group button {
        font-size: 80%;
        margin: 4px;

    }
    button.active {
        background: black;
        color: white;
    }
    /* textarea {
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
    } */
</style>
