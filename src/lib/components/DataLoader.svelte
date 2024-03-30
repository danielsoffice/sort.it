<script lang="ts">
    import { default as ItemComponent } from "./Item.svelte";
    import { default as BoxComponent } from "./Box.svelte";

    import {
        createQuery,
        useQueryClient,
        type CreateQueryResult,
    } from "@tanstack/svelte-query";
    import { getContext } from "svelte";
    import type { ThingDef, Box, Item } from "$lib/types";
    import { error } from "@sveltejs/kit";

    export let thing: string;
    export let parent: [string, null | string];
    export let id: string;
    export let ogData: any = null;

    const queryClient = useQueryClient();

    const getDef: (thing: string) => ThingDef = getContext("getDef");
    const def = getDef(thing);

    const queryResult: CreateQueryResult<Box | Item | any> = createQuery({
        retry: (failureCount: number, error: any) => failureCount <= 2,
        queryKey: [thing, { id, parent: parent[1] }],
        queryFn: async () => {
            if (id == "id:dnd-shadow-placeholder-0000") {
                return {
                    order: { order: "default" },
                    holds: "core.item",
                    type: thing,
                    children: [],
                };
            }
            let init: Box | Item;
            try {
                init = await def.sourceFunc(id, def.kind);
            } catch (e: any) {
                if (parent === null && e.message === "404") console.log("agg");
                throw error(404, "ahhh");
                return;
            }

            if (def.kind === "box" && init.holds_type == null) {
                init.holds_type = getDef(init.holds).kind;
            }

            const childrenPassed =
                def.kind == "box" &&
                init.children.length > 0 &&
                typeof init.children[0] !== "string";
            if (childrenPassed) {
                // stores Items in cache but replaces them with IDs
                for (let [i, child] of init.children.entries()) {
                    queryClient.setQueryData(
                        [init.holds, { id: child.id, parent: id }],
                        child,
                    );
                    queryClient.setQueryDefaults(
                        [init.holds, { id: child.id }],
                        { refetchInterval: false },
                    );
                    init.children[i] = child.id;
                }
            }

            return def.kind == "box" ? (init as Box) : (init as Item);
        },

        select(thingInst: Box | Item | any) {
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
    });
</script>

{#if $queryResult.isPending}
    <p>Loading {def.kind}...</p>
{:else if $queryResult.isError}
    {console.log($queryResult.error)}
    <p style="color: red">dad{$queryResult.error}</p>
{:else if $queryResult.data.copies}
    <svelte:self
        parent={[thing, $queryResult.data.id]}
        id={$queryResult.data.copies}
        {thing}
        ogData={$queryResult.data}
    />
{:else if def.kind == "box"}
    <BoxComponent
        box={{ ...$queryResult.data, ...ogData }}
        id={ogData ? ogData.id : id}
        {parent}
    />
{:else}
    <ItemComponent item={$queryResult.data} {parent} />
{/if}
