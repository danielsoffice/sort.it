<script lang="ts">
    import { computePosition } from "@floating-ui/dom";
    import Svg from "$lib/components/SVG.svelte";
    import Backdrop from "$lib/components/Items/Backdrop.svelte";

    export let buttonClasses = "icon-btn";
    export let title = "Boxlify Modal";

    let modal: HTMLDivElement;

    const shiftByOnePixel = {
        name: "shiftByOnePixel",
        fn({ x, y }: { x: number; y: number }) {
            return {
                y: y + 6,
            };
        },
    };

    let modalOpen = false;

    function buttonClicked(
        _event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        modalOpen = !modalOpen;
        modal.style.display = modalOpen ? "flex" : "none";
    }
</script>
{#if modalOpen}
    <Backdrop/>
{/if}
<button class={buttonClasses} on:click={buttonClicked}>
    <slot name="button" />
</button>
<div class="popup-modal" bind:this={modal}>
    <div class="modal-control-bar">
<!--        <div>-->
<!--            &nbsp;-->
<!--        </div>-->
        <div><h2 class="modal-title">
            <slot name="modal-title">
                {title}
            </slot>
        </h2></div>
        <div>
            <div>
                <button
                        on:click={buttonClicked}
                        class="icon-btn"
                       ><Svg icon="ex" width="1.75rem"/></button
                >
            </div>
        </div>
    </div>

    <slot name="modal"/>
</div>

<style>
    div.popup-modal {
        display: none;
        flex-direction: column;
        position: absolute;
        min-width: 150px;
        height: 80%;
        width: 70%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        /* height: 100px; */

        background-color: var(--box-color);
        padding: 6px 9px;
        border-radius: 5px;

        box-shadow: 2px 2px 2px 2px black;

        font-size: 130%;
    }
    .modal-control-bar {
        display: flex;
        border-bottom: 1px solid var(--box-control-color);
        justify-content: stretch;
        text-align: left;
        margin-bottom: 1rem;
    }
    .modal-control-bar > div {
        flex: 1 1 auto;
    }

    .modal-control-bar > *:last-child {
        display: flex;
        justify-content: end;
    }

    .modal-title {
        padding: 10px 5px;

    }

    :global(div.popup-modal ul li) {
        padding: 8px 5px;
        border-radius: 5px;
    }

    :global(div.popup-modal ul li:hover) {
        background-color: rgba(var(--detail-contrast), 0.2);
        box-shadow: 1px 1px 1px 1px black;
    }
</style>
