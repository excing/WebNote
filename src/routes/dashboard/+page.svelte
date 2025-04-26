<script lang="ts">
  import RepositoryCard from "$lib/components/RepositoryCard.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { goto } from "$app/navigation";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import CreateRepoButton from "$lib/components/CreateRepoButton.svelte";
  import LoadRepositories from "$lib/components/LoadRepositories.svelte";

  let loadRepositories: LoadRepositories;
</script>

<div class="space-y-10">
  <Toolbar class="h-12 md:h-14" title="仪表盘"></Toolbar>

  <main>
    <!-- Rest of your dashboard content remains the same -->
    <section class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">
          我的笔记仓库 ({$githubAuth.noteRepos.length})
        </h2>
        <CreateRepoButton
          class="p-2 text-sm md:px-4 md:py-2 bg-green-600 text-white rounded-full md:rounded hover:bg-green-700"
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $githubAuth.noteRepos as repo}
          <div class="flex flex-col">
            <RepositoryCard repository={repo} isManagerVisible={true} />
          </div>
        {/each}
      </div>
    </section>

    {#if $githubAuth.isLoading}
      <div class="flex flex-col items-center justify-center h-[300px]">
        <div
          class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
        ></div>
        <p class="mt-2">加载中...</p>
      </div>
    {:else if $githubAuth.error}
      <div class="text-center p-8 text-red-600">
        <h2 class="text-xl font-bold mb-2">出错了</h2>
        <p class="mb-4">{$githubAuth.error}</p>
        <button
          on:click={() => goto("/login")}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          返回登录
        </button>
      </div>
    {:else}
      <section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">所有仓库</h2>
        </div>
        <LoadRepositories
          bind:this={loadRepositories}
          token={$githubAuth.accessToken || ""}
          let:repositories
        >
          {#if repositories.length === 0}
            <p class="text-center p-8 text-gray-500">没有找到仓库</p>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each repositories as repo}
                <RepositoryCard
                  repository={repo}
                  isManagerVisible={true}
                  on:deleted={() => loadRepositories.reload()}
                />
              {/each}
            </div>
          {/if}
        </LoadRepositories>
      </section>
    {/if}
  </main>
</div>
