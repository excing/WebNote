<script lang="ts">
  import ContentItem from "$lib/components/ContentItem.svelte";
  import CreateFileModal from "$lib/components/CreateFileModal.svelte";
  import CreateRepoButton from "$lib/components/CreateRepoButton.svelte";
  import CreateRepoModal from "$lib/components/CreateRepoModal.svelte";
  import Dropdown from "$lib/components/Dropdown.svelte";
  import Home from "$lib/components/Home.svelte";
  import RepositoryCard from "$lib/components/RepositoryCard.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";

  let showAllHistoryNotes = false;
  let showNewFileModal = false;
  let showNewRepositoryModal = false;

  function toggleNewFileModal() {
    showNewFileModal = !showNewFileModal;
  }

  function toggleNewRepositoryModal() {
    showNewRepositoryModal = !showNewRepositoryModal;
  }
</script>

<Home class="space-y-10 flex flex-col min-h-screen">
  <Toolbar title="我的笔记" class="h-12 md:h-14"></Toolbar>
  {#if $githubAuth.historyNotes.length != 0}
    <section class=" space-y-5">
      <div class="flex justify-between">
        <h2 class="text-xl font-semibold">
          最近笔记<button
            class="text-sm text-gray-400 ml-2"
            on:click={() => {
              showAllHistoryNotes = !showAllHistoryNotes;
            }}>{showAllHistoryNotes ? "全部收起" : "显示全部"}</button
          >
        </h2>
      </div>
      <div class=" space-y-3">
        {#each $githubAuth.historyNotes as note, i}
          {#if showAllHistoryNotes || i < 3}
            <ContentItem
              isMenuVisible={false}
              type={note.content.type}
              repo={note.repo}
              path={note.content.path}
              name={note.content.name}
              sha={note.content.sha}
              size={note.content.size}
            />
          {/if}
        {/each}
      </div>
    </section>
  {/if}

  {#if $githubAuth.noteRepos.length == 0}
    <div class="flex-1 text-center p-8">
      <h2 class="text-xl font-bold mb-4">选择一个笔记仓库</h2>
      <p class="mb-4">您还没有添加任何笔记仓库</p>
      <div class="flex justify-center">
        <CreateRepoButton
          responsive={false}
          class="m-2 px-12 py-8 text-center bg-green-600 text-white rounded hover:bg-green-700"
        />
      </div>
      <a
        href="/dashboard"
        class="m-2 text-sm text-gray-400 hover:text-gray-800"
      >
        去仪表盘添加仓库
      </a>
    </div>
  {:else}
    <section class="flex-1">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">
          我的笔记仓库 ({$githubAuth.noteRepos.length})
        </h2>
        <Dropdown>
          <span
            slot="icon"
            class="px-4 text-2xl text-white bg-green-600 rounded-full transition-transform duration-300 hover:bg-green-700 hover:scale-110"
            >+</span
          >
          <div class="flex flex-col w-48">
            <button
              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              tabindex="-1"
              data-close-dropdown
              on:click|preventDefault={toggleNewFileModal}
            >
              新笔记
            </button>
            <button
              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              tabindex="-1"
              data-close-dropdown
              on:click|preventDefault={toggleNewRepositoryModal}
            >
              新建笔记仓库
            </button>
            <a
              href="/dashboard"
              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              tabindex="-1"
              data-close-dropdown
            >
              去仪表盘添加仓库
            </a>
          </div>
        </Dropdown>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $githubAuth.noteRepos as repository}
          <RepositoryCard {repository} />
        {/each}
      </div>
    </section>
    <CreateFileModal
      bind:isOpen={showNewFileModal}
      repo={$githubAuth.defaultRepo}
      closeModal={toggleNewFileModal}
    />
    <CreateRepoModal
      isOpen={showNewRepositoryModal}
      closeModal={toggleNewRepositoryModal}
    />
  {/if}
  <div slot="unlogin" class="text-sm text-gray-600 py-4">
    <a href="/~">Tools</a>
  </div>
</Home>
