<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import Dropdown from "./Dropdown.svelte";

  export let repository: {
    id: number;
    name: string;
    description: string | null;
    private: boolean;
    language: string | null;
    stargazers_count: number;
    html_url: string;
    created_at: string;
    updated_at: string;
  };

  // 是否确认移除
  let isRemove = false;

  // Check if this repo is selected
  $: isSelected = $githubAuth.noteRepos.some((r) => r.id === repository.id);

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

  function title() {
    return `创建于 ${new Date(repository.created_at).toLocaleString()}\n更新于 ${new Date(repository.updated_at).toLocaleString()}`;
  }
</script>

<div class="border-black co-border-6 rounded-lg p-4 bg-white relative">
  <!-- Selection indicator -->
  <div class="flex justify-between">
    <h3 class="text-xl font-medium mb-2">
      {repository.name}
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
      <a
        href={repository.html_url}
        target="_blank"
        class="rounded-t-lg flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        role="menuitem"
        tabindex="-1"
        data-close-dropdown
        on:click={() => {}}
      >
        <span class="mr-3 ic-github h-5 w-5"></span>
        查看 GitHub
      </a>
      <button
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        role="menuitem"
        tabindex="-1"
        data-close-dropdown
        on:click={() => {}}
      >
        <span class="mr-3 ic-dir h-5 w-5"></span>
        新文件
      </button>
      <button
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        role="menuitem"
        tabindex="-1"
        data-close-dropdown
        on:click={() => {}}
      >
        <span class="mr-3 ic-flag h-5 w-5"></span>
        设为默认仓库
      </button>
      <button
        on:click={toggleSelection}
        class={`rounded-b-lg px-4 py-2 text-sm transition-colors ${
          isSelected
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
        role="menuitem"
        tabindex="-1"
        data-close-dropdown={isRemove || !isSelected}
      >
        {isSelected ? (isRemove ? "确认移除" : "移除") : "添加为笔记"}
      </button>
    </Dropdown>
  </div>

  <p class="text-gray-600 mb-4 min-h-[3rem]">
    {repository.description || "无描述"}
  </p>
  <div class="text-sm" title={title()}>
    {new Date(repository.updated_at).toLocaleString()}
  </div>
</div>
