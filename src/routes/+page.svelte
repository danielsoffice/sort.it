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
    import RightSideBar from "$lib/components/RightSideBar.svelte";
    import Error from "./+error.svelte";
    import SelectorTable from "$lib/components/SelectorTable.svelte";
    import { error } from "@sveltejs/kit";
    import SelectorTree from "$lib/components/SelectorTree.svelte";

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

    if (!id) throw error(404, { message: "no id" });

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

    const columns = ["Type", "Plugin", "Name"];
    const data = [
        ["box", "item", "box", "item", "box", "item", "box", "item"],
        ["core", "core", "core", "core", "api", "api", "calendar", "calendar"],
        [
            "default",
            "default",
            "basic",
            "fetch",
            "second",
            "six",
            "seven",
            "eight",
        ],
    ];
</script>

<!-- HTML head. -->
<svelte:head>
    <title>Boxlify</title>
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
    <!--    <SelectorTable titles={columns} {data} />-->
    <!-- <SelectorTree/> -->
</main>

<!--<RightSideBar />-->

<style>
    main {
        box-sizing: border-box;
        position: relative;
        height: 100%;
        flex-direction: column;
        padding: 5px;
        flex: 1 1 max-content;
    }
    :global(main > .box) {
        height: calc(100% - 8px);
    }
</style>
