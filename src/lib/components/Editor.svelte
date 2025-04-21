<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { onMount } from "svelte";

  export let repo: any = "";
  export let path = "";

  let fileContent = "";
  let lastSavedSha: string | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  let isLoading = true;
  let isUpdating = false;

  onMount(() => {
    isLoading = true;

    const accessToken = $githubAuth.accessToken || "";
    const github = createGitHubRepoManager(accessToken);
    github
      .getContents(repo.owner.login || $githubAuth.user.login, repo.name, path)
      .then((content: any) => {
        if (Array.isArray(content)) {
          // It's a directory, not a file
          fileContent = "It's a directory, not a file";
        } else {
          // It's a file
          fileContent = atob(content.content);
          lastSavedSha = content.sha;
          isLoading = false;
        }
      })
      .catch((error: any) => {
        // File doesn't exist, create it
        if (error.message.includes("404")) {
          // 找不到文件
          fileContent = error.message;
        } else {
          throw error;
        }
      });
  });

  function handleContentChange() {
    if (!repo) return;

    // Debounce save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveContent(), 3000);
  }

  function saveContent() {
    if (isUpdating) {
      // 如果正在同步数据，则延后再执行最新数据的同步，因为 git 更新需要上一个 push 的 SHA
      handleContentChange();
      return;
    }
    if (!repo || !fileContent) return;

    const accessToken = $githubAuth.accessToken || "";
    const github = createGitHubRepoManager(accessToken);

    isUpdating = true;

    github
      .createOrUpdateFile(
        repo.owner.login || $githubAuth.user.login,
        repo.name,
        path,
        "Update notes",
        btoa(fileContent),
        lastSavedSha,
      )
      .then((result: any) => {
        lastSavedSha = result.content.sha;
      })
      .catch((err) => {
        githubAuth.setError(err.message || "保存内容时发生错误");
      })
      .finally(() => {
        isUpdating = false;
      });
  }
</script>

<textarea
  class="w-full h-[calc(100vh-200px)] p-4 border rounded"
  bind:value={fileContent}
  on:input={handleContentChange}
  disabled={isLoading}
></textarea>
