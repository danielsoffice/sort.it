<script lang="ts">
    import { page } from "$app/stores";

    let error = $page.error as App.Error;
</script>

<main>
    <div>
        <h1>Error</h1>
        <h2>{error.message ?? "Unknown error"}</h2>
        <h3>
            We have encountered an error. Please make sure you sent a valid
            "id".
        </h3>
    </div>
</main>

<style>
    main {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    div {
        text-align: center;
    }
</style>
