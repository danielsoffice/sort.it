<script lang="ts">
    import {preferences} from "$lib/stores";
    import { onMount } from "svelte";
    import Svg from "$lib/components/SVG.svelte";


    function changeZoom(amount: number) {
        if (amount < 0 && $preferences['rootFontSize'] == 8) return;
        if (amount > 0 && $preferences['rootFontSize'] == 64) return;
        preferences.update('rootFontSize', (fontSize: number) => fontSize + amount);
    }
    function toggleDragDrop(e: any) {
        preferences.toggle('dragDropMode');
    }

    function toggleReadOnly(e: any) {
        preferences.toggle('readOnlyMode')
    }

    // set document font size once it is loaded
    onMount(() => preferences.subscribe((prefs)=> {
        if (document) document.documentElement.style.fontSize = prefs.rootFontSize + "px";
    }));

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
    <span>Boxlify</span>
    <div>
        <span>Font Size</span>
        <button class="icon-btn" on:click={() => changeZoom(-1)}>
            <Svg icon="minus" width="1.2em" height="1.2em"  />
        </button>
        <button class="icon-btn" on:click={() => changeZoom(1)}>
            <Svg icon="plus" width="1.2em" height="1.2em" />
        </button>
        <span>{$preferences['rootFontSize'] + "px"}</span>
    </div>
    <br />
    <div>
        <button class="btn drag-drop-button" on:click={toggleDragDrop} class:enabled={$preferences['dragDropMode']}
            >DragDrop</button
        >
    </div>
    <div>
        <button class="btn" on:click={toggleMagicWand}>Wand</button>
    </div>
    <div>
        <button class="btn read-only-button" on:click={toggleReadOnly} class:enabled={$preferences["readOnlyMode"]}>ReadOnly</button>
    </div>
</div>

<style>
    * {
        font-size: 16px;
    }
    div#rail {
        width: calc(48px * 1.5);
        padding-block: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    #rail > div {
        padding: 2px;
        background-color: rgba(var(--box-color-rgb), .3);
        border-radius: 5px;
    }
    #rail > div > span:first-child {
        background-color: rgba(var(--box-color-rgb), .3);
        margin-bottom: 3px;
        border-radius: 5px 5px 0 0;
        margin-top: -2px;
        margin-inline: -2px;
        width: calc(100% + 4px);
    }

    span {
        display: block;
        font-size: 80%;
        text-align: center;
        width: 100%;
        padding: 3px 1px;
        box-sizing: border-box;
    }
    .btn {
        font-size: 80%;
    }

    input {
        font-size: 60%;
        width: 100%;
    }

    .drag-drop-button.enabled {
        background-color: rgba(70,200,70,.6);
    }.read-only-button.enabled {
        background-color: rgba(200,70,70,.8);
    }
</style>
