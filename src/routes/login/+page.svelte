<script lang="ts">
  import { goto } from "$app/navigation";
  import Login from "$lib/components/Login.svelte";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { onMount } from "svelte";

  onMount(() => {
    if ($githubAuth.accessToken) {
      goto("/");
      return;
    }
  });
</script>

<Login />
