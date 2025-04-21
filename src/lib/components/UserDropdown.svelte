<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
    import { clickOutside } from "$lib/utils/window";

  export let userImage: string;
  export let userName: string = "User";
  export let userEmail: string = "user@example.com";

  let isOpen: boolean = false;
  const dispatch = createEventDispatcher();

  // 下拉菜单项
  const menuItems = [
    { id: "profile", label: "Your Profile", icon: "user-circle" },
    { id: "settings", label: "Settings", icon: "cog" },
    { id: "dashboard", label: "Dashboard", icon: "book-open" },
    { id: "signout", label: "Sign out", icon: "logout" },
  ];

  // 切换下拉菜单
  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  // 关闭下拉菜单
  const closeDropdown = () => {
    isOpen = false;
  };

  // 处理菜单项点击
  const handleItemClick = (itemId: string) => {
    closeDropdown();
    dispatch("select", { item: itemId });
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
    on:click={toggleDropdown}
  >
    <span class="sr-only">Open user menu</span>
    <img class="h-8 w-8 rounded-full" src={userImage} alt="User avatar" />
  </button>

  <!-- 下拉菜单 -->
  {#if isOpen}
    <div
      transition:fade={{ duration: 150 }}
      class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
      tabindex="-1"
      use:clickOutside={closeDropdown}
    >
      <div class="py-1" role="none">
        <!-- 用户信息 -->
        <div class="px-4 py-2 border-b border-gray-100">
          <p class="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <p class="text-sm text-gray-500 truncate">{userEmail}</p>
        </div>

        <!-- 菜单项 -->
        {#each menuItems as item}
          <a
            href="/{item.id}"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            role="menuitem"
            tabindex="-1"
            on:click|preventDefault={() => handleItemClick(item.id)}
          >
            <span class="mr-3">
              {#if item.icon === "user-circle"}
                <svg
                  class="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              {:else if item.icon === "cog"}
                <svg
                  class="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              {:else if item.icon === "book-open"}
                <svg
                  class="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              {:else if item.icon === "logout"}
                <svg
                  class="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              {/if}
            </span>
            {item.label}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
