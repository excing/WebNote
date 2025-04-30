<script lang="ts">
  import { encode64File } from "$lib/utils/encode";
  import { filesize } from "$lib/utils/format";
  import { createGitHubRepoManager, type GitContent } from "$lib/utils/github";
  import { createEventDispatcher } from "svelte";
  import { flip } from "svelte/animate";

  const dispatch = createEventDispatcher();

  let fileInput: HTMLInputElement;

  export let token = "";
  export let owner = "";
  export let repo = "";
  export let path = "";

  export let multiple: boolean = false;
  export let accept: string = "";
  export let maxSize: number = 0; // 单位：bytes，0表示不限制
  export let disabled: boolean = false;

  let isUploading = false;

  function openFileDialog(): void {
    if (!disabled && fileInput) {
      fileInput.click();
    }
  }

  function handleInputChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    uploadFiles(target.files);
    // 重置input以便能够重复上传相同的文件
    target.value = "";
  }

  // 处理文件选择或拖放
  export async function uploadFiles(newFiles: FileList | null): Promise<void> {
    if (!newFiles || newFiles.length === 0) return;

    const github = createGitHubRepoManager(token);

    const uploadContetns: GitContent[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      // 检查文件类型限制（如果有）
      if (accept && !isFileTypeAccepted(file.type, accept)) {
        alert(`文件 "${file.name}" 类型不被接受`);
        continue;
      }

      // 检查文件大小限制（如果有）
      if (maxSize > 0 && file.size > maxSize) {
        alert(
          `文件 "${file.name}" 大小（${filesize(file.size)}） 超过最大大小限制 (${filesize(maxSize)})`,
        );
        continue;
      }

      let filepath = path ? `${path}/${file.name}` : file.name;

      try {
        isUploading = true;
        const fileBase64 = await encode64File(file);
        const result = await github.createOrUpdateFile(
          owner,
          repo,
          filepath,
          "Update file",
          fileBase64,
          null,
        );
        uploadContetns.push(result);
      } catch (err: any) {
        if (err.state) {
          alert(`${err.state}, ${err.message}`);
        } else {
          alert(`${err.message} || "上传文件时发生错误"`);
        }
      } finally {
        isUploading = false;
      }
    }

    dispatch("finished", uploadContetns);
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
</script>

<input
  type="file"
  bind:this={fileInput}
  on:change={handleInputChange}
  {accept}
  {multiple}
  disabled={disabled || isUploading}
  class="hidden"
/>
<button
  disabled={disabled || isUploading}
  on:click={openFileDialog}
  aria-label="Upload file"
  class="flex flex-row items-center {$$props.class}"
>
  {#if isUploading}
    <slot name="uploading" />
  {:else}
    <slot />
  {/if}
</button>
