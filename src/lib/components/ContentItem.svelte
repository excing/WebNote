<script lang="ts">
  import { filesize } from "$lib/utils/format";
  import DeleteFileModal from "./DeleteFileModal.svelte";
  import Dropdown from "./Dropdown.svelte";
  import { createEventDispatcher } from "svelte";
  import RenameFileModal from "./RenameFileModal.svelte";
  import { createGitHubRepoManager, type GitContent } from "$lib/utils/github";
  import { githubAuth } from "$lib/stores/githubAuth";
  const dispatch = createEventDispatcher();

  export let content: GitContent | null = null;
  export let repo;
  export let isMenuVisible = true;
  export let url = "";

  $: type = content ? content.type : "dir";
  $: path = content ? content.path : "";
  $: name = content ? content.name : "..";
  $: sha = content ? content.sha : "";
  $: size = content ? content.size : 0;

  let isDeleteFile = false;
  let isRenameFile = false;

  $: href =
    url || (type === "dir" ? `/${repo}/${path}` : `/${repo}/${path}/write`);

  function handleDownloadContent() {
    if (content) {
      const github = createGitHubRepoManager($githubAuth.accessToken || "");
      github.downloadContent(content).catch((err: any) => {
        alert(err.message);
      });
      dispatch("downloaded");
    }
  }
</script>

<div class="flex items-center">
  {#if type === "dir"}
    <a {href} class="flex-1 text-lg flex flex-row items-center break-all">
      <div class="mr-2 h-5 w-5 ic-dir ic-c-primary shrink-0"></div>
      {name}
    </a>
  {:else}
    <a {href} class="flex-1 text-lg flex flex-row items-center break-all">
      <div class="mr-2 h-5 w-5 ic-file ic-c-success shrink-0"></div>
      {name}
      <span class="text-sm shrink-0">({filesize(size)})</span>
    </a>
  {/if}
  {#if isMenuVisible}
    <Dropdown size={4} class="flex flex-col w-42" on:opened={() => {}}>
      <button
        class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        class:hidden={"dir" === type}
        data-close-dropdown
        on:click|preventDefault={handleDownloadContent}
      >
        下载
      </button>
      <button
        class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        data-close-dropdown
        on:click|preventDefault={() => {
          isRenameFile = true;
          dispatch("rename");
        }}
      >
        重命名
      </button>
      <button
        class="px-4 py-2 text-sm transition-colors bg-red-100 text-red-700 hover:bg-red-200"
        data-close-dropdown
        on:click|preventDefault={() => {
          isDeleteFile = true;
          dispatch("delete");
        }}
      >
        删除
      </button>
    </Dropdown>
    <DeleteFileModal
      bind:isOpen={isDeleteFile}
      {type}
      {repo}
      {path}
      {sha}
      closeModal={() => {
        isDeleteFile = false;
      }}
      on:deleted
    ></DeleteFileModal>
    <RenameFileModal
      bind:isOpen={isRenameFile}
      {type}
      {repo}
      {path}
      closeModal={() => {
        isRenameFile = false;
      }}
      on:renamed
    ></RenameFileModal>
  {/if}
</div>

<style>
  .ic-c-primary {
    filter: invert(26%) sepia(94%) saturate(3317%) hue-rotate(220deg)
      brightness(99%) contrast(103%);
  }

  .ic-c-success {
    filter: invert(51%) sepia(57%) saturate(372%) hue-rotate(101deg)
      brightness(89%) contrast(95%);
  }

  /* .ic-c-error {
    filter: invert(23%) sepia(90%) saturate(2346%) hue-rotate(3deg)
      brightness(93%) contrast(108%);
  }

  .ic-c-white {
    filter: invert(93%) sepia(100%) saturate(30%) hue-rotate(142deg)
      brightness(107%) contrast(108%);
  } */
</style>
