<script lang="ts">
    import type { Item } from "$lib/types";
    import TextBox from "./TextBox.svelte";

    export let content: Item["content"];
    export let updater: Function;
    export let fake: boolean;

    // function updateChecked(
    //     event: Event & { currentTarget: EventTarget & HTMLInputElement },
    // ): void {
    //     content["is_checked"] = event.currentTarget.checked;
    //     updater(content);
    // }
</script>

{#if !content.embedUrl}
    <TextBox {content} {updater} {fake} key="embedUrl" />
{:else}
    <iframe title="embed content" src={content["embedUrl"]} />
{/if}

<style>
    iframe {
        resize: both;
        width: 80vw;
        height: 40vw;
    }
</style>
