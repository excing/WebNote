<script lang="ts">
  import { countWords, segmentWord } from "$lib/utils/string";

  let text = "";
  let lang = "en";
  let granularity: "grapheme" | "word" | "sentence" = "word";

  $: result = segmentWord(text, lang, granularity);

  // 示例
  const xstr = "Hello, 这是一个中文句子！";
  const wordCount = countWords(xstr);
  console.log(wordCount); // 输出：10
</script>

<form>
  <div class="mb-4">
    <label for="lang" class="block text-left text-sm font-medium mb-1"
      >语言</label
    >
    <input
      id="lang"
      bind:value={lang}
      class="w-full px-3 py-2 border rounded"
      autocomplete="off"
      required
    />
  </div>
  <div class="mb-4">
    <label for="granularity" class="block text-left text-sm font-medium mb-1"
      >粒度</label
    >
    <input
      id="granularity"
      bind:value={granularity}
      class="w-full px-3 py-2 border rounded"
      autocomplete="off"
      required
    />
  </div>
  <div class="mb-4">
    <label for="text" class="block text-left text-sm font-medium mb-1"
      >速记</label
    >
    <textarea
      id="text"
      bind:value={text}
      class="w-full px-3 py-2 border rounded"
      rows="3"
    ></textarea>
  </div>
</form>

<div class="flex flex-wrap space-x-2 space-y-2">
  {result.length}字：
  {#each result as item}
    <div class="text-sm px-2 py-1 rounded bg-gray-200">{item}</div>
  {/each}
</div>

<div>字数（不计标点符号）：{countWords(text)}</div>
<div>字数：{countWords(text, true)}</div>
