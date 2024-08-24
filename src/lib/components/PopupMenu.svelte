<script lang="ts">
    import { computePosition } from "@floating-ui/dom";

    export let buttonClasses = "icon-btn";

    let menu: HTMLDivElement;

    const shiftByOnePixel = {
        name: "shiftByOnePixel",
        fn({ x, y }: { x: number; y: number }) {
            return {
                y: y + 6,
            };
        },
    };

    let menuOpen = false;

    function buttonClicked(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        menuOpen = !menuOpen;
        menu.style.display = menuOpen ? "block" : "none";
        computePosition(event.currentTarget, menu, {
            placement: "bottom-end",
            middleware: [shiftByOnePixel],
        }).then(({ x, y }: { x: number; y: number }) => {
            Object.assign(menu.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    }
</script>

<button class={buttonClasses} on:click={buttonClicked}>
    <slot name="button" />
</button>
<div class="popup-menu" bind:this={menu}>
    <slot name="menu" />
</div>

<style>
    div.popup-menu {
        display: none;
        position: absolute;
        min-width: 150px;
        width: max-content;
        top: 0px;
        left: 0px;
        /* height: 100px; */

        background-color: var(--box-color);
        padding: 6px 9px;
        border-radius: 5px;

        box-shadow: 2px 2px 2px 2px black;

        font-size: 130%;
    }

    :global(div.popup-menu ul li) {
        padding: 8px 5px;
        border-radius: 5px;
    }

    :global(div.popup-menu ul li:hover) {
        background-color: rgba(var(--detail-contrast), 0.2);
        box-shadow: 1px 1px 1px 1px black;
    }
</style>
