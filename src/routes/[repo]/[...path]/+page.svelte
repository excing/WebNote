<script lang="ts">
  import Home from "$lib/components/Home.svelte";
  import LoadContents from "$lib/components/LoadContents.svelte";
  import LoadRepository from "$lib/components/LoadRepository.svelte";
  import RepositoryCard from "$lib/components/RepositoryCard.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";

  export let data;
</script>

<!-- 默认加载器 -->
<Home>
  <Toolbar></Toolbar>
  <LoadRepository
    token={$githubAuth.accessToken || ""}
    repo={data.repo}
    owner={$githubAuth.user.login}
    let:repository
  >
    <RepositoryCard {repository} />
  </LoadRepository>
  <LoadContents
    token={$githubAuth.accessToken || ""}
    repo={data.repo}
    owner={$githubAuth.user.login}
    let:contents
  >
    <div>
      {#each contents as content}
        <div>{content.name}</div>
      {/each}
    </div>
  </LoadContents>
</Home>
