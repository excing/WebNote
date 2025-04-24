<script lang="ts">
  import { goto } from "$app/navigation";
  import CreateRepoButton from "$lib/components/CreateRepoButton.svelte";
  import Home from "$lib/components/Home.svelte";
  import RepositoryCard from "$lib/components/RepositoryCard.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
</script>

<Home class="max-w-[860px] mx-auto px-2 space-y-10">
  <Toolbar title="我的笔记" class="h-14 md:h-16"></Toolbar>
  {#if false}
    <section class=" space-y-5">
      <div class="flex justify-between">
        <h2 class="text-xl font-semibold">最近笔记</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </section>
  {/if}

  {#if $githubAuth.noteRepos.length == 0}
    <div class="text-center p-8">
      <h2 class="text-xl font-bold mb-4">选择一个笔记仓库</h2>
      <p class="mb-4">您还没有添加任何笔记仓库</p>
      <div class="flex flex-wrap items-end justify-center">
        <CreateRepoButton
          responsive={false}
          class="m-2 px-12 py-1 bg-green-600 text-white rounded-full md:rounded hover:bg-green-700"
        />
        <a
          href="/dashboard"
          class="m-2 text-sm text-gray-400 hover:text-gray-800"
        >
          去仪表盘添加仓库
        </a>
      </div>
    </div>
  {:else}
    <section class="">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">
          我的笔记仓库 ({$githubAuth.noteRepos.length})
        </h2>
        <a
          href="/dashboard"
          class="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          添加仓库
        </a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $githubAuth.noteRepos as repository}
          <RepositoryCard {repository} />
        {/each}
      </div>
    </section>
  {/if}
</Home>
