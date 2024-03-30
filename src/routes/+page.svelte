<script lang="ts">
    import type { v5 } from "uuid";
    import { page } from "$app/stores";
    import { onMount, setContext } from "svelte";
    import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
    import PluginManager from "$lib/plugins";
    import "/src/reset.css";
    import "/src/style.css";
    import DataLoader from "$lib/components/DataLoader.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import Error from "./+error.svelte";

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 5000,
                refetchInterval: 1000 * 60 * 5 - 1,
                structuralSharing: false,
                gcTime: Infinity,
            },
        },
    });

    const id = $page.url.searchParams.get("id");

    if (!id) throw Error;

    let uuid: typeof v5 = id as unknown as typeof v5;

    const manager = new PluginManager();

    setContext("PluginManager", manager);
    setContext("getDef", (type: string) => manager.getDef(type));
    setContext(
        "isBox",
        (type: string) => manager.getDef(type)["kind"] === "box",
    );

    let loading = true;

    onMount(async () => {
        await manager.loadPlugins();
        console.log("Plugins Loaded: " + manager.PLUGINS);
        loading = false;
    });
</script>

<!-- HTML head. -->
<svelte:head>
    <title>Svelte.it</title>
</svelte:head>

<SideBar />
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
    main {
        box-sizing: border-box;
        position: relative;
        height: 100%;
        flex-direction: column;
        padding: 5px;
        flex: 1 1 max-content;
    }
</style>
