<script lang="ts">
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import {
    createGitHubRepoManager,
    type GitRepository,
  } from "$lib/utils/github";

  export let token = "";

  let repositories: GitRepository[] = [];

  let isLoading = true;
  let err = "";
  let page = 1;
  let perPage = 30;
  let hasMore = true;

  export function reload() {
    page = 1;
    repositories = [];
    loadListRepositories();
  }

  function loadListRepositories() {
    isLoading = true;
    const github = createGitHubRepoManager(token);
    github
      .listRepositories({ perPage, page })
      .then((result: GitRepository[]) => {
        repositories = [...repositories, ...result];
        hasMore = perPage == result.length;
        page = page + 1;
      })
      .catch((error: any) => {
        err = error;
      })
      .finally(() => {
        isLoading = false;
      });
  }

  onMount(() => {
    loadListRepositories();
  });
</script>

<div class={$$props.class} class:hidden={page == 1}>
  <slot {repositories} />
</div>
<Loader {isLoading} class={$$props.class}>
  {#if err}
    <div class="text-2xl text-red">{err}</div>
  {:else}
    <div class="my-5 flex flex-row justify-end" class:hidden={!hasMore}>
      <button
        class="px-1 border-b-2 border-b-black hover:scale-110 active:scale-110 transition-transform"
        on:click={loadListRepositories}
        >下一页
      </button>
    </div>
  {/if}
</Loader>
