<script lang="ts">
    import {dragDropStatus, readOnlyStatus} from "$lib/stores";
    import { onMount } from "svelte";
    let zoom = 16;

    function changeZoom(amount: number) {
        if (amount < 0 && zoom == 8) return;
        if (amount > 0 && zoom == 64) return;
        zoom += amount;
        document.documentElement.style.fontSize = zoom + "px";
    }
    function toggleDragDrop(e: any) {
        dragDropStatus.toggle();
    }

    function toggleReadOnly(e: any) {
        readOnlyStatus.toggle();
    }

    onMount(() => changeZoom(0));

    let magicWand = false;
    function toggleMagicWand(){
        document.querySelector('.box').addEventListener("click", handleMagicWandClick);
        document.body.style.cursor = "copy";
    }
    function handleMagicWandClick(event: MouseEvent & { target: HTMLDivElement }) {
        event.preventDefault();
        window.open("http://localhost:8000/api/box/" + event.target.closest(".box").getAttribute('data-id') + "/");
        document.body.style.cursor = null;
        document.querySelector('.box').removeEventListener("click", handleMagicWandClick);
    }
</script>

<div id="rail">
    <span>Sort<br />.It</span>
    <div>
        <button class="icon" on:click={() => changeZoom(-2)}>-</button>
        <input type="text" value={zoom + "px"} readonly />
        <button class="icon" on:click={() => changeZoom(2)}>+</button>
    </div>
    <br />
    <div>
        <button on:click={toggleDragDrop}
            >{$dragDropStatus ? "Disable" : "Enable"}</button
        >
    </div>
    <div>
        <button on:click={toggleMagicWand}>Wand</button>
    </div>
    <div>
        <button class="btn read-only-button" on:click={toggleReadOnly} class:enabled={$readOnlyStatus}>ReadOnly</button>
    </div>
</div>

<style>
    div {
        width: calc(48px * 2);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    span {
        display: block;
        text-align: center;
        font-size: 60%;
        color: white;
    }

    input {
        font-size: 60%;
        width: 100%;
    }

    .read-only-button.enabled {
        background: red;
    }
</style>
