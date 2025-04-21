<script lang="ts">
  import { onMount } from "svelte";

  // 组件属性
  export let collapsed: boolean = false;
  export let collapsible: boolean = true;
  export let breakpoint: number = 768; // 响应式断点（px）
  export let width: string = "250px";
  export let collapsedWidth: string = "60px";

  // 响应式状态
  let isMobile: boolean = false;

  // 切换侧边栏状态
  function toggleCollapse() {
    if (collapsible) {
      collapsed = !collapsed;
    }
  }

  // 检查窗口大小并更新状态
  function checkScreenSize() {
    isMobile = window.innerWidth < breakpoint;
    if (isMobile) {
      collapsed = true; // 在小屏幕上默认折叠
      collapsedWidth = "0px";
    } else {
      collapsedWidth = "60px";
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
  class="sidebar"
  class:collapsed
  style:width={!collapsed ? width : collapsedWidth}
  style:left={isMobile && collapsed ? "-100%" : "0"}
>
  {#if collapsible}
    <button class="toggle-btn" on:click={toggleCollapse}>
      {collapsed ? "☰" : "✕"}
    </button>
  {/if}

  <div class="content">
    <slot />
  </div>
</div>

<style>
  .sidebar {
    background: #2c3e50;
    color: white;
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .content {
    padding: 20px;
    height: calc(100% - 40px);
  }

  .toggle-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 10px;
    position: absolute;
    right: 10px;
    top: 10px;
  }

  .toggle-btn:hover {
    color: #ecf0f1;
  }
</style>
