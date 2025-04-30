<script lang="ts">
  import Upload from "$lib/components/Upload.svelte";

  function handleFilesSelected(event: any) {
    const { files } = event.detail;
    console.log("选择的文件:", files);
    // 处理文件...
  }

  function handleError(event: any) {
    const { message } = event.detail;
    alert(message);
  }

  let textContent = "";

  function handleFileDropped(event: any) {
    const { files } = event.detail;
    console.log("拖放的文件:", files);
    // 可以在这里进行额外的文件处理
  }

  function handleChange(event: any) {
    const { value } = event.detail;
    console.log("文本内容已更新:", value);
  }
</script>

<Upload
  multiple={true}
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024}
  on:filesSelected={handleFilesSelected}
  on:error={handleError}
/>
