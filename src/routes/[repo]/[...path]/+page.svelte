<script lang="ts">
  import ContentItem from "$lib/components/ContentItem.svelte";
  import CreateFileModal from "$lib/components/CreateFileModal.svelte";
  import FloatButton from "$lib/components/FloatButton.svelte";
  import Home from "$lib/components/Home.svelte";
  import LoadContents from "$lib/components/LoadContents.svelte";
  import LoadRepository from "$lib/components/LoadRepository.svelte";
  import MultiNavigation from "$lib/components/MultiNavigation.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import UploadButton from "$lib/components/UploadButton.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { parseRepositoryDescription } from "$lib/utils/github-utils.js";
  import type { GitRepository } from "$lib/utils/github.js";
  import { parentPath } from "$lib/utils/path.js";

  export let data;

  let loadContentsEl: LoadContents;

  let isNewFile = false;
  $: prevPath = parentPath(`/${data.repo}/${data.path}`);

  let repository: GitRepository;
  $: noteRepository = repository
    ? parseRepositoryDescription(repository)
    : { name: data.repo, description: "" };

  function toggleNewFileModal() {
    isNewFile = !isNewFile;
  }

  function handleReloadContents() {
    loadContentsEl.reload();
  }
</script>

<!-- 默认加载器 -->
<Home class="min-h-screen flex flex-col space-y-8">
  <Toolbar class="h-12 md:h-14">
    <MultiNavigation
      slot="left"
      name={noteRepository.name}
      repo={data.repo}
      path={data.path}
    />
  </Toolbar>
  <LoadRepository
    bind:repository
    token={$githubAuth.accessToken || ""}
    repo={data.repo}
    owner={$githubAuth.user.login}
  >
    <p>{noteRepository.description}</p>
  </LoadRepository>
  <LoadContents
    bind:this={loadContentsEl}
    class="space-y-2 w-full flex-1"
    token={$githubAuth.accessToken || ""}
    bind:repo={data.repo}
    bind:path={data.path}
    owner={$githubAuth.user.login}
    let:contents
  >
    <section class="">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">我的笔记</h2>
        <div class="flex flex-row">
          <UploadButton
            token={$githubAuth.accessToken || ""}
            owner={$githubAuth.user.login}
            repo={data.repo}
            path={data.path}
            class="mx-2 p-1 hover:bg-gray-200 rounded"
            on:finished={handleReloadContents}
            ><span class="ic-upload w-5 h-5"></span>
            <span slot="uploading">Uploading...</span>
          </UploadButton>
          <button
            class="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            on:click={toggleNewFileModal}
          >
            新建笔记
          </button>
        </div>
      </div>

      {#if contents.length == 0}
        <div class="mt-20 flex flex-col items-center justify-between space-y-3">
          <div class="text-7xl text-gray-500">404</div>
          <button
            class="text-sm px-6 py-2 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            on:click={toggleNewFileModal}
          >
            快去写一个笔记吧 🥳
          </button>
        </div>
      {/if}

      <div class="space-y-3">
        {#if data.path}
          <ContentItem repo={data.repo} url={prevPath} isMenuVisible={false} />
        {/if}
        {#each contents as content}
          <ContentItem
            {content}
            repo={data.repo}
            on:deleted={handleReloadContents}
            on:renamed={handleReloadContents}
          />
        {/each}
      </div>
    </section>
  </LoadContents>

  <FloatButton on:click={toggleNewFileModal}>+</FloatButton>
  <CreateFileModal
    bind:isOpen={isNewFile}
    repo={repository}
    path={data.path}
    closeModal={toggleNewFileModal}
  ></CreateFileModal>
</Home>
