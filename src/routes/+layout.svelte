<script lang="ts">
	import { onMount } from "svelte";
	import "../app.css";
	import { githubAuth } from "$lib/stores/githubAuth";
	import { createGitHubRepoManager } from "$lib/utils/github";
	import Loader from "$lib/components/Loader.svelte";

	let { children } = $props();
	let loading = $state(true);

	onMount(async () => {
		githubAuth.init();
		const isAuth = await githubAuth.isAuthenticated();
		if (!isAuth) {
			loading = false;
			return;
		}

		try {
			const accessToken = $githubAuth.accessToken || "";
			const github = createGitHubRepoManager(accessToken);
			const user = await github.getCurrentUser();
			githubAuth.setUser(user);
		} catch (err: any) {
			githubAuth.setAccessToken("");
		}
		loading = false;
	});
</script>

<Loader isLoading={loading} class="max-w-[960px] m-auto px-1 md:px-2">
	{@render children()}
</Loader>
