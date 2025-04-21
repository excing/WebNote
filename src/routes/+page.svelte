<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import RepositoryList from "$lib/components/RepositoryList.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";

  function onEditorSyncError(err: string) {}
</script>

<div class="flex flex-row">
  <Sidebar>
    <RepositoryList />
  </Sidebar>
  <div class="flex-1 h-screen flex flex-col">
    <div class="md:hidden">
      <Toolbar></Toolbar>
    </div>
    <Editor
      class="w-full flex-1 p-4 border rounded disabled:border-none"
      onError={onEditorSyncError}
    ></Editor>
  </div>
</div>
