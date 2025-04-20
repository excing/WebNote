<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";

  export let repo: {
    id: number;
    name: string;
    description: string | null;
    private: boolean;
    language: string | null;
    stargazers_count: number;
    html_url: string;
  };

  // Check if this repo is selected
  $: isSelected = $githubAuth.noteRepos.some((r) => r.id === repo.id);

  function toggleSelection() {
    if (isSelected) {
      githubAuth.removeNoteRepo(repo.id);
    } else {
      githubAuth.addNoteRepo(repo);
    }
  }
</script>

<div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative">
  <!-- Selection indicator -->
  <button
    class={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 cursor-pointer
            ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
    on:click={toggleSelection}
  >
    {#if isSelected}
      <svg
        class="w-3 h-3 text-white absolute top-0.5 left-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    {/if}
  </button>

  <h3 class="text-xl font-medium mb-2">
    {repo.name}
    {#if repo.private}
      <span class="bg-blue-50 text-base text-blue-700 px-2 py-1 rounded">
        私有
      </span>
    {/if}
  </h3>
  <p class="text-gray-600 mb-4 min-h-[3rem]">
    {repo.description || "无描述"}
  </p>
  <div class="flex gap-2">
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-block bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
    >
      查看仓库
    </a>
    <button
      on:click={toggleSelection}
      class={`px-4 py-2 rounded text-sm transition-colors ${
        isSelected
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      }`}
    >
      {isSelected ? "移除笔记" : "添加为笔记"}
    </button>
  </div>
</div>
