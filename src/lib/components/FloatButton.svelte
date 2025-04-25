<script lang="ts">
</script>

<div class="sticky bottom-0 flex flex-row z-10">
  <div class="flex-1"></div>
  <button class="floating-button text-2xl m-5" on:click><slot /></button>
</div>

<style>
  .floating-button {
    width: calc(var(--spacing) * 10);
    height: calc(var(--spacing) * 10);
    border-radius: 50%;
    background-color: var(--color-blue-500);
    color: white;
    border: none;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s ease;
  }

  .floating-button:hover {
    transform: scale(1.1);
    background-color: var(--color-blue-600);
  }
</style>
