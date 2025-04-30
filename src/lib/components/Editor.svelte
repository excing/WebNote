<script lang="ts">
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { keyboardShortcut } from "$lib/utils/window";
  import { onMount } from "svelte";
  import { autoFocus } from "$lib/utils/actions/autoFocus";
  import { encode64 } from "$lib/utils/encode";
  import AutoHeightTextarea from "./AutoHeightTextarea.svelte";

  export let token = "";
  export let owner = "";
  export let repo = "";
  export let path = "";
  export let readOnly = true;
  export let hasUpdate = false;
  $: hasUpdate = updatingContent.trim() !== fileContent.trim();

  export let onError: (code: number, err: string) => void;

  export let fileContent = "";
  export let lastSavedSha: string | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  export let isUpdating = false;
  let updatingContent = fileContent;

  function handleContentChange() {
    // adjustHeight();

    if (!repo) return;

    // Debounce save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveContent(), 3000);
  }

  export function saveContent() {
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
      .catch((err: any) => {
        if (err.state) {
          onError(err.state, err.message || "保存内容时发生错误");
        } else {
          onError(0, err.message || "保存内容时发生错误");
        }
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

  onMount(() => {});
</script>

<AutoHeightTextarea
  class={$$props.class}
  bind:value={fileContent}
  on:input={handleContentChange}
  on:files
  disabled={readOnly}
  autofocus={!readOnly}
  shortcuts={[
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
></AutoHeightTextarea>
