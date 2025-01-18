<script lang="ts">
    import { computePosition } from "@floating-ui/dom";

    export let buttonClasses = "icon-btn";
    export let onClick = buttonClicked;

    let primaryMenu: HTMLDivElement;
    let secondaryMenu: HTMLDivElement;

    const shiftByOnePixel = {
        name: "shiftByOnePixel",
        fn({ x, y }: { x: number; y: number }) {
            return {
                y: y + 6,
            };
        },
    };

    let primaryMenuOpen = false;
    let secondaryMenuOpen = false;

    function buttonClicked(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        secondaryMenuOpen = false;
        secondaryMenu.style.display = secondaryMenuOpen ? "block" : "none";
        if(!$$slots['menu']) return
        primaryMenuOpen = !primaryMenuOpen;
        primaryMenu.style.display = primaryMenuOpen ? "block" : "none";
        computePosition(event.currentTarget, primaryMenu, {
            placement: "bottom-end",
            middleware: [shiftByOnePixel],
        }).then(({ x, y }: { x: number; y: number }) => {
            Object.assign(primaryMenu.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    }

    function buttonRightClicked(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        primaryMenuOpen = false;
        primaryMenu.style.display = primaryMenuOpen ? "block" : "none";
        if(!$$slots['secondary-menu']) return
        secondaryMenuOpen = !secondaryMenuOpen;
        secondaryMenu.style.display = secondaryMenuOpen ? "block" : "none";
        computePosition(event.currentTarget, secondaryMenu, {
            placement: "bottom-end",
            middleware: [shiftByOnePixel],
        }).then(({ x, y }: { x: number; y: number }) => {
            Object.assign(secondaryMenu.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    }
</script>
<button class={buttonClasses} on:click={onClick} on:contextmenu|preventDefault={buttonRightClicked} >
    <slot name="button" />
</button>
<div class="popup-menu" bind:this={primaryMenu}>
    <slot name="menu" />
</div>
<div class="popup-menu" bind:this={secondaryMenu}>
    <slot name="secondary-menu" />
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
