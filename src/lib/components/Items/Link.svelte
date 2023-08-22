<script lang="ts">
    import type { Item } from "$lib/types";
    import Svg from "../SVG.svelte";
    import TextBox from "./TextBox.svelte";

    export let content: Item["content"];
    export let updater: Function;
    export let fake: boolean;

    $: link = content.link
        ? (content.link.slice(0, 4) == "http" ? "" : "https://") + content.link
        : "";

    let linkShown = false;
</script>

<button class="add-link" on:click={() => (linkShown = !linkShown)}>
    {#if linkShown}
        <Svg icon="link" rotate={-45} width={18} height={18} />
    {:else}
        <Svg icon="edit" width={18} height={18} />
    {/if}
</button>:
<TextBox {content} {updater} {fake} key={linkShown ? "link" : "text"} />
{#if link == ""}
    <button class="add-link">+Link</button>
{:else}
    <a href={link} class:disabled={link == ""} target="_blank" rel="noreferrer"
        >Open</a
    >
{/if}

<style>
    button,
    a {
        border: 1px solid var(--item-color);
        background-color: var(--item-color);
        color: white;
        border-radius: 3px;
        cursor: pointer;
        padding: 2px 3px 0px 3px;
        margin: 1px;
    }
    button:hover,
    a:hover {
        border-color: #333;
    }
    a {
        border-radius: 50%;
        aspect-ratio: 1/1;
        height: 80%;
        flex: 1 1 20px;
        color: transparent;
        overflow: hidden;
    }
    a.disabled {
        pointer-events: none;
    }
</style>
