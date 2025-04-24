<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

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

<button class={$$props.class} on:click={handleClick}>
  {#if isClicked}
    <slot name="clicked" />
  {:else}
    <slot />
  {/if}
</button>
