<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import Login from "$lib/components/Login.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { scrollHideHeader } from "$lib/utils/window";

  function onEditorSyncError(err: string) {}
</script>

{#if $githubAuth.accessToken}
  <div class="flex flex-row overflow-auto">
    <div class="flex-1 flex flex-col">
      <header
        use:scrollHideHeader={100}
        class="fixed top-0 left-0 right-0 bg-white transition-transform duration-300 z-50 px-4"
      >
        <Toolbar></Toolbar>
      </header>
      <Editor
        class="w-full p-4 rounded disabled:border-none pt-20 focus:border-none focus:outline-none"
        repo={$githubAuth.noteRepos[0].name}
        owner={$githubAuth.user.login}
        path="notes.md"
        onError={onEditorSyncError}
      ></Editor>
    </div>
  </div>
{:else}
  <Login />
{/if}
