<script lang="ts">
  import CreateRepoModal from "./CreateRepoModal.svelte";

  export let responsive = true;
  export let text = "新建仓库";

  let showCreateModal = false;
</script>

<button
  on:click={() => (showCreateModal = true)}
  class="{$$props.class} flex items-center"
  title={text}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5 {responsive ? 'md:hidden' : ''}"
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
  <span class={responsive ? "hidden md:inline" : "ml-1"}>{text}</span>
</button>

<CreateRepoModal
  isOpen={showCreateModal}
  closeModal={() => (showCreateModal = false)}
/>
