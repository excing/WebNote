<script lang="ts">
  import ContentItem from "$lib/components/ContentItem.svelte";
  import CreateFileModal from "$lib/components/CreateFileModal.svelte";
  import DeleteFileModal from "$lib/components/DeleteFileModal.svelte";
  import FloatButton from "$lib/components/FloatButton.svelte";
  import Home from "$lib/components/Home.svelte";
  import LoadContents from "$lib/components/LoadContents.svelte";
  import LoadRepository from "$lib/components/LoadRepository.svelte";
  import MultiNavigation from "$lib/components/MultiNavigation.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";

  export let data;

  let loadContentsEl: LoadContents;

  let isNewFile = false;
  $: prevPath = `/${data.repo}/${data.path.split("/").slice(0, -1).join("/")}`;

  function toggleNewFileModal() {
    isNewFile = !isNewFile;
  }
</script>

<!-- 默认加载器 -->
<Home class="max-w-[860px] h-screen relative mx-auto px-2 space-y-8">
  <Toolbar class="h-14 md:h-16">
    <MultiNavigation slot="left" repo={data.repo} path={data.path} />
  </Toolbar>
  <LoadRepository
    token={$githubAuth.accessToken || ""}
    repo={data.repo}
    owner={$githubAuth.user.login}
    let:repository
  >
    <p>{repository.description}</p>
  </LoadRepository>
  <LoadContents
    bind:this={loadContentsEl}
    class="space-y-2 w-full"
    token={$githubAuth.accessToken || ""}
    bind:repo={data.repo}
    bind:path={data.path}
    owner={$githubAuth.user.login}
    let:contents
  >
    <section class=" space-y-5">
      <div class="flex justify-between">
        <h2 class="text-xl font-semibold">我的笔记</h2>
        <button
          class="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          on:click={toggleNewFileModal}
        >
          新建文件
        </button>
      </div>
      {#if data.path}
        <ContentItem
          type="dir"
          repo={data.repo}
          path={data.path}
          name=".."
          size={0}
          url={prevPath}
          isMenuVisible={false}
        />
      {/if}
      {#each contents as content}
        <ContentItem
          type={content.type}
          repo={data.repo}
          path={content.path}
          name={content.name}
          sha={content.sha}
          size={content.size}
          on:deleted={() => {
            loadContentsEl.reload();
          }}
          on:renamed={() => {
            loadContentsEl.reload();
          }}
        />
      {/each}
    </section>
  </LoadContents>

  <FloatButton onClick={toggleNewFileModal}>+</FloatButton>
  <CreateFileModal
    bind:isOpen={isNewFile}
    repo={data.repo}
    path={data.path}
    closeModal={toggleNewFileModal}
  ></CreateFileModal>
</Home>
