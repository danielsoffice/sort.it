<script lang="ts">
    import { dragDropStatus } from "$lib/stores";
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

    onMount(() => changeZoom(0));
</script>

<div id="rail">
    <span>Sort<br />.It</span>
    <div>
        <button on:click={() => changeZoom(-2)}>-</button>
        <input type="text" value={zoom + "px"} readonly />
        <button on:click={() => changeZoom(2)}>+</button>
    </div>
    <br />
    <div>
        <button on:click={toggleDragDrop}
            >{$dragDropStatus ? "Disable" : "Enable"}</button
        >
    </div>
</div>

<style>
    div {
        width: 48px;
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
</style>
