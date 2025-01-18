<script lang="ts">
    import { onMount } from "svelte";

    export let holds: string[];
    export let initVal: string;
    export let changeTypeEvent: Function;

    let type = initVal;

    let mounted = false;

    $: valueChanged(type);

    function valueChanged(type: any) {
        if (mounted) changeTypeEvent(type);
    }
    onMount(() => {
        mounted = true;
    });
</script>

<div class="type-selector">
    <select bind:value={type}>
        {#each holds as type}
            <option value={type}>{type}</option>
        {/each}
    </select>
</div>

<style>
    div {
        flex: 10 10 100% !important;
    }
    select {
        padding: 1px 0;
        border: none;
        font-size: inherit;
        color: inherit;
        cursor: inherit;
        text-align: center;
        background-color: var(--box-color);
        height: 100%;
        border-radius: 5px;
        color: var(--box-control-color);
    }
    option {
        margin: 0px;
        padding: 0px;
        border: none;
        font-size: inherit;
        color: var(--detail-contrast);
        cursor: pointer;
    }
    option:hover {
        box-shadow: 0 0 10px 100px green inset;
    }
</style>
