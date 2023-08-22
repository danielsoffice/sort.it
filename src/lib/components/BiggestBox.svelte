<script lang="ts">
    import DataLoader from "./DataLoader.svelte";

    export let id: string;
    export let thing: string = "core.box";
</script>

<div>
    <DataLoader {thing} parent={[thing, null]} {id} />
</div>
