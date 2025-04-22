<script lang="ts">
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import { createGitHubRepoManager } from "$lib/utils/github";

  export let token = "";

  let repositories: {
    id: number;
    name: string;
    description: string | null;
    private: boolean;
    language: string | null;
    stargazers_count: number;
    html_url: string;
  }[];

  let isLoading = true;
  let err = "";

  onMount(() => {
    const github = createGitHubRepoManager(token);
    github
      .listRepositories()
      .then((result: any) => {
        repositories = result;
      })
      .catch((error: any) => {
        err = error;
      })
      .finally(() => {
        isLoading = false;
      });
  });
</script>

<Loader {isLoading}>
  {#if err}
    <div class="text-2xl text-red">{err}</div>
  {:else}
    <slot {repositories} />
  {/if}
</Loader>
