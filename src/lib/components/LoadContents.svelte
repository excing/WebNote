<script lang="ts">
  import { createGitHubRepoManager, type GitContent } from "$lib/utils/github";
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";

  export let token = "";
  export let owner = "";
  export let repo = "";

  let isLoading = true;
  let contents: GitContent[];
  let err = "";

  onMount(() => {
    const github = createGitHubRepoManager(token);
    github
      .getContents(owner, repo, "")
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
  });
</script>

<Loader {isLoading} class={$$props.class}>
  {#if err}
    <div class="text-2xl text-red">{err}</div>
  {:else}
    <slot {contents} />
  {/if}
</Loader>
