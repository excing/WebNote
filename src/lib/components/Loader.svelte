<script lang="ts">
  // 定义组件的 props 类型
  export let isLoading: boolean = true;
  export let size: "sm" | "md" | "lg" = "sm";
</script>

<div class={$$props.class}>
  {#if isLoading}
    <div class="flex {size} space-x-4 justify-center items-center py-2">
      <div
        class="bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"
      ></div>
      <div
        class=" bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"
      ></div>
      <div class=" bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  {:else}
    <slot />
  {/if}
</div>

<style>
  .sm {
    :where(& > :not(:last-child)) {
      --tw-space-x-reverse: 0;
      margin-inline-start: calc(
        calc(var(--spacing) * 2) /* 1rem = 16px */ * var(--tw-space-x-reverse)
      );
      margin-inline-end: calc(
        calc(var(--spacing) * 2) /* 1rem = 16px */ *
          calc(1 - var(--tw-space-x-reverse))
      );
    }
  }

  .sm div {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .md {
    :where(& > :not(:last-child)) {
      --tw-space-x-reverse: 0;
      margin-inline-start: calc(
        calc(var(--spacing) * 3) /* 1rem = 16px */ * var(--tw-space-x-reverse)
      );
      margin-inline-end: calc(
        calc(var(--spacing) * 3) /* 1rem = 16px */ *
          calc(1 - var(--tw-space-x-reverse))
      );
    }
  }

  .md div {
    width: calc(var(--spacing) * 4.5);
    height: calc(var(--spacing) * 4.5);
  }

  .lg {
    :where(& > :not(:last-child)) {
      --tw-space-x-reverse: 0;
      margin-inline-start: calc(
        calc(var(--spacing) * 4) /* 1rem = 16px */ * var(--tw-space-x-reverse)
      );
      margin-inline-end: calc(
        calc(var(--spacing) * 4) /* 1rem = 16px */ *
          calc(1 - var(--tw-space-x-reverse))
      );
    }
  }

  .lg div {
    width: calc(var(--spacing) * 6);
    height: calc(var(--spacing) * 6);
  }
</style>
