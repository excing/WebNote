<script lang="ts">
  import { createGitHubRepoManager, type GitContent } from "$lib/utils/github";
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";

  export let token = "";
  export let owner = "";
  export let repo = "";
  export let path = "";

  let isLoading = true;
  let contents: GitContent[];
  let err = "";

  $: {
    requestContents(owner, repo, path);
  }

  function requestContents(owner: string, repo: string, path: string) {
    isLoading = true;
    err = "";
    const github = createGitHubRepoManager(token);
    github
      .getContents(owner, repo, path)
      .then((content: any) => {
        if (Array.isArray(content)) {
          // It's a directory, not a file
          contents = content;
        } else {
          // It's a file
          err = "It's a file";
        }
      })
      .catch((error: any) => {
        // File doesn't exist, create it
        if (error.message.includes("404")) {
          // 找不到文件
          err = "404 Not found";
        } else {
          err = error.message;
        }
      })
      .finally(() => {
        isLoading = false;
      });
  }

  onMount(() => {
    requestContents(owner, repo, path);
  });
</script>

<Loader {isLoading} class={$$props.class}>
  {#if err}
    <div class="text-2xl text-red">{err}</div>
  {:else}
    <slot {contents} />
  {/if}
</Loader>
