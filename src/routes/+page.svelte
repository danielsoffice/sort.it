<script lang="ts">
    import type { v5 } from "uuid";
    import { page } from "$app/stores";
    import { onMount, setContext } from "svelte";
    import {
        QueryClient,
        QueryClientProvider,
    } from "@sveltestack/svelte-query";
    import PluginManager from "$lib/plugins";
    import "/src/reset.css";
    import DataLoader from "$lib/components/DataLoader.svelte";

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 5000,
                structuralSharing: false,
            },
        },
    });

    const id = $page.url.searchParams.get("id");

    let uuid: typeof v5 = id as unknown as typeof v5;

    const manager = new PluginManager();

    setContext("PluginManager", manager);
    setContext("getDef", (type: string) => manager.getDef(type));
    setContext(
        "isBox",
        (type: string) => manager.getDef(type)["kind"] === "box"
    );

    let loading = true;

    onMount(async () => {
        await manager.loadPlugins();
        console.log(
            "Plugins Loaded: " + manager.boxClasses + "," + manager.itemClasses
        );
        loading = false;
    });
</script>

<!-- HTML head. -->
<svelte:head>
    <title>Svelte.it</title>
</svelte:head>

<main>
    <QueryClientProvider client={queryClient}>
        {#if !loading}
            <DataLoader
                thing={"core.box"}
                parent={["core.box", null]}
                id={uuid.toString()}
            />
        {/if}
    </QueryClientProvider>
</main>

<style>
    :root {
        --box-color: #39cccc;
        --box-width: 200px;

        --item-color: #2ecc40;
        --item-color-light: #6ece7933;
    }
    main {
        box-sizing: border-box;
        position: relative;
        height: 100%;
        background-color: #e8e8e8;

        display: flex;
        flex-direction: column;
        padding: 5px;
    }
</style>
