<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import Home from "$lib/components/Home.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { scrollHideHeader } from "$lib/utils/window";

  export let data;

  function onEditorSyncError(err: string) {}
</script>

<Home>
  <div class="flex flex-row overflow-auto">
    <div class="flex-1 flex flex-col">
      <header
        use:scrollHideHeader={100}
        class="fixed top-0 left-0 right-0 bg-white transition-transform duration-300 z-50 px-4"
      >
        <Toolbar></Toolbar>
      </header>
      <Editor
        class="w-full text-xl p-4 rounded disabled:border-none pt-20 focus:border-none focus:outline-none"
        token={$githubAuth.accessToken || ""}
        repo={data.repo}
        owner={$githubAuth.user.login}
        path={Array.isArray(data.path) ? data.path.join("/") : data.path}
        onError={onEditorSyncError}
      ></Editor>
    </div>
  </div>
</Home>
