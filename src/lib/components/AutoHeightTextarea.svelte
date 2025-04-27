<script lang="ts">
  import { autoFocus } from "$lib/utils/actions/autoFocus";
  import { keyboardShortcut, type KeyboardShortcut } from "$lib/utils/window";

  export let value: string = "";
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let autofocus: boolean = false;
  export let shortcuts: KeyboardShortcut[] = [];

  export let style = "";
  export let flex = "";

  $: {
    if (textspan) {
      textspan.innerText = `${value} `;
    }
  }

  let textspan: HTMLElement;
</script>

<div class={flex}>
  <span bind:this={textspan} class={$$props.class} {style}></span>
  <textarea
    class={$$props.class}
    {style}
    bind:value
    on:input
    {disabled}
    {readonly}
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
