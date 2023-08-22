<script lang="ts">
    import Item from "./Item.svelte";
    import Box from "./Box.svelte";

    import { useQuery, useQueryClient } from "@sveltestack/svelte-query";
    import { getContext } from "svelte";
    import type { ThingDef } from "$lib/types";
    import type { Thing } from "$lib/types";

    export let thing: string;
    export let parent: [string, null | string];
    export let id: string;
    export let ogData: any = null;

    const queryClient = useQueryClient();

    const getDef: (thing: string) => ThingDef = getContext("getDef");
    const def = getDef(thing);

    const queryResult: any = useQuery(
        [thing, id],
        async () => {
            if (id == "id:dnd-shadow-placeholder-0000") {
                return {
                    order: { order: "default" },
                    holds: "core.item",
                    type: thing,
                    children: [],
                };
            }
            let init = await def.sourceFunc(id, def.kind);

            const childrenPassed =
                def.kind == "box" &&
                def.childrenPassed &&
                init.holds == "core.item";
            if (childrenPassed && init.children) {
                // stores Items in cache but replaces them with IDs
                for (let [i, child] of init.children.entries()) {
                    queryClient.setQueryData([init.holds, child.id], child);
                    init.children[i] = child.id;
                }
            }
            return init;
        },
        {
            select(thingInst: Thing) {
                if (thingInst.copies) {
                    return {
                        copies: thingInst.copies,
                        id: id,
                        parent: thingInst.parent,
                        order: thingInst.order,
                    };
                }
                return thingInst;
            },
        }
    );
</script>

{#if $queryResult.isLoading}
    <p>Loading {def.kind}...</p>
{:else if $queryResult.isError}
    <p style="color: red">{$queryResult.error.message}</p>
{:else if $queryResult.data.copies}
    <svelte:self
        parent={[thing, $queryResult.data.id]}
        id={$queryResult.data.copies}
        {thing}
        ogData={$queryResult.data}
    />
{:else if def.kind == "box"}
    <Box
        box={{ ...$queryResult.data, ...ogData }}
        id={ogData ? ogData.id : id}
        {parent}
    />
{:else}
    <Item item={$queryResult.data} {parent} />
{/if}
