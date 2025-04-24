<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { pathname } from "$lib/utils/path";
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // 文件类型：dir, file
  export let type = "dir";
  export let repo = "";
  export let path = "";
  export let sha = "";

  export let isOpen: boolean = false;
  export let closeModal: () => void;

  $: typename = type === "dir" ? "文件夹" : "文件";

  const github = createGitHubRepoManager($githubAuth.accessToken || "");

  let isLoading = false;
  let error: string | null = null;

  async function handleSubmit() {
    isLoading = true;
    const request =
      type === "dir"
        ? github.deleteDirectory(
            $githubAuth.user.login,
            repo,
            path,
            "Delete directory",
          )
        : github.deleteFile(
            $githubAuth.user.login,
            repo,
            path,
            "Delete file",
            sha,
          );
    request
      .then((result: any) => {
        dispatch("deleted");
      })
      .catch((err: any) => {
        error = err.message;
      })
      .finally(() => {
        isLoading = false;
      });
  }
</script>

<Modal class="p-6" bind:isOpen {closeModal}>
  <h2 class="text-2xl font-bold mb-4">
    确定删除 {pathname(path)}
    {typename}吗？
  </h2>
  <div class="mb-4 p-3 bg-red-100 text-red-700 rounded {error ? '' : 'hidden'}">
    {error}
  </div>
  <p class="my-4">路径：/{repo}/{path}</p>
  <form on:submit|preventDefault={handleSubmit}>
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
        disabled={isLoading}
      >
        {isLoading ? "删除中..." : "确认删除"}
      </button>
    </div>
  </form>
</Modal>
