import { persisted } from 'svelte-persisted-store'

const defaultPreferences = {
    readOnlyMode: false,
    doAnimations: true,
    dragDropMode: true,
    rootFontSize: 16
};
type Prefs = typeof defaultPreferences;

type BooleanPrefKeys = {
    [K in keyof Prefs]: Prefs[K] extends boolean ? K : never
}[keyof Prefs];

function createPreferences() {
    const { subscribe, update } = persisted('preferences', defaultPreferences)

    // TODO: Remove in production
    update((prefs)=> ({...defaultPreferences, ...prefs}));

    return {
        subscribe,
        set: <K extends keyof Prefs>(name: K, value: Prefs[K]) => update((prefs: Prefs) => { prefs[name] = value; return prefs}),
        update: <K extends keyof Prefs>(name: K, updateFunc: (value: Prefs[K]) => Prefs[K]) => {
            update((prefs: Prefs) => { prefs[name] = updateFunc(prefs[name]); return prefs})
        },
        toggle: <K extends BooleanPrefKeys>(name: K) => update((prefs: Prefs) => {
            prefs[name] = !prefs[name];
            return prefs
        })
    };
}

export const preferences = createPreferences();