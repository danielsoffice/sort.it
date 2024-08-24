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

<label class:checked={content["is_checked"]}>
    <input
        type="checkbox"
        on:change={updateChecked}
        checked={content["is_checked"]}
    />
</label>

<TextBox {content} {updater} {fake} />

<style>
    /* label {
        width: 23px;
        height: 17px;
        margin: 6px;
        border-radius: 5px;
        border: 2px solid rgba(var(--detail-contrast), 0.4);
    }
    label:hover {
        background: rgba(var(--detail-contrast), 0.6) !important;
    }
    label.checked {
        background: rgba(var(--detail-contrast), 0.8);
    } */
    input {
        /* display: none; */
        cursor: pointer;
        width: 28px;
        height: 28px;
        margin: 0px;
        margin-right: 5px;
        display: block;
        border-radius: 5px;
        appearance: none;
        /* background: rgba(var(--detail-contrast), 0.15); */
        border: 1px solid rgb(var(--detail-contrast));
    }
    input:hover {
        /* background: rgba(var(--detail-contrast), 0.4); */
        border: 3px solid rgb(var(--detail-contrast));
    }
    input:checked {
        background: rgba(var(--detail-contrast), 0);
    }
    [type="checkbox"]:checked {
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
        background-size: cover;
    }
  </style>
