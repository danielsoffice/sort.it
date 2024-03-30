import { writable } from 'svelte/store';

function createDragDropStatus() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,
        toggle: () => update((x) => !x),
        enable: () => set(true),
        disable: () => set(false)
    };
}

export const dragDropStatus = createDragDropStatus();
