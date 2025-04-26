<script lang="ts">
  import { processMultiLevelPath } from "$lib/utils/path";

  export let name = "";
  export let repo = "";
  export let path = "";

  $: routers = processMultiLevelPath(repo, path, name);
</script>

<div class="flex flex-wrap gap-1">
  {#each routers as router}
    {#if !router.isLast}
      <a href={router.url}>{router.name}</a>
      <span>/</span>
    {:else}
      {router.name}
    {/if}
  {/each}
</div>
