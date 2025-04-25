<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import Home from "$lib/components/Home.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { pathname } from "$lib/utils/path.js";
  import { countWords } from "$lib/utils/string";

  export let data;

  let title = pathname(data.path);
  let path = `/${data.repo}/${data.path}`;

  let editer: Editor;
  let isUpdating = false;
  let isReadOnly = true;

  let fileContent = "";

  let hasUpdate = false;

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

  function onEditorSyncError(err: string) {}
</script>

<Home class="flex flex-col min-h-screen">
  <Toolbar
    class="h-12 md:h-14 sticky top-0 bg-white"
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
        class="text-sm text-white rounded py-1 px-4 {buttonColor} disabled:opacity-50"
        disabled={isUpdating}
        on:click={handleButton}
        >{buttonText}
      </button>
    </div>
  </Toolbar>
  <h1 class="text-center py-4 text-xl font-bold md:hidden">{title}</h1>
  <Editor
    bind:this={editer}
    bind:isUpdating
    bind:readOnly={isReadOnly}
    bind:hasUpdate
    bind:fileContent
    class="w-full text-xl px-2 py-4 rounded disabled:border-none focus:border-none focus:outline-none"
    token={$githubAuth.accessToken || ""}
    repo={data.repo}
    owner={$githubAuth.user.login}
    path={Array.isArray(data.path) ? data.path.join("/") : data.path}
    onError={onEditorSyncError}
  ></Editor>
  <div
    class="sticky bottom-0 bg-gray-200 text-sm px-1 md:hidden"
    class:hidden={isReadOnly}
  >
    <span>,</span>
  </div>
</Home>
