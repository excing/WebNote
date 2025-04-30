<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // 定义组件props
  export let multiple: boolean = false;
  export let accept: string = "";
  export let maxSize: number = 0; // 单位：bytes，0表示不限制
  export let disabled: boolean = false;
  export let dropzoneClass: string = "";

  // 内部状态
  let dragover: boolean = false;
  let fileInput: HTMLInputElement;
  let files: File[] = [];
  let errors: string[] = [];

  // 创建事件分发器，用于向父组件传递事件
  const dispatch = createEventDispatcher<{
    filesSelected: { files: File[] };
    error: { message: string };
  }>();

  // 处理文件选择或拖放
  function handleFiles(newFiles: FileList | null): void {
    if (!newFiles || newFiles.length === 0) return;

    errors = [];
    const validFiles: File[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      // 检查文件类型限制（如果有）
      if (accept && !isFileTypeAccepted(file.type, accept)) {
        errors.push(`文件 "${file.name}" 类型不被接受`);
        continue;
      }

      // 检查文件大小限制（如果有）
      if (maxSize > 0 && file.size > maxSize) {
        errors.push(
          `文件 "${file.name}" 超过最大大小限制 (${formatFileSize(maxSize)})`,
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      files = multiple ? [...files, ...validFiles] : validFiles;
      dispatch("filesSelected", { files });
    }

    if (errors.length > 0) {
      dispatch("error", { message: errors.join("\n") });
    }
  }

  // 检查文件类型是否被接受
  function isFileTypeAccepted(fileType: string, acceptStr: string): boolean {
    if (!acceptStr) return true;

    const acceptTypes = acceptStr
      .split(",")
      .map((type) => type.trim().toLowerCase());

    // 直接匹配MIME类型
    if (acceptTypes.includes(fileType.toLowerCase())) return true;

    // 处理通配符，如 "image/*"
    for (const type of acceptTypes) {
      if (type.endsWith("/*") && fileType.startsWith(type.replace("/*", "/"))) {
        return true;
      }

      // 处理文件扩展名
      if (type.startsWith(".")) {
        const extension = `.${fileType.split("/").pop()}`;
        if (extension === type) return true;
      }
    }

    return false;
  }

  // 文件大小格式化
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // 拖放相关处理程序
  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    dragover = true;
  }

  function handleDragLeave(): void {
    dragover = false;
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault();
    dragover = false;
    if (!disabled) {
      handleFiles(e.dataTransfer?.files || null);
    }
  }

  function openFileDialog(): void {
    if (!disabled && fileInput) {
      fileInput.click();
    }
  }

  function handleInputChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    handleFiles(target.files);
    // 重置input以便能够重复上传相同的文件
    target.value = "";
  }

  // 移除文件
  function removeFile(index: number): void {
    files = files.filter((_, i) => i !== index);
    dispatch("filesSelected", { files });
  }

  // 清除所有文件
  function clearFiles(): void {
    files = [];
    dispatch("filesSelected", { files });
  }
</script>

<div class="file-dropzone-container">
  <!-- 隐藏的文件输入 -->
  <input
    bind:this={fileInput}
    type="file"
    on:change={handleInputChange}
    {accept}
    {multiple}
    {disabled}
    class="hidden"
  />

  <!-- 拖放区域 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="file-dropzone {dropzoneClass} {dragover
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-300 bg-gray-50'} 
    {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
    class:border-dashed={!dragover}
    class:border-solid={dragover}
    on:click={openFileDialog}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    <div class="flex flex-col items-center justify-center p-6">
      <svg
        class="w-10 h-10 text-gray-400 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        ></path>
      </svg>
      <p class="mb-2 text-sm text-gray-700">
        <span class="font-semibold">点击上传</span> 或拖放文件
      </p>
      {#if accept}
        <p class="text-xs text-gray-500">允许的文件类型: {accept}</p>
      {/if}
      {#if maxSize > 0}
        <p class="text-xs text-gray-500">
          最大文件大小: {formatFileSize(maxSize)}
        </p>
      {/if}
    </div>
  </div>

  <!-- 错误信息 -->
  {#if errors.length > 0}
    <div class="mt-2 text-sm text-red-600">
      {#each errors as error}
        <p>{error}</p>
      {/each}
    </div>
  {/if}

  <!-- 文件列表 -->
  {#if files.length > 0}
    <div class="mt-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-medium text-gray-700">已选择的文件</h3>
        {#if files.length > 0}
          <button
            type="button"
            class="text-xs text-red-600 hover:text-red-800"
            on:click={clearFiles}
          >
            清除全部
          </button>
        {/if}
      </div>
      <ul class="space-y-2">
        {#each files as file, i}
          <li class="flex justify-between items-center p-2 bg-gray-100 rounded">
            <div class="flex items-center">
              <svg
                class="w-5 h-5 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <div>
                <p
                  class="text-sm font-medium text-gray-700 truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p class="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.type || "未知类型"}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-red-600"
              on:click={() => removeFile(i)}
              aria-label="Remove Flie"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .file-dropzone-container {
    width: 100%;
  }

  .file-dropzone {
    border-width: 2px;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
  }

  .hidden {
    display: none;
  }
</style>
