<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import type { GitRepository } from "$lib/utils/github";
  import { createEventDispatcher } from "svelte";
  import Dropdown from "./Dropdown.svelte";
  import CreateFileModal from "./CreateFileModal.svelte";
  import { parseRepositoryDescription } from "$lib/utils/github-utils";
  import DeleteRepositoryModal from "./DeleteRepositoryModal.svelte";

  const dispatch = createEventDispatcher();

  export let repository: GitRepository;
  export let isManagerVisible = false;

  $: noteRepo = parseRepositoryDescription(repository);

  // 是否确认移除
  let isRemove = false;
  // 是否创建新文件
  let isNewFile = false;
  // 是否删除仓库
  let isDeleteRepository = false;

  // Check if this repo is selected
  $: isSelected = $githubAuth.noteRepos.some((r) => r.id === repository.id);
  $: isDefaultRepository =
    $githubAuth.defaultRepo && $githubAuth.defaultRepo.id === repository.id;

  function toggleSelection() {
    if (isSelected) {
      if (isRemove) {
        githubAuth.removeNoteRepo(repository.id);
      } else {
        isRemove = true;
      }
    } else {
      githubAuth.addNoteRepo(repository);
    }
  }

  function toggleNewFileModal() {
    isNewFile = !isNewFile;
  }

  function toggleDeleteRepositoryModal() {
    isDeleteRepository = !isDeleteRepository;
  }
</script>

<a
  href="/{repository.name}"
  class="border-black co-border-6 rounded-lg p-4 bg-white relative"
>
  <!-- Selection indicator -->
  <div class="flex justify-between">
    <h3 class="text-xl font-medium mb-2">
      {noteRepo.name}
      {#if isDefaultRepository}
        <span class="bg-amber-50 text-base text-amber-700 px-2 py-1 rounded">
          默认
        </span>
      {/if}
      {#if repository.private}
        <span class="bg-blue-50 text-base text-blue-700 px-2 py-1 rounded">
          私有
        </span>
      {/if}
    </h3>
    <Dropdown
      class="flex flex-col w-42"
      on:opened={() => {
        isRemove = false;
      }}
    >
      <button
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        class:hidden={!isSelected}
        role="menuitem"
        tabindex="-1"
        data-close-dropdown
        on:click|preventDefault={toggleNewFileModal}
      >
        <span class="mr-3 ic-file h-5 w-5"></span>
        新笔记
      </button>
      <button
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        class:hidden={!isSelected}
        role="menuitem"
        tabindex="-1"
        data-close-dropdown
        on:click|preventDefault={() => {
          githubAuth.setDefaultRepo(repository);
        }}
      >
        <span class="mr-3 ic-flag h-5 w-5"></span>
        设为默认仓库
      </button>
      <a
        href={repository.html_url}
        target="_blank"
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        role="menuitem"
        tabindex="-1"
        data-close-dropdown
      >
        <span class="mr-3 ic-github h-5 w-5"></span>
        查看 GitHub
      </a>
      <button
        class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        class:hidden={!isSelected}
        role="menuitem"
        tabindex="-1"
        data-close-dropdown
        on:click|preventDefault={toggleDeleteRepositoryModal}
      >
        <span class="mr-3 ic-trash ic-c-error h-5 w-5"></span>
        删除该仓库
      </button>
      <button
        on:click|preventDefault={toggleSelection}
        class={`px-4 py-2 text-sm transition-colors ${
          isSelected
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
        role="menuitem"
        tabindex="-1"
        data-close-dropdown={isRemove || !isSelected}
      >
        {isSelected ? (isRemove ? "确认移除" : "移除") : "添加为笔记仓库"}
      </button>
    </Dropdown>
  </div>

  <p class="text-gray-600 mb-4 min-h-[3rem]">
    {noteRepo.description || "无描述"}
  </p>
  <div class="text-sm">
    {new Date(repository.created_at).toLocaleString()}
  </div>
  <div class:hidden={!isManagerVisible} class="flex justify-end">
    <button
      on:click|preventDefault={toggleSelection}
      class={`px-4 py-2 text-sm transition-colors rounded ${
        isSelected
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      }`}
    >
      {isSelected ? (isRemove ? "确认移除" : "移除") : "添加"}
    </button>
  </div>
</a>
<CreateFileModal
  bind:isOpen={isNewFile}
  repo={repository}
  closeModal={toggleNewFileModal}
></CreateFileModal>
<DeleteRepositoryModal
  bind:isOpen={isDeleteRepository}
  repo={repository}
  closeModal={toggleDeleteRepositoryModal}
  on:deleted
></DeleteRepositoryModal>

<style>
  .ic-c-error {
    filter: invert(23%) sepia(90%) saturate(2346%) hue-rotate(3deg)
      brightness(93%) contrast(108%);
  }
</style>
