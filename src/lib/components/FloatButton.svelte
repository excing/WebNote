<script lang="ts">
  export let onClick = () => {};
</script>

<button class="floating-button text-2xl" on:click={onClick}><slot /></button>

<style>
  .floating-button {
    position: absolute;
    bottom: calc(var(--spacing) * 5);
    right: calc(var(--spacing) * 5);
    z-index: 10;
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
