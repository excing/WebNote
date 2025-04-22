<script lang="ts">
  import CreateRepoModal from "./CreateRepoModal.svelte";

  let showCreateModal = false;
  let text = "新建仓库";
</script>

<button
  on:click={() => (showCreateModal = true)}
  class={$$props.class}
  title={text}
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
  <span class="hidden md:inline">{text}</span>
</button>

<CreateRepoModal
  isOpen={showCreateModal}
  closeModal={() => (showCreateModal = false)}
/>
