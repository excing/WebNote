<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import {
    createGitHubRepoManager,
    type GitRepository,
  } from "$lib/utils/github";
  import { parseRepositoryDescription } from "$lib/utils/github-utils";
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let repo: GitRepository;
  $: noteRepo = parseRepositoryDescription(repo);

  export let isOpen: boolean = false;
  export let closeModal: () => void;

  const github = createGitHubRepoManager($githubAuth.accessToken || "");

  let isLoading = false;
  let error: string | null = null;

  let confirmValue: string;

  async function handleSubmit() {
    isLoading = true;
    github
      .deleteRepository($githubAuth.user.login, repo.name)
      .then((result: any) => {
        githubAuth.removeNoteRepo(repo.id);
        closeModal();
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

<Modal class="p-6 space-y-4" bind:isOpen {closeModal}>
  <h2 class="text-2xl font-bold">
    确认删除“{noteRepo.name}”吗？
  </h2>
  <div class="p-3 bg-red-100 text-red-700 rounded {error ? '' : 'hidden'}">
    {error}
  </div>
  <div class="flex flex-col px-11 py-2 bg-gray-100">
    <span>请注意：</span>
    <span class=" indent-8"
      >该操作将永久删除你的"{noteRepo.name}"笔记仓库及其内所有笔记和数据，不可撤销，不可恢复。
    </span>
    <span class=" indent-8"
      >该操作同样作用于你的 GitHub 账号，不可撤销，不可恢复。
    </span>
    <span class=" indent-8">请谨慎执行。</span>
  </div>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="mb-4">
      <label
        for="confirmValue"
        class="block text-left text-sm text-red-500 mb-1"
        >请在下面的输入框中输入"<font class=" font-bold text-red-600"
          >{noteRepo.name}</font
        >"以确认删除 *
      </label>
      <input
        id="confirmValue"
        bind:value={confirmValue}
        class="w-full px-3 py-2 border border-red-400 rounded"
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
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        disabled={isLoading || confirmValue !== noteRepo.name}
      >
        {isLoading ? "删除中..." : "确认删除"}
      </button>
    </div>
  </form>
  <p class="text-sm text-red-400">
    * 执行成功后，数据更新有延迟(约1min)，请稍后刷新
  </p>
</Modal>
