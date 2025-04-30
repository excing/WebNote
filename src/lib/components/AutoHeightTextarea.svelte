<script lang="ts">
  import { autoFocus } from "$lib/utils/actions/autoFocus";
  import { keyboardShortcut, type KeyboardShortcut } from "$lib/utils/window";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let value: string = "";
  export let placeholder = "";
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let autofocus: boolean = false;
  export let shortcuts: KeyboardShortcut[] = [];
  export let selectStart = 0;

  export let style = "";
  export let flex = "";

  $: {
    if (textspan) {
      textspan.innerText = `${value} `;
      selectStart = textarea.selectionStart;
      dispatch("selectstart", textarea.selectionStart);
    }
  }

  let textspan: HTMLElement;
  let textarea: HTMLTextAreaElement;

  // 拖放相关处理程序
  function handleDragOver(e: DragEvent): void {}

  function handleDragLeave(): void {}

  function handleDrop(e: DragEvent): void {
    if (disabled || readonly) return;

    const files = e.dataTransfer?.files;

    if (files && files.length > 0) {
      dispatch("files", Array.from(files));
    }
  }
</script>

<div class={flex}>
  <span bind:this={textspan} class={$$props.class} {style}></span>
  <textarea
    bind:this={textarea}
    class={$$props.class}
    {style}
    bind:value
    on:input
    on:dragover|preventDefault={handleDragOver}
    on:dragleave|preventDefault={handleDragLeave}
    on:drop|preventDefault={handleDrop}
    {disabled}
    {readonly}
    {placeholder}
    use:autoFocus={autofocus}
    use:keyboardShortcut={shortcuts}
  ></textarea>
</div>

<style>
  div {
    position: relative;
    z-index: 5;
  }
  span {
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;
    width: 100%;
    height: 100%;
    resize: none;
    overflow: hidden;
    visibility: hidden; /* 一定不要少了给它隐藏哦，留个站位 */
  }
  textarea {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    resize: none;
    overflow: hidden;
    z-index: 4;
  }
</style>
