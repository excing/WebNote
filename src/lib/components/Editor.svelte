<script lang="ts">
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { keyboardShortcut } from "$lib/utils/window";
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import { decode64, encode64 } from "$lib/utils/encode";

  export let token = "";
  export let owner = "";
  export let repo = "";
  export let path = "";

  export let onError: (err: string) => void;

  let fileContent = "";
  let lastSavedSha: string | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  let isLoading = true;
  export let isUpdating = false;
  let updatingContent = "";

  let textarea: HTMLTextAreaElement;

  // SvelteKit 导航守卫
  // beforeNavigate((navigation) => {
  //   if (!confirm("未保存的更改将丢失，确定要离开吗？")) {
  //     navigation.cancel();
  //   }
  // });

  onMount(() => {
    isLoading = true;

    const github = createGitHubRepoManager(token);
    github
      .getContents(owner, repo, path)
      .then((content: any) => {
        if (Array.isArray(content)) {
          // It's a directory, not a file
          fileContent = "It's a directory, not a file";
        } else {
          // It's a file
          fileContent = decode64(content.content);
          lastSavedSha = content.sha;
          updatingContent = fileContent;
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
    }
  }

  function handleContentChange() {
    adjustHeight();

    if (!repo) return;

    // Debounce save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveContent(), 3000);
  }

  export function saveContent() {
    if (isLoading) {
      return;
    }
    if (updatingContent.trim() === fileContent.trim()) {
      return;
    }
    if (isUpdating) {
      // 如果正在同步数据，则延后再执行最新数据的同步，因为 git 更新需要上一个 push 的 SHA
      handleContentChange();
      return;
    }
    if (!repo || !fileContent) return;

    const accessToken = token || "";
    const github = createGitHubRepoManager(accessToken);
    const content = fileContent;

    isUpdating = true;

    github
      .createOrUpdateFile(
        owner,
        repo,
        path,
        "Update notes",
        encode64(content),
        lastSavedSha,
      )
      .then((result: any) => {
        lastSavedSha = result.content.sha;
        updatingContent = content;
      })
      .catch((err) => {
        onError(err.message || "保存内容时发生错误");
      })
      .finally(() => {
        isUpdating = false;
      });
  }
</script>

<Loader {isLoading} class={$$props.class}>
  <textarea
    bind:this={textarea}
    class={$$props.class}
    style="overflow-y: hidden;"
    bind:value={fileContent}
    on:input={handleContentChange}
    disabled={isLoading}
    use:keyboardShortcut={{
      key: "s",
      meta: true,
      ctrl: true,
      handle: saveContent,
    }}
  ></textarea>
</Loader>
