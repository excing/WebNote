<script lang="ts">
  import { clickOutside } from "$lib/utils/window";

  export let isOpen: boolean = false;
  export let closeModal: () => void;
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-gray-400/10 flex items-center justify-center p-4 z-50"
  >
    <div class="relative bg-white rounded-lg co-border-6 w-full max-w-md">
      <!-- 关闭按钮 -->
      <button
        on:click={closeModal}
        class="absolute -top-9 -right-3 w-8 h-8 flex items-center justify-center text-black cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        aria-label="Close modal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div class={$$props.class} use:clickOutside={closeModal}>
        <slot />
      </div>
    </div>
  </div>
{/if}
