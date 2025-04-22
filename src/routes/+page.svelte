<script lang="ts">
  import CreateRepoButton from "$lib/components/CreateRepoButton.svelte";
  import Home from "$lib/components/Home.svelte";
  import RepositoryCard from "$lib/components/RepositoryCard.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
</script>

<Home class="max-w-[860px] mx-auto px-2 pt-8 space-y-10">
  <Toolbar></Toolbar>
  <section class=" space-y-5">
    <div class="flex justify-between">
      <h2 class="text-xl font-semibold">最近笔记</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
  </section>
  <section class=" space-y-5">
    <div class="flex justify-between">
      <h2 class="text-xl font-semibold">
        我的笔记仓库 ({$githubAuth.noteRepos.length})
      </h2>
      <CreateRepoButton
        class="p-2 text-sm md:px-4 md:py-2 bg-green-600 text-white rounded-full md:rounded hover:bg-green-700"
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each $githubAuth.noteRepos as repository}
        <RepositoryCard {repository} />
      {/each}
    </div>
  </section>
</Home>
