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
        padding: 0px;
        border: none;
        font-size: inherit;
        color: inherit;
        background: transparent;
        cursor: inherit;
        text-align: center;
    }
    option {
        margin: 0px;
        padding: 0px;
        border: none;
        font-size: inherit;
        color: initial;
        cursor: inherit;
    }
</style>
