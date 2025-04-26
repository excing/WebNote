<script lang="ts">
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import {
    createGitHubRepoManager,
    type GitRepository,
  } from "$lib/utils/github";
  import { githubAuth } from "$lib/stores/githubAuth";

  export let token = "";
  export let owner = "";
  export let repo = "";

  export let repository: GitRepository;

  let isLoading = true;
  let err = "";

  onMount(() => {
    repository = $githubAuth.noteRepos.find((value) => {
      if (value.name === repo) {
        return true;
      }
    });
    if (repository) {
      isLoading = false;
      return;
    }
    const github = createGitHubRepoManager(token);
    github
      .getRepository(owner, repo)
      .then((result: GitRepository) => {
        repository = result;
      })
      .catch((error: any) => {
        err = error;
      })
      .finally(() => {
        isLoading = false;
      });
  });
</script>

<Loader {isLoading} class={$$props.class}>
  {#if err}
    <div class="text-2xl text-red">{err}</div>
  {:else}
    <slot {repository} />
  {/if}
</Loader>
