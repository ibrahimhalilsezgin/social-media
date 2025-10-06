<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Notification from '$lib/components/Notification.svelte';
	import { onMount } from 'svelte';
	let { children } = $props();
	let loading = $state(true);
	onMount(() => {
		setTimeout(() => {
			loading = false
		},500)
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Notification  />
{#if loading}
	<div class="h-screen flex items-center justify-center">
		<span class="loader"></span>
	</div>
{:else}
	{@render children?.()}

{/if}

<style>
	.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #fff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    } 
</style>