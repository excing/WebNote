<script lang="ts">
  import { filesize } from "$lib/utils/format";
  import Dropdown from "./Dropdown.svelte";
  import TwoClickButton from "./TwoClickButton.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let type;
  export let repo;
  export let path;
  export let name;
  export let size;
  export let url = "";
  export let isMenuVisible = true;

  $: href =
    url || (type === "dir" ? `/${repo}/${path}` : `/${repo}/${path}/write`);
</script>

<div class="flex items-center">
  {#if type === "dir"}
    <a {href} class="flex-1 text-lg flex flex-row items-center">
      <div class="mr-2 h-5 w-5 ic-dir ic-c-primary"></div>
      {name}
    </a>
  {:else}
    <a {href} class="flex-1 text-lg flex flex-row items-center">
      <div class="mr-2 h-5 w-5 ic-file ic-c-success"></div>
      {name}
      <span class="text-sm">({filesize(size)})</span>
    </a>
  {/if}
  {#if isMenuVisible}
    <Dropdown size={4} class="flex flex-col w-42" on:opened={() => {}}>
      <button
        class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        data-close-dropdown
        on:click|preventDefault={() => {
          dispatch("rename");
        }}
      >
        重命名
      </button>
      <TwoClickButton
        class="px-4 py-2 text-sm transition-colors bg-red-100 text-red-700 hover:bg-red-200"
        on:click={() => {
          dispatch("delete");
        }}
      >
        <span>删除</span>
        <span slot="clicked">确认删除</span>
      </TwoClickButton>
    </Dropdown>
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
