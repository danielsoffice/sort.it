<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { v4 as uuid} from "uuid";
    import "/src/style.css";
    import { onMount } from "svelte";

    let error = $page.error as App.Error;

    onMount(()=>{
        // if(error.message === "no id"){
        //     goto("/?id=" + uuid())
        // }
    })
    
</script>

<main>
    <div>
        <h1>Boxlify has encountered an error :(</h1>
        <h2>Error type: <code>{error.message ?? "Unknown error"}</code></h2>
        <h3>More info: 
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
    code {
        background: rgba(100,100,100,0.3);
        padding: 3px 5px;
    }
</style>
