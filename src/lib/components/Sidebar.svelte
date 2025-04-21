<script lang="ts">
  import { onMount } from "svelte";

  // 组件属性
  export let collapsed: boolean = false;
  export let breakpoint: number = 768; // 响应式断点（px）
  export let width: string = "w-64";
  export let collapsedWidth: string = "w-16";

  // 响应式状态
  let isMobile: boolean = false;

  // 切换侧边栏状态
  function toggleCollapse() {
    collapsed = !collapsed;
  }

  // 检查窗口大小并更新状态
  function checkScreenSize() {
    isMobile = window.innerWidth < breakpoint;
    if (isMobile) {
      collapsed = true; // 在小屏幕上默认折叠
      collapsedWidth = "w-16";
    } else {
      collapsedWidth = "w-16";
    }
  }

  onMount(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  });
</script>

<div
  class="bg-gray-800 h-screen text-white transition-all duration-300 overflow-hidden absolute md:relative shadow-md {collapsed
    ? collapsedWidth
    : width}"
  class:translate-x-0={!isMobile || !collapsed}
>
  <div class="flex flex-row justify-between p-2">
    <h1 class="text-2xl p-2 {collapsed ? 'hidden' : ''}">我的笔记</h1>
    <button
      class="bg-transparent border-none text-white text-2xl p-2 cursor-pointer hover:text-gray-200"
      on:click={toggleCollapse}
    >
      {collapsed ? "☰" : "✕"}
    </button>
  </div>

  <div class="p-5">
    <slot />
  </div>
</div>
