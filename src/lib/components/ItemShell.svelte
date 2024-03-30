<script lang="ts">
    export let fake: boolean;
</script>

<div class="item-shell" class:fake>
    <slot />
</div>

<style>
    div {
        box-sizing: border-box;
        padding: 0px 3px;
        min-height: 25px;
        min-width: 50px;

        border-radius: 3px;

        transition-duration: 0.3s;
        /* user-select: none; */

        display: flex;
        align-items: center;
    }
    .fake {
        opacity: 0.5;
    }
    :global(.item-shell:has(div input:focus)) {
        border: 2px solid var(--item-color);
    }
</style>
