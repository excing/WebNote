<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import { clickOutside } from "$lib/utils/window";

  export let isOpen: boolean = false;
  export let closeModal: () => void;

  let repoName = "";
  let repoDescription = "";
  let isPrivate = false;
  let isLoading = false;
  let error: string | null = null;

  async function handleSubmit() {
    if (!repoName.trim()) {
      error = "Repository name is required";
      return;
    }

    try {
      isLoading = true;
      error = null;

      await githubAuth.createRepository($githubAuth.accessToken, {
        name: repoName,
        description: repoDescription,
        private: isPrivate,
      });

      closeModal();
      repoName = "";
      repoDescription = "";
      isPrivate = false;
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-gray-400/10 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white rounded-lg co-border-6 w-full max-w-md">
      <div class="p-6" use:clickOutside={closeModal}>
        <h2 class="text-2xl font-bold mb-4">创建新仓库</h2>

        {#if error}
          <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit}>
          <div class="mb-4">
            <label
              for="repoName"
              class="block text-left text-sm font-medium mb-1">仓库名称 *</label
            >
            <input
              id="repoName"
              bind:value={repoName}
              class="w-full px-3 py-2 border rounded"
              placeholder="my-new-repo"
              required
            />
          </div>

          <div class="mb-4">
            <label
              for="repoDescription"
              class="block text-left text-sm font-medium mb-1">描述</label
            >
            <textarea
              id="repoDescription"
              bind:value={repoDescription}
              class="w-full px-3 py-2 border rounded"
              placeholder="Optional description"
              rows="3"
            ></textarea>
          </div>

          <div class="mb-6 flex items-center">
            <input
              id="isPrivate"
              type="checkbox"
              bind:checked={isPrivate}
              class="mr-2"
            />
            <label for="isPrivate" class="text-sm">私有仓库</label>
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
              disabled={isLoading || !repoName.trim()}
            >
              {isLoading ? "创建中..." : "创建仓库"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
