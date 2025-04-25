<script lang="ts">
  import { goto } from "$app/navigation";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { parentPath } from "$lib/utils/path";
  import UserDropdown from "./UserDropdown.svelte";
  import { page } from "$app/state";

  export let title = "";
  export let path = page.url.pathname;
  export let isHomeButtonVisible = true;
  export let isBackButtonVisible = false;
  export let isUserButtonVisible = true;

  function handleBack() {
    console.log("history.length", history.length);

    if (2 < history.length) {
      history.back();
    } else {
      goto(parentPath(path));
    }
  }

  function handleSelect(event: CustomEvent) {
    console.log("Selected item:", event.detail.item);
    // 根据选择的项执行相应操作
    switch (event.detail.item) {
      case "profile":
        // 导航到个人资料
        break;
      case "settings":
        // 打开设置
        break;
      case "dashboard":
        goto("/dashboard");
        break;
      case "signout":
        // 处理退出登录
        logout();
        break;
    }
  }

  function logout() {
    githubAuth.clearAccessToken();
  }
</script>

<header class="flex justify-between items-center space-x-2 {$$props.class}">
  <h1 class="text-xl font-bold flex items-center space-x-1 min-w-0">
    <a href="/" class:hidden={!isHomeButtonVisible}>
      <img
        class="w-6 h-6"
        src="/favicon.png"
        alt="Web Note Icon"
        title="Web Note Icon"
      />
    </a>
    <button
      on:click={handleBack}
      aria-label="back"
      class:hidden={!isBackButtonVisible}
    >
      <span class="w-9 h-9 ic-chevron-left block -mr-2" title="back"></span>
    </button>
    <span class="hidden md:inline truncate" class:hidden={!title}>{title}</span>
    <slot name="left" />
  </h1>
  <slot />
  {#if $githubAuth.user}
    <div class="flex items-center gap-4 shrink-0">
      <slot name="right" />
      {#if isUserButtonVisible}
        <UserDropdown
          userImage={$githubAuth.user.avatar_url}
          userName={$githubAuth.user.name}
          userEmail={$githubAuth.user.email}
          on:select={handleSelect}
        />
      {/if}
    </div>
  {:else}
    <button
      on:click={() => goto("/login")}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
    >
      登录
    </button>
  {/if}
</header>
