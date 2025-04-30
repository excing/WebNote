<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import Home from "$lib/components/Home.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import UploadButton from "$lib/components/UploadButton.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { decode64 } from "$lib/utils/encode.js";
  import {
    createGitHubRepoManager,
    type GitContent,
  } from "$lib/utils/github.js";
  import { pathname } from "$lib/utils/path.js";
  import { countWords } from "$lib/utils/string";
  import { onMount } from "svelte";

  export let data;

  let title = pathname(data.path);
  let path = `/${data.repo}/${data.path}`;

  let isLoading = true;
  let error: any;

  let uploader: UploadButton;
  let editer: Editor;
  let isUpdating = false;
  let isReadOnly = true;

  let fileContent = "";
  let lastSavedSha = "";

  let hasUpdate = false;

  let copyButtonText = "";

  $: buttonText = isReadOnly ? "编辑模式" : hasUpdate ? "同步" : "浏览模式";

  $: buttonColor = isReadOnly
    ? "bg-blue-600 hover:bg-blue-700"
    : hasUpdate
      ? "bg-green-600 hover:bg-green-700"
      : "bg-amber-600 hover:bg-amber-700";
  function handleButton() {
    if (isReadOnly) isReadOnly = false;
    else if (hasUpdate) editer.saveContent();
    else isReadOnly = true;
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(fileContent)
      .then(() => {
        copyButtonText = "Copied!";
      })
      .catch(() => {
        copyButtonText = "Failed";
      })
      .finally(() => {
        setTimeout(() => {
          copyButtonText = "";
        }, 2000);
      });
  }

  function handleUploadFiles(e: any) {
    console.log(e.detail);

    uploader.uploadFiles(e.detail);
  }

  function handleUploadFinished(e: any) {
    let files: { content: GitContent }[] = e.detail;

    let filesMD = files
      .map((file) => {
        let downloadURL = new URL(file.content.download_url);
        return `![${file.content.name}](${downloadURL.origin + downloadURL.pathname})`;
      })
      .join("\n");
    fileContent = `${fileContent}\n${filesMD}`;
  }

  function onEditorSyncError(code: number, err: string) {
    alert(`文件同步失败 (${code})\n${err}`);
  }

  onMount(() => {
    isLoading = true;

    const github = createGitHubRepoManager($githubAuth.accessToken || "");
    github
      .getContents($githubAuth.user.login, data.repo, data.path)
      .then((content: any) => {
        if (Array.isArray(content)) {
          // It's a directory, not a file
          fileContent = "It's a directory, not a file";
        } else {
          // It's a file
          fileContent = decode64(content.content);
          lastSavedSha = content.sha;
          isLoading = false;

          githubAuth.addContent(data.repo, content);
        }
      })
      .catch((err: any) => {
        if (err.status && err.status == 404) {
          githubAuth.deleteContent(data.repo, data.path);
        }
        error = err;
      })
      .finally(() => {
        isLoading = false;
      });
  });
</script>

<Home class="flex flex-col space-y-4 px-2 md:px-0">
  <Toolbar
    class="h-12 md:h-14 sticky top-0 bg-white z-10"
    {path}
    isHomeButtonVisible={false}
    isBackButtonVisible={true}
    isUserButtonVisible={false}
  >
    <div slot="left" class="hidden md:block">
      {title}
    </div>
    <div slot="right" class="flex items-center space-x-1">
      <span class="text-sm text-gray-600">{countWords(fileContent)}字</span>
      <span
        class="ic-refresh w-4 h-4 block"
        class:animate-spin={isUpdating}
        class:hidden={!isUpdating}
      ></span>
      <button
        class="p-1 hover:bg-gray-200 rounded flex flex-row items-center"
        aria-label="copy"
        on:click={handleCopy}
      >
        <span class="ic-copy w-5 h-5" class:animate-spin={isUpdating}></span>
        <span>{copyButtonText}</span>
      </button>
      <UploadButton
        bind:this={uploader}
        token={$githubAuth.accessToken || ""}
        owner={$githubAuth.user.login}
        repo={data.repo}
        path="Uploads"
        accept="image/*"
        class="p-1 hover:bg-gray-200 rounded {isReadOnly ? 'hidden' : ''}"
        on:finished={handleUploadFinished}
        ><span class="ic-upload w-5 h-5"></span>
        <span slot="uploading">Uploading...</span>
      </UploadButton>
      <button
        class="text-sm text-white rounded py-1 px-4 {buttonColor} disabled:opacity-50"
        disabled={isUpdating}
        on:click={handleButton}
        >{buttonText}
      </button>
    </div>
  </Toolbar>
  <Loader {isLoading} class=" space-y-4">
    {#if error}
      {#if error.status == 404}
        <div class="text-7xl text-gray-500">404</div>
      {:else}
        <p>网络异常({error.status || "-1"})</p>
        <p>{error.message}</p>
      {/if}
      <a
        href="/"
        class="text-black border-b-1 border-b-black hover:scale-110 active:scale-110 transition-transform"
        >返回首页
      </a>
    {:else}
      <h1 class="text-center text-xl font-bold md:hidden">{title}</h1>
      <Editor
        bind:this={editer}
        bind:isUpdating
        bind:readOnly={isReadOnly}
        bind:hasUpdate
        bind:fileContent
        bind:lastSavedSha
        on:files={handleUploadFiles}
        class="w-full min-h-[100dvh] text-xl rounded disabled:border-none focus:border-none focus:outline-none"
        token={$githubAuth.accessToken || ""}
        repo={data.repo}
        owner={$githubAuth.user.login}
        path={data.path}
        onError={onEditorSyncError}
      ></Editor>
    {/if}
  </Loader>
</Home>
