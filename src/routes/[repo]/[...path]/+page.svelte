<script lang="ts">
  import CreateFileModal from "$lib/components/CreateFileModal.svelte";
  import FloatButton from "$lib/components/FloatButton.svelte";
  import Home from "$lib/components/Home.svelte";
  import LoadContents from "$lib/components/LoadContents.svelte";
  import LoadRepository from "$lib/components/LoadRepository.svelte";
  import MultiNavigation from "$lib/components/MultiNavigation.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { filesize } from "$lib/utils/format.js";

  export let data;

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
        <a href={prevPath} class="text-lg flex flex-row items-center">
          <div class="mr-2 h-5 w-5 ic-dir ic-c-primary"></div>
          ..
        </a>
      {/if}
      {#each contents as content}
        {#if content.type === "dir"}
          <a
            href="/{data.repo}/{content.path}"
            class="text-lg flex flex-row items-center"
          >
            <div class="mr-2 h-5 w-5 ic-dir ic-c-primary"></div>
            {content.name}
          </a>
        {:else}
          <a
            href="/{data.repo}/{content.path}/write"
            class="text-lg flex flex-row items-center"
          >
            <div class="mr-2 h-5 w-5 ic-file ic-c-success"></div>
            {content.name}
            <span class="text-sm">({filesize(content.size)})</span>
          </a>
        {/if}
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

<style>
  .ic-c-primary {
    filter: invert(26%) sepia(94%) saturate(3317%) hue-rotate(220deg)
      brightness(99%) contrast(103%);
  }

  .ic-c-success {
    filter: invert(51%) sepia(57%) saturate(372%) hue-rotate(101deg)
      brightness(89%) contrast(95%);
  }

  /* .ic-c-error {
    filter: invert(23%) sepia(90%) saturate(2346%) hue-rotate(3deg)
      brightness(93%) contrast(108%);
  }

  .ic-c-white {
    filter: invert(93%) sepia(100%) saturate(30%) hue-rotate(142deg)
      brightness(107%) contrast(108%);
  } */
</style>
