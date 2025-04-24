<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { parentPath, pathname } from "$lib/utils/path";
  import { on } from "svelte/events";
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // 文件类型：dir, file
  export let type = "dir";
  export let repo = "";
  export let path = ""; // old path

  let oname = pathname(path);
  let nname = oname; // new name

  export let isOpen: boolean = false;
  export let closeModal: () => void;

  $: typename = type === "dir" ? "文件夹" : "文件";

  const github = createGitHubRepoManager($githubAuth.accessToken || "");

  let isLoading = false;
  let error: string | null = null;

  async function handleSubmit() {
    isLoading = true;
    const parent = parentPath(path);
    const npath = parent ? `${parentPath(path)}/${nname}` : nname;
    const request =
      type === "dir"
        ? github.renameDirectory(
            $githubAuth.user.login,
            repo,
            path,
            npath,
            "Rename directory",
          )
        : github.renameFile(
            $githubAuth.user.login,
            repo,
            path,
            npath,
            "Rename file",
          );
    request
      .then((result: any) => {
        dispatch("renamed");
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
    {typename}重命名
  </h2>
  {parentPath(path)}
  <div class="mb-4 p-3 bg-red-100 text-red-700 rounded {error ? '' : 'hidden'}">
    {error}
  </div>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <label for="fileName" class="block text-left text-sm font-medium mb-1"
        >新名称 *</label
      >
      <input
        id="fileName"
        bind:value={nname}
        class="w-full px-3 py-2 border rounded"
        placeholder="new name"
        autocomplete="off"
        required
      />
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
        disabled={isLoading || !nname.trim() || oname === nname}
      >
        {isLoading ? "重命名中..." : "确定"}
      </button>
    </div>
  </form>
</Modal>
