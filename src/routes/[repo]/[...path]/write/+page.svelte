<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import Home from "$lib/components/Home.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { pathname } from "$lib/utils/path.js";
  import { scrollHideHeader } from "$lib/utils/window";

  export let data;

  let title = pathname(data.path);
  let path = `/${data.repo}/${data.path}`;

  let editer: Editor;
  let isUpdating = false;
  let isReadOnly = true;

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

<Home class="">
  <div class="flex flex-row overflow-auto">
    <div class="flex-1 flex flex-col">
      <header
        class="pr-3 fixed top-0 left-0 right-0 bg-white transition-transform duration-300 z-50"
      >
        <Toolbar
          class="h-12 md:h-14"
          {title}
          {path}
          isHomeButtonVisible={false}
          isBackButtonVisible={true}
          isUserButtonVisible={false}
        >
          <div slot="left">
            <span
              class="ic-refresh w-4 h-4 block"
              class:animate-spin={isUpdating}
            ></span>
          </div>
          <div slot="right">
            <button
              class="text-sm text-white rounded py-1 px-4 {buttonColor} disabled:opacity-50"
              disabled={isUpdating}
              on:click={handleButton}
              >{buttonText}
            </button>
          </div>
        </Toolbar>
      </header>
      <Editor
        bind:this={editer}
        bind:isUpdating
        bind:readOnly={isReadOnly}
        bind:hasUpdate
        class="w-full text-xl px-2 py-4 rounded disabled:border-none pt-15 focus:border-none focus:outline-none"
        token={$githubAuth.accessToken || ""}
        repo={data.repo}
        owner={$githubAuth.user.login}
        path={Array.isArray(data.path) ? data.path.join("/") : data.path}
        onError={onEditorSyncError}
      ></Editor>
    </div>
  </div>
</Home>
