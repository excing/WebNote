<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import Modal from "./Modal.svelte";
  import { toValidGitHubRepoName } from "$lib/utils/string";
  import { stringifyRepositoryDescription } from "$lib/utils/github-utils";

  export let isOpen: boolean = false;
  export let closeModal: () => void;

  let repoName = "";
  let repoDescription = "";
  let isPrivate = true;
  let isLoading = false;
  let error: string | null = null;

  const MaxDescLength = 150;
  $: isExceed = MaxDescLength < repoDescription.length;

  async function handleSubmit() {
    if (!repoName.trim()) {
      error = "Repository name is required";
      return;
    }

    try {
      isLoading = true;
      error = null;

      let githubRepoName = toValidGitHubRepoName(repoName);
      let githubRepoDesc = stringifyRepositoryDescription(
        repoName,
        repoDescription,
      );

      await githubAuth.createRepository($githubAuth.accessToken, {
        name: githubRepoName,
        description: githubRepoDesc,
        private: isPrivate,
      });

      closeModal();
      repoName = "";
      repoDescription = "";
      isPrivate = true;
    } catch (err: any) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<Modal class="p-6" bind:isOpen {closeModal}>
  <h2 class="text-2xl font-bold mb-4">创建新仓库</h2>

  {#if error}
    <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <label for="repoName" class="block text-left text-sm font-medium mb-1"
        >仓库名称 *</label
      >
      <input
        id="repoName"
        bind:value={repoName}
        class="w-full px-3 py-2 border rounded"
        placeholder="my-new-repo"
        autocomplete="off"
        required
      />
    </div>

    <div class="mb-4">
      <label
        for="repoDescription"
        class="text-left text-sm font-medium mb-1 flex items-center justify-between"
        >描述
        <span class="font-light" class:text-red-600={isExceed}
          >{repoDescription.length}/{MaxDescLength}</span
        >
      </label>
      <textarea
        id="repoDescription"
        bind:value={repoDescription}
        class="w-full px-3 py-2 border rounded"
        placeholder="Optional description"
        rows="3"
      ></textarea>
    </div>

    <div class="mb-6 flex items-center">
      <label
        id="isPrivate"
        class="relative inline-flex items-center cursor-pointer"
      >
        <input type="checkbox" bind:checked={isPrivate} class="sr-only peer" />
        <div
          class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform"
        ></div>
        <span class="ml-3 text-base font-medium text-gray-900 dark:text-gray-300">
          私有
        </span>
      </label>
    </div>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        on:click={closeModal}
        class="px-4 py-2 border rounded hover:bg-gray-100"
        disabled={isLoading}
      >
        取消
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={isLoading || !repoName.trim() || isExceed}
      >
        {isLoading ? "创建中..." : "创建仓库"}
      </button>
    </div>
  </form>
</Modal>
