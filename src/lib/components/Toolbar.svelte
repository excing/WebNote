<script lang="ts">
  import { goto } from "$app/navigation";
  import { githubAuth } from "$lib/stores/githubAuth";
  import UserDropdown from "./UserDropdown.svelte";

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
        goto("/dashboard")
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

<header class="flex justify-between items-center py-4">
  <h1 class="text-2xl font-bold flex items-center space-x-2">
    <img
      class="w-6 h-6"
      src="/favicon.png"
      alt="Web Note Icon"
      title="Web Note Icon"
    />
    <span class="hidden md:inline">我的笔记</span>
  </h1>
  <slot />
  {#if $githubAuth.user}
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <UserDropdown
          userImage={$githubAuth.user.avatar_url}
          userName={$githubAuth.user.name}
          userEmail={$githubAuth.user.email}
          on:select={handleSelect}
        />
      </div>
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
