<script lang="ts">
  import { goto } from "$app/navigation";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { createGitHubRepoManager } from "$lib/utils/github";
  import Modal from "./Modal.svelte";

  export let repo = "";
  export let path = "";

  export let isOpen: boolean = false;
  export let closeModal: () => void;

  const github = createGitHubRepoManager($githubAuth.accessToken || "");

  let fileName = "";
  let fileContent = "";
  let isLoading = false;
  let error: string | null = null;

  async function handleSubmit() {
    if (!fileName.trim()) {
      error = "File name is required";
      return;
    }

    if (!fileContent.trim()) {
      fileContent = fileName;
    }

    let filepath = path ? `${path}/${fileName}` : fileName;
    console.log(filepath);

    isLoading = true;
    error = null;
    closeModal();

    github
      .createOrUpdateFile(
        $githubAuth.user.login,
        repo,
        filepath,
        "Create notes",
        btoa(encodeURIComponent(fileContent)),
        "",
      )
      .then((result: any) => {
        goto(`/${repo}/${filepath}/write`);
        fileName = "";
        fileContent = "";
      })
      .catch((err) => {
        error = err.message;
      })
      .finally(() => {
        isLoading = false;
      });
  }
</script>

<Modal class="p-6" bind:isOpen {closeModal}>
  <h2 class="text-2xl font-bold mb-4">创建新笔记</h2>
  <div class="mb-4 p-3 bg-red-100 text-red-700 rounded {error ? '' : 'hidden'}">
    {error}
  </div>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <label for="fileName" class="block text-left text-sm font-medium mb-1"
        >文件名称 *</label
      >
      <input
        id="fileName"
        bind:value={fileName}
        class="w-full px-3 py-2 border rounded"
        placeholder="my-new-note"
        required
      />
    </div>

    <div class="mb-4">
      <label for="fileContent" class="block text-left text-sm font-medium mb-1"
        >速记</label
      >
      <textarea
        id="fileContent"
        bind:value={fileContent}
        class="w-full px-3 py-2 border rounded"
        placeholder="Optional description"
        rows="3"
      ></textarea>
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
        disabled={isLoading || !fileName.trim()}
      >
        {isLoading ? "创建中..." : "创建笔记"}
      </button>
    </div>
  </form>
</Modal>
