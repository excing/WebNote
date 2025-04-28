<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  // SVG数据
  let svgContent: string = ``;
  let svgElement: SVGSVGElement | null = null;
  let svgContainer: HTMLDivElement;
  let fileName: string = "";

  // 选中的元素
  let selectedElement: SVGElement | null = null;
  let selectedElementAttributes: { name: string; value: string }[] = [];

  // 通用属性
  let svgWidth: string = "";
  let svgHeight: string = "";
  let svgViewBox: string = "";

  // 用于切换输入模式（文件上传或代码输入）
  let inputMode: "file" | "code" = "file";
  // 用于存储直接输入的SVG代码
  let inputSvgCode: string = "";

  // 处理手动输入的SVG代码
  function handleCodeInput() {
    if (inputSvgCode.trim()) {
      svgContent = inputSvgCode;
      renderSVG(inputSvgCode);
      fileName = "custom-svg.svg"; // 设置默认文件名
    }
  }

  // 清空输入
  function clearInput() {
    if (inputMode === "file") {
      // 清空文件输入
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      svgContent = "";
      svgContainer.innerHTML = "";
      fileName = "";
    } else {
      // 清空代码输入
      inputSvgCode = "";
      svgContent = "";
      svgContainer.innerHTML = "";
      fileName = "";
    }

    // 重置选中状态
    selectedElement = null;
    selectedElementAttributes = [];
  }

  // 文件上传
  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      fileName = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        svgContent = result;
        renderSVG(result);
      };

      reader.readAsText(file);
    }
  }

  // 渲染SVG
  function renderSVG(svgText: string) {
    // if (!svgContainer) return;
    console.log(svgText);

    svgContainer.innerHTML = svgText;
    svgElement = svgContainer.querySelector("svg");

    if (svgElement) {
      // 获取基本属性
      svgWidth = svgElement.getAttribute("width") || "";
      svgHeight = svgElement.getAttribute("height") || "";
      svgViewBox = svgElement.getAttribute("viewBox") || "";

      // 添加点击事件到所有SVG元素
      const allElements = svgElement.querySelectorAll("*");
      allElements.forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          selectElement(el as SVGElement);
        });
      });

      // 添加点击事件到SVG本身
      svgElement.addEventListener("click", () => {
        selectElement(svgElement);
      });
    }
  }

  // 选择元素
  function selectElement(element: SVGElement | null) {
    // 移除之前选中元素的高亮
    if (selectedElement) {
      selectedElement.classList.remove("svg-selected");
    }

    selectedElement = element;

    if (selectedElement) {
      // 高亮选中的元素
      selectedElement.classList.add("svg-selected");

      // 获取元素的所有属性
      selectedElementAttributes = [];
      for (let i = 0; i < selectedElement.attributes.length; i++) {
        const attr = selectedElement.attributes[i];
        selectedElementAttributes.push({
          name: attr.name,
          value: attr.value,
        });
      }
    } else {
      selectedElementAttributes = [];
    }
  }

  // 更新SVG属性
  function updateSVGAttribute(name: string, value: string) {
    if (!svgElement) return;

    if (value) {
      svgElement.setAttribute(name, value);
    } else {
      svgElement.removeAttribute(name);
    }

    // 更新内容
    svgContent = svgContainer.innerHTML;
  }

  // 更新选中元素的属性
  function updateElementAttribute(index: number, value: string) {
    if (!selectedElement) return;

    const attr = selectedElementAttributes[index];
    selectedElement.setAttribute(attr.name, value);
    selectedElementAttributes[index].value = value;

    // 更新内容
    svgContent = svgContainer.innerHTML;
  }

  // 添加新属性
  let newAttrName: string = "";
  let newAttrValue: string = "";

  function addNewAttribute() {
    if (!selectedElement || !newAttrName) return;

    selectedElement.setAttribute(newAttrName, newAttrValue);
    selectedElementAttributes.push({
      name: newAttrName,
      value: newAttrValue,
    });
    selectedElementAttributes = [...selectedElementAttributes];

    // 重置输入
    newAttrName = "";
    newAttrValue = "";

    // 更新内容
    svgContent = svgContainer.innerHTML;
  }

  // 删除属性
  function removeAttribute(index: number) {
    if (!selectedElement) return;

    const attr = selectedElementAttributes[index];
    selectedElement.removeAttribute(attr.name);

    selectedElementAttributes.splice(index, 1);
    selectedElementAttributes = [...selectedElementAttributes];

    // 更新内容
    svgContent = svgContainer.innerHTML;
  }

  // 修改颜色
  function updateFill(color: string) {
    if (!selectedElement) return;

    selectedElement.setAttribute("fill", color);

    // 更新属性列表
    const fillIndex = selectedElementAttributes.findIndex(
      (attr) => attr.name === "fill",
    );
    if (fillIndex >= 0) {
      selectedElementAttributes[fillIndex].value = color;
    } else {
      selectedElementAttributes.push({ name: "fill", value: color });
    }
    selectedElementAttributes = [...selectedElementAttributes];

    // 更新内容
    svgContent = svgContainer.innerHTML;
  }

  function updateStroke(color: string) {
    if (!selectedElement) return;

    selectedElement.setAttribute("stroke", color);

    // 更新属性列表
    const strokeIndex = selectedElementAttributes.findIndex(
      (attr) => attr.name === "stroke",
    );
    if (strokeIndex >= 0) {
      selectedElementAttributes[strokeIndex].value = color;
    } else {
      selectedElementAttributes.push({ name: "stroke", value: color });
    }
    selectedElementAttributes = [...selectedElementAttributes];

    // 更新内容
    svgContent = svgContainer.innerHTML;
  }

  // 导出SVG
  function exportSVG() {
    if (!svgContent) return;

    if (browser) {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "exported-svg.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // 初始化
  onMount(() => {
    // 在组件加载后可以做一些初始化工作
  });
</script>

<svelte:head>
  <title>SVG 修改器</title>
  <style>
    .svg-selected {
      outline: 2px dashed #3b82f6 !important;
    }
  </style>
</svelte:head>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">SVG 修改器</h1>

  <div class="flex flex-col lg:flex-row gap-4">
    <!-- 左侧：SVG上传和预览 -->
    <div class="w-full lg:w-1/2 space-y-4">
      <!-- 替换原来的上传部分 -->
      <div class="border-2 border-dashed border-gray-300 p-4 rounded-lg">
        <!-- 切换按钮 -->
        <div class="flex mb-4 bg-gray-100 rounded-md p-1">
          <button
            class={`flex-1 py-2 text-sm font-medium rounded-md ${inputMode === "file" ? "bg-white shadow-sm" : "text-gray-600"}`}
            on:click={() => (inputMode = "file")}
          >
            上传文件
          </button>
          <button
            class={`flex-1 py-2 text-sm font-medium rounded-md ${inputMode === "code" ? "bg-white shadow-sm" : "text-gray-600"}`}
            on:click={() => (inputMode = "code")}
          >
            输入代码
          </button>
        </div>

        <!-- 文件上传模式 -->
        {#if inputMode === "file"}
          <input
            type="file"
            accept=".svg"
            on:change={handleFileUpload}
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <!-- 代码输入模式 -->
        {:else}
          <div class="space-y-2">
            <textarea
              bind:value={inputSvgCode}
              placeholder="<svg>...</svg>"
              class="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <div class="flex gap-2">
              <button
                on:click={handleCodeInput}
                disabled={!inputSvgCode.trim()}
                class="py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                解析代码
              </button>
              <button
                on:click={clearInput}
                class="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                清空
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- 在SVG预览区域上方添加清空按钮 -->
      {#if svgContent}
        <div class="flex justify-end">
          <button
            on:click={clearInput}
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            清空
          </button>
        </div>
      {/if}

      <div
        class="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-64 flex items-center justify-center"
      >
        <div
          bind:this={svgContainer}
          class="svg-container w-full h-full"
          class:hidden={svgContent === ""}
        ></div>
        <p class="text-gray-400" class:hidden={svgContent !== ""}>
          上传SVG后在此处预览
        </p>
      </div>

      {#if svgElement}
        <div class="space-y-2">
          <h2 class="text-lg font-medium">SVG基本属性</h2>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">宽度</label
              >
              <input
                type="text"
                bind:value={svgWidth}
                on:blur={() => updateSVGAttribute("width", svgWidth)}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">高度</label
              >
              <input
                type="text"
                bind:value={svgHeight}
                on:blur={() => updateSVGAttribute("height", svgHeight)}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >视口(viewBox)</label
            >
            <input
              type="text"
              bind:value={svgViewBox}
              on:blur={() => updateSVGAttribute("viewBox", svgViewBox)}
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      {/if}

      <button
        on:click={exportSVG}
        disabled={!svgContent}
        class="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        导出 SVG
      </button>
    </div>

    <!-- 右侧：属性编辑器 -->
    <div
      class="w-full lg:w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      {#if selectedElement}
        <h2 class="text-lg font-medium mb-4">
          已选中: <span class="text-blue-600">{selectedElement.tagName}</span>
        </h2>

        <div class="space-y-4">
          <!-- 颜色快捷编辑 -->
          <div class="space-y-2">
            <h3 class="text-md font-medium">快速样式调整</h3>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >填充颜色</label
                >
                <div class="flex mt-1">
                  <input
                    type="color"
                    value={selectedElement.getAttribute("fill") || "#000000"}
                    on:input={(e) => updateFill(e.currentTarget.value)}
                    class="h-8 w-8 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={selectedElement.getAttribute("fill") || ""}
                    on:blur={(e) => updateFill(e.currentTarget.value)}
                    placeholder="#000000 或 none"
                    class="ml-2 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >描边颜色</label
                >
                <div class="flex mt-1">
                  <input
                    type="color"
                    value={selectedElement.getAttribute("stroke") || "#000000"}
                    on:input={(e) => updateStroke(e.currentTarget.value)}
                    class="h-8 w-8 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={selectedElement.getAttribute("stroke") || ""}
                    on:blur={(e) => updateStroke(e.currentTarget.value)}
                    placeholder="#000000 或 none"
                    class="ml-2 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 所有属性列表 -->
          <div class="space-y-2">
            <h3 class="text-md font-medium">所有属性</h3>

            <div class="space-y-2">
              {#each selectedElementAttributes as attr, i}
                <div class="flex items-center gap-2">
                  <span class="w-24 truncate text-sm font-medium"
                    >{attr.name}:</span
                  >
                  <input
                    type="text"
                    bind:value={attr.value}
                    on:blur={() => updateElementAttribute(i, attr.value)}
                    class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    on:click={() => removeAttribute(i)}
                    class="px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    删除
                  </button>
                </div>
              {/each}
            </div>

            <!-- 添加新属性 -->
            <div class="pt-4 border-t border-gray-200">
              <h3 class="text-md font-medium mb-2">添加新属性</h3>

              <div class="flex items-end gap-2">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700"
                    >属性名</label
                  >
                  <input
                    type="text"
                    bind:value={newAttrName}
                    placeholder="例如: class, style..."
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700"
                    >属性值</label
                  >
                  <input
                    type="text"
                    bind:value={newAttrValue}
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  on:click={addNewAttribute}
                  disabled={!newAttrName}
                  class="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <p class="text-gray-400 text-center py-8">
          {#if svgContent}
            点击SVG中的元素进行编辑
          {:else}
            请先上传SVG文件
          {/if}
        </p>
      {/if}
    </div>
  </div>

  <!-- SVG代码预览 -->
  {#if svgContent}
    <div class="mt-8">
      <h2 class="text-lg font-medium mb-2">SVG代码</h2>
      <div
        class="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto max-h-64"
      >
        <pre class="text-sm">{svgContent}</pre>
      </div>
    </div>
  {/if}
</div>
