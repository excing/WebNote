<script lang="ts">
  import { onMount } from "svelte";
  import { createGitHubRepoManager } from "$lib/utils/github";
  import RepositoryCard from "$lib/components/RepositoryCard.svelte";
  import CreateRepoModal from "$lib/components/CreateRepoModal.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { goto } from "$app/navigation";

  let user: any = null;
  let repos: any[] = [];
  let showCreateModal = false;

  onMount(async () => {
    githubAuth.setLoading(true);

    try {
      const isAuth = await githubAuth.isAuthenticated();
      if (!isAuth) return;

      const accessToken = $githubAuth.accessToken || "";
      const github = createGitHubRepoManager(accessToken);

      user = await github.getCurrentUser();
      repos = await github.listRepositories({ type: "all" });
    } catch (err) {
      githubAuth.setError(err.message || "加载数据时发生错误");
    } finally {
      githubAuth.setLoading(false);
    }
  });

  function logout() {
    githubAuth.clearAccessToken();
  }
</script>

<div class="max-w-[1200px] mx-auto p-4">
  <header
    class="flex justify-between items-center py-4 border-b border-gray-200 mb-8"
  >
    <h1 class="text-2xl font-bold flex items-center space-x-2">
      <img
        class="w-6 h-6"
        src="/favicon.png"
        alt="Web Note Icon"
        title="Web Note Icon"
      />
      <span class="hidden md:inline">我的笔记</span>
    </h1>
    {#if user}
      <div class="flex items-center gap-4">
        <button
          on:click={() => (showCreateModal = true)}
          class="p-2 md:px-4 md:py-2 bg-green-600 text-white rounded-full md:rounded hover:bg-green-700"
          title="新建仓库"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 md:hidden"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="hidden md:inline">新建仓库</span>
        </button>
        <div class="flex items-center gap-2">
          <img
            src={user.avatar_url}
            alt={user.login}
            class="w-10 h-10 rounded-full"
          />
          <span>{user.name || user.login}</span>
          <button
            on:click={logout}
            class="bg-gray-100 border-none rounded px-3 py-1 cursor-pointer ml-4 hover:bg-gray-200 transition-colors"
          >
            登出
          </button>
        </div>
      </div>
    {:else}
      <button
        on:click={() => goto("/login")}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        登录
      </button>
    {/if}
  </header>

  <main>
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
      <!-- Create Repository Modal -->
      <CreateRepoModal
        isOpen={showCreateModal}
        closeModal={() => (showCreateModal = false)}
      />

      <!-- Rest of your dashboard content remains the same -->
      {#if $githubAuth.noteRepos.length > 0}
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">
            我的笔记仓库 ({$githubAuth.noteRepos.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each $githubAuth.noteRepos as repo}
              <RepositoryCard {repo} />
            {/each}
          </div>
        </section>
      {/if}

      <section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">所有仓库 ({repos.length})</h2>
        </div>
        {#if repos.length === 0}
          <p class="text-center p-8 text-gray-500">没有找到仓库</p>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each repos as repo}
              <RepositoryCard {repo} />
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  </main>
</div>
