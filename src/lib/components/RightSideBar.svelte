<script lang="ts">
    import { onMount } from "svelte";
    import Svg from "$lib/components/SVG.svelte";

    let text = "hey"
</script>

<div id="rail">
    <span>Utility Bar</span>
    <div>
        <span></span>
        <p>{text}</p>
        </div>
</div>

<style>
    * {
        font-size: 16px;
    }
    div#rail {
        width: 400px;
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

    .read-only-button.enabled {
        background: red;
    }
</style>
