<script lang="ts">
	import { onMount } from "svelte";
	import "../app.css";
	import { githubAuth } from "$lib/stores/githubAuth";

	let { children } = $props();
	let loading = $state(true);

	onMount(() => {
		githubAuth.init();
		loading = false;
	});
</script>

{#if loading}
	loading...
{:else}
	{@render children()}
{/if}
