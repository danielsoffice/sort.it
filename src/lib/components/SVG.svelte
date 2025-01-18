<script lang="ts">
    export let icon: string;
    export let rotate = 0;
    export let width = "1.2rem";
    export let height = width;
</script>

{#if icon === "link"}
    <svg
            xmlns="http://www.w3.org/2000/svg"
            {width}
            {height}
            fill="currentColor"
            class="bi bi-link"
            viewBox="0 0 16 16"
            style:transform={`rotate(${rotate}deg)`}
    >
        <path
                d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"
        />
        <path
                d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"
        />
    </svg>
{:else if icon === "edit"}
    <svg
            xmlns="http://www.w3.org/2000/svg"
            {width}
            {height}
            fill="currentColor"
            class="bi bi-pencil"
            viewBox="-1 -1 18 16"
    >
        <path
                d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"
        />
    </svg>
{:else if icon === "grip-horizontal"}
    <svg
            xmlns="http://www.w3.org/2000/svg"
            {width}
            {height}
            fill="currentColor"
            class="bi bi-grip-horizontal"
            viewBox="0 0 16 16"
    >
        <path
                d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
        />
    </svg>
{:else if icon === "grip-vertical"}
    <svg
            xmlns="http://www.w3.org/2000/svg"
            {width}
            {height}
            fill="currentColor"
            class="bi bi-grip-vertical"
            viewBox="0 0 16 16"
    >
        <path
                d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
        />
    </svg>
{:else if icon === "options"}
    <svg
            xmlns="http://www.w3.org/2000/svg"
            {width}
            {height}
            fill="currentColor"
            class="bi bi-three-dots-vertical"
            viewBox="0 0 16 16"
            style:transform={`rotate(${rotate}deg)`}
    >
        <path
                d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
        />
    </svg>
{:else if icon === "plus"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 22 22"
    >
        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>
    </svg
    >
{:else if icon === "minus"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 14 14"
    >
        <path fill="currentColor" d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
    </svg
    >
{:else if icon === "ex"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} fill="currentColor" class="bi bi-x" viewBox="2 2 12 11">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
{:else if icon === "order"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24"
    >
        <path
                fill="currentColor"
                d="m18 21l-4-4h3V7h-3l4-4l4 4h-3v10h3M2 19v-2h10v2M2 13v-2h7v2M2 7V5h4v2z"
        />
    </svg
    >
    {:else if icon === "copy"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="-1 -1 18 18"
    >
        <path fill="currentColor" fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
    </svg
    >{:else if icon === "refresh"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 16 16"
    >
        <path fill="currentColor" fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
        <path fill="currentColor" d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>

    </svg
    >
{:else if icon === "order-ascending"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24"
    >
        <path
                fill="currentColor"
                d="M19 17h3l-4 4l-4-4h3V3h2m-8 10v2l-3.33 4H11v2H5v-2l3.33-4H5v-2M9 3H7c-1.1 0-2 .9-2 2v6h2V9h2v2h2V5a2 2 0 0 0-2-2m0 4H7V5h2Z"
        />
    </svg
    >
{:else if icon === "order-descending"}
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24"
    >
        <path
                fill="currentColor"
                d="M19 7h3l-4-4l-4 4h3v14h2m-8-8v2l-3.33 4H11v2H5v-2l3.33-4H5v-2M9 3H7c-1.1 0-2 .9-2 2v6h2V9h2v2h2V5a2 2 0 0 0-2-2m0 4H7V5h2Z"
        />
    </svg
    >
    {/if}
