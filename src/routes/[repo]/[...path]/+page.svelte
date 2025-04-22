<script lang="ts">
  import Home from "$lib/components/Home.svelte";
  import LoadContents from "$lib/components/LoadContents.svelte";
  import LoadRepository from "$lib/components/LoadRepository.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";

  export let data;
</script>

<!-- 默认加载器 -->
<Home class="max-w-[860px] mx-auto px-2 pt-8 space-y-10">
  <Toolbar title={data.repo}></Toolbar>
  <LoadRepository
    class="bg-gray-200 p-4"
    token={$githubAuth.accessToken || ""}
    repo={data.repo}
    owner={$githubAuth.user.login}
    let:repository
  >
    <h2 class="text-xl">{repository.name}</h2>
    <p>{repository.description}</p>
  </LoadRepository>
  <LoadContents
    class="space-y-2 w-full"
    token={$githubAuth.accessToken || ""}
    repo={data.repo}
    owner={$githubAuth.user.login}
    let:contents
  >
    {#each contents as content}
      <div class="flex flex-row items-center">
        {#if content.type === "dir"}
          <div class="mr-2 h-5 w-5 ic-dir ic-c-primary"></div>
          <a href="/{data.repo}/{content.path}" class="text-lg"
            >{content.name}
          </a>
        {:else}
          <div class="mr-2 h-5 w-5 ic-file ic-c-success"></div>
          <a href="/{data.repo}/{content.path}/write" class="text-lg"
            >{content.name}
          </a>
        {/if}
      </div>
    {/each}
  </LoadContents>
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

  .ic-c-error {
    filter: invert(23%) sepia(90%) saturate(2346%) hue-rotate(3deg)
      brightness(93%) contrast(108%);
  }

  .ic-c-white {
    filter: invert(93%) sepia(100%) saturate(30%) hue-rotate(142deg)
      brightness(107%) contrast(108%);
  }
</style>
