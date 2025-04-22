<script lang="ts">
  import { fade } from "svelte/transition";
  import { clickOutside } from "$lib/utils/window";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let isOpen: boolean = false;
  export let img = "";
  export let size = 5;
  export let icon = "ic-menu";
  export let alt = "";
  export let title = "Open user menu";

  // 切换下拉菜单
  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  // 关闭下拉菜单
  const openDropdown = () => {
    isOpen = true;
    dispatch("opened");
  };

  // 关闭下拉菜单
  const closeDropdown = () => {
    isOpen = false;
    dispatch("closed");
  };
</script>

<div class="relative inline-block text-left">
  <!-- 用户头像按钮 -->
  <button
    type="button"
    class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    id="user-menu-button"
    aria-expanded={isOpen}
    aria-haspopup="true"
    on:click|preventDefault={toggleDropdown}
  >
    {#if alt}
      <span class="sr-only">{title}</span>
    {/if}
    {#if img}
      <img class="h-{size} w-{size} rounded-full bg-gray-200" src={img} {alt} />
    {:else}
      <span class="{icon} w-{size} h-{size} m-1"></span>
    {/if}
  </button>

  <!-- 下拉菜单 -->
  {#if isOpen}
    <div
      transition:fade={{ duration: 150 }}
      class="origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border-black co-border-3 focus:outline-none z-50"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
      tabindex="-1"
      use:clickOutside={closeDropdown}
    >
      <div class={$$props.class} role="none">
        <slot />
      </div>
    </div>
  {/if}
</div>
