<script lang="ts">
  import { githubAuth } from "$lib/stores/githubAuth";
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { onMount } from "svelte";

  export let owner = "";
  export let repo = "";
  export let path = "";

  export let onError: (err: string) => void;

  let fileContent = "";
  let lastSavedSha: string | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  let isLoading = true;
  let isUpdating = false;

  let textarea: HTMLTextAreaElement;

  onMount(() => {
    isLoading = true;

    const accessToken = $githubAuth.accessToken || "";
    const github = createGitHubRepoManager(accessToken);
    github
      .getContents(owner, repo, path)
      .then((content: any) => {
        if (Array.isArray(content)) {
          // It's a directory, not a file
          fileContent = "It's a directory, not a file";
        } else {
          // It's a file
          fileContent = atob(content.content);
          lastSavedSha = content.sha;
          isLoading = false;

          setTimeout(() => {
            adjustHeight();
          }, 150);
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

  function adjustHeight() {
    if (textarea) {
      textarea.style.height = "auto"; // 先重置高度
      const height =
        textarea.scrollHeight < window.innerHeight
          ? window.innerHeight
          : textarea.scrollHeight;
      textarea.style.height = `${height}px`; // 然后设置为内容的高度
      console.log(
        textarea.scrollHeight,
        window.innerHeight,
        window.outerHeight,
        document.body.clientHeight,
      );
    }
  }

  function handleContentChange() {
    adjustHeight();

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
        owner,
        repo,
        path,
        "Update notes",
        btoa(fileContent),
        lastSavedSha,
      )
      .then((result: any) => {
        lastSavedSha = result.content.sha;
      })
      .catch((err) => {
        onError(err.message || "保存内容时发生错误");
      })
      .finally(() => {
        isUpdating = false;
      });
  }
</script>

<textarea
  bind:this={textarea}
  class={$$props.class}
  style="overflow-y: hidden;"
  bind:value={fileContent}
  on:input={handleContentChange}
  disabled={isLoading}
></textarea>
