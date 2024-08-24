import { writable } from 'svelte/store';

function createBoolStore(initVal = false) {
    const { subscribe, set, update } = writable(initVal);

    return {
        subscribe,
        toggle: () => update((x) => !x),
        enable: () => set(true),
        disable: () => set(false)
    };
}

export const dragDropStatus = createBoolStore();
export const readOnlyStatus = createBoolStore();

