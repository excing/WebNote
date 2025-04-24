<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let enableCloseDropdown = false;
  export let role = "default";
  export let tabindex = 0;

  // 是否确认移除
  let isClicked = false;

  function handleClick() {
    if (isClicked) {
      dispatch("click");
    } else {
      isClicked = true;
    }
  }
</script>

<button
  {role}
  {tabindex}
  class={$$props.class}
  on:click={handleClick}
  data-close-dropdown={enableCloseDropdown}
>
  {#if isClicked}
    <slot name="clicked" />
  {:else}
    <slot />
  {/if}
</button>
