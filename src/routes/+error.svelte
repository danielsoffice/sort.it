<script lang="ts">
    import { page } from "$app/stores";

    let error = $page.error as App.Error;
</script>

<main>
    <div>
        <h1>Error</h1>
        <h2>{error.message ?? "Unknown error"}</h2>
        <h3>Please click <a href="/">here</a> to return to the dashboard.</h3>
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
