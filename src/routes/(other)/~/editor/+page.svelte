<script lang="ts">
  import AutoHeightTextarea from "$lib/components/AutoHeightTextarea.svelte";
  import { keyboardVisible } from "$lib/utils/window";

  let textarea: HTMLElement;

  let value =
    "a\n\n\n\n\n\n\n\n\n\n\\n\\n\n\n\n\\n\n\nb\n\n\n\n\n\n\n\n\n\n\\n\\n\n\n\n\\n\n\nc\n\n\n\n\n\n\n\n\n\n\\n\\n\n\n\n\\n\n\nd";

  let viewHeight: number;
  let keyboardOK: boolean;

  function handleKeyboardVisible(height: number, isKeyboardVisible: boolean) {
    viewHeight = height;
    keyboardOK = isKeyboardVisible;
    textarea.style.height = height + "px";
  }
</script>

<div class="flex flex-row" use:keyboardVisible={handleKeyboardVisible}>
  <div class="flex-1 flex flex-col" bind:this={textarea}>
    <div class="my-2 bg-white z-10">Default</div>
    <textarea bind:value class="flex-1 mx-1 border resize-none outline-none"
    ></textarea>
    <div class="bg-gray-200" class:hidden={!keyboardOK}>Footer bar</div>
  </div>
  <div class="flex-1 flex flex-col">
    <div class="my-2 sticky top-0 bg-white z-10">AutoHeight</div>
    <AutoHeightTextarea
      bind:value
      class="flex-1 mx-1 pb-4 min-h-dvh border resize-none outline-none"
    ></AutoHeightTextarea>
    <div
      class="mt-4 sticky bottom-0 z-10 bg-gray-200"
      class:hidden={!keyboardOK}
    >
      Footer bar
    </div>
  </div>
</div>
