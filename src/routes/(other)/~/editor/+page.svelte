<script lang="ts">
  import AutoHeightTextarea from "$lib/components/AutoHeightTextarea.svelte";
  import { keyboardVisible } from "$lib/utils/window";

  let isEditor = true;
  let value =
    "a\n\n\n\n\n\n\n\n\n\n\\n\\n\n\n\n\\n\n\nb\n\n\n\n\n\n\n\n\n\n\\n\\n\n\n\n\\n\n\nc\n\n\n\n\n\n\n\n\n\n\\n\\n\n\n\n\\n\n\nd";

  let viewHeight: number;
  let keyboardOK: boolean;

  function handleKeyboardVisible(height: number, isKeyboardVisible: boolean) {
    viewHeight = height;
    keyboardOK = isKeyboardVisible;
  }
</script>

<div
  class="flex flex-col {isEditor ? '' : 'min-h-dvh'}"
  style={isEditor
    ? keyboardOK
      ? "min-height: " + viewHeight + "px;"
      : ""
    : ""}
  use:keyboardVisible={handleKeyboardVisible}
>
  <div class="my-2 flex flex-row justify-end bg-white space-x-2">
    <div>窗口 H: {viewHeight}</div>
    <div>键盘: {keyboardOK ? "开" : "关"}</div>
    <label class="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" bind:checked={isEditor} class="sr-only peer" />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform"
      ></div>
      <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {isEditor ? "Editor" : "Default"}
      </span>
    </label>
  </div>
  {#if isEditor}
    <div class="flex-1">title</div>
    <AutoHeightTextarea
      bind:value
      class="px-1 border resize-none outline-none {keyboardOK
        ? 'max-h-90'
        : 'min-h-dvh'}"
      style={keyboardOK ? "overflow-y: auto;" : ""}
      on:files={(e) => {
        console.log(e.detail);
      }}
    ></AutoHeightTextarea>
    <div class="bg-gray-200" class:hidden={!keyboardOK}>Footer bar</div>
  {:else}
    <textarea bind:value class="flex-1 px-1 border resize-none outline-none"
    ></textarea>
    <div class="bg-gray-200" class:hidden={!keyboardOK}>Footer bar</div>
  {/if}
</div>
