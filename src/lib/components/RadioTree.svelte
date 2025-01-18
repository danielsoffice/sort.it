<script lang="ts">

    type optionTree = {
        options: Array<{ value: string; label: string }>;
        subOptions?: optionTree
    }

    export let optionTree: optionTree;
    export let value: string;


</script>
{#each optionTree.options as option}
    <input name="radio" value={option.value} type="radio">{option.label}
{/each}
