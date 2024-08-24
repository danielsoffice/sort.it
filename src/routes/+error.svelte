<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { v4 as uuid} from "uuid";
    import "/src/style.css";
    import { onMount } from "svelte";

    let error = $page.error as App.Error;

    onMount(()=>{
        if(error.message === "no id"){
            goto("/?id=" + uuid())
        }
    })
    
</script>

<main>
    <div>
        <h1>Sort.It has encountered an Error</h1>
        <h2>Error Type: <code>{error.message ?? "Unknown error"}</code></h2>
        <h3>More Info:
            <code>We have encountered an error. Please make sure you sent a valid
            "id".</code>
        </h3>
    </div>
</main>

<style>
    main {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    div {
        text-align: center;
    }
</style>
