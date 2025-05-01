<script lang="ts">
  import Home from "$lib/components/Home.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { createGitHubRepoManager, type GitContent } from "$lib/utils/github";
  import {
    decode64AndReturnBlob,
    downloadBlob,
    getMimeTypeFromFilename,
  } from "$lib/utils/github-utils";
  import { onMount } from "svelte";

  export let data;

  let isLoading = true;
  let contentURL: string;
  let contentMimeType: string = "";
  let error: string;

  $: contentType = contentMimeType.split("/")[0] || "";

  onMount(() => {
    const github = createGitHubRepoManager($githubAuth.accessToken || "");
    github
      .getContents($githubAuth.user.login, data.repo, data.path)
      .then((result) => {
        if (Array.isArray(result)) throw new Error("This is Folder");
        try {
          contentMimeType = getMimeTypeFromFilename(result.name);
          if (result.content) {
            contentURL = decode64AndReturnBlob(result.content, contentMimeType);
          } else {
            contentURL = result.download_url;
          }
          downloadBlob(result.name, contentURL);
        } catch (err) {
          throw err;
        }
      })
      .catch((err) => {
        error = err.message;
      })
      .finally(() => {
        isLoading = false;
      });
  });
</script>

<Home class="min-h-screen flex flex-col">
  <Toolbar class="h-12 md:h-14"></Toolbar>
  {#if isLoading}
    <div class="flex flex-col items-center justify-center h-[300px]">
      <div
        class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
      ></div>
      <p class="mt-2">下载中...</p>
    </div>
  {:else if error}
    <div
      class="mb-4 p-3 bg-red-100 text-red-700 rounded {error ? '' : 'hidden'}"
    >
      {error}
    </div>
  {:else if contentType === "image"}
    <img src={contentURL} aria-label="download" class="h-full w-full" />
  {:else if contentType === "video"}
    <video src={contentURL} class="h-full w-full" />
  {:else if contentType === "audio"}
    <audio src={contentURL} class="h-full w-full" />
  {:else}
    <div class="flex flex-col items-center justify-center h-[300px]">
      <div
        class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
      ></div>
      <p class="mt-2">下载中...</p>
    </div>
  {/if}
</Home>
