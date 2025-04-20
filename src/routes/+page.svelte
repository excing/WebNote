<script lang="ts">
  import { onMount } from "svelte";
  import { createGitHubRepoManager } from "$lib/utils/github";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { goto } from "$app/navigation";
  import RepositoryCard from "$lib/components/RepositoryCard.svelte";

  let user: any = null;
  let selectedRepo: any = null;
  let fileContent = "";
  let fileName = "notes.md";
  let isLoading = false;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let lastSavedSha: string | null = null;

  onMount(async () => {
    githubAuth.setLoading(true);

    try {
      const isAuth = await githubAuth.isAuthenticated();
      if (!isAuth) {
        goto("/login");
        return;
      }

      const accessToken = $githubAuth.accessToken || "";
      const github = createGitHubRepoManager(accessToken);

      user = await github.getCurrentUser();

      // If user has note repos, try to load the first one
      if ($githubAuth.noteRepos.length > 0) {
        await loadRepositoryContent($githubAuth.noteRepos[0]);
      }
    } catch (err) {
      githubAuth.setError(err.message || "加载数据时发生错误");
    } finally {
      githubAuth.setLoading(false);
    }
  });

  async function loadRepositoryContent(repo: any) {
    try {
      isLoading = true;
      selectedRepo = repo;
      const accessToken = $githubAuth.accessToken || "";
      const github = createGitHubRepoManager(accessToken);

      // Try to get the file content
      try {
        const content = await github.getContents(
          repo.owner.login || user.login,
          repo.name,
          fileName,
        );

        if (Array.isArray(content)) {
          // It's a directory, not a file
          await createNewFile(repo);
        } else {
          // It's a file
          fileContent = atob(content.content);
          lastSavedSha = content.sha;
        }
      } catch (error) {
        // File doesn't exist, create it
        if (error.message.includes("404")) {
          await createNewFile(repo);
        } else {
          throw error;
        }
      }
    } catch (err) {
      githubAuth.setError(err.message || "加载仓库内容时发生错误");
    } finally {
      isLoading = false;
    }
  }

  async function createNewFile(repo: any) {
    const accessToken = $githubAuth.accessToken || "";
    const github = createGitHubRepoManager(accessToken);

    const initialContent = `# ${repo.name}\n\n开始你的笔记...`;
    const encodedContent = btoa(unescape(encodeURIComponent(initialContent)));
    console.log(encodedContent);
    
    const result = await github.createOrUpdateFile(
      repo.owner.login || user.login,
      repo.name,
      fileName,
      "Initial commit: Create notes file",
      encodedContent,
    );

    fileContent = initialContent;
    lastSavedSha = result.content.sha;
  }

  function handleContentChange(e: Event) {
    if (!selectedRepo) return;

    const target = e.target as HTMLTextAreaElement;
    fileContent = target.value;

    // Debounce save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveContent(), 2000);
  }

  async function saveContent() {
    if (!selectedRepo || !fileContent) return;

    try {
      isLoading = true;
      const accessToken = $githubAuth.accessToken || "";
      const github = createGitHubRepoManager(accessToken);

      const result = await github.createOrUpdateFile(
        selectedRepo.owner.login || user.login,
        selectedRepo.name,
        fileName,
        "Update notes",
        btoa(fileContent),
        lastSavedSha,
      );

      lastSavedSha = result.content.sha;
    } catch (err) {
      githubAuth.setError(err.message || "保存内容时发生错误");
    } finally {
      isLoading = false;
    }
  }

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
    {#if $githubAuth.isLoading || isLoading}
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
    {:else if !selectedRepo}
      <div class="text-center p-8">
        <h2 class="text-xl font-bold mb-4">选择一个笔记仓库</h2>
        {#if $githubAuth.noteRepos.length > 0}
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
          >
            {#each $githubAuth.noteRepos as repo}
              <RepositoryCard
                {repo}
                on:click={() => loadRepositoryContent(repo)}
              />
            {/each}
          </div>
        {:else}
          <p class="mb-4">您还没有添加任何笔记仓库</p>
          <button
            on:click={() => goto("/dashboard")}
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            去仪表盘添加仓库
          </button>
        {/if}
      </div>
    {:else}
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold">
          正在编辑: {selectedRepo.name}
          {#if selectedRepo.private}
            <span class="bg-blue-50 text-base text-blue-700 px-2 py-1 rounded">
              私有
            </span>
          {/if}
        </h2>
        <div class="text-sm text-gray-500">
          {#if isLoading}保存中...{:else}已保存{/if}
        </div>
      </div>

      <textarea
        class="w-full h-[calc(100vh-200px)] p-4 border rounded"
        bind:value={fileContent}
        on:input={handleContentChange}
        disabled={isLoading}
      ></textarea>
    {/if}
  </main>
</div>
