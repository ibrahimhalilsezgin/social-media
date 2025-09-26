<script lang="ts">
    export let data;
    console.log(data)
</script>

{#if data.user}
    {JSON.stringify(data.user)}

{:else}
    kullanıcı yok
{/if}
