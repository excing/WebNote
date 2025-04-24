<script lang="ts">
  import { createGitHubRepoManager, type GitContent } from "$lib/utils/github";
  import { onDestroy, onMount } from "svelte";
  import Loader from "./Loader.svelte";

  export let token = "";
  export let owner = "";
  export let repo = "";
  export let path = "";

  // todo 由调用者处理全部数据，包括错误信息和文件数据
  // 比如 404，文本文件等
  let isLoading = true;
  let contents: GitContent[];
  let error = "";

  $: {
    requestContents(owner, repo, path);
  }

  export function reload() {
    requestContents(owner, repo, path);
  }

  function requestContents(owner: string, repo: string, path: string) {
    isLoading = true;
    error = "";
    const github = createGitHubRepoManager(token);
    github
      .getContents(owner, repo, path)
      .then((content: any) => {
        if (Array.isArray(content)) {
          // It's a directory, not a file
          contents = content;
        } else {
          // It's a file
          error = "Error: It's a file";
        }
      })
      .catch((err: any) => {
        // File doesn't exist, create it
        if (err.message.includes("404")) {
          // 找不到文件
          error = "404 NOT FOUND";
        } else {
          error = err.message;
        }
      })
      .finally(() => {
        isLoading = false;
      });
  }

  onMount(() => {
    requestContents(owner, repo, path);
  });

  onDestroy(() => {
    console.log(`destory ${repo}/${path}`);
  });
</script>

<Loader {isLoading} class={$$props.class}>
  {#if error}
    <div class="text-2xl text-red-400">{error}</div>
  {:else}
    <slot {contents} />
  {/if}
</Loader>
