<script lang="ts">
    import type { Item } from "$lib/types";
    import TextBox from "./TextBox.svelte";

    export let content: Item["content"];
    export let updater: Function;
    export let fake: boolean;

    function updateChecked(
        event: Event & { currentTarget: EventTarget & HTMLInputElement },
    ): void {
        content["is_checked"] = event.currentTarget.checked;
        updater(content);
    }
</script>

<input
    type="checkbox"
    on:change={updateChecked}
    checked={content["is_checked"]}
/>
<TextBox {content} {updater} {fake} />

<style>
    input {
        cursor: pointer;
        width: 27px;
        height: 20px;
        margin: 0px;
        margin-right: 5px;
    }
</style>
