<script lang="ts">
  import { createGitHubRepoManager, type GitContent } from "$lib/utils/github";
  import { onDestroy, onMount } from "svelte";
  import Loader from "./Loader.svelte";

  export let token = "";
  export let owner = "";
  export let repo = "";
  export let path = "";

  let isLoading = true;
  let contents: GitContent[] = [];
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

          sort("name");
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

  function sort(
    sort: "default" | "name" | "size" = "default",
    direction: "asc" | "desc" = "asc",
  ) {
    // 如果是单个文件或未指定排序，直接返回
    if (!Array.isArray(contents) || sort === "default") {
      return contents;
    }

    // 排序逻辑
    return contents.sort((a, b) => {
      let compareResult = 0;

      switch (sort) {
        case "name":
          // 目录排在前面
          compareResult =
            (a.type === "dir" ? 0 : 1) - (b.type === "dir" ? 0 : 1);
          // 类型相同再按名称排序
          if (compareResult === 0) {
            compareResult = a.name.localeCompare(b.name);
          }
          break;
        case "size":
          compareResult = a.size - b.size;
          break;
      }

      return direction === "asc" ? compareResult : -compareResult;
    });
  }

  onMount(() => {});

  onDestroy(() => {
    console.log(`destory ${repo}/${path}`);
  });
</script>

<Loader {isLoading} class={$$props.class}>
  {#if error && !error.includes("404")}
    <div class="text-2xl text-red-400">{error}</div>
  {:else}
    <slot {contents} />
  {/if}
</Loader>
