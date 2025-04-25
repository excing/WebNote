<script lang="ts">
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { keyboardShortcut } from "$lib/utils/window";
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import { decode64, encode64 } from "$lib/utils/encode";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { autoFocus } from "$lib/utils/actions/autoFocus";

  export let token = "";
  export let owner = "";
  export let repo = "";
  export let path = "";
  export let readOnly = true;
  export let hasUpdate = false;
  $: hasUpdate = updatingContent.trim() !== fileContent.trim();

  export let onError: (err: string) => void;

  export let fileContent = "";

  let lastSavedSha: string | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  let isLoading = true;
  export let isUpdating = false;
  let updatingContent = "";

  let textspan: HTMLElement;

  // SvelteKit 导航守卫
  // beforeNavigate((navigation) => {
  //   if (!confirm("未保存的更改将丢失，确定要离开吗？")) {
  //     navigation.cancel();
  //   }
  // });

  function adjustHeight() {
    if (textspan) {
      textspan.innerText = fileContent + " ";
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
    if (!hasUpdate) {
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

  function exitEditMode() {
    readOnly = true;
  }

  function enterWriteMode() {
    readOnly = false;
  }

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

          githubAuth.addContent(repo, content);

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
</script>

<Loader {isLoading}></Loader>
<div class={$$props.class}>
  <span bind:this={textspan} class={$$props.class}></span>
  <textarea
    class={$$props.class}
    style="overflow-y: hidden;"
    bind:value={fileContent}
    on:input={handleContentChange}
    disabled={isLoading || readOnly}
    use:autoFocus={!readOnly}
    use:keyboardShortcut={[
      {
        key: "s",
        meta: true,
        stop: true,
        handle: saveContent,
      },
      {
        key: "s",
        ctrl: true,
        stop: true,
        handle: saveContent,
      },
      {
        key: "Escape",
        handle: exitEditMode,
      },
      {
        key: "i",
        handle: enterWriteMode,
      },
    ]}
  ></textarea>
</div>

<style>
  div {
    position: relative;
    z-index: 5;
  }
  span {
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;
    width: 100%;
    height: 100%;
    resize: none;
    outline: none;
    border: none;
    overflow: hidden;
    visibility: hidden; /* 一定不要少了给它隐藏哦，留个站位 */
  }
  textarea {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    resize: none;
    outline: none;
    border: none;
    overflow: hidden;
    z-index: 4;
  }
</style>
