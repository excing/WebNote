<script>
  import { githubAuth } from "$lib/stores/githubAuth";
  import Login from "./Login.svelte";
</script>

{#if $githubAuth.accessToken}
  <div class={$$props.class}>
    <slot />
  </div>
{:else}
  <Login />
{/if}
