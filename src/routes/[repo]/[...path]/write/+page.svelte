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

  function onEditorSyncError(err: string) {}
</script>

<Home class="max-w-[860px] mx-auto px-2">
  <div class="flex flex-row overflow-auto">
    <div class="flex-1 flex flex-col">
      <header
        use:scrollHideHeader={100}
        class="fixed top-0 left-0 right-0 bg-white transition-transform duration-300 z-50"
      >
        <Toolbar
          {title}
          {path}
          isHomeButtonVisible={false}
          isBackButtonVisible={true}
          isUserButtonVisible={false}
        >
          <div slot="left">
            <span
              class="ic-refresh w-5 h-5 block"
              class:animate-spin={isUpdating}
            ></span>
          </div>
          <div slot="right">
            <button
              class="text-sm text-white rounded py-1 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              disabled={isUpdating}
              on:click={() => {
                editer.saveContent();
              }}>保存</button
            >
          </div>
        </Toolbar>
      </header>
      <Editor
        bind:this={editer}
        bind:isUpdating
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
