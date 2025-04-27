<script>
  import { githubAuth } from "$lib/stores/githubAuth";
  import Login from "./Login.svelte";
</script>

<div class={$$props.class}>
  {#if $githubAuth.accessToken}
    <slot />
  {:else}
    <Login />
  {/if}
  <slot name="unlogin" />
</div>
