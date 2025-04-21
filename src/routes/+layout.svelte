<script lang="ts">
	import { onMount } from "svelte";
	import "../app.css";
	import { githubAuth } from "$lib/stores/githubAuth";
	import { goto } from "$app/navigation";
	import { createGitHubRepoManager } from "$lib/utils/github";

	let { children } = $props();
	let loading = $state(true);

	onMount(async () => {
		githubAuth.init();
		const isAuth = await githubAuth.isAuthenticated();
		if (!isAuth) {
			loading = false;
			return;
		}

		const accessToken = $githubAuth.accessToken || "";
		const github = createGitHubRepoManager(accessToken);
		const user = await github.getCurrentUser();
		githubAuth.setUser(user);
		loading = false;
	});
</script>

{#if loading}
	loading...
{:else}
	{@render children()}
{/if}
