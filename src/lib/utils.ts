import { error, type HttpError } from '@sveltejs/kit';
import { writable } from 'svelte/store';

function createErrorDispatcher() {
    const { subscribe, set, update } = writable([] as HttpError[]);

    return {
        subscribe,
        log: (status: number, message: string) => {
            console.error(message);
            update((errors: HttpError[]) => ([...errors, error(status, { message })]))
        },
        clear: () => set([])
    };
}

export const errorDispatcher = createErrorDispatcher();
