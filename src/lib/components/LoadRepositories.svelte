<script lang="ts">
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import {
    createGitHubRepoManager,
    type GitRepository,
  } from "$lib/utils/github";

  export let token = "";

  let repositories: GitRepository[];

  let isLoading = true;
  let err = "";

  onMount(() => {
    const github = createGitHubRepoManager(token);
    github
      .listRepositories()
      .then((result: GitRepository[]) => {
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
