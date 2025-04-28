<script lang="ts">
  const example = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`;

  let svg = "";
  $: encodeSvg = svgToCss(svg);
  $: svgCSS = `${encodeSvg}
background-repeat: no-repeat no-repeat;
background-position: center center;
background-size: cover;`;

  let encodeSvgEditor: any;
  let svgCSSEditor: any;

  function svgToCss(svg: string): string {
    // Ensure the SVG string is properly escaped
    const escapedSvg = encodeURIComponent(svg)
      .replace(/%20/g, " ")
      .replace(/%3D/g, "=")
      .replace(/%22/g, "'")
      .replace(/%27/g, "'")
      // .replace(/'/g, "%27") // Replace single quotes
      .replace(/"/g, "'") // Replace double quotes
      .replace(/\n/g, ""); // Remove newlines for cleaner output

    // Return the CSS rule
    return `background-image: url("data:image/svg+xml,${escapedSvg}");`;
  }

  function handleCssToSvg() {
    svg = cssToSvg(encodeSvg) || "";
  }

  function cssToSvg(css: string): string | null {
    const regex = /url\("data:image\/svg\+xml,(.*?)"\)/;
    const match = css.match(regex);

    if (match && match[1]) {
      // Decode the URI component to get the raw SVG string
      const decodedSvg = decodeURIComponent(match[1]);
      return decodedSvg;
    }

    return null; // Return null if the pattern is not found
  }
</script>

<form
  class="flex flex-col py-4 space-y-4"
  on:submit|preventDefault={() => {
    /* 处理提交逻辑 */
  }}
>
  <!-- SVG 输入 -->
  <label
    for="svg"
    class="mb-1 font-medium text-gray-700 flex flex-row justify-between"
  >
    <span>SVG</span>
    <button
      class="text-gray-500 hover:text-gray-800"
      on:click={() => {
        svg = example;
      }}>Example</button
    >
  </label>
  <textarea
    id="svg"
    bind:value={svg}
    placeholder="Enter your SVG here"
    class="border px-2 py-1 rounded min-h-32"
  ></textarea>

  <!-- 编码后的 SVG 输入 -->
  <label
    for="encodeSvg"
    class="mb-1 font-medium text-gray-700 flex flex-row justify-between"
    >Encoded SVG
    <button
      class="text-gray-500 hover:text-gray-800"
      on:click={() => {
        navigator.clipboard.writeText(encodeSvg);
        encodeSvgEditor.select();
      }}
      >Copy
    </button>
  </label>
  <textarea
    id="encodeSvg"
    bind:this={encodeSvgEditor}
    bind:value={encodeSvg}
    on:input={handleCssToSvg}
    placeholder="Encoded SVG will appear here"
    class="border px-2 py-1 rounded min-h-32"
  ></textarea>

  <!-- CSS 输入 -->
  <label
    for="svgCSS"
    class="mb-1 font-medium text-gray-700 flex flex-row justify-between"
    >SVG CSS
    <button
      class="text-gray-500 hover:text-gray-800"
      on:click={() => {
        navigator.clipboard.writeText(svgCSS);
        svgCSSEditor.select();
      }}
      >Copy
    </button>
  </label>
  <textarea
    id="svgCSS"
    bind:this={svgCSSEditor}
    bind:value={svgCSS}
    placeholder="SVG CSS will appear here"
    class="border px-2 py-1 rounded min-h-32"
    readonly
  ></textarea>

  <!-- 预览区域 -->
  <div class="w-32 h-32" style={svgCSS}></div>
</form>
