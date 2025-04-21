<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { githubAuth } from "$lib/stores/githubAuth";
  import { startOAuthFlow } from "$lib/utils/github-oauth";
  import { onMount } from "svelte";

  onMount(() => {
    if ($githubAuth.accessToken) {
      goto("/");
      return;
    }
  });

  function handleLogin() {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET;

    // 启动OAuth流程
    startOAuthFlow(
      clientId,
      clientSecret,
      "/login/redirect",
      page.url.origin,
      "repo",
    );
  }
</script>

<!-- // src/routes/login/+page.svelte -->
<div class="container">
  <h1>我的笔记</h1>
  <p>使用您的GitHub账户登录以管理笔记</p>

  <button on:click={handleLogin} class="github-login">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
    >
      <path
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      />
    </svg>
    使用 GitHub 登录
  </button>
</div>

<style>
  .container {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    margin-bottom: 2rem;
  }

  .github-login {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: #24292e;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: 0 auto;
  }

  .github-login:hover {
    background-color: #1b1f23;
  }
</style>
